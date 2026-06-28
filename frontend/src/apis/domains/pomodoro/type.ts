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
