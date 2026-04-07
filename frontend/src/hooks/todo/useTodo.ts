import { useCallback, useEffect, useMemo, useState } from "react";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { useToast } from "@/hooks/useToast";
import type { Category } from "@/pages/Todo/components/types";
import { buildUpdateTodoBody } from "./mappers";
import { useTodoData } from "./useTodoData";
import { useTodoMutations } from "./useTodoMutations";

export function useTodo() {
  const {
    userId,
    queryClient,
    todos,
    categories,
    isTodosLoading,
    isCategoriesLoading,
    isTodosError,
    isCategoriesError,
    setCategories,
    patchTodos,
    setGuestCategories,
  } = useTodoData();

  const { toast, clearToast, notify } = useToast();

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

  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    createCategoryMutation,
    createTodoMutation,
    updateTodoMutation,
    toggleTodoDoneMutation,
    moveTodoDueDateMutation,
    deleteTodoMutation,
    deleteCategoryMutation,
  } = useTodoMutations({
    userId,
    queryClient,
    notify,
    setCategoryRemap,
    setCategoryCreateFailedTempId,
    setEditingId,
  });

  const handleCreateCategory = (name: string): { tempId: string } => {
    if (userId == null) return { tempId: "" };
    const trimmed = name.trim().slice(0, 50);
    if (!trimmed) return { tempId: "" };
    const tempId = `opt-${crypto.randomUUID()}`;
    createCategoryMutation.mutate({ name: trimmed, tempId });
    return { tempId };
  };

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
    [userId, queryClient, deleteCategoryMutation, setGuestCategories],
  );

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
    if (userId == null) {
      patchTodos((prev) => [
        ...prev,
        { id: crypto.randomUUID(), ...item, completed: false },
      ]);
      notify("생성됐어요");
      return;
    }
    const tempId = `opt-todo-${crypto.randomUUID()}`;
    createTodoMutation.mutate({ item, tempId });
  };

  const handleUpdateTodo = (
    id: string,
    item: { title: string; dueDate: string; categoryId: string },
  ) => {
    if (userId == null) {
      patchTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...item } : t)),
      );
      setEditingId(null);
      notify("수정됐어요");
      return;
    }
    const prevTodo = todos.find((t) => t.id === id);
    if (!prevTodo) return;
    const todoIdNum = Number(id);
    if (!Number.isFinite(todoIdNum) || todoIdNum <= 0) {
      patchTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...item } : t)),
      );
      setEditingId(null);
      notify("수정됐어요");
      return;
    }
    updateTodoMutation.mutate({
      todoId: todoIdNum,
      todoIdStr: id,
      body: buildUpdateTodoBody(prevTodo, item),
    });
  };

  const handleDeleteTodo = (id: string) => {
    if (userId == null) {
      patchTodos((prev) => prev.filter((t) => t.id !== id));
      setEditingId(null);
      notify("삭제됐어요");
      return;
    }
    const num = Number(id);
    if (!Number.isFinite(num) || num <= 0) {
      patchTodos((prev) => prev.filter((t) => t.id !== id));
      setEditingId(null);
      notify("삭제됐어요");
      return;
    }
    deleteTodoMutation.mutate({ todoId: num, todoIdStr: id });
  };

  const handleToggleComplete = (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const nextDone = !todo.completed;

    if (userId == null) {
      patchTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: nextDone } : t)),
      );
      return;
    }

    const todoIdNum = Number(id);
    if (!Number.isFinite(todoIdNum) || todoIdNum <= 0) {
      patchTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: nextDone } : t)),
      );
      return;
    }

    toggleTodoDoneMutation.mutate({
      todoId: todoIdNum,
      todoIdStr: id,
      isDone: nextDone,
    });
  };

  const handleMoveTodoToDate = (id: string, dueDate: string) => {
    const trimmed = dueDate.trim();
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    if (todo.dueDate.trim() === trimmed) return;

    if (userId == null) {
      patchTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, dueDate: trimmed } : t)),
      );
      notify("이동됐어요");
      return;
    }

    const todoIdNum = Number(id);
    if (!Number.isFinite(todoIdNum) || todoIdNum <= 0) {
      patchTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, dueDate: trimmed } : t)),
      );
      notify("이동됐어요");
      return;
    }

    moveTodoDueDateMutation.mutate({
      todoId: todoIdNum,
      todoIdStr: id,
      dueDate: trimmed,
    });
  };

  return {
    userId,
    todos,
    categories,
    isTodosLoading,
    isCategoriesLoading,
    isTodosError,
    isCategoriesError,
    toast,
    clearToast,
    setCategories,
    patchTodos,
    setEditingId,
    editingTodo,
    categoryRemap,
    onCategoryRemapConsumed,
    categoryCreateFailedTempId,
    onCategoryCreateFailedConsumed,
    handleCreateCategory,
    handleRemoveCategory,
    handleAddTodo,
    handleUpdateTodo,
    handleDeleteTodo,
    handleToggleComplete,
    handleMoveTodoToDate,
  };
}
