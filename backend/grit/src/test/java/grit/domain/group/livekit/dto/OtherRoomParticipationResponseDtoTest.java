package grit.domain.group.livekit.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class OtherRoomParticipationResponseDtoTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void serializesBooleanInsideJsonObject() {
        OtherRoomParticipationResponseDto response =
                new OtherRoomParticipationResponseDto(true);

        String json = objectMapper.writeValueAsString(response);

        assertThat(json).isEqualTo("{\"isInOtherRoom\":true}");
    }
}
