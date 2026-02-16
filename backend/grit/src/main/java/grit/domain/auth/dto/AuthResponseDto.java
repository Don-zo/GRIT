package grit.domain.auth.dto;

import grit.domain.auth.TokenPair;
import grit.domain.member.dto.MemberResponseDto;

public record AuthResponseDto(
        MemberResponseDto member,
        TokenPair tokenPair,
        boolean firstTimeUser
) {

}
