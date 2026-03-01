package grit.domain.member.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberProfilePatchRequestDto {
    @Schema(description = "닉네임", example = "그릿유저")
    @NotBlank
    private String nickname;

    @Schema(description = "한 줄 소개", example = "오늘 하루도 파이팅", nullable = true)
    @NotBlank
    private String introduction;

    @NotBlank
    private String image;
}
