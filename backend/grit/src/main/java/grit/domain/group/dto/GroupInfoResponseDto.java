package grit.domain.group.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record GroupInfoResponseDto(

    @Schema(description = "그룹 이름", example = "그룹 1")
    String name,

    @Schema(description = "그룹 코드", example = "23ES4A")
    String groupCode,

    @Schema(description = "현재 그룹원 수", example = "5")
    int memberCount,

    @Schema(description = "이미지 URL", example = "https://grit-s3.ap-northeast-2.amazonaws.com/profile/default.png", nullable = true)
    String imageUrl,

    @Schema(description = "LiveKit 방 라이브 여부", example = "true")
    boolean isLive,

    @Schema(description = "LiveKit 방 참여자 수", example = "3")
    int liveParticipantCount
) {
}
