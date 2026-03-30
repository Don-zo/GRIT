import { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { todoApi } from "@/apis/services/todo";
import type { UpdateTodoBody } from "@/apis/types/todo";
import type { Category, TodoItem } from "@/pages/Todo/components/types";
import {
  applyTodoUpdateOptimistic,
  buildCreateTodoBody,
  buildOptimisticTodoItem,
  buildUpdateTodoBody,
  mapTodoApiToItem,
  mapTodoCategoryApiToCategory,
} from "./mappers";
import { useTodoData } from "./useTodoData";
import { useTodoToast } from "./useTodoToast";

export function useTodoBoard() {
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

  const { todoToast, clearTodoToast, notifyTodo } = useTodoToast();

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
          notifyTodo("같은 이름의 카테고리가 이미 있어요.", "error");
        } else {
          notifyTodo("카테고리를 추가하지 못했어요.", "error");
        }
      } else {
        notifyTodo("카테고리를 추가하지 못했어요.", "error");
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

  const [editingId, setEditingId] = useState<string | null>(null);

  const createTodoMutation = useMutation({
    mutationFn: (vars: {
      item: {
        title: string;
        dueDate: string;
        categoryId: string;
      };
      tempId: string;
    }) => todoApi.createTodo(userId!, buildCreateTodoBody(vars.item)),
    onMutate: async ({ item, tempId }) => {
      if (userId == null) return {};
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.todos.byUser(userId),
      });
      const previous = queryClient.getQueryData<TodoItem[]>(
        QUERY_KEYS.todos.byUser(userId),
      );
      const cats =
        queryClient.getQueryData<Category[]>(
          QUERY_KEYS.todoCategories.byUser(userId),
        ) ?? [];
      queryClient.setQueryData<TodoItem[]>(
        QUERY_KEYS.todos.byUser(userId),
        (prev) => [
          ...(prev ?? []),
          buildOptimisticTodoItem(item, tempId, cats),
        ],
      );
      return { previous };
    },
    onSuccess: (data, { tempId }) => {
      if (userId == null) return;
      queryClient.setQueryData<TodoItem[]>(
        QUERY_KEYS.todos.byUser(userId),
        (prev) => {
          const list = prev ?? [];
          const mapped = mapTodoApiToItem(data);
          if (!list.some((t) => t.id === tempId)) {
            return [...list, mapped];
          }
          return list.map((t) => (t.id === tempId ? mapped : t));
        },
      );
      notifyTodo("생성됐어요");
    },
    onError: (err, _v, context) => {
      if (userId == null) return;
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          QUERY_KEYS.todos.byUser(userId),
          context.previous,
        );
      }
      if (isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400) {
          notifyTodo("입력값을 확인해 주세요.", "error");
        } else if (status === 403) {
          notifyTodo("권한이 없어요.", "error");
        } else if (status === 404) {
          notifyTodo("사용자 또는 카테고리를 찾을 수 없어요.", "error");
        } else {
          notifyTodo("할 일을 추가하지 못했어요.", "error");
        }
      } else {
        notifyTodo("할 일을 추가하지 못했어요.", "error");
      }
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: ({
      todoId,
      body,
    }: {
      todoId: number;
      todoIdStr: string;
      body: UpdateTodoBody;
    }) => todoApi.updateTodo(todoId, body),
    onMutate: async ({ body, todoIdStr }) => {
      if (userId == null) return {};
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.todos.byUser(userId),
      });
      const previous = queryClient.getQueryData<TodoItem[]>(
        QUERY_KEYS.todos.byUser(userId),
      );
      const cats =
        queryClient.getQueryData<Category[]>(
          QUERY_KEYS.todoCategories.byUser(userId),
        ) ?? [];
      const prevTodo = previous?.find((t) => t.id === todoIdStr);
      if (!prevTodo) return { previous };
      const next = applyTodoUpdateOptimistic(prevTodo, body, cats);
      queryClient.setQueryData<TodoItem[]>(
        QUERY_KEYS.todos.byUser(userId),
        (prev) =>
          (prev ?? []).map((t) => (t.id === todoIdStr ? next : t)),
      );
      setEditingId(null);
      return { previous };
    },
    onSuccess: (data) => {
      if (userId == null) return;
      queryClient.setQueryData<TodoItem[]>(
        QUERY_KEYS.todos.byUser(userId),
        (prev) =>
          (prev ?? []).map((t) =>
            t.id === String(data.id) ? mapTodoApiToItem(data) : t,
          ),
      );
      setEditingId(null);
      notifyTodo("수정됐어요");
    },
    onError: (err, _v, context) => {
      if (userId == null) return;
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          QUERY_KEYS.todos.byUser(userId),
          context.previous,
        );
      }
      if (isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400) {
          notifyTodo("내용은 비울 수 없어요.", "error");
        } else if (status === 403) {
          notifyTodo("권한이 없어요.", "error");
        } else if (status === 404) {
          notifyTodo("할 일 또는 카테고리를 찾을 수 없어요.", "error");
        } else {
          notifyTodo("수정에 실패했어요.", "error");
        }
      } else {
        notifyTodo("수정에 실패했어요.", "error");
      }
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async ({
      todoId,
    }: {
      todoId: number;
      todoIdStr: string;
    }) => {
      await todoApi.deleteTodo(todoId);
    },
    onMutate: async ({ todoIdStr }) => {
      if (userId == null) return {};
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.todos.byUser(userId),
      });
      const previous = queryClient.getQueryData<TodoItem[]>(
        QUERY_KEYS.todos.byUser(userId),
      );
      queryClient.setQueryData<TodoItem[]>(
        QUERY_KEYS.todos.byUser(userId),
        (prev) => (prev ?? []).filter((t) => t.id !== todoIdStr),
      );
      setEditingId((cur) => (cur === todoIdStr ? null : cur));
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (userId == null) return;
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          QUERY_KEYS.todos.byUser(userId),
          context.previous,
        );
      }
      if (isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 403 || status === 404) {
          notifyTodo("할 일을 삭제할 수 없어요.", "error");
        } else {
          notifyTodo("삭제에 실패했어요.", "error");
        }
      } else {
        notifyTodo("삭제에 실패했어요.", "error");
      }
    },
    onSuccess: () => {
      notifyTodo("삭제됐어요");
    },
  });

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
          notifyTodo("카테고리를 삭제할 수 없어요.", "error");
        } else {
          notifyTodo("카테고리 삭제에 실패했어요.", "error");
        }
      } else {
        notifyTodo("카테고리 삭제에 실패했어요.", "error");
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
      notifyTodo("생성됐어요");
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
      notifyTodo("수정됐어요");
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
      notifyTodo("수정됐어요");
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
      notifyTodo("삭제됐어요");
      return;
    }
    const num = Number(id);
    if (!Number.isFinite(num) || num <= 0) {
      patchTodos((prev) => prev.filter((t) => t.id !== id));
      setEditingId(null);
      notifyTodo("삭제됐어요");
      return;
    }
    deleteTodoMutation.mutate({ todoId: num, todoIdStr: id });
  };

  return {
    userId,
    todos,
    categories,
    isTodosLoading,
    isCategoriesLoading,
    isTodosError,
    isCategoriesError,
    todoToast,
    clearTodoToast,
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
  };
}
