package grit.domain.group.livekit.service;

import livekit.LivekitWebhook.WebhookEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
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

    private final StringRedisTemplate redisTemplate;

    public void applyWebhookEvent(WebhookEvent event) {
        if (!event.hasRoom()) {
            return;
        }

        String roomName = event.getRoom().getName();
        if (!roomName.startsWith(ROOM_NAME_PREFIX)) {
            return;
        }

        switch (event.getEvent()) {
            case EVENT_PARTICIPANT_JOINED -> addParticipant(roomName, event);
            case EVENT_PARTICIPANT_LEFT -> removeParticipant(roomName, event);
            case EVENT_ROOM_FINISHED -> redisTemplate.delete(participantsKey(roomName));
            default -> {
            }
        }
    }

    public int getParticipantCount(String groupCode) {
        try {
            Long count = redisTemplate.opsForSet().size(participantsKey(roomName(groupCode)));
            return count == null ? 0 : count.intValue();
        } catch (DataAccessException e) {
            return 0;
        }
    }

    private void addParticipant(String roomName, WebhookEvent event) {
        if (!event.hasParticipant()) {
            return;
        }

        redisTemplate.opsForSet().add(participantsKey(roomName), event.getParticipant().getIdentity());
    }

    private void removeParticipant(String roomName, WebhookEvent event) {
        if (!event.hasParticipant()) {
            return;
        }

        String key = participantsKey(roomName);
        redisTemplate.opsForSet().remove(key, event.getParticipant().getIdentity());
        Long count = redisTemplate.opsForSet().size(key);

        if (count == null || count <= 0) {
            redisTemplate.delete(key);
        }
    }

    private String roomName(String groupCode) {
        return ROOM_NAME_PREFIX + groupCode;
    }

    private String participantsKey(String roomName) {
        return PARTICIPANTS_KEY_PREFIX + roomName + PARTICIPANTS_KEY_SUFFIX;
    }
}
