import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  isLiveKitPomodoroSyncMessage,
  toPomodoroStatusResponse,
} from "@/apis/domains/livekit/pomodoroSync";
import type { StartPomodoroRequest } from "@/apis/domains/pomodoro/type";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { usePomodoroStatus } from "@/hooks/usePomodoroStatus";
import { useStartPomodoro } from "@/hooks/useStartPomodoro";
import { usePausePomodoro } from "@/hooks/usePausePomodoro";
import { useResumePomodoro } from "@/hooks/useResumePomodoro";
import { useStopPomodoro } from "@/hooks/useStopPomodoro";

export function useRoomPomodoro(groupCode: string | undefined) {
  const queryClient = useQueryClient();

  const { data: pomodoroStatus } = usePomodoroStatus({
    groupCode,
    enabled: !!groupCode,
  });

  const { mutate: startPomodoro, isPending: isStartingPomodoro } =
    useStartPomodoro(groupCode);
  const { mutate: pausePomodoro, isPending: isPausingPomodoro } =
    usePausePomodoro(groupCode);
  const { mutate: resumePomodoro, isPending: isResumingPomodoro } =
    useResumePomodoro(groupCode);
  const { mutate: stopPomodoro, isPending: isStoppingPomodoro } =
    useStopPomodoro(groupCode);

  const applyLiveKitSync = useCallback(
    (data: unknown): boolean => {
      if (!isLiveKitPomodoroSyncMessage(data) || !groupCode) return false;

      queryClient.setQueryData(
        QUERY_KEYS.pomodoro.status(groupCode),
        toPomodoroStatusResponse(data.timer),
      );
      return true;
    },
    [groupCode, queryClient],
  );

  const handleStart = useCallback(
    (body: StartPomodoroRequest) => {
      if (!groupCode) return;
      startPomodoro(body);
    },
    [groupCode, startPomodoro],
  );

  const handlePause = useCallback(() => {
    if (!groupCode) return;
    pausePomodoro();
  }, [groupCode, pausePomodoro]);

  const handleResume = useCallback(() => {
    if (!groupCode) return;
    resumePomodoro();
  }, [groupCode, resumePomodoro]);

  const handleStop = useCallback(() => {
    if (!groupCode) return;
    stopPomodoro();
  }, [groupCode, stopPomodoro]);

  return {
    pomodoroStatus,
    isStartingPomodoro,
    isPausingPomodoro,
    isResumingPomodoro,
    isStoppingPomodoro,
    applyLiveKitSync,
    handleStart,
    handlePause,
    handleResume,
    handleStop,
  };
}
