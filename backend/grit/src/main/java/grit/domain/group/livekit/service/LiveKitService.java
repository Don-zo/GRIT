package grit.domain.group.livekit.service;

import grit.domain.group.livekit.constraint.ReactionEmoji;
import grit.domain.member.entity.Member;
import io.livekit.server.AccessToken;
import io.livekit.server.CanPublish;
import io.livekit.server.CanPublishData;
import io.livekit.server.CanSubscribe;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import io.livekit.server.RoomServiceClient;
import jakarta.annotation.PostConstruct;
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

    @Value("${livekit.api-key}")
    private String apiKey;

    @Value("${livekit.api-secret}")
    private String apiSecret;

    private final ObjectMapper objectMapper;

    private RoomServiceClient client;

    @PostConstruct
    public void init() {
        this.client = RoomServiceClient.createClient(url, apiKey, apiSecret);
    }

    public AccessToken generateToken(Member member, String roomName) {
        AccessToken token = new AccessToken(apiKey, apiSecret);

        token.setIdentity(member.getId().toString());
        token.setName(member.getNickname());
        token.addGrants(
                new RoomJoin(true),
                new RoomName(roomName),
                new CanPublish(true),
                new CanSubscribe(true),
                new CanPublishData(false)
        );
        return token;
    }

    public void sendReaction(Member member, String roomName, ReactionEmoji emoji) {
        sendData(roomName,
                Map.of(
                        "emoji", emoji.name(),
                        "emojiChar", emoji.getEmoji(),
                        "senderUserId", member.getId()
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

}
