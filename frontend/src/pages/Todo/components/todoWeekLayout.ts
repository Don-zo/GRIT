import { addDays, toDateKey } from "./weeklyTodo";

/**
 * 투두 주간 그리드 7일 → 5일 → 3일 전환 기준 (콘텐츠 영역 너비, px).
 * 이 객체 값만 수정하면 됩니다.
 */
export const TODO_WEEK_LAYOUT_BREAKPOINTS = {
  /** 이 너비 미만이면 5열 */
  fiveColumnsMaxWidth: 1200,
  /** 이 너비 미만이면 3열 */
  threeColumnsMaxWidth: 900,
} as const;

export type TodoWeekColumnCount = 7 | 5 | 3;

export function columnCountForContainerWidth(width: number): TodoWeekColumnCount {
  if (width < TODO_WEEK_LAYOUT_BREAKPOINTS.threeColumnsMaxWidth) return 3;
  if (width < TODO_WEEK_LAYOUT_BREAKPOINTS.fiveColumnsMaxWidth) return 5;
  return 7;
}

/** 3·5열일 때 오늘을 첫 열로, columnCount일 만큼 표시 (다음 주로 넘어갈 수 있음) */
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

/** GET /api/members/me/todos 쿼리 — 화면에 보이는 열과 동일한 범위 */
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
