import apiClient from "@/apis/client/apiClient";
import { API_ENDPOINTS } from "@/apis/constants/endpoints";
import type {
  CreateGroupRequest,
  UpdateGroupRequest,
  Group,
} from "@/apis/types";

export const groupApi = {
  create: async (data: CreateGroupRequest): Promise<Group> => {
    const response = await apiClient.post<Group>(
      API_ENDPOINTS.GROUP.BASE,
      data,
    );
    return response.data;
  },

  update: async (groupId: number, data: UpdateGroupRequest): Promise<Group> => {
    const response = await apiClient.put<Group>(
      API_ENDPOINTS.GROUP.DETAIL(groupId),
      data,
    );
    return response.data;
  },
} as const;
