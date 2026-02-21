package grit.domain.auth.controller;

import grit.domain.auth.TokenPair;
import grit.domain.auth.dto.AuthResponseDto;
import grit.domain.auth.dto.GoogleAuthRequestDto;
import grit.domain.auth.service.AuthService;
import grit.domain.auth.service.TokenService;
import grit.domain.member.dto.MemberResponseDto;
import grit.domain.member.entity.Member;
import grit.domain.member.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final TokenService tokenService;
    private final MemberService memberService;

    @PostMapping("/google")
    public ResponseEntity<AuthResponseDto> googleLogin(
            @Valid @RequestBody GoogleAuthRequestDto request) {

        Member member = authService.authenticateWithGoogle(request.code(), request.redirectUri());
        TokenPair tokenPair = tokenService.generateTokens(member);
        boolean isMemberPending = memberService.isMemberPending(member);

        return ResponseEntity.ok(
                new AuthResponseDto(new MemberResponseDto(member), tokenPair, isMemberPending));
    }
}
