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
        refreshTokenRepository.deleteByMember(member);

        RefreshToken refreshToken = RefreshToken.issue(member, Duration.ofMillis(refreshTokenTtl));
        refreshTokenRepository.save(refreshToken);

        return new TokenPair(accessToken, refreshToken.getToken());
    }
}
