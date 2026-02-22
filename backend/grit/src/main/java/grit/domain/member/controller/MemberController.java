package grit.domain.member.controller;

import grit.domain.auth.infrastructure.jwt.MemberPrincipal;
import grit.domain.member.entity.Member;
import grit.domain.member.service.MemberService;
import grit.domain.member.dto.MemberUpdateRequestDto;
import grit.domain.member.dto.MemberResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "User", description = "사용자 관련 API")
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    /*@Operation(summary = "회원 가입", description = "신규 사용자를 등록합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "회원가입 성공"),
            @ApiResponse(responseCode = "409", description = "이미 존재하는 이메일 또는 닉네임", content = @Content),
            @ApiResponse(responseCode = "400", description = "입력값 누락 또는 형식이 올바르지 않음", content = @Content)
    })
    @PostMapping
    public ResponseEntity<MemberResponseDto> create(@RequestBody MemberCreateRequestDto request) {
        //Member member = memberService.join(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(null);
    }*/

    @Operation(summary = "전체 회원 조회", description = "전체 사용자를 조회합니다.")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping
    public ResponseEntity<List<MemberResponseDto>> findAll() {
        return ResponseEntity.ok(memberService.findAll());
    }

    @Operation(summary = "특정 회원 조회", description = "id를 이용하여 특정 사용자를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 사용자 ID", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<MemberResponseDto> findOne(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal) {
        Member member = memberService.findOne(memberPrincipal.id());
        return ResponseEntity.ok(new MemberResponseDto(member));
    }

    @Operation(summary = "정보 수정", description = "사용자의 정보(닉네임, 비밀번호, 한 줄 소개)를 수정합니다. 3개 중 하나만 응답 바디에 적어도 정상적으로 수정됩니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "정보 수정 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (예: 기존 비밀번호/닉네임과 동일한 값으로 변경 시도)", content = @Content),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 사용자 ID", content = @Content),
            @ApiResponse(responseCode = "409", description = "이미 사용 중인 닉네임", content = @Content)
    })
    @PutMapping("/{id}")
    public ResponseEntity<MemberResponseDto> update(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @RequestBody MemberUpdateRequestDto updateParam) {
        memberService.update(memberPrincipal.id(), updateParam);

        Member updatedMember = memberService.findOne(memberPrincipal.id());
        return ResponseEntity.ok(new MemberResponseDto(updatedMember));
    }

    @Operation(summary = "회원 탈퇴", description = "사용자를 삭제(탈퇴)합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "삭제 성공 (반환값 없음)"),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 사용자")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal) {
        memberService.delete(memberPrincipal.id());
        return ResponseEntity.noContent().build();
    }
}