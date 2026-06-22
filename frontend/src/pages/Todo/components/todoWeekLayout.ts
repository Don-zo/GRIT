import { addDays, toDateKey } from "./weeklyTodo";

export const TODO_WEEK_LAYOUT_BREAKPOINTS = {
  fiveColumnsMaxWidth: 1200,
  threeColumnsMaxWidth: 900,
} as const;

export type TodoWeekColumnCount = 7 | 5 | 3;

export function columnCountForContainerWidth(width: number): TodoWeekColumnCount {
  if (width < TODO_WEEK_LAYOUT_BREAKPOINTS.threeColumnsMaxWidth) return 3;
  if (width < TODO_WEEK_LAYOUT_BREAKPOINTS.fiveColumnsMaxWidth) return 5;
  return 7;
}

export function getVisibleWeekDays(
  weekDays: Date[],
  today: Date,
  columnCount: TodoWeekColumnCount,
): Date[] {
  if (columnCount === 7 || weekDays.length === 0) return weekDays;

  const weekStart = weekDays[0]!;
  const weekEnd = weekDays[weekDays.length - 1]!;
  const startMs = weekStart.getTime();
  const endMs = weekEnd.getTime();
  const todayMs = today.getTime();

  const start =
    todayMs >= startMs && todayMs <= endMs ? today : weekStart;

  return Array.from({ length: columnCount }, (_, i) => addDays(start, i));
}

export type TodoListFetchParams = {
  startDate: string;
  dayCount: number;
};

export function getTodoListFetchParams(
  weekDays: Date[],
  today: Date,
  columnCount: TodoWeekColumnCount,
): TodoListFetchParams {
  const visible = getVisibleWeekDays(weekDays, today, columnCount);
  return {
    startDate: toDateKey(visible[0]!),
    dayCount: visible.length,
  };
}

export function gridColsClassForCount(columnCount: TodoWeekColumnCount): string {
  switch (columnCount) {
    case 3:
      return "grid-cols-3";
    case 5:
      return "grid-cols-5";
    default:
      return "grid-cols-7";
  }
}
