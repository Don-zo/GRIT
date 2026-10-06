import type { GroupMemberStudyTimeResponse } from "@/apis/domains/studyTime/type";
import type { LiveKitStudyTimeSyncMessage } from "@/apis/domains/livekit/type";

export const isLiveKitStudyTimeSyncMessage = (
  value: unknown,
): value is LiveKitStudyTimeSyncMessage => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<LiveKitStudyTimeSyncMessage>;
  const member = candidate.member;

  return (
    candidate.type === "study-time.sync" &&
    typeof candidate.senderNickname === "string" &&
    !!member &&
    typeof member === "object" &&
    typeof (member as GroupMemberStudyTimeResponse).memberId === "number" &&
    typeof (member as GroupMemberStudyTimeResponse).running === "boolean" &&
    typeof (member as GroupMemberStudyTimeResponse).serverNow === "string"
  );
};
