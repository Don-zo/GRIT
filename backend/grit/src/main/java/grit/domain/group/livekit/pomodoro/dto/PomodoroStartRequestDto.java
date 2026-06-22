package grit.domain.group.livekit.pomodoro.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record PomodoroStartRequestDto(
        @Min(1)
        @Max(60)
        int focusMinutes,

        @Min(1)
        @Max(6)
        int totalRounds
) {
}
