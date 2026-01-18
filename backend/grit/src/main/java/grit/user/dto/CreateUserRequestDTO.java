package grit.user.dto;

import grit.user.User;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateUserRequestDTO {
    @Schema(description = "닉네임", example = "그릿유저")
    private String nickname;

    @Schema(description = "비밀번호", example = "grit1234")
    private String password;

    @Schema(description = "이메일", example = "grit1234@a.com")
    private String email;

    // DTO를 엔티티로 변환
    public User toEntity() {
        return User.builder()
                .email(this.email)
                .password(this.password)
                .nickname(this.nickname)
                .build();
    }
}
