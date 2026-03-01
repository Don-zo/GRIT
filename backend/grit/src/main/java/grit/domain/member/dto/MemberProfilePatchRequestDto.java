package grit.domain.member.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberProfilePatchRequestDto {
    @Schema(description = "닉네임", example = "그릿유저")
    private String nickname;

    @Schema(description = "한 줄 소개", example = "오늘 하루도 파이팅", nullable = true)
    private String introduction;

    private String image;
}
