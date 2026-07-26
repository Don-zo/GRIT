import type { MemberStudyTimeResponse } from "@/apis/domains/studyTime/type";

export function formatStudySecondsAsClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function getDisplayedStudySeconds(
  studyTime: MemberStudyTimeResponse | undefined,
  clientNowMs: number = Date.now(),
  fetchedAtMs?: number,
): number {
  if (!studyTime) return 0;

  const base = Math.max(0, studyTime.currentWeekStudyTimeSeconds);
  if (!studyTime.running || !studyTime.lastStartedAt) return base;

  const serverNowMs = Date.parse(studyTime.serverNow);
  const lastStartedMs = Date.parse(studyTime.lastStartedAt);
  if (Number.isNaN(serverNowMs) || Number.isNaN(lastStartedMs)) return base;

  const anchorMs = fetchedAtMs ?? clientNowMs;
  const serverElapsedAtFetchMs = Math.max(0, serverNowMs - lastStartedMs);
  const clientElapsedSinceFetchMs = Math.max(0, clientNowMs - anchorMs);

  return (
    base + Math.floor((serverElapsedAtFetchMs + clientElapsedSinceFetchMs) / 1000)
  );
}

export function getStudyTimeProgressPercent(
  currentSeconds: number,
  goalSeconds: number | null | undefined,
): number {
  if (goalSeconds == null || goalSeconds <= 0) return 0;
  return Math.max(0, Math.min(100, (currentSeconds / goalSeconds) * 100));
}
