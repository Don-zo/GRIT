package grit.domain.member.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalTime;

public record MemberStudyTimeResponseDto(
        @JsonFormat(pattern = "HH:mm")
        LocalTime weeklyStudyTimeGoal,
        long currentWeekStudyTimeSeconds
) {
}
