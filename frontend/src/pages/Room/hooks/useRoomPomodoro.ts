import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  isLiveKitPomodoroSyncMessage,
  toPomodoroStatusResponse,
} from "@/apis/domains/livekit/pomodoroSync";
import type {
  PomodoroStatusResponse,
  StartPomodoroRequest,
} from "@/apis/domains/pomodoro/type";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { usePomodoroStatus } from "@/hooks/usePomodoroStatus";
import { useStartPomodoro } from "@/hooks/useStartPomodoro";
import { usePausePomodoro } from "@/hooks/usePausePomodoro";
import { useResumePomodoro } from "@/hooks/useResumePomodoro";
import { useStopPomodoro } from "@/hooks/useStopPomodoro";

const PHASE_BOUNDARY_BUFFER_MS = 50;

const freezePomodoroAt = (
  prev: PomodoroStatusResponse,
  atMs: number,
): PomodoroStatusResponse => {
  const endsAt = prev.phase === "BREAK" ? prev.breakEndsAt : prev.focusEndsAt;
  const remainingMs = endsAt ? Math.max(0, Date.parse(endsAt) - atMs) : 0;
  const nowIso = new Date(atMs).toISOString();
  const frozenEndsAt = new Date(atMs + remainingMs).toISOString();

  return {
    ...prev,
    status: "PAUSED",
    pausedAt: nowIso,
    serverNow: nowIso,
    focusEndsAt: prev.phase === "FOCUS" ? frozenEndsAt : prev.focusEndsAt,
    breakEndsAt: prev.phase === "BREAK" ? frozenEndsAt : prev.breakEndsAt,
  };
};

const resumePomodoroAt = (
  prev: PomodoroStatusResponse,
  atMs: number,
): PomodoroStatusResponse => {
  const endsAt = prev.phase === "BREAK" ? prev.breakEndsAt : prev.focusEndsAt;
  const remainingMs =
    endsAt && prev.serverNow
      ? Math.max(
          0,
          Math.floor((Date.parse(endsAt) - Date.parse(prev.serverNow)) / 1000) *
            1000,
        )
      : 0;
  const nowIso = new Date(atMs).toISOString();
  const nextEndsAtMs = atMs + remainingMs;
  const prevEndsAtMs = endsAt ? Date.parse(endsAt) : nextEndsAtMs;
  const shiftMs = nextEndsAtMs - prevEndsAtMs;

  const shift = (value: string | null) =>
    value ? new Date(Date.parse(value) + shiftMs).toISOString() : value;

  return {
    ...prev,
    status: prev.phase === "BREAK" ? "BREAK" : "RUNNING",
    pausedAt: null,
    serverNow: nowIso,
    focusEndsAt: shift(prev.focusEndsAt),
    breakEndsAt: shift(prev.breakEndsAt),
  };
};

export function useRoomPomodoro(groupCode: string | undefined) {
  const queryClient = useQueryClient();

  const { data: pomodoroStatus, refetch: refetchPomodoroStatus } =
    usePomodoroStatus({
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

  useEffect(() => {
    if (!pomodoroStatus || !groupCode) return;

    const { status, phase, serverNow, focusEndsAt, breakEndsAt } =
      pomodoroStatus;

    const isCounting = status === "RUNNING" || status === "BREAK";
    if (!isCounting) return;

    const endsAt = phase === "FOCUS" ? focusEndsAt : breakEndsAt;
    if (!endsAt) return;

    const clockOffset = Date.parse(serverNow) - Date.now();
    const delayMs =
      Math.max(0, Date.parse(endsAt) - (Date.now() + clockOffset)) +
      PHASE_BOUNDARY_BUFFER_MS;

    const timer = setTimeout(() => {
      queryClient.setQueryData(
        QUERY_KEYS.pomodoro.status(groupCode),
        (prev: PomodoroStatusResponse | undefined) => {
          if (!prev) return prev;
          if (prev.status === "PAUSED" || prev.status === "IDLE") return prev;

          if (prev.phase === "FOCUS") {
            return {
              ...prev,
              status: "BREAK",
              phase: "BREAK",
              serverNow: endsAt,
            };
          }

          return prev;
        },
      );
      void refetchPomodoroStatus();
    }, delayMs);

    return () => clearTimeout(timer);
  }, [groupCode, pomodoroStatus, queryClient, refetchPomodoroStatus]);

  const applyLiveKitSync = useCallback(
    (data: unknown): boolean => {
      if (!isLiveKitPomodoroSyncMessage(data) || !groupCode) return false;

      const next = toPomodoroStatusResponse(data.timer);

      queryClient.setQueryData(
        QUERY_KEYS.pomodoro.status(groupCode),
        (prev: PomodoroStatusResponse | undefined) => {
          if (prev && Date.parse(next.serverNow) < Date.parse(prev.serverNow)) {
            return prev;
          }
          return next;
        },
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

    queryClient.setQueryData(
      QUERY_KEYS.pomodoro.status(groupCode),
      (prev: PomodoroStatusResponse | undefined) => {
        if (!prev) return prev;
        if (prev.status !== "RUNNING" && prev.status !== "BREAK") return prev;
        return freezePomodoroAt(prev, Date.now());
      },
    );

    pausePomodoro(undefined, {
      onError: () => {
        void refetchPomodoroStatus();
      },
    });
  }, [groupCode, pausePomodoro, queryClient, refetchPomodoroStatus]);

  const handleResume = useCallback(() => {
    if (!groupCode) return;

    queryClient.setQueryData(
      QUERY_KEYS.pomodoro.status(groupCode),
      (prev: PomodoroStatusResponse | undefined) => {
        if (!prev || prev.status !== "PAUSED") return prev;
        return resumePomodoroAt(prev, Date.now());
      },
    );

    resumePomodoro(undefined, {
      onError: () => {
        void refetchPomodoroStatus();
      },
    });
  }, [groupCode, queryClient, refetchPomodoroStatus, resumePomodoro]);

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
