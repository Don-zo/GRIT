import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pomodoroApi } from "@/apis/domains/pomodoro/api";
import type { StartPomodoroRequest } from "@/apis/domains/pomodoro/type";
import { normalizeStartPomodoroRequest } from "@/apis/domains/pomodoro/type";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";

export function useStartPomodoro(groupCode: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: StartPomodoroRequest) =>
      pomodoroApi.start(groupCode!, normalizeStartPomodoroRequest(body)),
    onSuccess: (data) => {
      if (!groupCode) return;
      queryClient.setQueryData(QUERY_KEYS.pomodoro.status(groupCode), data);
    },
    onError: (error) => {
      console.error("뽀모도로 시작 실패", error);
    },
  });
}
