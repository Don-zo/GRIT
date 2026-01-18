package grit.group.dto;

import grit.group.entity.Group;
import lombok.Getter;

@Getter
public class GroupResponseDTO {
    private final Long id;
    private final String name;
    private final int memberCount;
    private final String imageUrl;

    // Entity -> DTO 변환
    public GroupResponseDTO(Group group) {
        this.id = group.getId();
        this.name = group.getName();
        this.memberCount = group.getMemberCount();
        this.imageUrl = group.getImageUrl();
    }
}
