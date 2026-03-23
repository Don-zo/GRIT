import apiClient from "@/apis/client/apiClient";
import { API_ENDPOINTS } from "@/apis/constants/endpoints";
import type {
  CreateGroupRequest,
  UpdateGroupRequest,
  Group,
  GroupList,
  GroupCoreInfo,
} from "@/apis/types";

export const groupApi = {
  create: async (data: CreateGroupRequest): Promise<Group> => {
    const response = await apiClient.post<Group>(
      API_ENDPOINTS.GROUP.CREATE,
      data,
    );
    return response.data;
  },

  getMyGroups: async (groupCode: string) => {
    const response = await apiClient.get<GroupCoreInfo>(
      API_ENDPOINTS.GROUP.DETAIL(groupCode),
    );
    return response.data;
  },

  getMyGroup: async () => {
    const response = await apiClient.get<GroupList>(API_ENDPOINTS.GROUP.MY);
    return response.data;
  },

  join: async (groupCode: string) => {
    const response = await apiClient.post<GroupCoreInfo>(
      API_ENDPOINTS.GROUP.JOIN(groupCode),
    );
    return response.data;
  },

  update: async (
    groupCode: string,
    data: UpdateGroupRequest,
  ): Promise<Group> => {
    const response = await apiClient.put<Group>(
      API_ENDPOINTS.GROUP.DETAIL(groupCode),
      data,
    );
    return response.data;
  },
} as const;
