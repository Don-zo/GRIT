import { useMemo, useState, type DragEvent } from "react";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import CustomCheckbox from "@/components/Checkbox";
import type { Category, TodoItem } from "@/pages/Todo/types";

type TodoListProps = {
  todos: TodoItem[];
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
  onEditTodo: (todo: TodoItem) => void;
  onToggleComplete: (id: string) => void;
  onMoveTodoToDate: (id: string, dueDate: string) => void;
};

const DND_TODO_MIME = "application/x-grit-todo-id";

type TodoRowProps = {
  todo: TodoItem;
  catLabel: string;
  variant: "comfortable" | "compact";
  onEditTodo: (todo: TodoItem) => void;
  onToggleComplete: (id: string) => void;
  weekDnD?: { onDragEnd: () => void };
};

function TodoRow({
  todo,
  catLabel,
  variant,
  onEditTodo,
  onToggleComplete,
  weekDnD,
}: TodoRowProps) {
  const done = todo.completed;

  const onWeekDragStart = (e: DragEvent<HTMLLIElement>) => {
    if (!weekDnD) return;
    const target = e.target as HTMLElement;
    if (target.closest("button")) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData(DND_TODO_MIME, todo.id);
    e.dataTransfer.setData("text/plain", todo.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const checkbox = (
    <div className="mt-0.5 shrink-0 self-start">
      <CustomCheckbox
        checked={done}
        onChange={() => onToggleComplete(todo.id)}
        ariaLabel={done ? "완료 해제" : "완료"}
        size="sm"
      />
    </div>
  );

  if (variant === "comfortable") {
    return (
      <li
        className={`flex items-start gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2 transition ${
          done ? "opacity-[0.58]" : ""
        }`}
      >
        {checkbox}
        <div className="min-w-0 flex-1">
          <p
            className={`text-bodySm font-medium ${
              done
                ? "text-white/40 line-through decoration-white/35"
                : "text-white/90"
            }`}
          >
            {todo.title}
          </p>
          {catLabel ? (
            <span
              className={`mt-0.5 inline-block rounded-full px-1.5 py-px text-[9px] font-medium ring-1 ring-green-normal/25 ${
                done
                  ? "bg-green-normal/8 text-green-light/50 line-through decoration-green-light/30"
                  : "bg-green-normal/15 text-green-light"
              }`}
            >
              {catLabel}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onEditTodo(todo)}
          className="shrink-0 rounded-md p-1 text-white/35 transition hover:bg-white/10 hover:text-[#82C397]"
          aria-label="수정"
        >
          <Pencil className="h-4 w-4" strokeWidth={2} />
        </button>
      </li>
    );
  }

  return (
    <li
      draggable={Boolean(weekDnD)}
      onDragStart={weekDnD ? onWeekDragStart : undefined}
      onDragEnd={weekDnD ? weekDnD.onDragEnd : undefined}
      className={`group relative rounded-md bg-white/[0.04] px-2 py-1.5 transition hover:bg-white/[0.07] ${
        weekDnD ? "cursor-grab active:cursor-grabbing" : ""
      } ${done ? "opacity-55" : ""}`}
    >
      <div className="flex items-start gap-1.5">
        {checkbox}
        <div className="min-w-0 flex-1">
          <p
            className={`line-clamp-2 text-[11px] font-medium leading-snug ${
              done
                ? "text-white/40 line-through decoration-white/30"
                : "text-white/90"
            }`}
          >
            {todo.title}
          </p>
          {catLabel ? (
            <span
              className={`mt-1 inline-block max-w-full truncate rounded px-1.5 py-px text-[9px] font-medium ${
                done
                  ? "bg-green-normal/8 text-green-light/45 line-through"
                  : "bg-green-normal/12 text-green-light/95"
              }`}
            >
              {catLabel}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onEditTodo(todo)}
          className="shrink-0 rounded p-0.5 text-white/30 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-[#82C397]"
          aria-label="수정"
        >
          <Pencil className="h-3 w-3" strokeWidth={2.5} />
        </button>
      </div>
    </li>
  );
}

const WEEKDAY_KO = ["월", "화", "수", "목", "금", "토", "일"] as const;

const LIST_PANEL = {
  solid: "overflow-hidden rounded-xl bg-[#2A2F38]",
  layered:
    "relative overflow-hidden rounded-xl bg-[#2A2F38] before:pointer-events-none before:absolute before:inset-0 before:z-0 before:content-['']",
} as const;

function weeklyListPanelClass(
  isToday: boolean,
  isSaturday: boolean,
  isSunday: boolean,
): { panel: string; stackList: boolean } {
  if (isToday) {
    return {
      panel: `${LIST_PANEL.layered} before:bg-[#223D38]/30`,
      stackList: true,
    };
  }
  if (isSaturday) {
    return {
      panel: `${LIST_PANEL.layered} before:bg-[#163648]/30`,
      stackList: true,
    };
  }
  if (isSunday) {
    return {
      panel: `${LIST_PANEL.layered} before:bg-[#40262D]/30`,
      stackList: true,
    };
  }
  return { panel: LIST_PANEL.solid, stackList: false };
}

function startOfWeekMonday(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatMonthHeading(weekStart: Date): string {
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

export default function TodoList({
  todos,
  categories,
  isLoading,
  isError,
  onEditTodo,
  onToggleComplete,
  onMoveTodoToDate,
}: TodoListProps) {
  const [anchor, setAnchor] = useState(() => new Date());
  const [dragOverDateKey, setDragOverDateKey] = useState<string | null>(null);

  const clearDnDHighlight = () => setDragOverDateKey(null);

  const weekStart = useMemo(() => startOfWeekMonday(anchor), [anchor]);
  const monthHeading = useMemo(() => formatMonthHeading(weekStart), [weekStart]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const categoryLabelForTodo = (todo: TodoItem) => {
    if (todo.categoryName) return todo.categoryName;
    if (!todo.categoryId?.trim()) return "";
    return categories.find((c) => c.id === todo.categoryId)?.label ?? "기타";
  };

  const prevWeek = () => setAnchor((d) => addDays(d, -7));
  const nextWeek = () => setAnchor((d) => addDays(d, 7));
  const goToday = () => setAnchor(new Date());

  return (
    <div className="relative my-20 ml-2 flex min-h-0 min-w-0 flex-[3] flex-col overflow-hidden pl-6 pr-2 md:pl-8">
      <div className="shrink-0 pb-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-h3 font-semibold text-white">{monthHeading}</h2>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={prevWeek}
              className="rounded-lg p-2 text-[#D6FDE5]/70 transition hover:bg-white/10 hover:text-[#D6FDE5]"
              aria-label="이전 주"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#82C397] transition hover:bg-white/10"
            >
              오늘
            </button>
            <button
              type="button"
              onClick={nextWeek}
              className="rounded-lg p-2 text-[#D6FDE5]/70 transition hover:bg-white/10 hover:text-[#D6FDE5]"
              aria-label="다음 주"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </div>
        <div className="mt-3 border-b border-white/10" />
      </div>

      {isError ? (
        <p className="shrink-0 text-sm text-red-400/90">
          투두 목록을 불러오지 못했습니다.
        </p>
      ) : null}
      {isLoading ? (
        <p className="shrink-0 text-sm text-white/45">투두 불러오는 중…</p>
      ) : null}

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto pt-4">
        {/* 7열 위클리 */}
        <div className="grid min-h-[min(420px,50vh)] grid-cols-7 gap-2">
          {weekDays.map((day, i) => {
            const key = toDateKey(day);
            const dayTodos = todos.filter((t) => t.dueDate === key);
            const isToday = isSameCalendarDay(day, today);
            const isSaturday = i === 5;
            const isSunday = i === 6;

            const { panel: listPanelClass, stackList } = weeklyListPanelClass(
              isToday,
              isSaturday,
              isSunday,
            );

            return (
              <div
                key={key}
                className="flex min-h-0 min-w-0 flex-col gap-1.5"
              >
                <div
                  className={`shrink-0 rounded-xl px-1.5 py-2.5 text-center ${
                    isToday
                      ? "bg-green-semidark/35"
                      : isSaturday
                        ? "bg-[#163648]"
                        : isSunday
                          ? "bg-[#40262D]"
                          : "bg-[#2F323A]"
                  }`}
                >
                  <div
                    className={`text-[11px] font-semibold tracking-wide ${
                      isToday
                        ? "text-green-light"
                        : isSaturday
                          ? "text-[#d8e8fb] font-bold"
                          : isSunday
                            ? "text-[#f0b4b3]"
                            : "text-white/55"
                    }`}
                  >
                    {WEEKDAY_KO[i]}
                  </div>
                  <div
                    className={`mt-0.5 text-sm font-bold tabular-nums ${
                      isToday
                        ? "text-[#EDFFF4]"
                        : isSaturday
                          ? "text-white/78"
                          : isSunday
                            ? "text-[#f5d4d3]"
                            : "text-white"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                </div>

                <div
                  className={`flex min-h-0 min-w-0 flex-1 flex-col ${listPanelClass} ${
                    dragOverDateKey === key
                      ? "ring-2 ring-[#82C397]/55 ring-inset"
                      : ""
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    setDragOverDateKey(key);
                  }}
                  onDragLeave={(e) => {
                    if (
                      !e.currentTarget.contains(e.relatedTarget as Node | null)
                    ) {
                      setDragOverDateKey(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id =
                      e.dataTransfer.getData(DND_TODO_MIME) ||
                      e.dataTransfer.getData("text/plain");
                    if (id) onMoveTodoToDate(id, key);
                    setDragOverDateKey(null);
                  }}
                >
                  <ul
                    className={`min-h-0 flex-1 space-y-1.5 overflow-y-auto p-1.5 [scrollbar-gutter:stable] ${
                      stackList ? "relative z-[1]" : ""
                    }`}
                  >
                    {dayTodos.map((t) => (
                      <TodoRow
                        key={t.id}
                        todo={t}
                        catLabel={categoryLabelForTodo(t)}
                        variant="compact"
                        onEditTodo={onEditTodo}
                        onToggleComplete={onToggleComplete}
                        weekDnD={{ onDragEnd: clearDnDHighlight }}
                      />
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
