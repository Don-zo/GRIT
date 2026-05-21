export type StudyGoalParts = {
  hours: number;
  minutes: number;
};

export type StudyGoalApiFormat = "korean" | "totalMinutes" | "colon";

export function detectStudyGoalFormat(
  value: string | null | undefined,
): StudyGoalApiFormat {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "korean";
  if (/^\d+$/.test(trimmed)) return "totalMinutes";
  if (/^\d+:\d{1,2}$/.test(trimmed)) return "colon";
  return "korean";
}

export function normalizeStudyGoalMinutes(minutes: number): number {
  return Math.min(55, Math.max(0, Math.round(minutes / 5) * 5));
}

export function parseStudyGoal(value: string | null | undefined): StudyGoalParts {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return { hours: 0, minutes: 0 };

  const hourMatch = trimmed.match(/(\d+)\s*시간/);
  const minuteMatch = trimmed.match(/(\d+)\s*분/);
  if (hourMatch || minuteMatch) {
    return {
      hours: hourMatch ? Number(hourMatch[1]) : 0,
      minutes: minuteMatch ? Number(minuteMatch[1]) : 0,
    };
  }

  const colonMatch = trimmed.match(/^(\d+):(\d{1,2})$/);
  if (colonMatch) {
    return {
      hours: Number(colonMatch[1]),
      minutes: Number(colonMatch[2]),
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
  format: StudyGoalApiFormat,
): string | null {
  const h = Math.max(0, Math.floor(hours));
  const m = Math.max(0, Math.floor(minutes));

  if (h === 0 && m === 0) return null;

  if (format === "totalMinutes") {
    return String(h * 60 + m);
  }

  if (format === "colon") {
    return `${h}:${String(m).padStart(2, "0")}`;
  }

  return formatStudyGoal(h, m) || null;
}
