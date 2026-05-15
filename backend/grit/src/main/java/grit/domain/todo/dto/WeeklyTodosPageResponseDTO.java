package grit.domain.todo.dto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDate;
import java.util.List;

@Getter
@AllArgsConstructor
public class WeeklyTodosPageResponseDTO {
    @Schema(description = "조회 구간 첫 날(포함)", example = "2026-05-15")
    private LocalDate startDate;

    @Schema(description = "조회 구간 마지막 날(포함)", example = "2026-05-19")
    private LocalDate endDate;

    @Schema(description = "조회 일수", example = "5")
    private int dayCount;

    @Schema(description = "조회 구간 내 투두 총 개수", example = "37")
    private long totalCount;

    @Schema(description = "투두 목록 (조회 구간 전체)")
    private List<TodoResponseDTO> todos;
}
