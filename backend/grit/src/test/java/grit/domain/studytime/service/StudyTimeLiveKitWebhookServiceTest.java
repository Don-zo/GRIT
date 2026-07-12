package grit.domain.studytime.service;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import grit.domain.member.entity.Member;
import grit.domain.member.repository.MemberRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import livekit.LivekitModels.ParticipantInfo;
import livekit.LivekitModels.Room;
import livekit.LivekitWebhook.WebhookEvent;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class StudyTimeLiveKitWebhookServiceTest {

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private StudyTimeService studyTimeService;

    private final Clock clock = Clock.fixed(Instant.parse("2026-07-10T10:00:00Z"), ZoneOffset.UTC);

    @Test
    void participantLeftPausesMemberFoundByNicknameIdentity() {
        Member member = Member.builder()
                .id(1L)
                .nickname("member")
                .build();
        WebhookEvent event = WebhookEvent.newBuilder()
                .setEvent("participant_left")
                .setRoom(Room.newBuilder().setName("group:ABC123"))
                .setParticipant(ParticipantInfo.newBuilder().setIdentity("member"))
                .build();
        StudyTimeLiveKitWebhookService service = new StudyTimeLiveKitWebhookService(
                memberRepository,
                studyTimeService,
                clock
        );
        when(memberRepository.findByNickname("member")).thenReturn(Optional.of(member));

        service.applyWebhookEvent(event);

        verify(studyTimeService).pauseForRoomLeave(member, clock.instant());
    }
}
