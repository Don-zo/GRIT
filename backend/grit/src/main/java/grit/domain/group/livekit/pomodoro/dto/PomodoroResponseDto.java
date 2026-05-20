package grit.domain.group.livekit.pomodoro.dto;

import grit.domain.group.livekit.pomodoro.entity.Pomodoro;
import grit.domain.group.livekit.pomodoro.entity.PomodoroStatus;
import java.time.LocalDateTime;

public record PomodoroResponseDto(
        Long id,
        PomodoroStatus status,
        LocalDateTime startedAt,
        Integer focusMinutes,
        Integer totalRounds,
        Integer currentRound,
        Long version
) {

    public static PomodoroResponseDto from(Pomodoro pomodoro) {
        return new PomodoroResponseDto(
                pomodoro.getId(),
                pomodoro.getStatus(),
                pomodoro.getStartedAt(),
                pomodoro.getFocusMinutes(),
                pomodoro.getTotalRounds(),
                pomodoro.getCurrentRound(),
                pomodoro.getVersion()
        );
    }

    public static PomodoroResponseDto idle() {
        return new PomodoroResponseDto(
                null,
                PomodoroStatus.IDLE,
                null,
                null,
                null,
                null,
                null
        );
    }
}
