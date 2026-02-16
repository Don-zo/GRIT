package grit.domain.group.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GroupCreateRequestDto {
    @Schema(description = "그룹 이름", example = "그룹 1")
    private String name;

    @Schema(description = "이미지 URL", example = "https://grit-s3.ap-northeast-2.amazonaws.com/profile/default.png", nullable = true)
    private String imageUrl;
}
