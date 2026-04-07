import { Header } from "@/components/Header";
import EditCard from "@/pages/Todo/components/Edit/EditCard";
import TodoList from "@/pages/Todo/components/TodoList";
import TodoToast from "@/pages/Todo/components/TodoToast";
import { useTodoBoard } from "@/pages/Todo/components/TodoBoard/useTodoBoard";

const TodoPage = () => {
  const b = useTodoBoard();

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-gray-darkest pt-[65px]">
      <Header variant="dark" alwaysVisible />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TodoToast toast={b.todoToast} onClear={b.clearTodoToast} />
        <div className="flex min-h-0 flex-1 flex-col gap-2 px-8 pb-8 pt-4">
          {b.userId != null && b.isCategoriesError ? (
            <p className="shrink-0 text-sm text-red-400/90">
              카테고리 목록을 불러오지 못했습니다.
            </p>
          ) : null}
          <div className="flex min-h-0 min-w-0 flex-1 flex-row gap-3">
            <TodoList
              todos={b.todos}
              categories={b.categories}
              isLoading={
                Boolean(b.userId) &&
                (b.isTodosLoading || b.isCategoriesLoading)
              }
              isError={b.isTodosError}
              onEditTodo={(todo) => b.setEditingId(todo.id)}
              onDeleteTodo={b.handleDeleteTodo}
              onToggleComplete={(id) =>
                b.patchTodos((prev) =>
                  prev.map((t) =>
                    t.id === id ? { ...t, completed: !t.completed } : t,
                  ),
                )
              }
              onMoveTodoToDate={(id, dueDate) =>
                b.patchTodos((prev) =>
                  prev.map((t) => (t.id === id ? { ...t, dueDate } : t)),
                )
              }
            />

            <EditCard
              categories={b.categories}
              setCategories={b.setCategories}
              onRemoveCategory={b.handleRemoveCategory}
              onCreateCategory={
                b.userId != null ? b.handleCreateCategory : undefined
              }
              categoryRemap={b.categoryRemap}
              onCategoryRemapConsumed={b.onCategoryRemapConsumed}
              categoryCreateFailedTempId={b.categoryCreateFailedTempId}
              onCategoryCreateFailedConsumed={b.onCategoryCreateFailedConsumed}
              editingTodo={b.editingTodo}
              onCancelEdit={() => b.setEditingId(null)}
              onAddTodo={b.handleAddTodo}
              onUpdateTodo={b.handleUpdateTodo}
              onDeleteTodo={b.handleDeleteTodo}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoPage;
