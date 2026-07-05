import Pomodoro from "@/pages/Room/components/Cam/Pomodoro";
import type { PomodoroStatusResponse } from "@/apis/domains/pomodoro/type";

const DEFAULT_FOCUS_MINUTES = 45;
const DEFAULT_BREAK_MINUTES = 15;
const DEFAULT_TOTAL_ROUNDS = 1;

type RoomPomodoroProps = {
  pomodoroStatus: PomodoroStatusResponse | undefined;
};

export default function RoomPomodoro({ pomodoroStatus }: RoomPomodoroProps) {
  const isRunning =
    pomodoroStatus?.status === "RUNNING" ||
    pomodoroStatus?.status === "BREAK" ||
    pomodoroStatus?.status === "PAUSED";

  return (
    <Pomodoro
      studyMinutes={
        isRunning
          ? (pomodoroStatus?.focusMinutes ?? DEFAULT_FOCUS_MINUTES)
          : DEFAULT_FOCUS_MINUTES
      }
      breakMinutes={
        isRunning
          ? (pomodoroStatus?.breakMinutes ?? DEFAULT_BREAK_MINUTES)
          : DEFAULT_BREAK_MINUTES
      }
      repeat={
        isRunning
          ? (pomodoroStatus?.totalRounds ?? DEFAULT_TOTAL_ROUNDS)
          : DEFAULT_TOTAL_ROUNDS
      }
      autoStart={isRunning && pomodoroStatus?.status !== "PAUSED"}
      serverNow={isRunning ? pomodoroStatus?.serverNow : undefined}
      phase={isRunning ? pomodoroStatus?.phase : undefined}
      focusEndsAt={isRunning ? pomodoroStatus?.focusEndsAt : undefined}
      breakEndsAt={isRunning ? pomodoroStatus?.breakEndsAt : undefined}
      currentRound={isRunning ? (pomodoroStatus?.currentRound ?? 1) : 1}
    />
  );
}
