import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studyTimeApi } from "@/apis/domains/studyTime/api";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";

export function useResumeStudyTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["studyTime", "resume"],
    mutationFn: studyTimeApi.resume,
    onError: (error) => {
      console.error("공부 타이머 재개 실패", error);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.studyTime.me });
    },
  });
}
