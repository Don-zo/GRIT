package grit.domain.todo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateTodoCategoryRequestDto {
    @NotBlank
    @Size(max = 50)
    @Schema(description = "카테고리 이름", example = "학교 과제")
    private String name;
}
