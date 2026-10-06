package grit.domain.group.livekit.controller;

import grit.domain.auth.infrastructure.jwt.MemberPrincipal;
import grit.domain.group.livekit.dto.GroupStudyTimeMemberResponseDto;
import grit.domain.member.entity.Member;
import grit.domain.member.service.MemberService;
import grit.domain.studytime.service.GroupStudyTimeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "LiveKit Study Time", description = "캠스터디 그룹 멤버 공부 시간 동기화 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/group/{groupCode}/livekit/study-time")
public class LiveKitStudyTimeController {

    private final MemberService memberService;
    private final GroupStudyTimeService groupStudyTimeService;

    @Operation(summary = "그룹 멤버 공부 시간 조회", description = "그룹 멤버별 이번 주 공부 시간과 목표를 조회합니다.")
    @GetMapping
    public ResponseEntity<List<GroupStudyTimeMemberResponseDto>> getGroupStudyTimes(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @PathVariable String groupCode
    ) {
        Member member = memberService.findMemberById(memberPrincipal.id());
        return ResponseEntity.ok(groupStudyTimeService.getGroupStudyTimes(member, groupCode));
    }

    @Operation(summary = "공부 시간 재개", description = "내 이번 주 공부 시간을 재개하고 그룹에 상태를 전파합니다.")
    @PostMapping("/resume")
    public ResponseEntity<GroupStudyTimeMemberResponseDto> resume(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @PathVariable String groupCode
    ) {
        Member member = memberService.findMemberById(memberPrincipal.id());
        return ResponseEntity.ok(groupStudyTimeService.resume(member, groupCode));
    }

    @Operation(summary = "공부 시간 일시정지", description = "내 이번 주 공부 시간을 일시정지하고 그룹에 상태를 전파합니다.")
    @PostMapping("/pause")
    public ResponseEntity<GroupStudyTimeMemberResponseDto> pause(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @PathVariable String groupCode
    ) {
        Member member = memberService.findMemberById(memberPrincipal.id());
        return ResponseEntity.ok(groupStudyTimeService.pause(member, groupCode));
    }
}