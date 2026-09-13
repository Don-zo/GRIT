import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { todoApi } from "@/apis/domains/todo/api";
import { userApi } from "@/apis/domains/user/api";
import { getAccessToken } from "@/utils/tokenStorage";
import { mapTodoCategoryApiToCategory } from "./mappers";

/** /todo 페이지와 동일한 카테고리 캐시를 읽기 전용으로 조회 */
export function useTodoCategories() {
  const accessToken = getAccessToken();

  const { data: member } = useQuery({
    queryKey: QUERY_KEYS.member.me,
    queryFn: userApi.get,
    enabled: accessToken != null,
  });
  const userId = member?.id ?? null;

  const { data: categories = [] } = useQuery({
    queryKey:
      userId != null
        ? QUERY_KEYS.todoCategories.byUser(userId)
        : (["todoCategories", "guest"] as const),
    queryFn: async () => {
      const rows = await todoApi.getCategories();
      const sorted = [...rows].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      );
      return sorted.map(mapTodoCategoryApiToCategory);
    },
    enabled: userId != null,
  });

  return { categories };
}
