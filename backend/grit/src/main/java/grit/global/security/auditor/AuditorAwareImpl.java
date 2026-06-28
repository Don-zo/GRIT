package grit.global.security.auditor;

import grit.domain.auth.infrastructure.jwt.MemberPrincipal;
import java.util.Optional;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuditorAwareImpl implements AuditorAware<Long> {

    private static final Long SYSTEM_ID = 0L;

    @Override
    public Optional<Long> getCurrentAuditor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()
                || auth instanceof AnonymousAuthenticationToken) {
            return Optional.of(SYSTEM_ID);
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof MemberPrincipal user) {
            return Optional.of(user.id());
        }

        return Optional.of(SYSTEM_ID);
    }
}
