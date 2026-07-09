package grit.domain.studytime.service;

import grit.domain.group.GroupService;
import grit.domain.group.entity.Group;
import grit.domain.group.livekit.pomodoro.entity.Pomodoro;
import grit.domain.group.livekit.pomodoro.entity.PomodoroPhase;
import grit.domain.group.livekit.pomodoro.entity.PomodoroStatus;
import grit.domain.group.livekit.pomodoro.repository.PomodoroRepository;
import grit.domain.group.livekit.service.LiveKitRoomStatusService;
import grit.domain.member.entity.Member;
import grit.domain.member.dto.MemberStudyTimeResponseDto;
import grit.domain.member.repository.MemberRepository;
import grit.domain.studytime.dto.WeeklyStudyTimeResponseDto;
import grit.domain.studytime.entity.StudyTimerState;
import grit.domain.studytime.entity.WeeklyStudyTime;
import grit.domain.studytime.repository.StudyTimerStateRepository;
import grit.domain.studytime.repository.WeeklyStudyTimeRepository;
import grit.global.config.TimeConfig;
import grit.global.exception.AccessDeniedException;
import grit.global.exception.EntityNotFoundException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudyTimeService {

    private static final long POMODORO_ROUND_SECONDS = 60 * 60L;

    private final StudyTimerStateRepository studyTimerStateRepository;
    private final WeeklyStudyTimeRepository weeklyStudyTimeRepository;
    private final PomodoroRepository pomodoroRepository;
    private final LiveKitRoomStatusService liveKitRoomStatusService;
    private final MemberRepository memberRepository;
    private final GroupService groupService;
    private final Clock clock;

    @Transactional
    public WeeklyStudyTimeResponseDto getWeekly(Member member) {
        Instant now = Instant.now(clock);
        StudyTimerState state = studyTimerStateRepository.findByMember(member).orElse(null);

        LocalDate weekStartDate = getWeekStartDate(now);
        long accumulatedSeconds = weeklyStudyTimeRepository
                .findByMemberAndWeekStartDate(member, weekStartDate)
                .map(WeeklyStudyTime::getAccumulatedSeconds)
                .orElse(0L);

        boolean running = state != null && state.isRunning();
        Instant lastStartedAt = state == null ? null : state.getLastStartedAt();
        Long activeGroupId = Optional.ofNullable(state)
                .map(StudyTimerState::getActiveGroup)
                .map(Group::getId)
                .orElse(null);

        if (running && lastStartedAt != null) {
            accumulatedSeconds += getSecondsWithinWeek(lastStartedAt, now, weekStartDate);
        }

        return new WeeklyStudyTimeResponseDto(
                weekStartDate,
                accumulatedSeconds,
                running,
                now,
                lastStartedAt,
                activeGroupId
        );
    }

    @Transactional
    public MemberStudyTimeResponseDto getMemberStudyTime(Member member) {
        WeeklyStudyTimeResponseDto weekly = getWeekly(member);
        return new MemberStudyTimeResponseDto(
                member.getWeeklyStudyTimeGoal(),
                weekly.accumulatedSeconds()
        );
    }

    @Transactional
    public WeeklyStudyTimeResponseDto manualResume(Member member, String groupCode) {
        Group group = groupService.findGroupByCode(groupCode);
        checkPermission(member, group);

        StudyTimerState state = findOrCreateStateForUpdate(member);
        state.clearManualPaused();
        startOrResume(state, group, Instant.now(clock));

        return getWeekly(member);
    }

    @Transactional
    public WeeklyStudyTimeResponseDto manualPause(Member member, String groupCode) {
        Group group = groupService.findGroupByCode(groupCode);
        checkPermission(member, group);

        Instant now = Instant.now(clock);
        Optional<String> manualPausePhaseKey = pomodoroRepository.findByGroup(group)
                .flatMap(pomodoro -> getAutoResumePhaseKey(pomodoro, now));

        StudyTimerState state = manualPausePhaseKey
                .map(phaseKey -> findOrCreateStateForUpdate(member))
                .orElseGet(() -> studyTimerStateRepository.findByMemberForUpdate(member).orElse(null));
        if (state == null) {
            return getWeekly(member);
        }

        pause(state, now);

        manualPausePhaseKey.ifPresentOrElse(
                        phaseKey -> state.markManualPaused(group, phaseKey),
                        state::clearManualPaused
                );

        return getWeekly(member);
    }

    @Transactional
    public void applyPomodoroToActiveRoomMembers(Group group, Pomodoro pomodoro, Collection<Member> additionalMembers) {
        Instant now = Instant.now(clock);
        findActiveRoomMembers(group, additionalMembers)
                .forEach(member -> applyPomodoroAutoState(member, group, pomodoro, now));
    }

    @Transactional
    public void applyPomodoroAutoState(Member member, Group group, Pomodoro pomodoro, Instant now) {
        checkPermission(member, group);

        PomodoroStatus currentStatus = pomodoro.getCurrentStatus(now);
        PomodoroPhase currentPhase = pomodoro.getCurrentPhase(now);
        String phaseKey = getPhaseKey(pomodoro, now).orElse(null);

        if (currentStatus != PomodoroStatus.RUNNING || currentPhase != PomodoroPhase.FOCUS) {
            studyTimerStateRepository.findByMemberForUpdate(member)
                    .ifPresent(state -> {
                        if (phaseKey != null && !state.hasManualPauseFor(group, phaseKey)) {
                            state.clearManualPaused();
                        }
                        pauseIfRunningInGroup(state, group, getAutoPauseInstant(pomodoro, now, state));
                    });
            return;
        }

        StudyTimerState state = findOrCreateStateForUpdate(member);

        if (phaseKey != null && !state.hasManualPauseFor(group, phaseKey)) {
            state.clearManualPaused();
        }

        if (phaseKey != null && state.hasManualPauseFor(group, phaseKey)) {
            return;
        }

        startOrResume(state, group, now);
    }

    @Transactional
    public void pauseForRoomLeave(Member member, Group group, Instant now) {
        studyTimerStateRepository.findByMemberForUpdate(member)
                .filter(state -> state.isRunningIn(group))
                .ifPresent(state -> pause(state, now));
    }

    @Transactional
    public void pauseRunningMembersInGroup(Group group, Instant now) {
        studyTimerStateRepository.findRunningByActiveGroupForUpdate(group)
                .forEach(state -> pause(state, now));
    }

    @Transactional
    public void pauseRunningMembersInGroup(Group group, Pomodoro pomodoro, Instant now) {
        studyTimerStateRepository.findRunningByActiveGroupForUpdate(group)
                .forEach(state -> pause(state, getAutoPauseInstant(pomodoro, now, state)));
    }

    private StudyTimerState findOrCreateStateForUpdate(Member member) {
        Optional<StudyTimerState> existingState = studyTimerStateRepository.findByMemberForUpdate(member);
        if (existingState.isPresent()) {
            return existingState.get();
        }

        Member lockedMember = memberRepository.findLockedById(member.getId())
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 회원입니다."));
        return studyTimerStateRepository.findByMemberForUpdate(lockedMember)
                .orElseGet(() -> studyTimerStateRepository.save(StudyTimerState.create(lockedMember)));
    }

    private List<Member> findActiveRoomMembers(Group group, Collection<Member> additionalMembers) {
        Set<Long> memberIds = new LinkedHashSet<>();
        liveKitRoomStatusService.getParticipantIdentities(group.getCode()).stream()
                .map(this::parseMemberId)
                .flatMap(Optional::stream)
                .forEach(memberIds::add);

        for (Member member : additionalMembers) {
            if (member.getId() != null) {
                memberIds.add(member.getId());
            }
        }

        Map<Long, Member> membersById = new LinkedHashMap<>();
        memberRepository.findAllById(memberIds)
                .forEach(member -> membersById.put(member.getId(), member));
        return memberIds.stream()
                .map(membersById::get)
                .filter(member -> member != null)
                .toList();
    }

    private Instant getAutoPauseInstant(Pomodoro pomodoro, Instant now, StudyTimerState state) {
        PomodoroStatus status = pomodoro.getCurrentStatus(now);
        Instant lastStartedAt = state.getLastStartedAt();

        if (status == PomodoroStatus.BREAK) {
            return Optional.ofNullable(pomodoro.getFocusEndsAt(now))
                    .filter(focusEndsAt -> lastStartedAt != null && lastStartedAt.isBefore(focusEndsAt))
                    .orElse(now);
        }

        if (status == PomodoroStatus.PAUSED) {
            return Optional.ofNullable(pomodoro.getPausedAt())
                    .filter(pausedAt -> lastStartedAt == null || pausedAt.isAfter(lastStartedAt))
                    .orElse(now);
        }

        if (status == PomodoroStatus.FINISHED) {
            return getFirstFocusEndAfter(pomodoro, lastStartedAt, now).orElse(now);
        }

        return now;
    }

    private Optional<Instant> getFirstFocusEndAfter(Pomodoro pomodoro, Instant lastStartedAt, Instant now) {
        if (lastStartedAt == null || pomodoro.getStartedAt() == null) {
            return Optional.empty();
        }

        Instant firstFocusEndsAt = Optional.ofNullable(pomodoro.getAnchorFocusEndsAt())
                .orElseGet(() -> pomodoro.getStartedAt().plusSeconds(pomodoro.getFocusMinutes() * 60L));
        for (int round = 0; round < pomodoro.getTotalRounds(); round++) {
            Instant focusEndsAt = firstFocusEndsAt.plusSeconds(round * POMODORO_ROUND_SECONDS);
            if (focusEndsAt.isAfter(lastStartedAt) && !focusEndsAt.isAfter(now)) {
                return Optional.of(focusEndsAt);
            }
        }

        return Optional.empty();
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

    private void startOrResume(StudyTimerState state, Group group, Instant now) {
        if (state.isRunningIn(group)) {
            return;
        }

        if (state.isRunning()) {
            pause(state, now);
        }

        state.start(group, now);
    }

    private void pauseIfRunningInGroup(StudyTimerState state, Group group, Instant now) {
        if (state.isRunningIn(group)) {
            pause(state, now);
        }
    }

    private void pause(StudyTimerState state, Instant now) {
        Instant startedAt = state.pause();
        if (startedAt == null) {
            return;
        }

        addElapsedToWeeklyRows(state.getMember(), startedAt, now);
    }

    private void addElapsedToWeeklyRows(Member member, Instant from, Instant to) {
        if (!to.isAfter(from)) {
            return;
        }

        ZoneId zone = TimeConfig.SERVICE_ZONE;
        ZonedDateTime cursor = from.atZone(zone);
        ZonedDateTime end = to.atZone(zone);

        while (cursor.isBefore(end)) {
            LocalDate weekStartDate = getWeekStartDate(cursor.toLocalDate());
            ZonedDateTime nextWeekStart = weekStartDate.plusWeeks(1).atStartOfDay(zone);
            ZonedDateTime segmentEnd = end.isBefore(nextWeekStart) ? end : nextWeekStart;
            long seconds = Duration.between(cursor.toInstant(), segmentEnd.toInstant()).getSeconds();

            if (seconds > 0) {
                WeeklyStudyTime weeklyStudyTime = weeklyStudyTimeRepository
                        .findByMemberAndWeekStartDateForUpdate(member, weekStartDate)
                        .orElseGet(() -> weeklyStudyTimeRepository.save(WeeklyStudyTime.create(member, weekStartDate)));
                weeklyStudyTime.addSeconds(seconds);
            }

            cursor = segmentEnd;
        }
    }

    private long getSecondsWithinWeek(Instant from, Instant to, LocalDate weekStartDate) {
        ZoneId zone = TimeConfig.SERVICE_ZONE;
        Instant weekStart = weekStartDate.atStartOfDay(zone).toInstant();
        Instant nextWeekStart = weekStartDate.plusWeeks(1).atStartOfDay(zone).toInstant();
        Instant segmentStart = from.isAfter(weekStart) ? from : weekStart;
        Instant segmentEnd = to.isBefore(nextWeekStart) ? to : nextWeekStart;

        if (!segmentEnd.isAfter(segmentStart)) {
            return 0;
        }

        return Duration.between(segmentStart, segmentEnd).getSeconds();
    }

    private Optional<String> getAutoResumePhaseKey(Pomodoro pomodoro, Instant now) {
        if (pomodoro.getCurrentStatus(now) != PomodoroStatus.RUNNING
                || pomodoro.getCurrentPhase(now) != PomodoroPhase.FOCUS) {
            return Optional.empty();
        }

        return getPhaseKey(pomodoro, now);
    }

    private Optional<String> getPhaseKey(Pomodoro pomodoro, Instant now) {
        PomodoroPhase phase = pomodoro.getCurrentPhase(now);
        if (pomodoro.getId() == null || pomodoro.getStartedAt() == null || phase == null) {
            return Optional.empty();
        }

        return Optional.of(pomodoro.getId()
                + ":"
                + pomodoro.getStartedAt().toEpochMilli()
                + ":"
                + pomodoro.getCurrentRound(now)
                + ":"
                + phase.name());
    }

    private LocalDate getWeekStartDate(Instant instant) {
        return getWeekStartDate(LocalDate.ofInstant(instant, TimeConfig.SERVICE_ZONE));
    }

    private LocalDate getWeekStartDate(LocalDate date) {
        return date.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
    }

    private void checkPermission(Member member, Group group) {
        if (!groupService.isMemberInGroup(member, group)) {
            throw new AccessDeniedException("권한이 없습니다.");
        }
    }
}
