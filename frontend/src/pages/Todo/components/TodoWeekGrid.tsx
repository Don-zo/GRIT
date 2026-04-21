import { ChevronLeft, ChevronRight, LoaderCircle, Plus, XCircle } from "lucide-react";
import TodoComposeBlock from "./TodoComposeBlock";
import TodoRow from "./TodoRow";
import type { Category, TodoItem, TodoQuickAddConfig } from "./types";
import {
  DND_TODO_MIME,
  WEEKDAY_KO,
  isSameCalendarDay,
  toDateKey,
  weeklyAddButtonClass,
  weeklyDayHeaderClass,
  weeklyListPanelClass,
} from "./weeklyTodo";

type TodoWeekHeaderProps = {
  monthHeading: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onGoToday: () => void;
  fetchStatus?: "idle" | "loading" | "error";
};

export function TodoWeekHeader({
  monthHeading,
  onPrevWeek,
  onNextWeek,
  onGoToday,
  fetchStatus = "idle",
}: TodoWeekHeaderProps) {
  return (
    <div className="sticky top-[65px] z-30 shrink-0 border-b border-white/10 bg-gray-darkest/95 py-2 pb-3 backdrop-blur-md supports-[backdrop-filter]:bg-gray-darkest/90">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-white text-h3">{monthHeading}</h2>
          {fetchStatus === "loading" ? (
            <LoaderCircle
              className="h-5 w-5 animate-spin text-white/75"
              aria-label="투두 로딩 중"
            />
          ) : null}
          {fetchStatus === "error" ? (
            <XCircle className="h-5 w-5 text-red-400" aria-label="투두 로딩 실패" />
          ) : null}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onPrevWeek}
            className="rounded-lg p-2 text-[#D6FDE5]/70 transition hover:bg-white/10 hover:text-[#D6FDE5]"
            aria-label="이전 주"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={onGoToday}
            className="rounded-lg px-3 py-1.5 text-bodyMd font-semibold text-[#82C397] transition hover:bg-white/10 hover:text-[#D6FDE5]"
          >
            오늘
          </button>
          <button
            type="button"
            onClick={onNextWeek}
            className="rounded-lg p-2 text-[#D6FDE5]/70 transition hover:bg-white/10 hover:text-[#D6FDE5]"
            aria-label="다음 주"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

type TodoWeekGridProps = {
  weekDays: Date[];
  today: Date;
  todos: TodoItem[];
  categories: Category[];
  dragOverDateKey: string | null;
  setDragOverDateKey: (key: string | null) => void;
  onMoveTodoToDate: (id: string, dueDate: string) => void;
  onAddTodoForDate?: (dueDate: string) => void;
  quickAdd: TodoQuickAddConfig;
  editingTodoId: string | null;
  onEditTodo: (todo: TodoItem) => void;
  onDeleteTodo: (id: string) => void;
  onToggleComplete: (id: string) => void;
  categoryLabelForTodo: (todo: TodoItem) => string;
  onDragEndClear: () => void;
  onUpdateTodo: (
    id: string,
    item: { title: string; dueDate: string; categoryId: string },
  ) => void;
  onCancelEdit: () => void;
};

function compareTodoDisplayOrder(a: TodoItem, b: TodoItem): number {
  if (a.completed !== b.completed) {
    return a.completed ? 1 : -1;
  }

  const aCategoryOrderNull = a.categorySortOrder == null ? 1 : 0;
  const bCategoryOrderNull = b.categorySortOrder == null ? 1 : 0;
  if (aCategoryOrderNull !== bCategoryOrderNull) {
    return aCategoryOrderNull - bCategoryOrderNull;
  }

  const aCategoryOrder = a.categorySortOrder ?? 0;
  const bCategoryOrder = b.categorySortOrder ?? 0;
  if (aCategoryOrder !== bCategoryOrder) {
    return aCategoryOrder - bCategoryOrder;
  }

  const byTitle = a.title.localeCompare(b.title, "ko");
  if (byTitle !== 0) {
    return byTitle;
  }

  const aId = Number(a.id);
  const bId = Number(b.id);
  if (Number.isFinite(aId) && Number.isFinite(bId)) {
    return aId - bId;
  }
  return a.id.localeCompare(b.id);
}

export default function TodoWeekGrid({
  weekDays,
  today,
  todos,
  categories,
  dragOverDateKey,
  setDragOverDateKey,
  onMoveTodoToDate,
  onAddTodoForDate,
  quickAdd,
  editingTodoId,
  onEditTodo,
  onDeleteTodo,
  onToggleComplete,
  categoryLabelForTodo,
  onDragEndClear,
  onUpdateTodo,
  onCancelEdit,
}: TodoWeekGridProps) {
  return (
    <div className="w-full min-w-0 pt-4 pb-10">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, i) => {
          const key = toDateKey(day);
          const composePicker = {
            categories,
            setCategories: quickAdd.setCategories,
            onCreateCategory: quickAdd.onCreateCategory,
            onRemoveCategory: quickAdd.onRemoveCategory,
            onReorderCategories: quickAdd.onReorderCategories,
            reorderDisabled: quickAdd.reorderDisabled,
            categoryRemap: quickAdd.categoryRemap,
            onCategoryRemapConsumed: quickAdd.onCategoryRemapConsumed,
            categoryCreateFailedTempId: quickAdd.categoryCreateFailedTempId,
            onCategoryCreateFailedConsumed:
              quickAdd.onCategoryCreateFailedConsumed,
            notify: quickAdd.notify,
          } as const;
          const dayTodos = todos
            .filter((t) => t.dueDate === key)
            .sort(compareTodoDisplayOrder);
          const isToday = isSameCalendarDay(day, today);
          const isSaturday = i === 5;
          const isSunday = i === 6;

          const listPanelClass = weeklyListPanelClass(
            isToday,
            isSaturday,
            isSunday,
          );
          const dayHeaderClass = weeklyDayHeaderClass(
            isToday,
            isSaturday,
            isSunday,
          );
          const addBtnClass = weeklyAddButtonClass(
            isToday,
            isSaturday,
            isSunday,
          );

          return (
            <div
              key={key}
              className="relative flex h-full min-h-[min(560px,62vh)] w-full min-w-0 flex-col gap-2"
            >
              <div className={`group/day-head ${dayHeaderClass}`}>
                <div className="flex items-center justify-between gap-2 px-4 py-3.5">
                  <div
                    className="flex min-w-0 flex-1 items-baseline gap-2 text-left"
                    aria-label={`${WEEKDAY_KO[i]}요일 ${day.getDate()}일`}
                  >
                    <span
                      className={`shrink-0 text-h3 font-bold tabular-nums leading-none ${
                        isToday
                          ? "text-[#EDFFF4]"
                          : isSaturday
                            ? "text-[#e3f0ff]"
                            : isSunday
                              ? "text-[#fff0ee]"
                              : "text-white"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    <span
                      className={`min-w-0 text-[11px] font-semibold tracking-wide ${
                        isToday
                          ? "text-green-light"
                          : isSaturday
                            ? "font-bold text-[#9ec8f0]"
                            : isSunday
                              ? "font-bold text-[#fab4b1]"
                              : "text-white/55"
                      }`}
                    >
                      {WEEKDAY_KO[i]}
                    </span>
                  </div>
                  {onAddTodoForDate ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddTodoForDate(key);
                      }}
                      className={addBtnClass}
                      aria-label={`${key}에 투두 추가`}
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </button>
                  ) : null}
                </div>
              </div>
              <div
                className={`relative z-[1] flex min-h-0 flex-1 flex-col ${listPanelClass} ${
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
                <ul className="relative z-[1] flex flex-1 flex-col gap-3 list-none px-2 pt-2 pb-6">
                {quickAdd.pendingDueDate === key ? (
                  <li className="shrink-0">
                    <TodoComposeBlock
                      variant="create"
                      dueDate={key}
                      isDueDateToday={isToday}
                      onCancel={quickAdd.onCancel}
                      onSubmit={quickAdd.onSubmit}
                      {...composePicker}
                    />
                  </li>
                ) : null}
                {dayTodos.map((t) =>
                  editingTodoId === t.id ? (
                    <li key={t.id} className="shrink-0">
                      <TodoComposeBlock
                        variant="edit"
                        todo={t}
                        isDueDateToday={isToday}
                        onCancel={onCancelEdit}
                        onSubmit={(item) => onUpdateTodo(t.id, item)}
                        onDelete={() => onDeleteTodo(t.id)}
                        {...composePicker}
                      />
                    </li>
                  ) : (
                    <TodoRow
                      key={t.id}
                      todo={t}
                      catLabel={categoryLabelForTodo(t)}
                      onEditTodo={onEditTodo}
                      onDeleteTodo={onDeleteTodo}
                      onToggleComplete={onToggleComplete}
                      weekDnD={{ onDragEnd: onDragEndClear }}
                      isEditing={false}
                    />
                  ),
                )}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
