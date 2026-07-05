package grit.domain.group.livekit.service;

import grit.domain.group.GroupService;
import grit.domain.group.entity.Group;
import grit.domain.group.livekit.constraint.ReactionEmoji;
import grit.domain.group.livekit.pomodoro.entity.Pomodoro;
import grit.domain.member.entity.Member;
import grit.global.exception.AccessDeniedException;
import io.livekit.server.AccessToken;
import io.livekit.server.CanPublish;
import io.livekit.server.CanPublishData;
import io.livekit.server.CanSubscribe;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import io.livekit.server.RoomServiceClient;
import io.micrometer.observation.Observation;
import io.micrometer.observation.ObservationRegistry;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import livekit.LivekitModels.DataPacket.Kind;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import retrofit2.Response;
import tools.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class LiveKitService {

    @Value("${livekit.url}")
    private String url;

    @Value("${livekit.api.key}")
    private String apiKey;

    @Value("${livekit.api.secret}")
    private String apiSecret;

    private final GroupService groupService;
    private final ObjectMapper objectMapper;
    private final Clock clock;
    private final ObservationRegistry observationRegistry;
    private RoomServiceClient client;

    @PostConstruct
    public void init() {
        this.client = RoomServiceClient.createClient(url, apiKey, apiSecret);
    }

    public AccessToken generateToken(Member member, String groupCode) {
        Group group = groupService.findGroupByCode(groupCode);
        checkPermission(member, group);

        AccessToken token = new AccessToken(apiKey, apiSecret);
        token.setIdentity(member.getNickname());
        token.setName(member.getNickname());
        token.addGrants(
                new RoomJoin(true),
                new RoomName(roomName(group.getCode())),
                new CanPublish(true),
                new CanSubscribe(true),
                new CanPublishData(false)
        );
        return token;
    }

    public void sendReaction(Member member, String groupCode, ReactionEmoji emoji) {
        Group group = groupService.findGroupByCode(groupCode);
        checkPermission(member, group);
        sendData(roomName(group.getCode()),
                "reaction",
                Map.of(
                        "type", "reaction",
                        "emoji", emoji.name(),
                        "emojiChar", emoji.getEmoji(),
                        "senderNickname", member.getNickname()
                ), Kind.RELIABLE);
    }

    public void sendPomodoroSync(Member member, Group group, Pomodoro pomodoro) {
        Instant serverNow = Instant.now(clock);
        Map<String, Object> timer = new LinkedHashMap<>();
        timer.put("status", pomodoro.getCurrentStatus(serverNow).name());
        timer.put("phase", pomodoro.getCurrentPhase(serverNow));
        timer.put("serverNow", serverNow);
        timer.put("focusEndsAt", pomodoro.getFocusEndsAt(serverNow));
        timer.put("breakEndsAt", pomodoro.getBreakEndsAt(serverNow));
        timer.put("pausedAt", pomodoro.getPausedAt());
        timer.put("focusMinutes", pomodoro.getFocusMinutes());
        timer.put("breakMinutes", pomodoro.getBreakMinutes());
        timer.put("currentRound", pomodoro.getCurrentRound(serverNow));
        timer.put("totalRounds", pomodoro.getTotalRounds());

        sendData(roomName(group.getCode()),
                "pomodoro.sync",
                Map.of(
                        "type", "pomodoro.sync",
                        "timer", timer,
                        "senderNickname", member.getNickname()
                ), Kind.RELIABLE);
    }

    private void sendData(String roomName, String messageType, Object payload, Kind kind) {
        Observation observation = Observation.createNotStarted("livekit.send_data", observationRegistry)
                .contextualName("LiveKit send data")
                .lowCardinalityKeyValue("livekit.message_type", messageType)
                .lowCardinalityKeyValue("livekit.kind", kind.name())
                .highCardinalityKeyValue("livekit.room", roomName)
                .start();

        try (Observation.Scope ignored = observation.openScope()) {
            String json = objectMapper.writeValueAsString(payload);
            byte[] payloadBytes = json.getBytes(StandardCharsets.UTF_8);
            observation.highCardinalityKeyValue("livekit.payload.bytes", String.valueOf(payloadBytes.length));
            Response<Void> response = client.sendData(roomName, payloadBytes, kind).execute();
            if (!response.isSuccessful()) {
                throw new RuntimeException("LiveKit send data failed. status="
                        + response.code()
                        + ", message="
                        + response.message());
            }
        } catch (Exception e) {
            observation.error(e);
            throw new RuntimeException("Failed to send data to LiveKit", e);
        } finally {
            observation.stop();
        }
    }

    private void checkPermission(Member member, Group group) {
        if (!groupService.isMemberInGroup(member, group)) {
            throw new AccessDeniedException("권한이 없습니다.");
        }
    }

    private String roomName(String groupCode) {
        return "group:" + groupCode;
    }

}
