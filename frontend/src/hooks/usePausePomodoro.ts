import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pomodoroApi } from "@/apis/domains/pomodoro/api";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";

export function usePausePomodoro(groupCode: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => pomodoroApi.pause(groupCode!),
    onSuccess: (data) => {
      if (!groupCode) return;
      queryClient.setQueryData(QUERY_KEYS.pomodoro.status(groupCode), data);
    },
    onError: (error) => {
      console.error("뽀모도로 일시정지 실패", error);
    },
  });
}
