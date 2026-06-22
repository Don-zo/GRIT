package grit.domain.member.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record MemberProfileInitializeRequestDto(
        @Schema(description = "닉네임", example = "그릿유저")
        @NotBlank
        String nickname,

        @Schema(description = "한 줄 소개", example = "오늘 하루도 파이팅")
        @NotNull
        String introduction,

        UUID imageName,

        LocalDate dDayDate,

        @Pattern(regexp = ".*\\S.*", message = "공백만 입력할 수 없습니다")
        String dDayTitle,

        @JsonFormat(pattern = "HH:mm")
        LocalTime weeklyStudyTimeGoal
) {

}
