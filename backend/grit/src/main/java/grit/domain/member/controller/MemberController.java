package grit.domain.member.controller;

import grit.domain.auth.infrastructure.jwt.MemberPrincipal;
import grit.domain.member.dto.MemberNickNameAvailabilityResponseDto;
import grit.domain.member.dto.MemberProfileInitializeRequestDto;
import grit.domain.member.entity.Member;
import grit.domain.member.service.MemberService;
import grit.domain.member.dto.MemberProfilePatchRequestDto;
import grit.domain.member.dto.MemberResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "User", description = "사용자 관련 API")
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @Operation(summary = "내 정보 조회", description = "현재 로그인한 사용자의 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 사용자", content = @Content)
    })
    @GetMapping("/me")
    public ResponseEntity<MemberResponseDto> findOne(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal) {
        Member member = getAuthenticatedMember(memberPrincipal);
        return ResponseEntity.ok(new MemberResponseDto(member));
    }

    @Operation(summary = "정보 수정", description = "사용자의 정보(닉네임, 비밀번호, 한 줄 소개)를 수정합니다. 3개 중 하나만 응답 바디에 적어도 정상적으로 수정됩니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "정보 수정 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (예: 기존 비밀번호/닉네임과 동일한 값으로 변경 시도)", content = @Content),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 사용자 ID", content = @Content),
            @ApiResponse(responseCode = "409", description = "이미 사용 중인 닉네임", content = @Content)
    })
    @PatchMapping("/me/profile")
    public ResponseEntity<MemberResponseDto> patchProfile(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @Valid @RequestBody MemberProfilePatchRequestDto requestDto) {

        Member member = getAuthenticatedMember(memberPrincipal);
        memberService.updateProfile(member, requestDto.getNickname(), requestDto.getIntroduction(),
                requestDto.getImage());
        return ResponseEntity.ok(new MemberResponseDto(member));
    }

    @PostMapping("/me/profile")
    public ResponseEntity<MemberResponseDto> initializeProfile(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @Valid @RequestBody MemberProfileInitializeRequestDto requestDto) {

        Member member = getAuthenticatedMember(memberPrincipal);
        memberService.initializeProfile(member, requestDto.nickname(), requestDto.introduction(),
                requestDto.image());
        return ResponseEntity.ok(new MemberResponseDto(member));
    }

    @GetMapping("/nickname-availability")
    public ResponseEntity<MemberNickNameAvailabilityResponseDto> checkNicknameAvailability(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @RequestParam("nickname") String nickname) {

        Member member = getAuthenticatedMember(memberPrincipal);
        boolean isAvailable = !memberService.isNicknameTaken(member, nickname);
        return ResponseEntity.status(isAvailable ? HttpStatus.OK : HttpStatus.CONFLICT)
                .body(new MemberNickNameAvailabilityResponseDto(isAvailable));
    }

    @Operation(summary = "회원 탈퇴", description = "사용자를 삭제(탈퇴)합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "삭제 성공 (반환값 없음)"),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 사용자")
    })
    @DeleteMapping("/me")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal) {

        Member member = getAuthenticatedMember(memberPrincipal);
        memberService.delete(member);
        return ResponseEntity.noContent().build();
    }

    private Member getAuthenticatedMember(MemberPrincipal principal) {
        return memberService.findMemberById(principal.id());
    }
}