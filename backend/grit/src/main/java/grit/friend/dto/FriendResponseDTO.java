package grit.friend.dto;

import grit.user.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class FriendResponseDTO {
    private Long friendId;
    private String nickname;
    private String introduction;

    public static FriendResponseDTO from(User user) {
        return new FriendResponseDTO(
                user.getId(),
                user.getNickname(),
                user.getIntroduction()
        );
    }
}