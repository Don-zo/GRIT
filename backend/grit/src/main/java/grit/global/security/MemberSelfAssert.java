package grit.global.security;

import grit.domain.auth.infrastructure.jwt.MemberPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class MemberSelfAssert {

    private MemberSelfAssert() {
    }

    /**
     * URL 등에 포함된 member id가 로그인한 사용자와 일치하는지 검사합니다.
     */
    public static void assertSameMember(MemberPrincipal principal, Long userId) {
        if (principal == null || userId == null || !principal.id().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 계정만 접근할 수 있습니다.");
        }
    }
}
