import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { MemberStudyTimeResponse } from "@/apis/domains/studyTime/type";
import type { PomodoroStatusResponse } from "@/apis/domains/pomodoro/type";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { useStudyTime } from "@/hooks/useStudyTime";
import { usePauseStudyTime } from "@/hooks/usePauseStudyTime";
import { useResumeStudyTime } from "@/hooks/useResumeStudyTime";
import {
  getPomodoroStudyPhase,
  shouldStudyTimerRunForPhase,
  type PomodoroStudyPhase,
} from "@/utils/pomodoroStudySync";
import { getDisplayedStudySeconds } from "@/utils/studyTime";

const STUDY_TIMER_KEEP_RUNNING_KEY = "grit:studyTimerKeepRunning";

function readKeepRunningIntent(): boolean {
  try {
    return sessionStorage.getItem(STUDY_TIMER_KEEP_RUNNING_KEY) === "1";
  } catch {
    return false;
  }
}

function writeKeepRunningIntent(keepRunning: boolean) {
  try {
    if (keepRunning) {
      sessionStorage.setItem(STUDY_TIMER_KEEP_RUNNING_KEY, "1");
    } else {
      sessionStorage.removeItem(STUDY_TIMER_KEEP_RUNNING_KEY);
    }
  } catch {
    // ignore
  }
}

function buildOptimisticRunning(
  prev: MemberStudyTimeResponse | undefined,
  displayedSeconds: number,
): MemberStudyTimeResponse {
  const nowIso = new Date().toISOString();
  return {
    weekStartDate: prev?.weekStartDate ?? nowIso.slice(0, 10),
    weeklyStudyTimeGoalSeconds: prev?.weeklyStudyTimeGoalSeconds ?? null,
    currentWeekStudyTimeSeconds: displayedSeconds,
    running: true,
    serverNow: nowIso,
    lastStartedAt: nowIso,
  };
}

function buildOptimisticPaused(
  prev: MemberStudyTimeResponse | undefined,
  displayedSeconds: number,
): MemberStudyTimeResponse {
  const nowIso = new Date().toISOString();
  return {
    weekStartDate: prev?.weekStartDate ?? nowIso.slice(0, 10),
    weeklyStudyTimeGoalSeconds: prev?.weeklyStudyTimeGoalSeconds ?? null,
    currentWeekStudyTimeSeconds: displayedSeconds,
    running: false,
    serverNow: nowIso,
    lastStartedAt: null,
  };
}

function isPomodoroBlockingPhase(phase: PomodoroStudyPhase): boolean {
  return phase === "break" || phase === "paused";
}

type UseRoomStudyTimeOptions = {
  pomodoroStatus: PomodoroStatusResponse | undefined;
};

export function useRoomStudyTime({ pomodoroStatus }: UseRoomStudyTimeOptions) {
  const queryClient = useQueryClient();
  const { data: studyTime, dataUpdatedAt, isLoading, isFetching } =
    useStudyTime();

  const { mutateAsync: resumeStudyTimeAsync } = useResumeStudyTime();
  const { mutateAsync: pauseStudyTimeAsync } = usePauseStudyTime();

  const [isSyncing, setIsSyncing] = useState(false);

  const desiredRunningRef = useRef<boolean | null>(null);
  const inflightRef = useRef(false);
  const fetchedAtRef = useRef<number | undefined>(undefined);
  const displayedSecondsRef = useRef(0);
  const prevPomodoroPhaseRef = useRef<PomodoroStudyPhase | null>(null);
  const didBindPomodoroPhaseRef = useRef(false);
  const pomodoroStatusRef = useRef(pomodoroStatus);

  pomodoroStatusRef.current = pomodoroStatus;

  useEffect(() => {
    if (dataUpdatedAt) {
      fetchedAtRef.current = dataUpdatedAt;
    }
  }, [dataUpdatedAt]);

  const [displayedSeconds, setDisplayedSeconds] = useState(0);

  useEffect(() => {
    const tick = () => {
      const next = getDisplayedStudySeconds(
        studyTime,
        Date.now(),
        fetchedAtRef.current,
      );
      displayedSecondsRef.current = next;
      setDisplayedSeconds(next);
    };

    tick();
    if (!studyTime?.running) return;

    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [studyTime]);

  const applyOptimistic = useCallback(
    (next: MemberStudyTimeResponse) => {
      fetchedAtRef.current = Date.now();
      queryClient.setQueryData(QUERY_KEYS.studyTime.me, next);
      const seconds = getDisplayedStudySeconds(
        next,
        Date.now(),
        fetchedAtRef.current,
      );
      displayedSecondsRef.current = seconds;
      setDisplayedSeconds(seconds);
    },
    [queryClient],
  );

  const flushDesired = useCallback(async () => {
    if (inflightRef.current) return;
    inflightRef.current = true;
    setIsSyncing(true);

    try {
      while (desiredRunningRef.current !== null) {
        const desired = desiredRunningRef.current;
        desiredRunningRef.current = null;

        try {
          const data = desired
            ? await resumeStudyTimeAsync()
            : await pauseStudyTimeAsync();

          const latestDesired = desiredRunningRef.current;
          if (latestDesired !== null && latestDesired !== data.running) {
            const current = queryClient.getQueryData<MemberStudyTimeResponse>(
              QUERY_KEYS.studyTime.me,
            );
            applyOptimistic(
              latestDesired
                ? buildOptimisticRunning(current, displayedSecondsRef.current)
                : buildOptimisticPaused(current, displayedSecondsRef.current),
            );
          } else {
            fetchedAtRef.current = Date.now();
            queryClient.setQueryData(QUERY_KEYS.studyTime.me, data);
            const seconds = getDisplayedStudySeconds(
              data,
              Date.now(),
              fetchedAtRef.current,
            );
            displayedSecondsRef.current = seconds;
            setDisplayedSeconds(seconds);
          }
        } catch {
          await queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.studyTime.me,
          });
          desiredRunningRef.current = null;
          break;
        }
      }
    } finally {
      inflightRef.current = false;
      setIsSyncing(false);

      if (desiredRunningRef.current !== null) {
        void flushDesired();
      }
    }
  }, [
    applyOptimistic,
    pauseStudyTimeAsync,
    queryClient,
    resumeStudyTimeAsync,
  ]);

  const setDesiredRunning = useCallback(
    (running: boolean) => {
      const current = queryClient.getQueryData<MemberStudyTimeResponse>(
        QUERY_KEYS.studyTime.me,
      );
      if (current?.running === running) return;

      writeKeepRunningIntent(running);
      desiredRunningRef.current = running;
      applyOptimistic(
        running
          ? buildOptimisticRunning(current, displayedSecondsRef.current)
          : buildOptimisticPaused(current, displayedSecondsRef.current),
      );

      void flushDesired();
    },
    [applyOptimistic, flushDesired, queryClient],
  );

  const syncResume = useCallback(() => {
    setDesiredRunning(true);
  }, [setDesiredRunning]);

  const syncPause = useCallback(() => {
    setDesiredRunning(false);
  }, [setDesiredRunning]);

  const handleToggle = useCallback(() => {
    const current = queryClient.getQueryData<MemberStudyTimeResponse>(
      QUERY_KEYS.studyTime.me,
    );
    setDesiredRunning(!current?.running);
  }, [queryClient, setDesiredRunning]);

  /** 재생 의도인데 서버/캐시가 멈춤이면 다시 재생 (탭 복귀·refetch 대응) */
  const restoreKeepRunningIfNeeded = useCallback(() => {
    if (!readKeepRunningIntent()) return;

    const phase = pomodoroStatusRef.current
      ? getPomodoroStudyPhase(pomodoroStatusRef.current)
      : "idle";
    if (isPomodoroBlockingPhase(phase)) return;

    const current = queryClient.getQueryData<MemberStudyTimeResponse>(
      QUERY_KEYS.studyTime.me,
    );
    if (!current || current.running) return;

    syncResume();
  }, [queryClient, syncResume]);

  useEffect(() => {
    if (!studyTime) return;

    if (studyTime.running) {
      writeKeepRunningIntent(true);
      return;
    }

    restoreKeepRunningIfNeeded();
  }, [studyTime, restoreKeepRunningIfNeeded]);

  useEffect(() => {
    const handleVisible = () => {
      if (document.visibilityState !== "visible") return;

      // 탭 복귀 시 최신 서버 상태 확인 + 재생 의도 복구
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.studyTime.me });
      restoreKeepRunningIfNeeded();
    };

    document.addEventListener("visibilitychange", handleVisible);
    window.addEventListener("focus", handleVisible);
    return () => {
      document.removeEventListener("visibilitychange", handleVisible);
      window.removeEventListener("focus", handleVisible);
    };
  }, [queryClient, restoreKeepRunningIfNeeded]);

  useEffect(() => {
    if (!pomodoroStatus) return;

    const phase = getPomodoroStudyPhase(pomodoroStatus);
    const prevPhase = prevPomodoroPhaseRef.current;

    if (!didBindPomodoroPhaseRef.current) {
      didBindPomodoroPhaseRef.current = true;
      prevPomodoroPhaseRef.current = phase;
      return;
    }

    if (prevPhase === null || prevPhase === phase) return;
    prevPomodoroPhaseRef.current = phase;

    if (shouldStudyTimerRunForPhase(phase)) {
      syncResume();
      return;
    }

    // break / paused / idle(정지) 전환만 타이머 pause
    syncPause();
  }, [pomodoroStatus, syncPause, syncResume]);

  return {
    studyTime,
    displayedSeconds,
    isRunning: !!studyTime?.running,
    isLoading,
    isFetching,
    isTogglePending: isSyncing,
    handleToggle,
    syncResume,
    syncPause,
  };
}
