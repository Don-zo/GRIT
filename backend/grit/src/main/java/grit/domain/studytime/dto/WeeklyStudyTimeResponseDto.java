package grit.domain.studytime.dto;

import java.time.Instant;
import java.time.LocalDate;

public record WeeklyStudyTimeResponseDto(
        LocalDate weekStartDate,
        long accumulatedSeconds,
        boolean running,
        Instant serverNow,
        Instant lastStartedAt,
        Long activeGroupId
) {
}
