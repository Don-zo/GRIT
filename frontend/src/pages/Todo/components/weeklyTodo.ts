export const DND_TODO_MIME = "application/x-grit-todo-id";

export const WEEKDAY_KO = ["월", "화", "수", "목", "금", "토", "일"] as const;

const LIST_PANEL = {
  solid: "overflow-hidden rounded-xl bg-[#2A2F38]",
  layered:
    "relative overflow-hidden rounded-xl bg-[#2A2F38] before:pointer-events-none before:absolute before:inset-0 before:z-0 before:content-['']",
} as const;

export function weeklyListPanelClass(
  isToday: boolean,
  isSaturday: boolean,
  isSunday: boolean,
): string {
  if (isToday) {
    return `${LIST_PANEL.layered} before:bg-[#223D38]/30`;
  }
  if (isSaturday) {
    return `${LIST_PANEL.layered} before:bg-[#163648]/30`;
  }
  if (isSunday) {
    return `${LIST_PANEL.layered} before:bg-[#4a2e34]/40`;
  }
  return LIST_PANEL.solid;
}

export function weeklyDayHeaderClass(
  isToday: boolean,
  isSaturday: boolean,
  isSunday: boolean,
): string {
  const shell = "relative z-[1] shrink-0 overflow-hidden rounded-xl";
  if (isToday) return `${shell} bg-green-semidark/35`;
  if (isSaturday) return `${shell} bg-[#163648]`;
  if (isSunday) return `${shell} bg-[#4a2e34]`;
  return `${shell} bg-[#2F323A]`;
}

export function weeklyAddButtonClass(
  isToday: boolean,
  isSaturday: boolean,
  isSunday: boolean,
): string {
  const shell =
    "shrink-0 flex h-7 w-7 items-center justify-center rounded-lg opacity-0 pointer-events-none shadow-sm transition-[opacity,background-color,color] duration-150 group-hover/day-head:pointer-events-auto group-hover/day-head:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/25";
  if (isToday) {
    return `${shell} bg-[#2A5042] text-[#b5ebd4]/72 hover:bg-[#386b57] hover:text-[#D6FDE5]/95`;
  }
  if (isSaturday) {
    return `${shell} bg-[#254d6c] text-[#b8daf6]/72 hover:bg-[#2f5c80] hover:text-[#e8f4ff]/95`;
  }
  if (isSunday) {
    return `${shell} bg-[#5a3a48] text-[#f2d0d3]/80 hover:bg-[#6a4a52] hover:text-[#fff5f6]/95`;
  }
  return `${shell} bg-[#3f444e] text-white/58 hover:bg-[#4b515c] hover:text-white/88`;
}

export type WeeklyDueDayTone = "default" | "saturday" | "sunday";

export function weeklyDueDayTone(dueDateStr: string): WeeklyDueDayTone {
  const parts = dueDateStr.trim().split("-");
  if (parts.length !== 3) return "default";
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return "default";
  }
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
    return "default";
  }
  const wd = dt.getDay();
  if (wd === 6) return "saturday";
  if (wd === 0) return "sunday";
  return "default";
}

export const weeklyComposeBlockTodayBgClass = "bg-[#3C4F4C]/60";

export function weeklyComposeBlockBgClass(tone: WeeklyDueDayTone): string {
  switch (tone) {
    case "saturday":
      return "bg-[#345562]/55";
    case "sunday":
      return "bg-[#5d4349]/65";
    default:
      return "bg-[#3D434C]/60";
  }
}

export function startOfWeekMonday(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatMonthHeading(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const sameMonth =
    weekStart.getFullYear() === weekEnd.getFullYear() &&
    weekStart.getMonth() === weekEnd.getMonth();
  if (sameMonth) {
    return weekStart.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
    });
  }
  if (weekStart.getFullYear() !== weekEnd.getFullYear()) {
    return `${weekStart.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
    })} – ${weekEnd.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
    })}`;
  }
  const y = weekStart.getFullYear();
  return `${y}년 ${weekStart.toLocaleDateString("ko-KR", { month: "long" })} – ${weekEnd.toLocaleDateString("ko-KR", { month: "long" })}`;
}
