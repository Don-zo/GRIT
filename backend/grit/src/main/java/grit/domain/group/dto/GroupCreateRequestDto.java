package grit.domain.group.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GroupCreateRequestDto {
    @Schema(description = "그룹 이름", example = "그룹 1")
    private String name;

    @Schema(description = "이미지 이름", example = "", nullable = true)
    private UUID imageName;
}
