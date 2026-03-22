package grit.domain.group.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GroupInfoResponseDto {
    @Schema(description = "그룹 이름", example = "그룹 1")
    private final String name;

    @Schema(description = "그룹 코드", example = "23ES4A")
    private final String groupCode;

    @Schema(description = "현재 그룹원 수", example = "5")
    private final int memberCount;

    @Schema(description = "이미지 URL", example = "https://grit-s3.ap-northeast-2.amazonaws.com/profile/default.png", nullable = true)
    private final String imageUrl;
}
