package grit.domain.group.livekit.pomodoro.controller;

import grit.domain.auth.infrastructure.jwt.MemberPrincipal;
import grit.domain.group.livekit.pomodoro.dto.PomodoroResponseDto;
import grit.domain.group.livekit.pomodoro.dto.PomodoroStartRequestDto;
import grit.domain.group.livekit.pomodoro.service.PomodoroService;
import grit.domain.member.entity.Member;
import grit.domain.member.service.MemberService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.Clock;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Pomodoro", description = "LiveKit 방 내 뽀모도로 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/group/{groupCode}/livekit/pomodoro")
public class PomodoroController {

    private final MemberService memberService;
    private final PomodoroService pomodoroService;
    private final Clock clock;

    @GetMapping
    public ResponseEntity<PomodoroResponseDto> get(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @PathVariable String groupCode) {

        Member member = memberService.findMemberById(memberPrincipal.id());

        return ResponseEntity.ok(PomodoroResponseDto.fromNullable(
                pomodoroService.findCurrent(member, groupCode),
                now()
        ));
    }

    @PostMapping("/start")
    public ResponseEntity<PomodoroResponseDto> start(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @PathVariable String groupCode,
            @Valid @RequestBody PomodoroStartRequestDto requestDto) {

        Member member = memberService.findMemberById(memberPrincipal.id());
        return ResponseEntity.ok(PomodoroResponseDto.from(
                pomodoroService.start(
                        member,
                        groupCode,
                        requestDto.focusMinutes(),
                        requestDto.totalRounds()
                ),
                now()
        ));
    }

    @PostMapping("/pause")
    public ResponseEntity<PomodoroResponseDto> pause(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @PathVariable String groupCode) {

        Member member = memberService.findMemberById(memberPrincipal.id());

        return ResponseEntity.ok(PomodoroResponseDto.from(
                pomodoroService.pause(member, groupCode),
                now()
        ));
    }

    @PostMapping("/resume")
    public ResponseEntity<PomodoroResponseDto> resume(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @PathVariable String groupCode) {

        Member member = memberService.findMemberById(memberPrincipal.id());

        return ResponseEntity.ok(PomodoroResponseDto.from(
                pomodoroService.resume(member, groupCode),
                now()
        ));
    }

    @PostMapping("/stop")
    public ResponseEntity<PomodoroResponseDto> stop(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @PathVariable String groupCode) {

        Member member = memberService.findMemberById(memberPrincipal.id());

        return ResponseEntity.ok(PomodoroResponseDto.from(
                pomodoroService.stop(member, groupCode),
                now()
        ));
    }

    private Instant now() {
        return Instant.now(clock);
    }
}
