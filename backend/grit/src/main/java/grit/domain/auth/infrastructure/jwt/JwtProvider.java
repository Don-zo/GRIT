package grit.domain.auth.infrastructure.jwt;

import grit.domain.auth.entity.RefreshToken;
import grit.domain.auth.repository.RefreshTokenRepository;
import grit.domain.member.entity.Member;
import grit.global.exception.InvalidCredentialsException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import javax.crypto.SecretKey;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtProvider {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-expiration}")
    private Long accessTokenTtl;

    private SecretKey secretKey;
    private final RefreshTokenRepository refreshTokenRepository;

    @PostConstruct
    private void init() {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public Authentication getAuthentication(String accessToken) {
        Claims claims = getClaims(accessToken);

        Long memberId = Long.parseLong(claims.getSubject());
        String email = claims.get("email", String.class);
        String nickname = claims.get("nickname", String.class);
        String role = claims.get("role", String.class);

        Collection<? extends GrantedAuthority> authorities =
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role));

        MemberPrincipal principal = new MemberPrincipal(memberId, email, nickname);
        return new UsernamePasswordAuthenticationToken(principal, accessToken, authorities);
    }

    public String createAccessToken(Member member) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenTtl);

        return Jwts.builder()
                .subject(member.getId().toString())
                .claim("email", member.getEmail())
                .claim("nickname", member.getNickname())
                .claim("role", member.getRole().name())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();
    }

    public Member getMemberFromRefreshToken(String refreshTokenString)
            throws InvalidCredentialsException {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenString)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid refresh token"));
        if (refreshToken.isExpired()) {
            throw new InvalidCredentialsException("Refresh token has expired");
        }

        return refreshToken.getMember();
    }

    private Claims getClaims(String accessToken) throws InvalidCredentialsException {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(accessToken)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            throw new InvalidCredentialsException("Expired access token");
        } catch (MalformedJwtException e) {
            throw new InvalidCredentialsException("Malformed access token");
        }
    }
}
