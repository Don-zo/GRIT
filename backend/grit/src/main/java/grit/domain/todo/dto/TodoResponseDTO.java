package grit.domain.todo.dto;

import grit.domain.todo.entity.Todo;
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

    @Schema(description = "작성자 ID", example = "1")
    private Long ownerId;

    @Schema(description = "작성자 닉네임", example = "그릿유저")
    private String ownerNickname;

    @Schema(description = "투두 내용", example = "과제 제출하기")
    private String content;

    @Schema(description = "완료 여부", example = "false")
    private Boolean isDone;

    @Schema(description = "카테고리 ID (없으면 null)", example = "1")
    private Long categoryId;

    @Schema(description = "카테고리 이름 (없으면 null)", example = "학교 과제")
    private String categoryName;

    @Schema(description = "카테고리 표시 순서 (없으면 null)", example = "0")
    private Integer categorySortOrder;

    @Schema(description = "마감일", example = "2025-01-25")
    private LocalDate dueDate;

    @Schema(description = "생성일시")
    private LocalDateTime createdAt;

    @Schema(description = "수정일시")
    private LocalDateTime updatedAt;

    public static TodoResponseDTO from(Todo todo) {
        return new TodoResponseDTO(
                todo.getId(),
                todo.getOwner().getId(),
                todo.getOwner().getNickname(),
                todo.getContent(),
                todo.isDone(),
                todo.getCategory() != null ? todo.getCategory().getId() : null,
                todo.getCategory() != null ? todo.getCategory().getName() : null,
                todo.getCategory() != null ? todo.getCategory().getSortOrder() : null,
                todo.getDueDate(),
                todo.getCreatedAt(),
                todo.getUpdatedAt()
        );
    }
}
