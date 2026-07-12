import type { PomodoroStatusResponse } from "@/apis/domains/pomodoro/type";

export type PomodoroStudyPhase = "focus" | "break" | "paused" | "idle";

/**
 * 벽시계/endsAt 예측은 뽀모도로 UI(setInterval 카운트다운)보다
 * 먼저 멈추는 원인이 되므로, 서버가 내려준 status/phase만 신뢰한다.
 */
export function getPomodoroStudyPhase(
  pomodoro: PomodoroStatusResponse | undefined,
): PomodoroStudyPhase {
  if (!pomodoro) return "idle";

  const { status, phase } = pomodoro;

  if (status === "IDLE" || status === "FINISHED") return "idle";
  if (status === "PAUSED") return "paused";
  if (status === "BREAK" || phase === "BREAK") return "break";
  if (status === "RUNNING" && (phase === "FOCUS" || phase == null)) {
    return "focus";
  }

  return "idle";
}

export function shouldStudyTimerRunForPhase(phase: PomodoroStudyPhase): boolean {
  return phase === "focus";
}
