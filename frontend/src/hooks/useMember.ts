import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/apis/domains/user/api";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";

export function useMember() {
  return useQuery({
    queryKey: QUERY_KEYS.member.me,
    queryFn: userApi.get,
  });
}
