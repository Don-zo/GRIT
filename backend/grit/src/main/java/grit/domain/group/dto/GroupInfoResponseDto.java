package grit.domain.group.dto;

import grit.domain.group.entity.Group;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GroupInfoResponseDto {
    @Schema(description = "그룹 고유 ID (PK)", example = "10")
    private final Long id;

    @Schema(description = "그룹 이름", example = "그룹 1")
    private final String name;

    @Schema(description = "그룹 초대 코드", example = "23E!S@")
    private final String inviteCode;

    @Schema(description = "현재 그룹원 수", example = "5")
    private final int memberCount;

    @Schema(description = "이미지 URL", example = "https://grit-s3.ap-northeast-2.amazonaws.com/profile/default.png", nullable = true)
    private final String imageUrl;

    public GroupInfoResponseDto(Group group, String imageUrl) {
        this.id = group.getId();
        this.name = group.getName();
        this.inviteCode = group.getInviteCode();
        this.memberCount = group.getMemberCount();
        this.imageUrl = imageUrl;
    }
}
