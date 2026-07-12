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
    // sessionStorage 불가 환경은 무시
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
  const didInitialSyncRef = useRef(false);

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

  useEffect(() => {
    // studyTime + pomodoro 모두 준비된 뒤 한 번만 처리
    if (!studyTime || !pomodoroStatus || didInitialSyncRef.current) return;
    didInitialSyncRef.current = true;

    const phase = getPomodoroStudyPhase(pomodoroStatus);
    prevPomodoroPhaseRef.current = phase;

    if (studyTime.running) {
      writeKeepRunningIntent(true);
      return;
    }

    // 수동으로 끈 상태는 유지. 재생 중이었는데 방 이탈 등으로 멈춘 경우만 복구.
    if (!readKeepRunningIntent()) return;
    if (phase === "break" || phase === "paused") return;

    syncResume();
  }, [pomodoroStatus, studyTime, syncResume]);

  useEffect(() => {
    if (!pomodoroStatus) return;

    const phase = getPomodoroStudyPhase(pomodoroStatus);
    const prevPhase = prevPomodoroPhaseRef.current;

    // 초기 phase 기록은 위 effect에서 수행
    if (prevPhase === null) return;
    if (prevPhase === phase) return;

    prevPomodoroPhaseRef.current = phase;

    if (shouldStudyTimerRunForPhase(phase)) {
      syncResume();
      return;
    }

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
