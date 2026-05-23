package grit.domain.group.livekit.service;

import io.livekit.server.WebhookReceiver;
import livekit.LivekitWebhook.WebhookEvent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class LiveKitWebhookService {

    private final LiveKitRoomStatusService liveKitRoomStatusService;
    private final WebhookReceiver webhookReceiver;

    public LiveKitWebhookService(
            LiveKitRoomStatusService liveKitRoomStatusService,
            @Value("${livekit.api.key}") String apiKey,
            @Value("${livekit.api.secret}") String apiSecret) {
        this.liveKitRoomStatusService = liveKitRoomStatusService;
        this.webhookReceiver = new WebhookReceiver(apiKey, apiSecret);
    }

    public void receive(String body, String authorizationHeader) {
        WebhookEvent event;
        try {
            event = webhookReceiver.receive(body, authorizationHeader);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid LiveKit webhook", e);
        }

        liveKitRoomStatusService.applyWebhookEvent(event);
    }
}
