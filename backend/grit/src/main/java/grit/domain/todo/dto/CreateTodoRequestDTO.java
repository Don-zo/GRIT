package grit.domain.todo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateTodoRequestDTO {
    @Schema(description = "투두 내용", example = "과제 제출하기")
    private String content;

    @Schema(description = "카테고리 ID (선택사항)", example = "1")
    private Long categoryId;

    @Schema(description = "마감일", example = "2025-01-25")
    private LocalDate dueDate;

    @Schema(description = "그룹 ID (선택사항)", example = "1")
    private Long groupId;
}

