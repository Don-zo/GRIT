import type { PomodoroStatusResponse } from "@/apis/domains/pomodoro/type";
import type { LiveKitPomodoroSyncMessage } from "@/apis/domains/livekit/type";

export const isLiveKitPomodoroSyncMessage = (
  value: unknown,
): value is LiveKitPomodoroSyncMessage => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<LiveKitPomodoroSyncMessage>;
  const timer = candidate.timer;

  return (
    candidate.type === "pomodoro.sync" &&
    typeof candidate.senderNickname === "string" &&
    !!timer &&
    typeof timer === "object" &&
    typeof (timer as PomodoroStatusResponse).status === "string" &&
    typeof (timer as PomodoroStatusResponse).serverNow === "string"
  );
};

export const toPomodoroStatusResponse = (
  timer: LiveKitPomodoroSyncMessage["timer"],
): PomodoroStatusResponse => ({
  status: timer.status,
  phase: timer.phase,
  serverNow: timer.serverNow,
  focusEndsAt: timer.focusEndsAt,
  breakEndsAt: timer.breakEndsAt,
  pausedAt: timer.pausedAt,
  focusMinutes: timer.focusMinutes,
  breakMinutes: timer.breakMinutes,
  currentRound: timer.currentRound,
  totalRounds: timer.totalRounds,
});
