package grit.domain.studytime.controller;

import grit.domain.auth.infrastructure.jwt.MemberPrincipal;
import grit.domain.member.entity.Member;
import grit.domain.member.service.MemberService;
import grit.domain.studytime.dto.WeeklyStudyTimeResponseDto;
import grit.domain.studytime.service.StudyTimeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Study Time", description = "주간 공부 시간 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class StudyTimeController {

    private final MemberService memberService;
    private final StudyTimeService studyTimeService;

    @GetMapping("/study-time/me/weekly")
    public ResponseEntity<WeeklyStudyTimeResponseDto> getWeekly(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal) {

        Member member = memberService.findMemberById(memberPrincipal.id());
        return ResponseEntity.ok(studyTimeService.getWeekly(member));
    }

    @PostMapping("/group/{groupCode}/study-time/resume")
    public ResponseEntity<WeeklyStudyTimeResponseDto> resume(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @PathVariable String groupCode) {

        Member member = memberService.findMemberById(memberPrincipal.id());
        return ResponseEntity.ok(studyTimeService.manualResume(member, groupCode));
    }

    @PostMapping("/group/{groupCode}/study-time/pause")
    public ResponseEntity<WeeklyStudyTimeResponseDto> pause(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @PathVariable String groupCode) {

        Member member = memberService.findMemberById(memberPrincipal.id());
        return ResponseEntity.ok(studyTimeService.manualPause(member, groupCode));
    }
}
