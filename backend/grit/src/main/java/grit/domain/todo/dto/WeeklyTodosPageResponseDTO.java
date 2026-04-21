package grit.domain.todo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@AllArgsConstructor
public class WeeklyTodosPageResponseDTO {
    @Schema(description = "조회한 주의 시작일(월요일)", example = "2026-04-20")
    private LocalDate weekStartDate;

    @Schema(description = "조회한 주의 종료일(일요일)", example = "2026-04-26")
    private LocalDate weekEndDate;

    @Schema(description = "현재 페이지 번호(0부터 시작)", example = "0")
    private int page;

    @Schema(description = "페이지 크기", example = "20")
    private int size;

    @Schema(description = "전체 항목 수", example = "37")
    private long totalElements;

    @Schema(description = "전체 페이지 수", example = "2")
    private int totalPages;

    @Schema(description = "다음 페이지 존재 여부", example = "true")
    private boolean hasNext;

    @Schema(description = "현재 페이지 투두 목록")
    private List<TodoResponseDTO> todos;
}
