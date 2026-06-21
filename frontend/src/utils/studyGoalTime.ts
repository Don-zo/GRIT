export type StudyGoalParts = {
  hours: number;
  minutes: number;
};

const HH_MM_PATTERN = /^(\d{1,2}):(\d{2})$/;

export function normalizeStudyGoalMinutes(minutes: number): number {
  return Math.min(55, Math.max(0, Math.round(minutes / 5) * 5));
}

export function parseStudyGoal(value: string | null | undefined): StudyGoalParts {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return { hours: 0, minutes: 0 };

  const hhMmMatch = trimmed.match(HH_MM_PATTERN);
  if (hhMmMatch) {
    return {
      hours: Number(hhMmMatch[1]),
      minutes: Number(hhMmMatch[2]),
    };
  }

  const hourMatch = trimmed.match(/(\d+)\s*시간/);
  const minuteMatch = trimmed.match(/(\d+)\s*분/);
  if (hourMatch || minuteMatch) {
    return {
      hours: hourMatch ? Number(hourMatch[1]) : 0,
      minutes: minuteMatch ? Number(minuteMatch[1]) : 0,
    };
  }

  if (/^\d+$/.test(trimmed)) {
    const totalMinutes = Number(trimmed);
    if (!Number.isNaN(totalMinutes)) {
      return {
        hours: Math.floor(totalMinutes / 60),
        minutes: totalMinutes % 60,
      };
    }
  }

  return { hours: 0, minutes: 0 };
}

export function formatStudyGoal(hours: number, minutes: number): string {
  const h = Math.max(0, Math.floor(hours));
  const m = Math.max(0, Math.floor(minutes));

  if (h === 0 && m === 0) return "";

  const parts: string[] = [];
  if (h > 0) parts.push(`${h}시간`);
  if (m > 0) parts.push(`${m}분`);
  return parts.join(" ");
}

export function serializeStudyGoal(
  hours: number,
  minutes: number,
): string | null {
  const h = Math.max(0, Math.floor(hours));
  const m = Math.max(0, Math.floor(minutes));

  if (h === 0 && m === 0) return null;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatStudyGoalDisplay(value: string | null | undefined): string {
  const { hours, minutes } = parseStudyGoal(value);
  return formatStudyGoal(hours, minutes) || value?.trim() || "미설정";
}
