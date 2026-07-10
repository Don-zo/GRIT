package grit.domain.studytime.service;

import grit.domain.member.entity.Member;
import grit.domain.member.repository.MemberRepository;
import java.time.Clock;
import java.time.Instant;
import java.util.Optional;
import livekit.LivekitWebhook.WebhookEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudyTimeLiveKitWebhookService {

    private static final String EVENT_PARTICIPANT_LEFT = "participant_left";

    private final MemberRepository memberRepository;
    private final StudyTimeService studyTimeService;
    private final Clock clock;

    public void applyWebhookEvent(WebhookEvent event) {
        if (!event.hasRoom()) {
            return;
        }

        if (!EVENT_PARTICIPANT_LEFT.equals(event.getEvent())) {
            return;
        }

        findEventMember(event).ifPresent(member ->
                studyTimeService.pauseForRoomLeave(member, Instant.now(clock)));
    }

    private Optional<Member> findEventMember(WebhookEvent event) {
        if (!event.hasParticipant()) {
            return Optional.empty();
        }

        return parseMemberId(event.getParticipant().getIdentity())
                .flatMap(memberRepository::findById);
    }

    private Optional<Long> parseMemberId(String identity) {
        if (identity == null || !identity.startsWith("member:")) {
            return Optional.empty();
        }

        try {
            return Optional.of(Long.parseLong(identity.substring("member:".length())));
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }
}
