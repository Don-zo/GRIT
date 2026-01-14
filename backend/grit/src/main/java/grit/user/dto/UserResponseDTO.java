package grit.user.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import grit.user.User;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@JsonPropertyOrder({"id", "nickname", "email", "introduction"})
public class UserResponseDTO {
    private Long id;
    private String nickname;
    private String email;
    private String introduction;

    // User 엔티티 -> DTO 변환
    public UserResponseDTO(User user) {
        this.id = user.getId();
        this.nickname = user.getNickname();
        this.email = user.getEmail();
        this.introduction = user.getIntroduction();
    }
}