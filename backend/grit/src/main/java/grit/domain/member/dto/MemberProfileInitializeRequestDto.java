package grit.domain.member.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record MemberProfileInitializeRequestDto(
        @Schema(description = "닉네임", example = "그릿유저")
        @NotBlank
        String nickname,

        @Schema(description = "한 줄 소개", example = "오늘 하루도 파이팅")
        @NotBlank
        String introduction,

        @NotBlank
        String image
) {

}
