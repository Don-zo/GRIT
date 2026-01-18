package grit.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserRequestDTO {
    @Schema(description = "닉네임", example = "그릿유저")
    private String nickname;

    @Schema(description = "비밀번호", example = "grit1234")
    private String password;

    @Schema(description = "한 줄 소개", example = "오늘 하루도 파이팅", nullable = true)
    private String introduction;
}
