package grit.domain.todo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class MoveTodoDueDateRequestDTO {
    @NotNull
    @Schema(description = "이동할 마감일 (드래그앤드롭 등으로 날짜만 변경할 때)", example = "2026-04-10", requiredMode = Schema.RequiredMode.REQUIRED)
    private LocalDate dueDate;
}
