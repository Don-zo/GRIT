package grit.domain.group.livekit.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.Optional;
import livekit.LivekitModels.ParticipantInfo;
import livekit.LivekitModels.Room;
import livekit.LivekitWebhook.WebhookEvent;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.SetOperations;
import org.springframework.data.redis.core.StringRedisTemplate;

@ExtendWith(MockitoExtension.class)
class LiveKitRoomStatusServiceTest {

    private static final String PARTICIPANTS_KEY = "livekit:room:group:ABC123:participants";

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private SetOperations<String, String> setOperations;

    @Test
    void participantLeftReturnsGroupCodeWhenRoomBecomesEmpty() {
        LiveKitRoomStatusService service = new LiveKitRoomStatusService(redisTemplate);
        when(redisTemplate.opsForSet()).thenReturn(setOperations);
        when(setOperations.size(PARTICIPANTS_KEY)).thenReturn(0L);

        Optional<String> emptyRoomGroupCode = service.applyWebhookEvent(participantLeftEvent());

        assertThat(emptyRoomGroupCode).contains("ABC123");
    }

    @Test
    void participantLeftDoesNotReturnGroupCodeWhenParticipantRemains() {
        LiveKitRoomStatusService service = new LiveKitRoomStatusService(redisTemplate);
        when(redisTemplate.opsForSet()).thenReturn(setOperations);
        when(setOperations.size(PARTICIPANTS_KEY)).thenReturn(1L);

        Optional<String> emptyRoomGroupCode = service.applyWebhookEvent(participantLeftEvent());

        assertThat(emptyRoomGroupCode).isEmpty();
    }

    private WebhookEvent participantLeftEvent() {
        return WebhookEvent.newBuilder()
                .setEvent("participant_left")
                .setRoom(Room.newBuilder().setName("group:ABC123"))
                .setParticipant(ParticipantInfo.newBuilder().setIdentity("member"))
                .build();
    }
}
