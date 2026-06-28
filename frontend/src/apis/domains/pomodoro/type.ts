export interface StartPomodoroRequest {
  focusMinutes: number;
  totalRounds: number;
}

export const clampFocusMinutes = (value: number) => {
  const rounded = Math.round(value);
  if (rounded < 1) return 1;
  if (rounded > 60) return 60;
  return rounded;
};

export const clampTotalRounds = (value: number) => {
  const rounded = Math.round(value);
  if (rounded < 1) return 1;
  if (rounded > 6) return 6;
  return rounded;
};

export const normalizeStartPomodoroRequest = (
  body: StartPomodoroRequest,
): StartPomodoroRequest => ({
  focusMinutes: clampFocusMinutes(body.focusMinutes),
  totalRounds: clampTotalRounds(body.totalRounds),
});

export type PomodoroStatus =
  | "IDLE"
  | "RUNNING"
  | "BREAK"
  | "PAUSED"
  | "FINISHED";

export type PomodoroPhase = "FOCUS" | "BREAK" | null;

export interface PomodoroStatusResponse {
  status: PomodoroStatus;
  phase: PomodoroPhase;
  serverNow: string;
  focusEndsAt: string | null;
  breakEndsAt: string | null;
  pausedAt: string | null;
  focusMinutes: number | null;
  breakMinutes: number | null;
  currentRound: number | null;
  totalRounds: number | null;
}
