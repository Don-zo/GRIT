package grit.domain.group.livekit.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record OtherRoomParticipationResponseDto(
        @Schema(
                description = "현재 그룹 방을 제외한 다른 LiveKit 그룹 방 참여 여부",
                example = "true"
        )
        boolean isInOtherRoom
) {
}
