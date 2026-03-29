package grit.domain.todo.dto;

import grit.domain.todo.entity.TodoCategory;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TodoCategoryResponseDto {
    @Schema(description = "카테고리 ID", example = "1")
    private Long id;

    @Schema(description = "카테고리 이름", example = "학교 과제")
    private String name;

    public static TodoCategoryResponseDto from(TodoCategory category) {
        return new TodoCategoryResponseDto(category.getId(), category.getName());
    }
}
