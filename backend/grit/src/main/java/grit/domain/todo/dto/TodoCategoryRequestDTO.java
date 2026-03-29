package grit.domain.todo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TodoCategoryRequestDTO {
    @Schema(description = "카테고리 이름", example = "학교 과제", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;
}
