package grit.domain.livekit.api;

import io.livekit.server.AccessToken;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "LiveKit", description = "LiveKit 토큰 발급 관련 API")
@RestController
@RequestMapping("livekit")
public class LiveKitController {

    private final String apiKey;
    private final String apiSecret;

    public LiveKitController(
            @Value("${livekit.api.key}") String apiKey,
            @Value("${livekit.api.secret}") String apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    @Operation(summary = "LiveKit 토큰 발급", description = "화상 회의 참여를 위한 LiveKit 액세스 토큰을 발급합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "토큰 발급 성공")
    })
    @GetMapping("token")
    public Map<String, Object> getToken(
            @Parameter(description = "참여할 방 이름", example = "test-room") @RequestParam(defaultValue = "test-room") String room,
            @Parameter(description = "사용자 이름", example = "user") @RequestParam(defaultValue = "user") String user) {
        AccessToken token = new AccessToken(apiKey, apiSecret);

        token.setName(user);
        token.setIdentity(user);
        token.addGrants(new RoomJoin(true), new RoomName(room));

        return Map.of("token", token.toJwt());
    }
}
