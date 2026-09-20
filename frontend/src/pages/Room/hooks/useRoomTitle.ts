import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { groupApi } from "@/apis/domains/group/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function useRoomTitle(groupCode: string | undefined) {
  const { data: group } = useQuery({
    queryKey: QUERY_KEYS.groups.detail(groupCode ?? ""),
    queryFn: () => groupApi.getMyGroup(groupCode!),
    enabled: !!groupCode,
  });

  useDocumentTitle(group?.name);
}
