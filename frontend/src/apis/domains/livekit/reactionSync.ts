import type { LiveKitReactionMessage } from "@/apis/domains/livekit/type";

export const isLiveKitReactionMessage = (
  value: unknown,
): value is LiveKitReactionMessage => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<LiveKitReactionMessage>;
  return (
    typeof candidate.emoji === "string" &&
    typeof candidate.emojiChar === "string" &&
    typeof candidate.senderNickname === "string"
  );
};
