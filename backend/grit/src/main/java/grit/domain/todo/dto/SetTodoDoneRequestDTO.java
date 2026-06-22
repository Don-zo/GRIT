package grit.domain.todo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SetTodoDoneRequestDTO {
    @NotNull
    @Schema(description = "완료 여부 (체크/체크 해제)", example = "true", requiredMode = Schema.RequiredMode.REQUIRED)
    private Boolean isDone;
}
