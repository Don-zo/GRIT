package grit.group.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateGroupRequestDTO {
    private Long id;
    private String name;
    private String description;
    private String image;
    private int memberCount;
}
