import type { PomodoroStatusResponse } from "@/apis/domains/pomodoro/type";

export type PomodoroStudyPhase = "focus" | "break" | "paused" | "idle";

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
