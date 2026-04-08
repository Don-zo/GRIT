import { useRef, type Dispatch, type SetStateAction } from "react";
import { isAxiosError } from "axios";
import { useMutation, type QueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { todoApi } from "@/apis/services/todo";
import type { UpdateTodoBody } from "@/apis/types/todo";
import type { Category, TodoItem } from "@/pages/Todo/components/types";
import {
  applyTodoUpdateOptimistic,
  buildCreateTodoBody,
  buildOptimisticTodoItem,
  mapTodoApiToItem,
  mapTodoCategoryApiToCategory,
} from "./mappers";

type Notify = (text: string, variant?: "success" | "error") => void;

export function useTodoMutations(options: {
  userId: number | null;
  queryClient: QueryClient;
  notify: Notify;
  setCategoryRemap: Dispatch<
    SetStateAction<{ tempId: string; realId: string } | null>
  >;
  setCategoryCreateFailedTempId: Dispatch<SetStateAction<string | null>>;
  setEditingId: Dispatch<SetStateAction<string | null>>;
}) {
  const {
    userId,
    queryClient,
    notify,
    setCategoryRemap,
    setCategoryCreateFailedTempId,
    setEditingId,
  } = options;

  const reorderRequestIdRef = useRef(0);

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
          notify("같은 이름의 카테고리가 이미 있어요.", "error");
        } else {
          notify("카테고리를 추가하지 못했어요.", "error");
        }
      } else {
        notify("카테고리를 추가하지 못했어요.", "error");
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
      notify("생성됐어요");
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
          notify("입력값을 확인해 주세요.", "error");
        } else if (status === 403) {
          notify("권한이 없어요.", "error");
        } else if (status === 404) {
          notify("사용자 또는 카테고리를 찾을 수 없어요.", "error");
        } else {
          notify("할 일을 추가하지 못했어요.", "error");
        }
      } else {
        notify("할 일을 추가하지 못했어요.", "error");
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
      notify("수정됐어요");
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
          notify("내용은 비울 수 없어요.", "error");
        } else if (status === 403) {
          notify("권한이 없어요.", "error");
        } else if (status === 404) {
          notify("할 일 또는 카테고리를 찾을 수 없어요.", "error");
        } else {
          notify("수정에 실패했어요.", "error");
        }
      } else {
        notify("수정에 실패했어요.", "error");
      }
    },
  });

  const toggleTodoDoneMutation = useMutation({
    mutationFn: ({
      todoId,
      isDone,
    }: {
      todoId: number;
      todoIdStr: string;
      isDone: boolean;
    }) => todoApi.patchTodoDone(todoId, { isDone }),
    onMutate: async ({ todoIdStr, isDone }) => {
      if (userId == null) return {};
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.todos.byUser(userId),
      });
      const previous = queryClient.getQueryData<TodoItem[]>(
        QUERY_KEYS.todos.byUser(userId),
      );
      queryClient.setQueryData<TodoItem[]>(
        QUERY_KEYS.todos.byUser(userId),
        (prev) =>
          (prev ?? []).map((t) =>
            t.id === todoIdStr ? { ...t, completed: isDone } : t,
          ),
      );
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
          notify("완료 상태를 바꿀 수 없어요.", "error");
        } else if (status === 403) {
          notify("권한이 없어요.", "error");
        } else if (status === 404) {
          notify("할 일을 찾을 수 없어요.", "error");
        } else {
          notify("완료 처리에 실패했어요.", "error");
        }
      } else {
        notify("완료 처리에 실패했어요.", "error");
      }
    },
  });

  const moveTodoDueDateMutation = useMutation({
    mutationFn: ({
      todoId,
      dueDate,
    }: {
      todoId: number;
      todoIdStr: string;
      dueDate: string;
    }) => todoApi.patchTodoDueDate(todoId, { dueDate }),
    onMutate: async ({ todoIdStr, dueDate }) => {
      if (userId == null) return {};
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.todos.byUser(userId),
      });
      const previous = queryClient.getQueryData<TodoItem[]>(
        QUERY_KEYS.todos.byUser(userId),
      );
      queryClient.setQueryData<TodoItem[]>(
        QUERY_KEYS.todos.byUser(userId),
        (prev) =>
          (prev ?? []).map((t) =>
            t.id === todoIdStr ? { ...t, dueDate } : t,
          ),
      );
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
      notify("이동됐어요");
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
          notify("마감일을 바꿀 수 없어요.", "error");
        } else if (status === 403) {
          notify("권한이 없어요.", "error");
        } else if (status === 404) {
          notify("할 일을 찾을 수 없어요.", "error");
        } else {
          notify("이동에 실패했어요.", "error");
        }
      } else {
        notify("이동에 실패했어요.", "error");
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
          notify("할 일을 삭제할 수 없어요.", "error");
        } else {
          notify("삭제에 실패했어요.", "error");
        }
      } else {
        notify("삭제에 실패했어요.", "error");
      }
    },
    onSuccess: () => {
      notify("삭제됐어요");
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
          notify("카테고리를 삭제할 수 없어요.", "error");
        } else {
          notify("카테고리 삭제에 실패했어요.", "error");
        }
      } else {
        notify("카테고리 삭제에 실패했어요.", "error");
      }
    },
    onSuccess: async () => {
      if (userId == null) return;
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.todoCategories.byUser(userId),
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.todos.byUser(userId),
      });
    },
  });

  const reorderCategoriesMutation = useMutation({
    mutationFn: async ({ categoryIds }: { categoryIds: number[] }) => {
      const requestId = ++reorderRequestIdRef.current;
      const data = await todoApi.reorderCategories(userId!, { categoryIds });
      return { data, requestId };
    },
    onMutate: async ({ categoryIds }) => {
      if (userId == null) return {};
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.todoCategories.byUser(userId),
      });
      const previous = queryClient.getQueryData<Category[]>(
        QUERY_KEYS.todoCategories.byUser(userId),
      );
      const map = new Map((previous ?? []).map((c) => [c.id, c]));
      const next = categoryIds
        .map((id) => map.get(String(id)))
        .filter((c): c is Category => c != null);
      queryClient.setQueryData<Category[]>(
        QUERY_KEYS.todoCategories.byUser(userId),
        next,
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
        if (status === 400) {
          notify("카테고리 순서를 바꿀 수 없어요. 목록을 새로고침해 보세요.", "error");
        } else if (status === 403) {
          notify("권한이 없어요.", "error");
        } else if (status === 404) {
          notify("사용자를 찾을 수 없어요.", "error");
        } else {
          notify("카테고리 순서 변경에 실패했어요.", "error");
        }
      } else {
        notify("카테고리 순서 변경에 실패했어요.", "error");
      }
    },
    onSuccess: (result) => {
      if (userId == null || result == null) return;
      if (result.requestId !== reorderRequestIdRef.current) return;
      const sorted = [...result.data].sort((a, b) => {
        const ao = a.sortOrder ?? 0;
        const bo = b.sortOrder ?? 0;
        return ao - bo;
      });
      queryClient.setQueryData<Category[]>(
        QUERY_KEYS.todoCategories.byUser(userId),
        sorted.map(mapTodoCategoryApiToCategory),
      );
    },
  });

  return {
    createCategoryMutation,
    createTodoMutation,
    updateTodoMutation,
    toggleTodoDoneMutation,
    moveTodoDueDateMutation,
    deleteTodoMutation,
    deleteCategoryMutation,
    reorderCategoriesMutation,
  };
}
