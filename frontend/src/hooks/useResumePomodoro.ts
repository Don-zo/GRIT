import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pomodoroApi } from "@/apis/domains/pomodoro/api";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";

export function useResumePomodoro(groupCode: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => pomodoroApi.resume(groupCode!),
    onSuccess: (data) => {
      if (!groupCode) return;
      queryClient.setQueryData(QUERY_KEYS.pomodoro.status(groupCode), data);
    },
    onError: (error) => {
      console.error("뽀모도로 재개 실패", error);
    },
  });
}
