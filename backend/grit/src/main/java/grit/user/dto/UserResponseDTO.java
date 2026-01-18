package grit.user.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import grit.user.User;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@JsonPropertyOrder({"id", "nickname", "email", "introduction"})
public class UserResponseDTO {
    @Schema(description = "사용자 고유 ID (PK)", example = "1")
    private Long id;

    @Schema(description = "닉네임", example = "그릿유저")
    private String nickname;

    @Schema(description = "이메일", example = "grit1234@a.com")
    private String email;

    @Schema(description = "한 줄 소개", example = "오늘 하루도 파이팅")
    private String introduction;

    // User 엔티티 -> DTO 변환
    public UserResponseDTO(User user) {
        this.id = user.getId();
        this.nickname = user.getNickname();
        this.email = user.getEmail();
        this.introduction = user.getIntroduction();
    }
}