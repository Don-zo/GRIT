package grit.domain.group.livekit.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import livekit.LivekitModels.ParticipantInfo;
import livekit.LivekitModels.Room;
import livekit.LivekitWebhook.WebhookEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.QueryTimeoutException;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings({"rawtypes", "unchecked"})
class LiveKitRoomStatusServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    private LiveKitRoomStatusService service;

    @BeforeEach
    void setUp() {
        service = new LiveKitRoomStatusService(redisTemplate);
    }

    @Test
    void currentRoomIsExcludedFromOtherRoomParticipation() {
        when(redisTemplate.execute(
                any(RedisScript.class),
                eq(List.of(
                        "livekit:participant:member:rooms",
                        "livekit:participant:member:rooms:indexed"
                )),
                eq("group:CURRENT")
        )).thenReturn(0L);

        boolean result = service.isParticipatingInOtherRoom(
                "member",
                "CURRENT",
                () -> {
                    throw new AssertionError("fast path must not load group memberships");
                }
        );

        assertThat(result).isFalse();
    }

    @Test
    void returnsTrueWhenReverseIndexContainsAnotherRoom() {
        when(redisTemplate.execute(
                any(RedisScript.class),
                eq(List.of(
                        "livekit:participant:member:rooms",
                        "livekit:participant:member:rooms:indexed"
                )),
                eq("group:CURRENT")
        )).thenReturn(1L);

        boolean result = service.isParticipatingInOtherRoom(
                "member",
                "CURRENT",
                () -> {
                    throw new AssertionError("fast path must not load group memberships");
                }
        );

        assertThat(result).isTrue();
    }

    @Test
    void redisFailureIsPropagatedInsteadOfReturningFalse() {
        when(redisTemplate.execute(
                any(RedisScript.class),
                eq(List.of(
                        "livekit:participant:member:rooms",
                        "livekit:participant:member:rooms:indexed"
                )),
                eq("group:CURRENT")
        ))
                .thenThrow(new QueryTimeoutException("timeout"));

        assertThatThrownBy(() ->
                service.isParticipatingInOtherRoom("member", "CURRENT", List::of))
                .isInstanceOf(QueryTimeoutException.class);
    }

    @Test
    void missingReverseIndexIsBackfilledFromExistingRoomIndexes() {
        when(redisTemplate.execute(
                any(RedisScript.class),
                eq(List.of(
                        "livekit:participant:member:rooms",
                        "livekit:participant:member:rooms:indexed"
                )),
                eq("group:CURRENT")
        )).thenReturn(-1L);
        when(redisTemplate.executePipelined(any(RedisCallback.class)))
                .thenReturn(List.of(false, true));

        boolean result = service.isParticipatingInOtherRoom(
                "member",
                "CURRENT",
                () -> List.of("CURRENT", "OTHER")
        );

        assertThat(result).isTrue();
        verify(redisTemplate).execute(
                any(RedisScript.class),
                eq(List.of(
                        "livekit:participant:member:rooms",
                        "livekit:participant:member:rooms:indexed"
                )),
                eq("86400"),
                eq("group:OTHER")
        );
    }

    @Test
    void joinedEventAtomicallyUpdatesRoomAndParticipantIndexes() {
        WebhookEvent event = participantEvent("participant_joined", "group:CURRENT", "member", "PA_1");

        service.applyWebhookEvent(event);

        verify(redisTemplate).execute(
                any(RedisScript.class),
                eq(List.of(
                        "livekit:room:group:CURRENT:participants",
                        "livekit:participant:member:rooms",
                        "livekit:room:group:CURRENT:connections",
                        "livekit:participant:member:rooms:indexed"
                )),
                eq("member"),
                eq("group:CURRENT"),
                eq("PA_1"),
                eq("86400")
        );
    }

    @Test
    void leftEventPassesConnectionSidForStaleEventProtection() {
        WebhookEvent event = participantEvent("participant_left", "group:CURRENT", "member", "PA_1");

        service.applyWebhookEvent(event);

        verify(redisTemplate).execute(
                any(RedisScript.class),
                eq(List.of(
                        "livekit:room:group:CURRENT:participants",
                        "livekit:participant:member:rooms",
                        "livekit:room:group:CURRENT:connections",
                        "livekit:participant:member:rooms:indexed"
                )),
                eq("member"),
                eq("group:CURRENT"),
                eq("PA_1"),
                eq("86400")
        );
    }

    @Test
    void participantLeftReturnsGroupCodeWhenRoomBecomesEmpty() {
        WebhookEvent event = participantEvent("participant_left", "group:ABC123", "member", "PA_1");
        when(redisTemplate.execute(
                any(RedisScript.class),
                eq(List.of(
                        "livekit:room:group:ABC123:participants",
                        "livekit:participant:member:rooms",
                        "livekit:room:group:ABC123:connections",
                        "livekit:participant:member:rooms:indexed"
                )),
                eq("member"),
                eq("group:ABC123"),
                eq("PA_1"),
                eq("86400")
        )).thenReturn(0L);

        assertThat(service.applyWebhookEvent(event)).contains("ABC123");
    }

    @Test
    void participantLeftDoesNotReturnGroupCodeWhenParticipantRemains() {
        WebhookEvent event = participantEvent("participant_left", "group:ABC123", "member", "PA_1");
        when(redisTemplate.execute(
                any(RedisScript.class),
                eq(List.of(
                        "livekit:room:group:ABC123:participants",
                        "livekit:participant:member:rooms",
                        "livekit:room:group:ABC123:connections",
                        "livekit:participant:member:rooms:indexed"
                )),
                eq("member"),
                eq("group:ABC123"),
                eq("PA_1"),
                eq("86400")
        )).thenReturn(1L);

        assertThat(service.applyWebhookEvent(event)).isEmpty();
    }

    @Test
    void ignoresEventsOutsideManagedGroupRooms() {
        WebhookEvent event = participantEvent("participant_joined", "external-room", "member", "PA_1");

        service.applyWebhookEvent(event);

        verify(redisTemplate, never()).execute(
                any(RedisScript.class),
                any(),
                any()
        );
    }

    private WebhookEvent participantEvent(
            String eventName,
            String roomName,
            String identity,
            String participantSid
    ) {
        return WebhookEvent.newBuilder()
                .setEvent(eventName)
                .setRoom(Room.newBuilder().setName(roomName))
                .setParticipant(ParticipantInfo.newBuilder()
                        .setIdentity(identity)
                        .setSid(participantSid))
                .build();
    }
}
