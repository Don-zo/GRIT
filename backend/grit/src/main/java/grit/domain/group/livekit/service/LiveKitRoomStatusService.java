package grit.domain.group.livekit.service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import livekit.LivekitWebhook.WebhookEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LiveKitRoomStatusService {

    private static final String ROOM_NAME_PREFIX = "group:";
    private static final String PARTICIPANTS_KEY_PREFIX = "livekit:room:";
    private static final String PARTICIPANTS_KEY_SUFFIX = ":participants";
    private static final String EVENT_PARTICIPANT_JOINED = "participant_joined";
    private static final String EVENT_PARTICIPANT_LEFT = "participant_left";
    private static final String EVENT_ROOM_FINISHED = "room_finished";
    private static final Duration STATUS_TTL = Duration.ofHours(24);

    private final StringRedisTemplate redisTemplate;

    public void applyWebhookEvent(WebhookEvent event) {
        if (!event.hasRoom()) {
            return;
        }

        String roomName = event.getRoom().getName();
        if (!roomName.startsWith(ROOM_NAME_PREFIX) || roomName.length() == ROOM_NAME_PREFIX.length()) {
            return;
        }

        try {
            switch (event.getEvent()) {
                case EVENT_PARTICIPANT_JOINED -> addParticipant(roomName, event);
                case EVENT_PARTICIPANT_LEFT -> removeParticipant(roomName, event);
                case EVENT_ROOM_FINISHED -> redisTemplate.delete(participantsKey(roomName));
                default -> {
                }
            }
        } catch (DataAccessException ignored) {
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

    private void addParticipant(String roomName, WebhookEvent event) {
        if (!event.hasParticipant()) {
            return;
        }

        String identity = event.getParticipant().getIdentity();
        if (identity.isBlank()) {
            return;
        }

        redisTemplate.opsForSet().add(participantsKey(roomName), identity);
        redisTemplate.expire(participantsKey(roomName), STATUS_TTL);
    }

    private void removeParticipant(String roomName, WebhookEvent event) {
        if (!event.hasParticipant()) {
            return;
        }

        String identity = event.getParticipant().getIdentity();
        if (identity.isBlank()) {
            return;
        }

        redisTemplate.opsForSet().remove(participantsKey(roomName), identity);
    }

    private String roomName(String groupCode) {
        return ROOM_NAME_PREFIX + groupCode;
    }

    private String participantsKey(String roomName) {
        return PARTICIPANTS_KEY_PREFIX + roomName + PARTICIPANTS_KEY_SUFFIX;
    }
}
