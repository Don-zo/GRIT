package grit.user.dto;

import grit.user.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateUserRequestDTO {
    private String nickname;
    private String password;
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
