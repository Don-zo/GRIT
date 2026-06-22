package grit.domain.group.livekit.constraint;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ReactionEmoji {

    THUMBS_UP("👍"),
    THUMBS_DOWN("👎"),
    CLAP("👏"),
    RAISED_HAND("✋"),
    HEART("❤️"),
    HEART_HANDS("🫶"),
    MIDDLE_FINGER("🖕"),
    PRAY("🙏"),
    FIST("✊"),
    WOW("😮"),
    PLEADING("🥺"),
    CRY("😭"),
    ANGRY("🤬"),
    SAD("😢"),
    SCREAM("😱"),
    ROLLING_EYES("🙄"),
    SLEEP("😴"),
    NAUSEATED("🤢"),
    MIND_BLOWN("🤯"),
    SKULL("💀");

    private final String emoji;

}
