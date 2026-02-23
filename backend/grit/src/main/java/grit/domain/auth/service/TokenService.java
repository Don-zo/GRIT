package grit.domain.auth.service;

import grit.domain.auth.TokenPair;
import grit.domain.auth.entity.RefreshToken;
import grit.domain.auth.infrastructure.jwt.JwtProvider;
import grit.domain.auth.repository.RefreshTokenRepository;
import grit.domain.member.entity.Member;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TokenService {

    @Value("${jwt.refresh-expiration}")
    private Long refreshTokenTtl;

    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public TokenPair generateTokens(Member member) {
        String accessToken = jwtProvider.createAccessToken(member);

        RefreshToken refreshToken = RefreshToken.issue(member, Duration.ofMillis(refreshTokenTtl));
        refreshTokenRepository.save(refreshToken);

        return new TokenPair(accessToken, refreshToken.getToken());
    }

    @Transactional
    public String refreshAccessToken(RefreshToken refreshToken) {
        checkRefreshTokenValidity(refreshToken);
        return jwtProvider.createAccessToken(refreshToken.getMember());
    }

    @Transactional
    public RefreshToken getRefreshToken(String refreshTokenString) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenString)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));
        checkRefreshTokenValidity(refreshToken);
        return refreshToken;
    }

    private void checkRefreshTokenValidity(RefreshToken refreshToken) {
        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new IllegalArgumentException("Refresh token has expired");
        }
    }
}
