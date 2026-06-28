package grit.domain.group.livekit.pomodoro.dto;

import grit.domain.group.livekit.pomodoro.entity.Pomodoro;
import grit.domain.group.livekit.pomodoro.entity.PomodoroPhase;
import grit.domain.group.livekit.pomodoro.entity.PomodoroStatus;
import java.time.Instant;

public record PomodoroResponseDto(
        PomodoroStatus status,
        PomodoroPhase phase,
        Instant serverNow,
        Instant focusEndsAt,
        Instant breakEndsAt,
        Instant pausedAt,
        Integer focusMinutes,
        Integer breakMinutes,
        Integer currentRound,
        Integer totalRounds
) {

    public static PomodoroResponseDto from(Pomodoro pomodoro, Instant serverNow) {
        return new PomodoroResponseDto(
                pomodoro.getCurrentStatus(serverNow),
                pomodoro.getCurrentPhase(serverNow),
                serverNow,
                pomodoro.getFocusEndsAt(serverNow),
                pomodoro.getBreakEndsAt(serverNow),
                pomodoro.getPausedAt(),
                pomodoro.getFocusMinutes(),
                pomodoro.getBreakMinutes(),
                pomodoro.getCurrentRound(serverNow),
                pomodoro.getTotalRounds()
        );
    }

    public static PomodoroResponseDto fromNullable(Pomodoro pomodoro, Instant serverNow) {
        if (pomodoro == null) {
            return idle(serverNow);
        }

        return from(pomodoro, serverNow);
    }

    public static PomodoroResponseDto idle(Instant serverNow) {
        return new PomodoroResponseDto(
                PomodoroStatus.IDLE,
                null,
                serverNow,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );
    }
}
