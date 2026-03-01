package grit.domain.member.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MemberProfileInitializeRequestDto(
        @Schema(description = "닉네임", example = "그릿유저")
        @NotNull @NotBlank
        String nickname,

        @Schema(description = "비밀번호", example = "grit1234")
        @NotNull @NotBlank
        String password,

        @Schema(description = "한 줄 소개", example = "오늘 하루도 파이팅", nullable = true)
        @NotNull @NotBlank
        String introduction,

        @NotBlank
        String image
) {

}
