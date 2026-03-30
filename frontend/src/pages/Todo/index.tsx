import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { getStoredMember } from "@/apis/services/auth";
import { todoApi } from "@/apis/services/todo";
import type { TodoApiItem, TodoCategoryApiItem } from "@/apis/types/todo";
import EditCard from "@/pages/Todo/Edit/EditCard";
import TodoList from "@/pages/Todo/TodoList/TodoList";
import {
  DEFAULT_CATEGORIES,
  type Category,
  type TodoItem,
} from "@/pages/Todo/types";

function mapTodoCategoryApiToCategory(row: TodoCategoryApiItem): Category {
  return { id: String(row.id), label: row.name };
}

function mapTodoApiToItem(row: TodoApiItem): TodoItem {
  return {
    id: String(row.id),
    title: row.content,
    completed: row.isDone,
    dueDate: row.dueDate,
    categoryId: row.categoryId != null ? String(row.categoryId) : "",
    categoryName: row.categoryName,
  };
}

const TodoPage = () => {
  const queryClient = useQueryClient();
  const userId = getStoredMember()?.id ?? null;

  const {
    data: todos = [],
    isLoading: isTodosLoading,
    isError: isTodosError,
  } = useQuery({
    queryKey:
      userId != null
        ? QUERY_KEYS.todos.byUser(userId)
        : (["todos", "guest"] as const),
    queryFn: async () => {
      const rows = await todoApi.getListByUserId(userId!);
      return rows.map(mapTodoApiToItem);
    },
    enabled: userId != null,
  });

  const {
    data: serverCategories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useQuery({
    queryKey:
      userId != null
        ? QUERY_KEYS.todoCategories.byUser(userId)
        : (["todoCategories", "guest"] as const),
    queryFn: async () => {
      const rows = await todoApi.getCategoriesByUserId(userId!);
      return rows.map(mapTodoCategoryApiToCategory);
    },
    enabled: userId != null,
  });

  const [guestCategories, setGuestCategories] = useState<Category[]>(
    DEFAULT_CATEGORIES,
  );

  const categories = userId != null ? serverCategories : guestCategories;

  const setCategories: Dispatch<SetStateAction<Category[]>> = (action) => {
    if (userId == null) {
      setGuestCategories(action);
      return;
    }
    queryClient.setQueryData<Category[]>(
      QUERY_KEYS.todoCategories.byUser(userId),
      (prev) => {
        const p = prev ?? [];
        return typeof action === "function" ? action(p) : action;
      },
    );
  };

  const setTodosCache = (updater: (prev: TodoItem[]) => TodoItem[]) => {
    if (userId == null) return;
    queryClient.setQueryData<TodoItem[]>(
      QUERY_KEYS.todos.byUser(userId),
      (prev) => updater(prev ?? []),
    );
  };

  const [editingId, setEditingId] = useState<string | null>(null);

  const editingTodo = useMemo(
    () =>
      editingId ? (todos.find((t) => t.id === editingId) ?? null) : null,
    [editingId, todos],
  );

  useEffect(() => {
    if (editingId && !todos.some((t) => t.id === editingId)) {
      setEditingId(null);
    }
  }, [editingId, todos]);

  const handleAddTodo = (item: {
    title: string;
    dueDate: string;
    categoryId: string;
  }) => {
    setTodosCache((prev) => [
      ...prev,
      { id: crypto.randomUUID(), ...item, completed: false },
    ]);
  };

  const handleUpdateTodo = (
    id: string,
    item: { title: string; dueDate: string; categoryId: string },
  ) => {
    setTodosCache((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...item } : t)),
    );
    setEditingId(null);
  };

  const handleDeleteTodo = (id: string) => {
    setTodosCache((prev) => prev.filter((t) => t.id !== id));
    setEditingId(null);
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-darkest pt-[65px]">
      <Header variant="dark" alwaysVisible />
      <div className="flex min-h-0 flex-1 flex-col gap-2 px-8 pb-8 pt-4">
        {userId != null && isCategoriesError ? (
          <p className="shrink-0 text-sm text-red-400/90">
            카테고리 목록을 불러오지 못했습니다.
          </p>
        ) : null}
        <div className="flex min-h-0 min-w-0 flex-1 flex-row gap-3">
          <TodoList
            todos={todos}
            categories={categories}
            isLoading={
              Boolean(userId) && (isTodosLoading || isCategoriesLoading)
            }
            isError={isTodosError}
            onEditTodo={(todo) => setEditingId(todo.id)}
            onToggleComplete={(id) =>
              setTodosCache((prev) =>
                prev.map((t) =>
                  t.id === id ? { ...t, completed: !t.completed } : t,
                ),
              )
            }
            onMoveTodoToDate={(id, dueDate) =>
              setTodosCache((prev) =>
                prev.map((t) => (t.id === id ? { ...t, dueDate } : t)),
              )
            }
          />

          <EditCard
            categories={categories}
            setCategories={setCategories}
            editingTodo={editingTodo}
            onAddTodo={handleAddTodo}
            onUpdateTodo={handleUpdateTodo}
            onDeleteTodo={handleDeleteTodo}
          />
        </div>
      </div>
    </div>
  );
};

export default TodoPage;
