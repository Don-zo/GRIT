import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { groupStudyTimeApi } from "@/apis/domains/studyTime/api";
import type { GroupMemberStudyTimeResponse } from "@/apis/domains/studyTime/type";
import { isLiveKitStudyTimeSyncMessage } from "@/apis/domains/livekit/studyTimeSync";
import type { PomodoroStatusResponse } from "@/apis/domains/pomodoro/type";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { useMember } from "@/hooks/useMember";
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

function buildOptimisticMember(
  prev: GroupMemberStudyTimeResponse | undefined,
  memberId: number,
  nickname: string,
  displayedSeconds: number,
  running: boolean,
): GroupMemberStudyTimeResponse {
  const nowIso = new Date().toISOString();
  return {
    memberId,
    nickname,
    weekStartDate: prev?.weekStartDate ?? nowIso.slice(0, 10),
    weeklyStudyTimeGoalSeconds: prev?.weeklyStudyTimeGoalSeconds ?? null,
    currentWeekStudyTimeSeconds: displayedSeconds,
    running,
    serverNow: nowIso,
    lastStartedAt: running ? nowIso : null,
  };
}

function isPomodoroBlockingPhase(phase: PomodoroStudyPhase): boolean {
  return phase === "break" || phase === "paused";
}

type UseRoomStudyTimeOptions = {
  groupCode: string | undefined;
  pomodoroStatus: PomodoroStatusResponse | undefined;
};

export function useRoomStudyTime({
  groupCode,
  pomodoroStatus,
}: UseRoomStudyTimeOptions) {
  const queryClient = useQueryClient();
  const { data: currentMember } = useMember();
  const queryKey = QUERY_KEYS.groupStudyTime.list(groupCode ?? "");

  const fetchedAtByMemberIdRef = useRef(new Map<number, number>());

  const {
    data: members = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const data = await groupStudyTimeApi.getAll(groupCode!);
      const fetchedAt = Date.now();
      data.forEach((member) => {
        fetchedAtByMemberIdRef.current.set(member.memberId, fetchedAt);
      });
      return data;
    },
    enabled: !!groupCode,
  });

  const membersByMemberId = useMemo(() => {
    const map = new Map<number, GroupMemberStudyTimeResponse>();
    members.forEach((member) => map.set(member.memberId, member));
    return map;
  }, [members]);

  const myMemberId = currentMember?.id;
  const myState = myMemberId != null ? membersByMemberId.get(myMemberId) : undefined;

  const getMyState = useCallback((): GroupMemberStudyTimeResponse | undefined => {
    if (myMemberId == null) return undefined;
    const list = queryClient.getQueryData<GroupMemberStudyTimeResponse[]>(queryKey);
    return list?.find((member) => member.memberId === myMemberId);
  }, [myMemberId, queryClient, queryKey]);

  const getDisplayedSecondsFor = useCallback(
    (memberId: number) => {
      const member = membersByMemberId.get(memberId);
      if (!member) return 0;
      return getDisplayedStudySeconds(
        member,
        Date.now(),
        fetchedAtByMemberIdRef.current.get(memberId),
      );
    },
    [membersByMemberId],
  );

  const getMemberStudyProgress = useCallback(
    (memberId: number) => {
      const member = membersByMemberId.get(memberId);
      if (!member) return undefined;
      return {
        displayedSeconds: getDisplayedSecondsFor(memberId),
        weeklyStudyTimeGoalSeconds: member.weeklyStudyTimeGoalSeconds,
        running: member.running,
      };
    },
    [getDisplayedSecondsFor, membersByMemberId],
  );

  // 1초마다 리렌더를 강제해 러닝 중인 멤버들의 표시 초를 흘려보낸다.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!members.some((member) => member.running)) return;
    const interval = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(interval);
  }, [members]);

  const upsertMember = useCallback(
    (member: GroupMemberStudyTimeResponse, fetchedAt = Date.now()) => {
      fetchedAtByMemberIdRef.current.set(member.memberId, fetchedAt);
      queryClient.setQueryData(
        queryKey,
        (prev: GroupMemberStudyTimeResponse[] | undefined) => {
          if (!prev) return [member];
          const idx = prev.findIndex((m) => m.memberId === member.memberId);
          if (idx === -1) return [...prev, member];
          const next = [...prev];
          next[idx] = member;
          return next;
        },
      );
    },
    [queryClient, queryKey],
  );

  const { mutateAsync: resumeStudyTimeAsync } = useMutation({
    mutationFn: () => groupStudyTimeApi.resume(groupCode!),
  });
  const { mutateAsync: pauseStudyTimeAsync } = useMutation({
    mutationFn: () => groupStudyTimeApi.pause(groupCode!),
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const desiredRunningRef = useRef<boolean | null>(null);
  const inflightRef = useRef(false);

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
            const current = getMyState();
            upsertMember(
              buildOptimisticMember(
                current,
                data.memberId,
                data.nickname,
                getDisplayedSecondsFor(data.memberId),
                latestDesired,
              ),
            );
          } else {
            upsertMember(data);
          }
        } catch {
          await refetch();
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
  }, [getDisplayedSecondsFor, getMyState, pauseStudyTimeAsync, refetch, resumeStudyTimeAsync, upsertMember]);

  const setDesiredRunning = useCallback(
    (running: boolean) => {
      const current = getMyState();
      if (current?.running === running || myMemberId == null) return;

      writeKeepRunningIntent(running);
      desiredRunningRef.current = running;
      upsertMember(
        buildOptimisticMember(
          current,
          myMemberId,
          currentMember?.nickname ?? current?.nickname ?? "",
          getDisplayedSecondsFor(myMemberId),
          running,
        ),
      );

      void flushDesired();
    },
    [currentMember?.nickname, flushDesired, getDisplayedSecondsFor, getMyState, myMemberId, upsertMember],
  );

  const syncResume = useCallback(() => {
    setDesiredRunning(true);
  }, [setDesiredRunning]);

  const syncPause = useCallback(() => {
    setDesiredRunning(false);
  }, [setDesiredRunning]);

  const handleToggle = useCallback(() => {
    const current = getMyState();
    setDesiredRunning(!current?.running);
  }, [getMyState, setDesiredRunning]);

  /** 재생 의도인데 서버/캐시가 멈춤이면 다시 재생 (탭 복귀·refetch 대응) */
  const restoreKeepRunningIfNeeded = useCallback(() => {
    if (!readKeepRunningIntent()) return;

    const phase = pomodoroStatus ? getPomodoroStudyPhase(pomodoroStatus) : "idle";
    if (isPomodoroBlockingPhase(phase)) return;

    const current = getMyState();
    if (!current || current.running) return;

    syncResume();
  }, [getMyState, pomodoroStatus, syncResume]);

  useEffect(() => {
    if (!myState) return;

    if (myState.running) {
      writeKeepRunningIntent(true);
      return;
    }

    restoreKeepRunningIfNeeded();
  }, [myState, restoreKeepRunningIfNeeded]);

  useEffect(() => {
    const handleVisible = () => {
      if (document.visibilityState !== "visible") return;

      // 탭 복귀 시 최신 서버 상태 확인 + 재생 의도 복구
      void refetch();
      restoreKeepRunningIfNeeded();
    };

    document.addEventListener("visibilitychange", handleVisible);
    window.addEventListener("focus", handleVisible);
    return () => {
      document.removeEventListener("visibilitychange", handleVisible);
      window.removeEventListener("focus", handleVisible);
    };
  }, [refetch, restoreKeepRunningIfNeeded]);

  const prevPomodoroPhaseRef = useRef<PomodoroStudyPhase | null>(null);
  const didBindPomodoroPhaseRef = useRef(false);

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

  const applyLiveKitSync = useCallback(
    (data: unknown): boolean => {
      if (!isLiveKitStudyTimeSyncMessage(data)) return false;

      upsertMember(data.member);
      return true;
    },
    [upsertMember],
  );

  return {
    studyTime: myState,
    displayedSeconds: myMemberId != null ? getDisplayedSecondsFor(myMemberId) : 0,
    isRunning: !!myState?.running,
    isLoading,
    isFetching,
    isTogglePending: isSyncing,
    handleToggle,
    syncResume,
    syncPause,
    applyLiveKitSync,
    getMemberStudyProgress,
  };
}
