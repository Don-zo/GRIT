import { useCallback } from "react";
import { useRoomPomodoro } from "@/pages/Room/hooks/useRoomPomodoro";
import { useRoomReactions } from "@/pages/Room/hooks/useRoomReactions";

export function useRoomLiveKitData(groupCode: string | undefined) {
  const pomodoro = useRoomPomodoro(groupCode);
  const reactions = useRoomReactions(groupCode);

  const handleDataReceived = useCallback(
    (payload: Uint8Array) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(payload));

        if (pomodoro.applyLiveKitSync(data)) return;
        reactions.applyLiveKitReaction(data);
      } catch {
        // 파싱 불가한 메시지는 무시
      }
    },
    [pomodoro.applyLiveKitSync, reactions.applyLiveKitReaction],
  );

  return {
    pomodoro,
    reactions,
    handleDataReceived,
  };
}
