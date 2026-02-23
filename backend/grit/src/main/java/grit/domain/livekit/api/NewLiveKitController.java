package grit.domain.livekit.api;

import grit.domain.auth.infrastructure.jwt.MemberPrincipal;
import grit.domain.member.entity.Member;
import grit.domain.member.service.MemberService;
import io.livekit.server.AccessToken;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "LiveKit", description = "LiveKit 토큰 발급 관련 API")
@RestController
@RequestMapping("/api/livekit")
public class NewLiveKitController {

    private final String apiKey;
    private final String apiSecret;
    private final MemberService memberService;

    public NewLiveKitController(
            @Value("${livekit.api.key}") String apiKey,
            @Value("${livekit.api.secret}") String apiSecret, MemberService memberService) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.memberService = memberService;
    }

    @Operation(summary = "LiveKit 토큰 발급", description = "화상 회의 참여를 위한 LiveKit 액세스 토큰을 발급합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "토큰 발급 성공")
    })
    @GetMapping("token")
    public Map<String, Object> getToken(
            @AuthenticationPrincipal MemberPrincipal memberPrincipal,
            @RequestParam Long groupId) {

        Member member = memberService.findOne(memberPrincipal.id());

        AccessToken token = new AccessToken(apiKey, apiSecret);
        token.setName(member.getNickname());
        token.setIdentity(member.getNickname());
        token.addGrants(new RoomJoin(true), new RoomName(groupId.toString()));

        return Map.of("token", token.toJwt());
    }
}
