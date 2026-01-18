package grit.friend.dto;

import grit.user.User;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class FriendResponseDTO {
    @Schema(description = "친구의 사용자 고유 ID (PK)", example = "2")
    private Long friendId;

    @Schema(description = "친구의 닉네임", example = "그릿유저친구")
    private String nickname;

    @Schema(description = "친구의 한 줄 소개", example = "그릿은 정말 좋은 서비스다")
    private String introduction;

    public static FriendResponseDTO from(User user) {
        return new FriendResponseDTO(
                user.getId(),
                user.getNickname(),
                user.getIntroduction()
        );
    }
}