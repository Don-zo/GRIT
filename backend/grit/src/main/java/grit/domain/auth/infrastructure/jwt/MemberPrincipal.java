package grit.domain.auth.infrastructure.jwt;

public record MemberPrincipal(
        Long id,
        String email,
        String nickname
) {

}
