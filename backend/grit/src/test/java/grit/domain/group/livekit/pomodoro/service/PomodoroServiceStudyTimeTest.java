package grit.domain.group.livekit.pomodoro.service;

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
import grit.domain.group.livekit.service.LiveKitService;
import grit.domain.member.constant.Role;
import grit.domain.member.constant.SocialProvider;
import grit.domain.member.entity.Member;
import grit.domain.member.repository.MemberRepository;
import grit.domain.studytime.entity.StudyTimerState;
import grit.domain.studytime.entity.WeeklyStudyTime;
import grit.domain.studytime.repository.StudyTimerStateRepository;
import grit.domain.studytime.repository.WeeklyStudyTimeRepository;
import grit.domain.studytime.service.StudyTimeService;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import io.micrometer.observation.ObservationRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PomodoroServiceStudyTimeTest {

    private static final ZoneId SERVICE_ZONE = ZoneId.of("Asia/Seoul");

    @Mock
    private GroupService groupService;

    @Mock
    private PomodoroRepository pomodoroRepository;

    @Mock
    private LiveKitService liveKitService;

    @Mock
    private StudyTimerStateRepository studyTimerStateRepository;

    @Mock
    private WeeklyStudyTimeRepository weeklyStudyTimeRepository;

    @Mock
    private LiveKitRoomStatusService liveKitRoomStatusService;

    @Mock
    private MemberRepository memberRepository;

    private final MutableClock clock = new MutableClock(Instant.parse("2026-07-06T00:50:00Z"));
    private final Map<Long, StudyTimerState> states = new HashMap<>();
    private final Map<LocalDate, WeeklyStudyTime> weeklyTimes = new HashMap<>();
    private PomodoroService pomodoroService;
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
        pomodoroService = new PomodoroService(
                groupService,
                pomodoroRepository,
                liveKitService,
                studyTimeService,
                clock,
                ObservationRegistry.create()
        );
        member = Member.builder()
                .id(1L)
                .email("member@example.com")
                .provider(SocialProvider.GOOGLE)
                .providerId("google-1")
                .nickname("member")
                .role(Role.USER)
                .build();
        group = Group.builder()
                .id(10L)
                .code("ABC123")
                .name("group")
                .build();

        when(groupService.findGroupByCodeForUpdate(group.getCode())).thenReturn(group);
        when(groupService.isMemberInGroup(member, group)).thenReturn(true);
        lenient().when(liveKitRoomStatusService.getParticipantIdentities(group.getCode())).thenReturn(Set.of());
        lenient().when(memberRepository.findAllById(any())).thenReturn(List.of(member));
        lenient().when(memberRepository.findLockedById(member.getId())).thenReturn(Optional.of(member));
        when(studyTimerStateRepository.findByMember(member))
                .thenAnswer(invocation -> Optional.ofNullable(states.get(member.getId())));
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
        when(weeklyStudyTimeRepository.findByMemberAndWeekStartDateForUpdate(any(Member.class), any(LocalDate.class)))
                .thenAnswer(invocation -> Optional.ofNullable(weeklyTimes.get(invocation.getArgument(1))));
        when(weeklyStudyTimeRepository.save(any(WeeklyStudyTime.class)))
                .thenAnswer(invocation -> {
                    WeeklyStudyTime weeklyStudyTime = invocation.getArgument(0);
                    weeklyTimes.put(weeklyStudyTime.getWeekStartDate(), weeklyStudyTime);
                    return weeklyStudyTime;
                });
    }

    @Test
    void stopDuringBreakCountsOnlyUntilFocusEnd() {
        Pomodoro pomodoro = runningPomodoro(12L, Instant.parse("2026-07-06T00:00:00Z"));
        when(pomodoroRepository.findByGroup(group)).thenReturn(Optional.of(pomodoro));
        when(pomodoroRepository.save(any(Pomodoro.class))).thenAnswer(invocation -> invocation.getArgument(0));
        studyTimeService.applyPomodoroAutoState(member, group, pomodoro, Instant.parse("2026-07-06T00:00:00Z"));

        pomodoroService.stop(member, group.getCode());

        assertThat(studyTimeService.getWeekly(member).accumulatedSeconds()).isEqualTo(45 * 60);
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

        private final Instant instant;

        private MutableClock(Instant instant) {
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
