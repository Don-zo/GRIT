import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

  const [categoryRemap, setCategoryRemap] = useState<{
    tempId: string;
    realId: string;
  } | null>(null);

  const [categoryCreateFailedTempId, setCategoryCreateFailedTempId] =
    useState<string | null>(null);

  const onCategoryRemapConsumed = useCallback(() => {
    setCategoryRemap(null);
  }, []);

  const onCategoryCreateFailedConsumed = useCallback(() => {
    setCategoryCreateFailedTempId(null);
  }, []);

  const createCategoryMutation = useMutation({
    mutationFn: ({
      name,
      tempId: _tempId,
    }: {
      name: string;
      tempId: string;
    }) => todoApi.createCategory(userId!, { name }),
    onMutate: async ({ name, tempId }) => {
      if (userId == null) return {};
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.todoCategories.byUser(userId),
      });
      const previous = queryClient.getQueryData<Category[]>(
        QUERY_KEYS.todoCategories.byUser(userId),
      );
      queryClient.setQueryData<Category[]>(
        QUERY_KEYS.todoCategories.byUser(userId),
        (prev) => [...(prev ?? []), { id: tempId, label: name }],
      );
      return { previous };
    },
    onError: (err, { tempId }, context) => {
      if (userId == null) return;
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          QUERY_KEYS.todoCategories.byUser(userId),
          context.previous,
        );
      } else {
        queryClient.setQueryData<Category[]>(
          QUERY_KEYS.todoCategories.byUser(userId),
          (prev) => (prev ?? []).filter((c) => c.id !== tempId),
        );
      }
      setCategoryCreateFailedTempId(tempId);
      if (isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 409) {
          window.alert("같은 이름의 카테고리가 이미 있어요.");
        } else {
          window.alert("카테고리를 추가하지 못했어요.");
        }
      } else {
        window.alert("카테고리를 추가하지 못했어요.");
      }
    },
    onSuccess: (data, { tempId }) => {
      if (userId == null) return;
      queryClient.setQueryData<Category[]>(
        QUERY_KEYS.todoCategories.byUser(userId),
        (prev) =>
          (prev ?? []).map((c) =>
            c.id === tempId ? mapTodoCategoryApiToCategory(data) : c,
          ),
      );
      setCategoryRemap({ tempId, realId: String(data.id) });
    },
  });

  const handleCreateCategory = (name: string): { tempId: string } => {
    if (userId == null) return { tempId: "" };
    const trimmed = name.trim().slice(0, 50);
    if (!trimmed) return { tempId: "" };
    const tempId = `opt-${crypto.randomUUID()}`;
    createCategoryMutation.mutate({ name: trimmed, tempId });
    return { tempId };
  };

  const deleteCategoryMutation = useMutation({
    mutationFn: async ({
      categoryId,
    }: {
      categoryId: number;
      categoryIdStr: string;
    }) => {
      await todoApi.deleteCategory(userId!, categoryId);
    },
    onMutate: async ({ categoryIdStr }) => {
      if (userId == null) return {};
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.todoCategories.byUser(userId),
      });
      const previous = queryClient.getQueryData<Category[]>(
        QUERY_KEYS.todoCategories.byUser(userId),
      );
      queryClient.setQueryData<Category[]>(
        QUERY_KEYS.todoCategories.byUser(userId),
        (prev) => (prev ?? []).filter((c) => c.id !== categoryIdStr),
      );
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (userId == null) return;
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          QUERY_KEYS.todoCategories.byUser(userId),
          context.previous,
        );
      }
      if (isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 403 || status === 404) {
          window.alert("카테고리를 삭제할 수 없어요.");
        } else {
          window.alert("카테고리 삭제에 실패했어요.");
        }
      } else {
        window.alert("카테고리 삭제에 실패했어요.");
      }
    },
  });

  const handleRemoveCategory = useCallback(
    (id: string) => {
      if (userId == null) {
        setGuestCategories((prev) => prev.filter((c) => c.id !== id));
        return;
      }
      if (id.startsWith("opt-")) {
        queryClient.setQueryData<Category[]>(
          QUERY_KEYS.todoCategories.byUser(userId),
          (prev) => (prev ?? []).filter((c) => c.id !== id),
        );
        return;
      }
      const numId = Number(id);
      if (!Number.isFinite(numId) || numId <= 0) return;
      deleteCategoryMutation.mutate({ categoryId: numId, categoryIdStr: id });
    },
    [userId, queryClient, deleteCategoryMutation],
  );

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
            onRemoveCategory={handleRemoveCategory}
            onCreateCategory={
              userId != null ? handleCreateCategory : undefined
            }
            categoryRemap={categoryRemap}
            onCategoryRemapConsumed={onCategoryRemapConsumed}
            categoryCreateFailedTempId={categoryCreateFailedTempId}
            onCategoryCreateFailedConsumed={onCategoryCreateFailedConsumed}
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
