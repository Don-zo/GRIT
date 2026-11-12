package grit.domain.member.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record MemberProfileUpdateRequestDto(
        @Schema(description = "닉네임", example = "그릿유저")
        @NotBlank
        @Size(max = 10, message = "닉네임은 10자 이하여야 합니다.")
        String nickname,

        @Schema(description = "한 줄 소개", example = "오늘 하루도 파이팅", nullable = true)
        @Size(max = 40, message = "한 줄 소개는 40자 이하여야 합니다.")
        String introduction,

        UUID imageName,

        LocalDate dDayDate,

        @Pattern(regexp = ".*\\S.*", message = "공백만 입력할 수 없습니다")
        String dDayTitle,

        @JsonFormat(pattern = "HH:mm")
        LocalTime weeklyStudyTimeGoal
) {

}
