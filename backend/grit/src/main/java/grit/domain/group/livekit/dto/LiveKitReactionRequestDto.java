package grit.domain.group.livekit.dto;

import grit.domain.group.livekit.constraint.ReactionEmoji;
import jakarta.validation.constraints.NotNull;

public record LiveKitReactionRequestDto(
        @NotNull
        ReactionEmoji emoji
) {

}
