import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { todoApi } from "@/apis/domains/todo/api";
import { userApi } from "@/apis/domains/user/api";
import { getAccessToken } from "@/utils/tokenStorage";
import type { TodoListFetchParams } from "@/pages/Todo/components/todoWeekLayout";
import {
  DEFAULT_CATEGORIES,
  type Category,
  type TodoItem,
} from "@/pages/Todo/components/types";
import { mapTodoApiToItem, mapTodoCategoryApiToCategory } from "./mappers";

type UseTodoDataOptions = {
  listParams: TodoListFetchParams;
};

export function useTodoData({ listParams }: UseTodoDataOptions) {
  const { startDate, dayCount } = listParams;
  const queryClient = useQueryClient();
  const accessToken = getAccessToken();
  const { data: member } = useQuery({
    queryKey: QUERY_KEYS.member.me,
    queryFn: userApi.get,
    enabled: accessToken != null,
  });
  const userId = member?.id ?? null;

  const listQueryKey =
    userId != null
      ? QUERY_KEYS.todos.byUserRange(userId, startDate, dayCount)
      : (["todos", "guest"] as const);

  const {
    data: serverTodos = [],
    isLoading: isTodosLoading,
    isError: isTodosError,
  } = useQuery({
    queryKey: listQueryKey,
    queryFn: async () => {
      const response = await todoApi.getList({ startDate, dayCount });
      return response.todos.map(mapTodoApiToItem);
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
      const rows = await todoApi.getCategories();
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
      queryClient.setQueryData<TodoItem[]>(listQueryKey, (prev) =>
        updater(prev ?? []),
      );
    },
    [userId, listQueryKey, queryClient],
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
