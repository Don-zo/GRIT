package grit.todolist.dto;

import grit.todolist.Todo;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateTodoRequestDTO {
    @Schema(description = "투두 내용", example = "과제 제출하기")
    private String content;

    @Schema(description = "과목 카테고리", example = "SCHOOL")
    private Todo.SubjectCategory subjectCategory;

    @Schema(description = "마감일", example = "2025-01-25")
    private LocalDate dueDate;

    @Schema(description = "방 ID (선택사항)", example = "1")
    private Long roomId;
}
