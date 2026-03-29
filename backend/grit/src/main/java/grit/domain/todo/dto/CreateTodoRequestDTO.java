package grit.domain.todo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateTodoRequestDTO {
    @NotBlank
    @Size(max = 500)
    @Schema(description = "투두 내용", example = "과제 제출하기")
    private String content;

    @NotNull
    @Schema(description = "마감일", example = "2025-01-25")
    private LocalDate dueDate;

    @Schema(description = "카테고리 ID (선택, 본인이 등록한 카테고리만)", example = "1")
    private Long categoryId;
}
