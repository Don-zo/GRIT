package grit.domain.friend.controller;

import grit.domain.auth.infrastructure.jwt.MemberPrincipal;
import grit.domain.friend.service.FriendService;
import grit.domain.member.dto.MemberResponseDto;
import grit.domain.member.entity.Member;
import grit.domain.member.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Friend", description = "친구 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/friends")
public class FriendController {

    private final FriendService friendService;
    private final MemberService memberService;

    @Operation(summary = "친구 추가", description = "특정 사용자를 친구로 추가합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "친구 추가 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (예: 자기 자신을 친구로 추가)", content = @Content),
            @ApiResponse(responseCode = "404", description = "해당 닉네임을 가진 사용자가 없음", content = @Content),
            @ApiResponse(responseCode = "409", description = "이미 친구로 등록된 사용자", content = @Content)
    })
    @PostMapping("/{nickname}")
    public ResponseEntity<MemberResponseDto> addFriend(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @Parameter(description = "친구의 닉네임", example = "그릿유저친구") @PathVariable String nickname) {

        Member member = memberService.findMemberById(memberPrincipal.id());
        MemberResponseDto addedFriend = friendService.addFriend(member, nickname);
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(addedFriend);
    }

    // 친구 제거
    @Operation(summary = "친구 제거", description = "특정 사용자를 친구 목록에서 제거합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "친구 삭제 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (예: 친구 관계가 아님, 자기 자신 삭제 시도)", content = @Content),
            @ApiResponse(responseCode = "404", description = "해당 닉네임의 친구가 존재하지 않음", content = @Content)
    })
    @DeleteMapping("/{nickname}")
    public ResponseEntity<MemberResponseDto> removeFriend(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @Parameter(description = "친구의 닉네임", example = "그릿유저친구") @PathVariable String nickname) {

        Member member = memberService.findMemberById(memberPrincipal.id());
        MemberResponseDto removedFriend = friendService.removeFriend(member, nickname);
        return ResponseEntity.ok(removedFriend);
    }

    // 친구 목록 조회
    @Operation(summary = "친구 목록 조회", description = "특정 사용자의 친구 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "목록 조회 성공"),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 사용자 ID", content = @Content)
    })
    @GetMapping
    public ResponseEntity<List<MemberResponseDto>> findFriends(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal) {

        Member member = memberService.findMemberById(memberPrincipal.id());
        return ResponseEntity.ok(friendService.getFriendList(member));
    }
}
