import { useQuery } from "@tanstack/react-query";
import { pomodoroApi } from "@/apis/domains/pomodoro/api";
import { POMODORO_STATUS_REFETCH_INTERVAL_MS } from "@/apis/constants/pomodoro";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";

type UsePomodoroStatusOptions = {
  groupCode: string | undefined;
  enabled?: boolean;
};

export function usePomodoroStatus({
  groupCode,
  enabled = true,
}: UsePomodoroStatusOptions) {
  return useQuery({
    queryKey: QUERY_KEYS.pomodoro.status(groupCode ?? ""),
    queryFn: () => pomodoroApi.getStatus(groupCode!),
    enabled: enabled && !!groupCode,
    refetchInterval: POMODORO_STATUS_REFETCH_INTERVAL_MS,
  });
}
