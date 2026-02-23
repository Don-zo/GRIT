package grit.domain.auth.dto;

import grit.domain.member.dto.MemberResponseDto;

public record AuthResponseDto(
        MemberResponseDto member,
        String accessToken,
        boolean firstTimeUser
) {

}
