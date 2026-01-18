package grit.todolist.dto;

import grit.todolist.Todo;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TodoResponseDTO {
    @Schema(description = "투두 고유 ID (PK)", example = "1")
    private Long id;

    @Schema(description = "방 ID (선택사항)", example = "1")
    private Long roomId;

    @Schema(description = "작성자 ID", example = "1")
    private Long ownerId;

    @Schema(description = "작성자 닉네임", example = "그릿유저")
    private String ownerNickname;

    @Schema(description = "투두 내용", example = "과제 제출하기")
    private String content;

    @Schema(description = "완료 여부", example = "false")
    private Boolean isDone;

    @Schema(description = "과목 카테고리", example = "SCHOOL")
    private Todo.SubjectCategory subjectCategory;

    @Schema(description = "마감일", example = "2025-01-25")
    private LocalDate dueDate;

    @Schema(description = "생성일시")
    private LocalDateTime createdAt;

    @Schema(description = "수정일시")
    private LocalDateTime updatedAt;

    public static TodoResponseDTO from(Todo todo) {
        TodoResponseDTO response = new TodoResponseDTO();
        response.setId(todo.getId());
        response.setRoomId(todo.getRoom() != null ? todo.getRoom().getId() : null);
        response.setOwnerId(todo.getOwner().getId());
        response.setOwnerNickname(todo.getOwner().getNickname());
        response.setContent(todo.getContent());
        response.setIsDone(todo.getIsDone());
        response.setSubjectCategory(todo.getSubjectCategory());
        response.setDueDate(todo.getDueDate());
        response.setCreatedAt(todo.getCreatedAt());
        response.setUpdatedAt(todo.getUpdatedAt());
        return response;
    }
}
