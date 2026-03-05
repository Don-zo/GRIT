package grit.domain.member.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.time.LocalTime;

public record MemberProfilePatchRequestDto(
        @Schema(description = "닉네임", example = "그릿유저")
        String nickname,

        @Schema(description = "한 줄 소개", example = "오늘 하루도 파이팅", nullable = true)
        String introduction,

        String image,

        LocalDate dDayDate,

        String dDayTitle,

        @JsonFormat(pattern = "HH:mm")
        LocalTime weeklyStudyTimeGoal
) {

}
