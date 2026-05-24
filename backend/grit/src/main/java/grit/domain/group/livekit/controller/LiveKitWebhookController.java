package grit.domain.group.livekit.controller;

import com.google.protobuf.InvalidProtocolBufferException;
import grit.domain.group.livekit.service.LiveKitRoomStatusService;
import io.livekit.server.WebhookReceiver;
import jakarta.annotation.PostConstruct;
import livekit.LivekitWebhook.WebhookEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/livekit/webhook")
public class LiveKitWebhookController {

    private final LiveKitRoomStatusService liveKitRoomStatusService;

    @Value("${livekit.api.key}")
    private String apiKey;

    @Value("${livekit.api.secret}")
    private String apiSecret;

    private WebhookReceiver webhookReceiver;

    @PostConstruct
    private void init() {
        this.webhookReceiver = new WebhookReceiver(apiKey, apiSecret);
    }

    @PostMapping
    public ResponseEntity<Void> receive(
            @RequestBody String body,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader) {

        WebhookEvent event;
        try {
            event = receiveWebhook(body, authorizationHeader);
        } catch (IllegalArgumentException | InvalidProtocolBufferException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (RuntimeException e) {
            if (isJwtVerificationException(e)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            throw e;
        }

        liveKitRoomStatusService.applyWebhookEvent(event);
        return ResponseEntity.noContent().build();
    }

    private WebhookEvent receiveWebhook(String body, String authorizationHeader) throws InvalidProtocolBufferException {
        return webhookReceiver.receive(body, authorizationHeader);
    }

    private boolean isJwtVerificationException(RuntimeException e) {
        return e.getClass().getName().startsWith("com.auth0.jwt.exceptions.");
    }
}
