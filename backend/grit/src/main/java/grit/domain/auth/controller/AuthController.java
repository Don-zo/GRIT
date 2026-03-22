package grit.domain.auth.controller;

import grit.domain.auth.TokenPair;
import grit.domain.auth.dto.AuthResponseDto;
import grit.domain.auth.dto.GoogleAuthRequestDto;
import grit.domain.auth.dto.RefreshResponseDto;
import grit.domain.auth.service.AuthService;
import grit.domain.auth.service.TokenService;
import grit.domain.member.dto.MemberResponseDto;
import grit.domain.member.entity.Member;
import grit.domain.member.service.MemberService;
import grit.global.s3.S3Directory;
import grit.global.s3.S3Service;
import grit.global.util.CookieUtils;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final TokenService tokenService;
    private final MemberService memberService;
    private final S3Service s3Service;
    private final CookieUtils cookieUtils;

    @PostMapping("/google")
    public ResponseEntity<AuthResponseDto> googleLogin(
            @Valid @RequestBody GoogleAuthRequestDto request,
            HttpServletResponse response) {

        Member member = authService.authenticateWithGoogle(request.code(), request.redirectUri());
        TokenPair tokenPair = tokenService.generateTokens(member);
        boolean isMemberPending = memberService.isMemberPending(member);

        ResponseCookie cookie = cookieUtils.createRefreshTokenCookie(tokenPair.refreshToken());
        response.addHeader("Set-Cookie", cookie.toString());

        String imageUrl = s3Service.resolveUrl(S3Directory.PROFILE_IMAGES, member.getImageName());
        return ResponseEntity.status(isMemberPending ? HttpStatus.CREATED : HttpStatus.OK).body(
                new AuthResponseDto(
                        MemberResponseDto.fromWithResolvedUrl(member, imageUrl), tokenPair.accessToken(), isMemberPending));
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponseDto> refreshToken(
            @CookieValue(value = "refresh_token", required = false) String refreshTokenString) {

        if (refreshTokenString == null || refreshTokenString.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(
                new RefreshResponseDto(tokenService.refreshAccessToken(refreshTokenString)));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletResponse response,
            @CookieValue(value = "refresh_token", required = false) String refreshTokenString
    ) {

        ResponseCookie cookie = cookieUtils.createEmptyRefreshTokenCookie();
        response.addHeader("Set-Cookie", cookie.toString());
        tokenService.invalidateRefreshToken(refreshTokenString);
        return ResponseEntity.ok().build();
    }
}
