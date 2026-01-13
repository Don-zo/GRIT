package grit.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserRequestDTO {
    private String nickname;
    private String password;
    private String introduction;
}
