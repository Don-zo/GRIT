import { useQuery } from "@tanstack/react-query";
import { studyTimeApi } from "@/apis/domains/studyTime/api";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";

type UseStudyTimeOptions = {
  enabled?: boolean;
};

export function useStudyTime({ enabled = true }: UseStudyTimeOptions = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.studyTime.me,
    queryFn: studyTimeApi.get,
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });
}
