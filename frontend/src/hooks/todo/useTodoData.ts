import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { getStoredMember } from "@/apis/domains/auth/api";
import { todoApi } from "@/apis/domains/todo/api";
import {
  DEFAULT_CATEGORIES,
  type Category,
  type TodoItem,
} from "@/pages/Todo/components/types";
import { mapTodoApiToItem, mapTodoCategoryApiToCategory } from "./mappers";

export function useTodoData() {
  const queryClient = useQueryClient();
  const userId = getStoredMember()?.id ?? null;

  const {
    data: serverTodos = [],
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

  const [guestTodos, setGuestTodos] = useState<TodoItem[]>([]);
  const todos = userId != null ? serverTodos : guestTodos;

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
      const sorted = [...rows].sort((a, b) => {
        const ao = a.sortOrder ?? 0;
        const bo = b.sortOrder ?? 0;
        return ao - bo;
      });
      return sorted.map(mapTodoCategoryApiToCategory);
    },
    enabled: userId != null,
  });

  const [guestCategories, setGuestCategories] =
    useState<Category[]>(DEFAULT_CATEGORIES);

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

  const patchTodos = useCallback(
    (updater: (prev: TodoItem[]) => TodoItem[]) => {
      if (userId == null) {
        setGuestTodos((prev) => updater(prev));
        return;
      }
      queryClient.setQueryData<TodoItem[]>(
        QUERY_KEYS.todos.byUser(userId),
        (prev) => updater(prev ?? []),
      );
    },
    [userId, queryClient],
  );

  return {
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
  };
}
