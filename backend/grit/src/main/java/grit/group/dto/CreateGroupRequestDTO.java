package grit.group.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateGroupRequestDTO {
    private String name;
    private String imageUrl;
}
