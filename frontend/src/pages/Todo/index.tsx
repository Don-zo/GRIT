import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import SmallViewportNotice from "@/components/SmallViewportNotice";
import Toast from "@/components/Toast";
import { useTodo } from "@/hooks/todo/useTodo";
import TodoWeekGrid, {
  TodoWeekHeader,
} from "@/pages/Todo/components/TodoWeekGrid";
import type { TodoItem } from "@/pages/Todo/components/types";
import {
  getTodoListFetchParams,
  getVisibleWeekDays,
} from "@/pages/Todo/components/todoWeekLayout";
import {
  addDays,
  formatMonthHeading,
  startOfWeekMonday,
} from "@/pages/Todo/components/weeklyTodo";
import { useTodoWeekColumnCount } from "@/pages/Todo/hooks/useTodoWeekColumnCount";

const TodoPage = () => {
  const [anchor, setAnchor] = useState(() => new Date());
  const [dragOverDateKey, setDragOverDateKey] = useState<string | null>(null);

  const onDragEndClear = () => setDragOverDateKey(null);

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
  const { columnCount, layoutRef } = useTodoWeekColumnCount();
  const visibleWeekDays = useMemo(
    () => getVisibleWeekDays(weekDays, today, columnCount),
    [weekDays, today, columnCount],
  );
  const listFetchParams = useMemo(
    () => getTodoListFetchParams(weekDays, today, columnCount),
    [weekDays, today, columnCount],
  );
  const b = useTodo(listFetchParams);
  const todoFetchStatus = useMemo<"idle" | "loading" | "error">(() => {
    if (b.userId == null) return "idle";
    if (b.isTodosError || b.isCategoriesError) return "error";
    if (b.isTodosLoading || b.isCategoriesLoading) return "loading";
    return "idle";
  }, [b.userId, b.isTodosError, b.isCategoriesError, b.isTodosLoading, b.isCategoriesLoading]);

  const categoryLabelForTodo = (todo: TodoItem) => {
    if (todo.categoryName && todo.categoryName !== "미분류") {
      return todo.categoryName;
    }
    if (!todo.categoryId?.trim()) return "";
    const label =
      b.categories.find((c) => c.id === todo.categoryId)?.label ?? "";
    return label === "미분류" ? "" : label;
  };

  const prevWeek = () => setAnchor((d) => addDays(d, -7));
  const nextWeek = () => setAnchor((d) => addDays(d, 7));
  const goToday = () => setAnchor(new Date());

  const quickAdd = {
    pendingDueDate: b.pendingAddTodoDueDate,
    onCancel: b.clearPendingAddTodoDueDate,
    onSubmit: (item: {
      title: string;
      dueDate: string;
      categoryId: string;
    }) => {
      b.handleAddTodo(item);
      b.clearPendingAddTodoDueDate();
    },
    setCategories: b.setCategories,
    onRemoveCategory: b.handleRemoveCategory,
    onCreateCategory:
      b.userId != null ? b.handleCreateCategory : undefined,
    onReorderCategories: b.handleReorderCategories,
    reorderDisabled: b.reorderDisabled,
    categoryRemap: b.categoryRemap,
    onCategoryRemapConsumed: b.onCategoryRemapConsumed,
    categoryCreateFailedTempId: b.categoryCreateFailedTempId,
    onCategoryCreateFailedConsumed: b.onCategoryCreateFailedConsumed,
    notify: b.notify,
  };

  return (
    <SmallViewportNotice>
      <div className="relative flex h-screen w-full flex-col overflow-hidden bg-gray-darkest pt-[65px]">
        <Header variant="dark" alwaysVisible />
        <div className="flex min-h-0 flex-1 flex-col w-full min-w-0 select-none overflow-hidden">
          <Toast toast={b.toast} onClear={b.clearToast} />
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-20 py-20 md:py-14">
            {b.userId != null && b.isCategoriesError ? (
              <p className="text-sm shrink-0 text-red-300/95">
                카테고리 목록을 불러오지 못했습니다.
              </p>
            ) : null}
            <div
              ref={layoutRef}
              className="flex min-h-0 flex-1 w-full min-w-0 justify-center overflow-hidden"
            >
              <div className="relative flex min-h-0 w-full min-w-0 max-w-[1440px] flex-1 flex-col px-2 md:px-4">
                <TodoWeekHeader
                  monthHeading={monthHeading}
                  onPrevWeek={prevWeek}
                  onNextWeek={nextWeek}
                  onGoToday={goToday}
                  fetchStatus={todoFetchStatus}
                />

                <TodoWeekGrid
                  weekDays={visibleWeekDays}
                  columnCount={columnCount}
                  today={today}
                  todos={b.todos}
                  categories={b.categories}
                  dragOverDateKey={dragOverDateKey}
                  setDragOverDateKey={setDragOverDateKey}
                  onMoveTodoToDate={b.handleMoveTodoToDate}
                  onAddTodoForDate={b.requestAddTodoForDate}
                  quickAdd={quickAdd}
                  editingTodoId={b.editingTodo?.id ?? null}
                  onEditTodo={(todo) => b.setEditingId(todo.id)}
                  onDeleteTodo={b.handleDeleteTodo}
                  onToggleComplete={b.handleToggleComplete}
                  categoryLabelForTodo={categoryLabelForTodo}
                  onDragEndClear={onDragEndClear}
                  onUpdateTodo={b.handleUpdateTodo}
                  onCancelEdit={() => b.setEditingId(null)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SmallViewportNotice>
  );
};

export default TodoPage;
