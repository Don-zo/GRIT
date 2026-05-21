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
import jakarta.annotation.PostConstruct;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import livekit.LivekitModels.DataPacket.Kind;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
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
                Map.of(
                        "type", "reaction",
                        "emoji", emoji.name(),
                        "emojiChar", emoji.getEmoji(),
                        "senderNickname", member.getNickname()
                ), Kind.RELIABLE);
    }

    public void sendPomodoroSync(Member member, Group group, Pomodoro pomodoro) {
        LocalDateTime serverNow = LocalDateTime.now(clock);
        Map<String, Object> timer = new LinkedHashMap<>();
        timer.put("status", pomodoro.getCurrentStatus(serverNow).name());
        timer.put("phase", pomodoro.getCurrentPhase(serverNow));
        timer.put("serverNow", serverNow);
        timer.put("phaseStartedAt", pomodoro.getPhaseStartedAt(serverNow));
        timer.put("phaseEndsAt", pomodoro.getPhaseEndsAt(serverNow));
        timer.put("pausedAt", pomodoro.getPausedAt());
        timer.put("focusMinutes", pomodoro.getFocusMinutes());
        timer.put("breakMinutes", pomodoro.getBreakMinutes());
        timer.put("currentRound", pomodoro.getCurrentRound(serverNow));
        timer.put("totalRounds", pomodoro.getTotalRounds());

        sendData(roomName(group.getCode()),
                Map.of(
                        "type", "pomodoro.sync",
                        "timer", timer,
                        "senderNickname", member.getNickname()
                ), Kind.RELIABLE);
    }

    private void sendData(String roomName, Object payload, Kind kind) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            client.sendData(roomName, json.getBytes(), kind).execute();
        } catch (Exception e) {
            throw new RuntimeException("Failed to send data to LiveKit", e);
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
