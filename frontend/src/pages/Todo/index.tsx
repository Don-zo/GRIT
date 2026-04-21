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
  addDays,
  formatMonthHeading,
  startOfWeekMonday,
  toDateKey,
} from "@/pages/Todo/components/weeklyTodo";

const TodoPage = () => {
  const [anchor, setAnchor] = useState(() => new Date());
  const [dragOverDateKey, setDragOverDateKey] = useState<string | null>(null);

  const onDragEndClear = () => setDragOverDateKey(null);

  const weekStart = useMemo(() => startOfWeekMonday(anchor), [anchor]);
  const weekStartDate = useMemo(() => toDateKey(weekStart), [weekStart]);
  const b = useTodo(weekStartDate);
  const monthHeading = useMemo(() => formatMonthHeading(weekStart), [weekStart]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );
  const todoFetchStatus = useMemo<"idle" | "loading" | "error">(() => {
    if (b.userId == null) return "idle";
    if (b.isTodosError || b.isCategoriesError) return "error";
    if (b.isTodosLoading || b.isCategoriesLoading) return "loading";
    return "idle";
  }, [b.userId, b.isTodosError, b.isCategoriesError, b.isTodosLoading, b.isCategoriesLoading]);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const categoryLabelForTodo = (todo: TodoItem) => {
    if (todo.categoryName) return todo.categoryName;
    if (!todo.categoryId?.trim()) return "";
    return b.categories.find((c) => c.id === todo.categoryId)?.label ?? "기타";
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
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-darkest pt-[65px]">
        <Header variant="dark" alwaysVisible />
        <div className="flex flex-col w-full min-w-0 select-none">
          <Toast toast={b.toast} onClear={b.clearToast} />
          <div className="flex flex-col gap-2 px-8 pt-4 pb-20">
            {b.userId != null && b.isCategoriesError ? (
              <p className="text-sm shrink-0 text-red-300/95">
                카테고리 목록을 불러오지 못했습니다.
              </p>
            ) : null}
            <div className="flex w-full min-w-0 justify-center">
              <div className="relative my-20 flex w-full min-w-0 max-w-[1440px] flex-col px-2 md:px-4">
                <TodoWeekHeader
                  monthHeading={monthHeading}
                  onPrevWeek={prevWeek}
                  onNextWeek={nextWeek}
                  onGoToday={goToday}
                  fetchStatus={todoFetchStatus}
                />

                <TodoWeekGrid
                  weekDays={weekDays}
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
