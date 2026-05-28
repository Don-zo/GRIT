package grit.domain.group.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record GroupMemberResponseDto(
        @Schema(description = "회원 ID", example = "1")
        Long id,
        @Schema(description = "회원 닉네임", example = "이유민")
        String nickname,
        @Schema(description = "요청자 본인 여부", example = "true")
        boolean me
) {
}
