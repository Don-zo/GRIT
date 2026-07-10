package grit.domain.member.dto;

import java.time.Instant;
import java.time.LocalDate;

public record MemberStudyTimeResponseDto(
        LocalDate weekStartDate,
        Long weeklyStudyTimeGoalSeconds,
        long currentWeekStudyTimeSeconds,
        boolean running,
        Instant serverNow,
        Instant lastStartedAt
) {
}
