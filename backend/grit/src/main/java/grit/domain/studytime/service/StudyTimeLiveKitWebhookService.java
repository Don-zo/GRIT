package grit.domain.studytime.service;

import grit.domain.group.GroupService;
import grit.domain.group.entity.Group;
import grit.domain.group.livekit.pomodoro.repository.PomodoroRepository;
import grit.domain.member.entity.Member;
import grit.domain.member.repository.MemberRepository;
import grit.global.exception.EntityNotFoundException;
import java.time.Clock;
import java.time.Instant;
import livekit.LivekitWebhook.WebhookEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudyTimeLiveKitWebhookService {

    private static final String ROOM_NAME_PREFIX = "group:";
    private static final String EVENT_PARTICIPANT_JOINED = "participant_joined";
    private static final String EVENT_PARTICIPANT_LEFT = "participant_left";
    private static final String EVENT_ROOM_FINISHED = "room_finished";

    private final GroupService groupService;
    private final MemberRepository memberRepository;
    private final PomodoroRepository pomodoroRepository;
    private final StudyTimeService studyTimeService;
    private final Clock clock;

    public void applyWebhookEvent(WebhookEvent event) {
        if (!event.hasRoom()) {
            return;
        }

        String groupCode = getGroupCode(event.getRoom().getName());
        if (groupCode == null) {
            return;
        }

        Group group;
        try {
            group = groupService.findGroupByCode(groupCode);
        } catch (EntityNotFoundException e) {
            return;
        }

        switch (event.getEvent()) {
            case EVENT_PARTICIPANT_JOINED -> applyParticipantJoined(event, group);
            case EVENT_PARTICIPANT_LEFT -> applyParticipantLeft(event, group);
            case EVENT_ROOM_FINISHED -> studyTimeService.pauseRunningMembersInGroup(group, Instant.now(clock));
            default -> {
            }
        }
    }

    private void applyParticipantJoined(WebhookEvent event, Group group) {
        findEventMember(event).ifPresent(member -> pomodoroRepository.findByGroup(group)
                .ifPresent(pomodoro -> studyTimeService.applyPomodoroAutoState(member, group, pomodoro, Instant.now(clock))));
    }

    private void applyParticipantLeft(WebhookEvent event, Group group) {
        findEventMember(event).ifPresent(member ->
                studyTimeService.pauseForRoomLeave(member, group, Instant.now(clock)));
    }

    private java.util.Optional<Member> findEventMember(WebhookEvent event) {
        if (!event.hasParticipant()) {
            return java.util.Optional.empty();
        }

        return parseMemberId(event.getParticipant().getIdentity())
                .flatMap(memberRepository::findById);
    }

    private java.util.Optional<Long> parseMemberId(String identity) {
        if (identity == null || !identity.startsWith("member:")) {
            return java.util.Optional.empty();
        }

        try {
            return java.util.Optional.of(Long.parseLong(identity.substring("member:".length())));
        } catch (NumberFormatException e) {
            return java.util.Optional.empty();
        }
    }

    private String getGroupCode(String roomName) {
        if (roomName == null
                || !roomName.startsWith(ROOM_NAME_PREFIX)
                || roomName.length() == ROOM_NAME_PREFIX.length()) {
            return null;
        }

        return roomName.substring(ROOM_NAME_PREFIX.length());
    }
}
