package grit.group.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UpdateGroupRequestDTO {
    private String name;
    private String imageUrl;
}
