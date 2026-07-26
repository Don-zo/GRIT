package grit.domain.group.livekit.service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Supplier;
import livekit.LivekitWebhook.WebhookEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LiveKitRoomStatusService {

    private static final String ROOM_NAME_PREFIX = "group:";
    private static final String PARTICIPANTS_KEY_PREFIX = "livekit:room:";
    private static final String PARTICIPANTS_KEY_SUFFIX = ":participants";
    private static final String CONNECTIONS_KEY_SUFFIX = ":connections";
    private static final String PARTICIPANT_ROOMS_KEY_PREFIX = "livekit:participant:";
    private static final String PARTICIPANT_ROOMS_KEY_SUFFIX = ":rooms";
    private static final String PARTICIPANT_ROOMS_INDEXED_KEY_SUFFIX = ":indexed";
    private static final String EVENT_PARTICIPANT_JOINED = "participant_joined";
    private static final String EVENT_PARTICIPANT_LEFT = "participant_left";
    private static final String EVENT_ROOM_FINISHED = "room_finished";
    private static final Duration STATUS_TTL = Duration.ofHours(24);
    private static final DefaultRedisScript<Long> ADD_PARTICIPANT_SCRIPT = new DefaultRedisScript<>("""
            redis.call('SADD', KEYS[1], ARGV[1])
            redis.call('EXPIRE', KEYS[1], ARGV[4])
            redis.call('SADD', KEYS[2], ARGV[2])
            redis.call('EXPIRE', KEYS[2], ARGV[4])
            redis.call('HSET', KEYS[3], ARGV[1], ARGV[3])
            redis.call('EXPIRE', KEYS[3], ARGV[4])
            redis.call('SET', KEYS[4], '1', 'EX', ARGV[4])
            return 1
            """, Long.class);
    private static final DefaultRedisScript<Long> REMOVE_PARTICIPANT_SCRIPT = new DefaultRedisScript<>("""
            local currentSid = redis.call('HGET', KEYS[3], ARGV[1])
            if currentSid and currentSid ~= ARGV[3] then
                return -1
            end
            redis.call('SREM', KEYS[1], ARGV[1])
            redis.call('SREM', KEYS[2], ARGV[2])
            redis.call('HDEL', KEYS[3], ARGV[1])
            if redis.call('SCARD', KEYS[2]) == 0 then
                redis.call('DEL', KEYS[2])
            end
            local remainingParticipants = redis.call('SCARD', KEYS[1])
            if remainingParticipants == 0 then
                redis.call('DEL', KEYS[1])
                redis.call('DEL', KEYS[3])
            end
            redis.call('SET', KEYS[4], '1', 'EX', ARGV[4])
            return remainingParticipants
            """, Long.class);
    private static final DefaultRedisScript<Long> FINISH_ROOM_SCRIPT = new DefaultRedisScript<>("""
            local identities = redis.call('SMEMBERS', KEYS[1])
            for _, identity in ipairs(identities) do
                local participantRoomsKey = ARGV[2] .. identity .. ARGV[3]
                redis.call('SREM', participantRoomsKey, ARGV[1])
                if redis.call('SCARD', participantRoomsKey) == 0 then
                    redis.call('DEL', participantRoomsKey)
                end
            end
            redis.call('DEL', KEYS[1])
            redis.call('DEL', KEYS[2])
            return #identities
            """, Long.class);
    private static final DefaultRedisScript<Long> HAS_OTHER_ROOM_SCRIPT = new DefaultRedisScript<>("""
            if redis.call('EXISTS', KEYS[2]) == 0 then
                return -1
            end
            local roomCount = redis.call('SCARD', KEYS[1])
            if roomCount == 0 then
                return 0
            end
            if roomCount > 1 then
                return 1
            end
            if redis.call('SISMEMBER', KEYS[1], ARGV[1]) == 1 then
                return 0
            end
            return 1
            """, Long.class);
    private static final DefaultRedisScript<Long> BACKFILL_PARTICIPANT_ROOMS_SCRIPT = new DefaultRedisScript<>("""
            if redis.call('EXISTS', KEYS[2]) == 1 then
                return 0
            end
            for index = 2, #ARGV do
                redis.call('SADD', KEYS[1], ARGV[index])
            end
            if #ARGV > 1 then
                redis.call('EXPIRE', KEYS[1], ARGV[1])
            end
            redis.call('SET', KEYS[2], '1', 'EX', ARGV[1])
            return 1
            """, Long.class);

    private final StringRedisTemplate redisTemplate;

    public Optional<String> applyWebhookEvent(WebhookEvent event) {
        if (!event.hasRoom()) {
            return Optional.empty();
        }

        String roomName = event.getRoom().getName();
        if (!roomName.startsWith(ROOM_NAME_PREFIX) || roomName.length() == ROOM_NAME_PREFIX.length()) {
            return Optional.empty();
        }

        try {
            return switch (event.getEvent()) {
                case EVENT_PARTICIPANT_JOINED -> {
                    addParticipant(roomName, event);
                    yield Optional.empty();
                }
                case EVENT_PARTICIPANT_LEFT -> removeParticipant(roomName, event);
                case EVENT_ROOM_FINISHED -> {
                    finishRoom(roomName);
                    yield Optional.empty();
                }
                default -> Optional.empty();
            };
        } catch (DataAccessException ignored) {
            return Optional.empty();
        }
    }

    public int getParticipantCount(String groupCode) {
        try {
            Long count = redisTemplate.opsForSet().size(participantsKey(roomName(groupCode)));
            return count == null ? 0 : count.intValue();
        } catch (DataAccessException ignored) {
            return 0;
        }
    }

    public Map<String, Integer> getParticipantCounts(Collection<String> groupCodes) {
        Map<String, Integer> participantCounts = new LinkedHashMap<>();
        if (groupCodes.isEmpty()) {
            return participantCounts;
        }

        List<String> codes = groupCodes.stream().toList();
        try {
            List<Object> results = redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
                for (String groupCode : codes) {
                    String key = participantsKey(roomName(groupCode));
                    connection.setCommands().sCard(key.getBytes(StandardCharsets.UTF_8));
                }
                return null;
            });

            for (int i = 0; i < codes.size(); i++) {
                Object result = results.get(i);
                int count = result instanceof Number number ? number.intValue() : 0;
                participantCounts.put(codes.get(i), count);
            }
        } catch (DataAccessException ignored) {
            codes.forEach(groupCode -> participantCounts.put(groupCode, 0));
        }

        return participantCounts;
    }

    public boolean isParticipatingInOtherRoom(
            String identity,
            String currentGroupCode,
            Supplier<? extends Collection<String>> memberGroupCodesSupplier
    ) {
        String participantRoomsKey = participantRoomsKey(identity);
        String participantRoomsIndexedKey = participantRoomsIndexedKey(identity);
        Long result = redisTemplate.execute(
                HAS_OTHER_ROOM_SCRIPT,
                List.of(participantRoomsKey, participantRoomsIndexedKey),
                roomName(currentGroupCode)
        );
        if (result == null) {
            throw new IllegalStateException("LiveKit room participation lookup returned no result.");
        }
        if (!Long.valueOf(-1L).equals(result)) {
            return Long.valueOf(1L).equals(result);
        }

        List<String> joinedRoomNames =
                findJoinedRoomsFromLegacyIndex(identity, memberGroupCodesSupplier.get());
        backfillParticipantRooms(participantRoomsKey, participantRoomsIndexedKey, joinedRoomNames);
        String currentRoomName = roomName(currentGroupCode);
        return joinedRoomNames.stream().anyMatch(joinedRoomName -> !joinedRoomName.equals(currentRoomName));
    }

    private void addParticipant(String roomName, WebhookEvent event) {
        if (!event.hasParticipant()) {
            return;
        }

        String identity = event.getParticipant().getIdentity();
        if (identity.isBlank()) {
            return;
        }

        redisTemplate.execute(
                ADD_PARTICIPANT_SCRIPT,
                List.of(
                        participantsKey(roomName),
                        participantRoomsKey(identity),
                        connectionsKey(roomName),
                        participantRoomsIndexedKey(identity)
                ),
                identity,
                roomName,
                event.getParticipant().getSid(),
                String.valueOf(STATUS_TTL.toSeconds())
        );
    }

    private Optional<String> removeParticipant(String roomName, WebhookEvent event) {
        if (!event.hasParticipant()) {
            return Optional.empty();
        }

        String identity = event.getParticipant().getIdentity();
        if (identity.isBlank()) {
            return Optional.empty();
        }

        Long remainingParticipants = redisTemplate.execute(
                REMOVE_PARTICIPANT_SCRIPT,
                List.of(
                        participantsKey(roomName),
                        participantRoomsKey(identity),
                        connectionsKey(roomName),
                        participantRoomsIndexedKey(identity)
                ),
                identity,
                roomName,
                event.getParticipant().getSid(),
                String.valueOf(STATUS_TTL.toSeconds())
        );
        if (Long.valueOf(0L).equals(remainingParticipants)) {
            return Optional.of(roomName.substring(ROOM_NAME_PREFIX.length()));
        }
        return Optional.empty();
    }

    private void finishRoom(String roomName) {
        redisTemplate.execute(
                FINISH_ROOM_SCRIPT,
                List.of(participantsKey(roomName), connectionsKey(roomName)),
                roomName,
                PARTICIPANT_ROOMS_KEY_PREFIX,
                PARTICIPANT_ROOMS_KEY_SUFFIX
        );
    }

    private List<String> findJoinedRoomsFromLegacyIndex(
            String identity,
            Collection<String> memberGroupCodes
    ) {
        List<String> roomNames = memberGroupCodes.stream()
                .distinct()
                .map(this::roomName)
                .toList();
        if (roomNames.isEmpty()) {
            return List.of();
        }

        byte[] identityBytes = identity.getBytes(StandardCharsets.UTF_8);
        List<Object> results = redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
            for (String candidateRoomName : roomNames) {
                connection.setCommands().sIsMember(
                        participantsKey(candidateRoomName).getBytes(StandardCharsets.UTF_8),
                        identityBytes
                );
            }
            return null;
        });

        List<String> joinedRoomNames = new ArrayList<>();
        for (int i = 0; i < roomNames.size(); i++) {
            if (Boolean.TRUE.equals(results.get(i))) {
                joinedRoomNames.add(roomNames.get(i));
            }
        }
        return joinedRoomNames;
    }

    private void backfillParticipantRooms(
            String participantRoomsKey,
            String participantRoomsIndexedKey,
            List<String> joinedRoomNames
    ) {
        List<String> arguments = new ArrayList<>();
        arguments.add(String.valueOf(STATUS_TTL.toSeconds()));
        arguments.addAll(joinedRoomNames);
        redisTemplate.execute(
                BACKFILL_PARTICIPANT_ROOMS_SCRIPT,
                List.of(participantRoomsKey, participantRoomsIndexedKey),
                arguments.toArray()
        );
    }

    private String roomName(String groupCode) {
        return ROOM_NAME_PREFIX + groupCode;
    }

    private String participantsKey(String roomName) {
        return PARTICIPANTS_KEY_PREFIX + roomName + PARTICIPANTS_KEY_SUFFIX;
    }

    private String connectionsKey(String roomName) {
        return PARTICIPANTS_KEY_PREFIX + roomName + CONNECTIONS_KEY_SUFFIX;
    }

    private String participantRoomsKey(String identity) {
        return PARTICIPANT_ROOMS_KEY_PREFIX + identity + PARTICIPANT_ROOMS_KEY_SUFFIX;
    }

    private String participantRoomsIndexedKey(String identity) {
        return participantRoomsKey(identity) + PARTICIPANT_ROOMS_INDEXED_KEY_SUFFIX;
    }
}
