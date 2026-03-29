package grit.domain.todo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdateTodoRequestDTO {
    @Size(max = 500)
    @Schema(description = "투두 내용 (보낼 때 비어 있으면 안 됨)", example = "과제 제출하기")
    private String content;

    @Schema(description = "완료 여부", example = "true")
    private Boolean isDone;

    @Schema(description = "마감일")
    private LocalDate dueDate;

    @Schema(description = "true이면 카테고리 해제 (categoryId보다 우선)")
    private Boolean removeCategory;

    @Schema(description = "설정할 카테고리 ID (본인 카테고리만). removeCategory가 true면 무시됩니다.")
    private Long categoryId;
}
