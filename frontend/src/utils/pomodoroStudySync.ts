import type { PomodoroStatusResponse } from "@/apis/domains/pomodoro/type";

export type PomodoroStudyPhase = "focus" | "break" | "paused" | "idle";

function getAlignedServerNowMs(
  serverNow: string,
  clientNowMs: number,
  fetchedAtMs?: number,
): number {
  const serverNowMs = Date.parse(serverNow);
  if (Number.isNaN(serverNowMs)) return clientNowMs;
  const anchorMs = fetchedAtMs ?? clientNowMs;
  return serverNowMs + Math.max(0, clientNowMs - anchorMs);
}

/**
 * 뽀모도로 상태 + endsAt 시각으로 공부 타이머가 따라야 할 국면을 계산한다.
 * LiveKit phase 갱신이 늦어도 focusEndsAt/breakEndsAt 기준으로 전환을 감지한다.
 */
export function getPomodoroStudyPhase(
  pomodoro: PomodoroStatusResponse | undefined,
  clientNowMs: number = Date.now(),
  fetchedAtMs?: number,
): PomodoroStudyPhase {
  if (!pomodoro) return "idle";

  const { status, phase, focusEndsAt, breakEndsAt, serverNow } = pomodoro;

  if (status === "IDLE" || status === "FINISHED") return "idle";
  if (status === "PAUSED") return "paused";

  const nowMs = getAlignedServerNowMs(serverNow, clientNowMs, fetchedAtMs);
  const focusEndMs = focusEndsAt ? Date.parse(focusEndsAt) : Number.NaN;
  const breakEndMs = breakEndsAt ? Date.parse(breakEndsAt) : Number.NaN;

  const focusEnded = !Number.isNaN(focusEndMs) && nowMs >= focusEndMs;
  const breakEnded = !Number.isNaN(breakEndMs) && nowMs >= breakEndMs;

  if (status === "BREAK" || phase === "BREAK") {
    if (breakEnded) return "focus";
    return "break";
  }

  if (status === "RUNNING") {
    if (focusEnded) {
      if (!Number.isNaN(breakEndMs)) {
        return breakEnded ? "focus" : "break";
      }
      return "break";
    }
    return "focus";
  }

  return "idle";
}

export function shouldStudyTimerRunForPhase(phase: PomodoroStudyPhase): boolean {
  return phase === "focus";
}
