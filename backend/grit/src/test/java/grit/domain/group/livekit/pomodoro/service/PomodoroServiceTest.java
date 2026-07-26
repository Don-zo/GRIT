package grit.domain.group.livekit.pomodoro.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import grit.domain.group.GroupService;
import grit.domain.group.entity.Group;
import grit.domain.group.livekit.pomodoro.entity.Pomodoro;
import grit.domain.group.livekit.pomodoro.entity.PomodoroStatus;
import grit.domain.group.livekit.pomodoro.repository.PomodoroRepository;
import grit.domain.group.livekit.service.LiveKitService;
import io.micrometer.observation.ObservationRegistry;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PomodoroServiceTest {

    @Mock
    private GroupService groupService;

    @Mock
    private PomodoroRepository pomodoroRepository;

    @Mock
    private LiveKitService liveKitService;

    private final Clock clock = Clock.fixed(Instant.parse("2026-07-20T10:00:00Z"), ZoneOffset.UTC);
    private PomodoroService pomodoroService;
    private Group group;

    @BeforeEach
    void setUp() {
        pomodoroService = new PomodoroService(
                groupService,
                pomodoroRepository,
                liveKitService,
                clock,
                ObservationRegistry.NOOP
        );
        group = Group.builder().id(1L).code("ABC123").name("study").build();
        when(groupService.findGroupByCodeForUpdate("ABC123")).thenReturn(group);
    }

    @Test
    void emptyRoomStopsRunningPomodoro() {
        Pomodoro pomodoro = Pomodoro.builder().group(group).build();
        pomodoro.start(clock.instant(), 25, 4);
        when(pomodoroRepository.findByGroup(group)).thenReturn(Optional.of(pomodoro));

        pomodoroService.stopForEmptyRoom("ABC123");

        assertThat(pomodoro.getStatus()).isEqualTo(PomodoroStatus.IDLE);
        verify(pomodoroRepository).save(pomodoro);
    }

    @Test
    void emptyRoomDoesNothingWhenPomodoroDoesNotExist() {
        when(pomodoroRepository.findByGroup(group)).thenReturn(Optional.empty());

        pomodoroService.stopForEmptyRoom("ABC123");

        verify(pomodoroRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void emptyRoomDoesNotSavePomodoroAlreadyStopped() {
        Pomodoro pomodoro = Pomodoro.builder().group(group).build();
        when(pomodoroRepository.findByGroup(group)).thenReturn(Optional.of(pomodoro));

        pomodoroService.stopForEmptyRoom("ABC123");

        verify(pomodoroRepository, never()).save(pomodoro);
    }
}
