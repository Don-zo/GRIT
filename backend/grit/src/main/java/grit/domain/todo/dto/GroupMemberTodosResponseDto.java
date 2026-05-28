package grit.domain.todo.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.List;

public record GroupMemberTodosResponseDto(
        @Schema(description = "조회 뷰", example = "category")
        String view,
        @Schema(description = "조회 시작일", example = "2026-05-28")
        LocalDate startDate,
        @Schema(description = "조회 종료일", example = "2026-05-30")
        LocalDate endDate,
        @Schema(description = "섹션 목록")
        List<SectionDto> sections
) {
    public record SectionDto(
            @Schema(description = "섹션 키", example = "today")
            String key,
            @Schema(description = "섹션 라벨", example = "오늘")
            String label,
            @Schema(description = "해당 섹션 투두 목록")
            List<TodoResponseDTO> todos
    ) {
    }
}
