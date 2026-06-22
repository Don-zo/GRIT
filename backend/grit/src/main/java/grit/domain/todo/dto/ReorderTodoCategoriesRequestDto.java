package grit.domain.todo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ReorderTodoCategoriesRequestDto {
    @NotEmpty
    @Schema(
            description = "본인 카테고리 ID를 원하는 표시 순서대로 나열 (전체 목록과 동일한 집합이어야 함)",
            example = "[3, 1, 2]",
            requiredMode = Schema.RequiredMode.REQUIRED)
    private List<@NotNull Long> categoryIds;
}
