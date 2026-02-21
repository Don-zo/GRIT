package grit.domain.auth.service;

import grit.domain.auth.infrastructure.oauth.GoogleOAuthClient;
import grit.domain.member.constant.SocialProvider;
import grit.domain.member.entity.Member;
import grit.domain.member.service.MemberService;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final GoogleOAuthClient googleOAuthClient;
    private final MemberService memberService;

    @Transactional
    public Member authenticateWithGoogle(String code, String redirectUri) {
        OAuth2User oauth2User = googleOAuthClient.getOAuth2User(code, redirectUri);

        String providerId = oauth2User.getName();
        String email = oauth2User.getAttribute("email");

        Optional<Member> member = memberService.getBySocialAccount(SocialProvider.GOOGLE, providerId);
        return member.orElseGet(
                () -> memberService.createMember(email, SocialProvider.GOOGLE, providerId));

    }
}
