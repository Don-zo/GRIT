package grit.domain.studytime.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

import grit.domain.group.GroupService;
import grit.domain.group.entity.Group;
import grit.domain.group.livekit.pomodoro.entity.Pomodoro;
import grit.domain.group.livekit.pomodoro.entity.PomodoroStatus;
import grit.domain.group.livekit.pomodoro.repository.PomodoroRepository;
import grit.domain.group.livekit.service.LiveKitRoomStatusService;
import grit.domain.member.constant.Role;
import grit.domain.member.constant.SocialProvider;
import grit.domain.member.dto.MemberStudyTimeResponseDto;
import grit.domain.member.entity.Member;
import grit.domain.member.repository.MemberRepository;
import grit.domain.studytime.entity.StudyTimerState;
import grit.domain.studytime.entity.WeeklyStudyTime;
import grit.domain.studytime.repository.StudyTimerStateRepository;
import grit.domain.studytime.repository.WeeklyStudyTimeRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class StudyTimeServiceTest {

    private static final ZoneId SERVICE_ZONE = ZoneId.of("Asia/Seoul");

    @Mock
    private StudyTimerStateRepository studyTimerStateRepository;

    @Mock
    private WeeklyStudyTimeRepository weeklyStudyTimeRepository;

    @Mock
    private PomodoroRepository pomodoroRepository;

    @Mock
    private LiveKitRoomStatusService liveKitRoomStatusService;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private GroupService groupService;

    private final MutableClock clock = new MutableClock(Instant.parse("2026-07-06T00:00:00Z"));
    private final Map<Long, StudyTimerState> states = new HashMap<>();
    private final Map<LocalDate, WeeklyStudyTime> weeklyTimes = new HashMap<>();
    private StudyTimeService studyTimeService;
    private Member member;
    private Group group;

    @BeforeEach
    void setUp() {
        studyTimeService = new StudyTimeService(
                studyTimerStateRepository,
                weeklyStudyTimeRepository,
                pomodoroRepository,
                liveKitRoomStatusService,
                memberRepository,
                groupService,
                clock
        );
        member = Member.builder()
                .id(1L)
                .email("member@example.com")
                .provider(SocialProvider.GOOGLE)
                .providerId("google-1")
                .nickname("member")
                .role(Role.USER)
                .weeklyStudyTimeGoal(LocalTime.of(12, 30))
                .build();
        group = Group.builder()
                .id(10L)
                .code("ABC123")
                .name("group")
                .build();

        lenient().when(groupService.findGroupByCode(group.getCode())).thenReturn(group);
        when(groupService.isMemberInGroup(member, group)).thenReturn(true);
        when(studyTimerStateRepository.findByMemberForUpdate(member))
                .thenAnswer(invocation -> Optional.ofNullable(states.get(member.getId())));
        when(studyTimerStateRepository.save(any(StudyTimerState.class)))
                .thenAnswer(invocation -> {
                    StudyTimerState state = invocation.getArgument(0);
                    states.put(state.getMember().getId(), state);
                    return state;
                });
        when(weeklyStudyTimeRepository.findByMemberAndWeekStartDate(any(Member.class), any(LocalDate.class)))
                .thenAnswer(invocation -> Optional.ofNullable(weeklyTimes.get(invocation.getArgument(1))));
        lenient().when(weeklyStudyTimeRepository.findByMemberAndWeekStartDateForUpdate(any(Member.class), any(LocalDate.class)))
                .thenAnswer(invocation -> Optional.ofNullable(weeklyTimes.get(invocation.getArgument(1))));
        lenient().when(weeklyStudyTimeRepository.save(any(WeeklyStudyTime.class)))
                .thenAnswer(invocation -> {
                    WeeklyStudyTime weeklyStudyTime = invocation.getArgument(0);
                    weeklyTimes.put(weeklyStudyTime.getWeekStartDate(), weeklyStudyTime);
                    return weeklyStudyTime;
                });
    }

    @Test
    void duplicateResumeAndPauseDoNotDoubleCountElapsedSeconds() {
        studyTimeService.manualResume(member, group.getCode());
        clock.setInstant(Instant.parse("2026-07-06T00:10:00Z"));
        studyTimeService.manualResume(member, group.getCode());

        clock.setInstant(Instant.parse("2026-07-06T00:20:00Z"));
        studyTimeService.manualPause(member, group.getCode());
        studyTimeService.manualPause(member, group.getCode());

        assertThat(studyTimeService.getWeekly(member).accumulatedSeconds()).isEqualTo(20 * 60);
    }

    @Test
    void manualPauseBlocksAutoResumeOnlyForSamePomodoroPhase() {
        Pomodoro pomodoro = runningPomodoro(12L, Instant.parse("2026-07-06T00:00:00Z"));
        when(pomodoroRepository.findByGroup(group)).thenReturn(Optional.of(pomodoro));

        studyTimeService.manualResume(member, group.getCode());
        clock.setInstant(Instant.parse("2026-07-06T00:10:00Z"));
        studyTimeService.manualPause(member, group.getCode());

        studyTimeService.applyPomodoroAutoState(member, group, pomodoro, Instant.parse("2026-07-06T00:20:00Z"));
        assertThat(states.get(member.getId()).isRunning()).isFalse();

        studyTimeService.applyPomodoroAutoState(member, group, pomodoro, Instant.parse("2026-07-06T01:00:00Z"));
        assertThat(states.get(member.getId()).isRunning()).isTrue();
    }

    @Test
    void newPomodoroRunIsNotBlockedByManualPauseFromPreviousRun() {
        Pomodoro pomodoro = runningPomodoro(12L, Instant.parse("2026-07-06T00:00:00Z"));
        when(pomodoroRepository.findByGroup(group)).thenReturn(Optional.of(pomodoro));

        studyTimeService.manualResume(member, group.getCode());
        clock.setInstant(Instant.parse("2026-07-06T00:10:00Z"));
        studyTimeService.manualPause(member, group.getCode());

        pomodoro.stop();
        pomodoro.start(Instant.parse("2026-07-06T02:00:00Z"), 45, 2);
        studyTimeService.applyPomodoroAutoState(member, group, pomodoro, Instant.parse("2026-07-06T02:00:00Z"));

        assertThat(states.get(member.getId()).isRunning()).isTrue();
    }

    @Test
    void pauseSplitsElapsedSecondsAcrossWeekBoundary() {
        clock.setInstant(Instant.parse("2026-07-05T14:59:50Z"));
        studyTimeService.manualResume(member, group.getCode());

        clock.setInstant(Instant.parse("2026-07-05T15:00:10Z"));
        studyTimeService.manualPause(member, group.getCode());

        assertThat(weeklyTimes.get(LocalDate.parse("2026-06-29")).getAccumulatedSeconds()).isEqualTo(10);
        assertThat(weeklyTimes.get(LocalDate.parse("2026-07-06")).getAccumulatedSeconds()).isEqualTo(10);
    }

    @Test
    void pomodoroAutoStatePausesRunningTimerWhenEnteredBreak() {
        Pomodoro pomodoro = runningPomodoro(12L, Instant.parse("2026-07-06T00:00:00Z"));

        studyTimeService.applyPomodoroAutoState(member, group, pomodoro, Instant.parse("2026-07-06T00:00:00Z"));
        studyTimeService.applyPomodoroAutoState(member, group, pomodoro, Instant.parse("2026-07-06T00:50:00Z"));

        assertThat(studyTimeService.getWeekly(member).accumulatedSeconds()).isEqualTo(45 * 60);
        assertThat(states.get(member.getId()).isRunning()).isFalse();
    }

    @Test
    void manualResumeKeepsRunningAfterWeeklyLookup() {
        studyTimeService.manualResume(member, group.getCode());

        assertThat(studyTimeService.getWeekly(member).running()).isTrue();
    }

    @Test
    void getMemberStudyTimeReturnsGoalAndCurrentWeekAccumulatedSeconds() {
        studyTimeService.manualResume(member, group.getCode());
        clock.setInstant(Instant.parse("2026-07-06T00:30:00Z"));
        studyTimeService.manualPause(member, group.getCode());

        MemberStudyTimeResponseDto response = studyTimeService.getMemberStudyTime(member);

        assertThat(response.weeklyStudyTimeGoal()).isEqualTo(LocalTime.of(12, 30));
        assertThat(response.currentWeekStudyTimeSeconds()).isEqualTo(30 * 60);
    }

    private Pomodoro runningPomodoro(Long id, Instant startedAt) {
        return Pomodoro.builder()
                .id(id)
                .group(group)
                .status(PomodoroStatus.RUNNING)
                .startedAt(startedAt)
                .focusMinutes(45)
                .totalRounds(2)
                .anchorFocusEndsAt(startedAt.plusSeconds(45 * 60L))
                .anchorBreakEndsAt(startedAt.plusSeconds(60 * 60L))
                .build();
    }

    private static final class MutableClock extends Clock {

        private Instant instant;

        private MutableClock(Instant instant) {
            this.instant = instant;
        }

        private void setInstant(Instant instant) {
            this.instant = instant;
        }

        @Override
        public ZoneId getZone() {
            return SERVICE_ZONE;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return Clock.fixed(instant, zone);
        }

        @Override
        public Instant instant() {
            return instant;
        }
    }
}
