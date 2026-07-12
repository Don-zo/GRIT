package grit.domain.studytime.service;

import grit.domain.member.dto.MemberStudyTimeResponseDto;
import grit.domain.member.entity.Member;
import grit.domain.member.repository.MemberRepository;
import grit.domain.studytime.entity.StudyTimerState;
import grit.domain.studytime.entity.WeeklyStudyTime;
import grit.domain.studytime.repository.StudyTimerStateRepository;
import grit.domain.studytime.repository.WeeklyStudyTimeRepository;
import grit.global.config.TimeConfig;
import grit.global.exception.EntityNotFoundException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudyTimeService {

    private final StudyTimerStateRepository studyTimerStateRepository;
    private final WeeklyStudyTimeRepository weeklyStudyTimeRepository;
    private final MemberRepository memberRepository;
    private final Clock clock;

    @Transactional(readOnly = true)
    public MemberStudyTimeResponseDto getStudyTime(Member member) {
        Instant now = Instant.now(clock);
        StudyTimerState state = studyTimerStateRepository.findByMember(member).orElse(null);

        LocalDate weekStartDate = getWeekStartDate(now);
        long accumulatedSeconds = weeklyStudyTimeRepository
                .findByMemberAndWeekStartDate(member, weekStartDate)
                .map(WeeklyStudyTime::getAccumulatedSeconds)
                .orElse(0L);

        boolean running = state != null && state.isRunning();
        Instant lastStartedAt = state == null ? null : state.getLastStartedAt();
        if (running && lastStartedAt != null) {
            accumulatedSeconds += getSecondsWithinWeek(lastStartedAt, now, weekStartDate);
        }

        return new MemberStudyTimeResponseDto(
                weekStartDate,
                member.getWeeklyStudyTimeGoal() == null
                        ? null
                        : (long) member.getWeeklyStudyTimeGoal().toSecondOfDay(),
                accumulatedSeconds,
                running,
                now,
                lastStartedAt
        );
    }

    @Transactional
    public MemberStudyTimeResponseDto resume(Member member) {
        StudyTimerState state = findOrCreateStateForUpdate(member);
        state.start(Instant.now(clock));

        return getStudyTime(member);
    }

    @Transactional
    public MemberStudyTimeResponseDto pause(Member member) {
        Instant now = Instant.now(clock);
        StudyTimerState state = studyTimerStateRepository.findByMemberForUpdate(member).orElse(null);
        if (state == null) {
            return getStudyTime(member);
        }

        pauseAndAccumulate(state, now);

        return getStudyTime(member);
    }

    @Transactional
    public void pauseForRoomLeave(Member member, Instant now) {
        studyTimerStateRepository.findByMemberForUpdate(member)
                .ifPresent(state -> pauseAndAccumulate(state, now));
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

    private void pauseAndAccumulate(StudyTimerState state, Instant now) {
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
                        .findByMemberAndWeekStartDate(member, weekStartDate)
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

    private LocalDate getWeekStartDate(Instant instant) {
        return getWeekStartDate(LocalDate.ofInstant(instant, TimeConfig.SERVICE_ZONE));
    }

    private LocalDate getWeekStartDate(LocalDate date) {
        return date.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
    }
}
