import { useCallback, useState } from "react";
import type { TodoToastPayload } from "@/pages/Todo/components/TodoToast";

export function useTodoToast() {
  const [todoToast, setTodoToast] = useState<TodoToastPayload | null>(null);

  const clearTodoToast = useCallback(() => setTodoToast(null), []);

  const notifyTodo = useCallback(
    (text: string, variant: "success" | "error" = "success") => {
      setTodoToast((prev) => ({
        key: (prev?.key ?? 0) + 1,
        text,
        variant,
      }));
    },
    [],
  );

  return { todoToast, clearTodoToast, notifyTodo };
}
