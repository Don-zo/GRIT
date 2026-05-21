export type StudyGoalParts = {
  hours: number;
  minutes: number;
};

export function parseStudyGoal(value: string | null | undefined): StudyGoalParts {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return { hours: 0, minutes: 0 };

  const hourMatch = trimmed.match(/(\d+)\s*시간/);
  const minuteMatch = trimmed.match(/(\d+)\s*분/);

  return {
    hours: hourMatch ? Number(hourMatch[1]) : 0,
    minutes: minuteMatch ? Number(minuteMatch[1]) : 0,
  };
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
