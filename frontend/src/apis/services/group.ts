import apiClient from "@/apis/client/apiClient";
import { GROUPS_ENDPOINT } from "@/apis/constants/endpoints";
import type {
  CreateGroupRequest,
  CreateGroupResponse,
  UpdateGroupRequest,
  UpdateGroupResponse,
} from "@/apis/types/group";

// 그룹 생성
export const createGroup = async (
  userId: number,
  data: CreateGroupRequest
): Promise<CreateGroupResponse> => {
  const response = await apiClient.post<CreateGroupResponse>(
    GROUPS_ENDPOINT,
    data,
    {
      params: { userId },
    }
  );
  return response.data;
};

//그룹 정보 수정
export const updateGroup = async (
  groupId: number,
  userId: number,
  data: UpdateGroupRequest
): Promise<UpdateGroupResponse> => {
  const response = await apiClient.put<UpdateGroupResponse>(
    `${GROUPS_ENDPOINT}/${groupId}`,
    data,
    {
      params: { userId },
    }
  );
  return response.data;
};
