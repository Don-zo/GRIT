package grit.user.dto;

import grit.user.User;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor

public class UserResponseDTO {
    private Long id;
    private String nickname;
    private String email;

    // User 엔티티 -> DTO 변환
    public UserResponseDTO(User user) {
        this.id = user.getId();
        this.nickname = user.getNickname();
        this.email = user.getEmail();
    }
}