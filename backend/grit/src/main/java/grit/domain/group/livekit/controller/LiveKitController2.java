package grit.domain.group.livekit.controller;

import grit.domain.auth.infrastructure.jwt.MemberPrincipal;
import grit.domain.group.livekit.constraint.ReactionEmoji;
import grit.domain.group.livekit.dto.LiveKitReactionRequestDto;
import grit.domain.group.livekit.dto.SupportReactionsResponseDto;
import grit.domain.group.livekit.service.LiveKitService;
import grit.domain.member.entity.Member;
import grit.domain.member.service.MemberService;
import io.livekit.server.AccessToken;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "LiveKit", description = "LiveKit 토큰 발급 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/group/{groupCode}/livekit")
public class LiveKitController2 {

    private final MemberService memberService;
    private final LiveKitService liveKitService;

    private static final List<SupportReactionsResponseDto> SUPPORTED_REACTIONS =
            Arrays.stream(ReactionEmoji.values())
                    .map(e -> new SupportReactionsResponseDto(e.name(), e.getEmoji()))
                    .toList();

    @Operation(summary = "LiveKit 토큰 발급", description = "화상 회의 참여를 위한 LiveKit 액세스 토큰을 발급합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "토큰 발급 성공")
    })
    @GetMapping("/token")
    public ResponseEntity<Map<String, Object>> getToken(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @PathVariable String groupCode) {

        Member member = memberService.findMemberById(memberPrincipal.id());
        AccessToken token = liveKitService.generateToken(member, groupCode);
        return ResponseEntity.ok(Map.of("token", token.toJwt()));
    }

    @GetMapping("/reactions")
    public ResponseEntity<List<SupportReactionsResponseDto>> getSupportReactions() {

        return ResponseEntity.ok(SUPPORTED_REACTIONS);
    }

    @PostMapping("/reaction")
    public ResponseEntity<Void> sendReaction(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @PathVariable String groupCode,
            @Valid @RequestBody LiveKitReactionRequestDto requestDto) {

        Member member = memberService.findMemberById(memberPrincipal.id());
        liveKitService.sendReaction(member, groupCode, requestDto.emoji());
        return ResponseEntity.noContent().build();
    }
}
