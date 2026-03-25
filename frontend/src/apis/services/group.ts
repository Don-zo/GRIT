import apiClient from "@/apis/client/apiClient";
import { ENDPOINTS } from "@/apis/constants/endpoints";
import type {
  CreateGroupRequest,
  UpdateGroupRequest,
  Group,
} from "@/apis/types";

export const groupApi = {
  create: async (data: CreateGroupRequest): Promise<Group> => {
    const response = await apiClient.post<Group>(ENDPOINTS.GROUP.CREATE, data);
    return response.data;
  },

  getMyGroup: async (groupCode: string) => {
    const response = await apiClient.get<Group>(
      ENDPOINTS.GROUP.INFO(groupCode),
    );
    return response.data;
  },

  getMyGroupList: async () => {
    const response = await apiClient.get<Group[]>(ENDPOINTS.GROUP.MY);
    return response.data;
  },

  join: async (groupCode: string) => {
    const response = await apiClient.post<Group>(
      ENDPOINTS.GROUP.JOIN(groupCode),
    );
    return response.data;
  },

  update: async (
    groupCode: string,
    data: UpdateGroupRequest,
  ): Promise<Group> => {
    const response = await apiClient.put<Group>(
      ENDPOINTS.GROUP.INFO(groupCode),
      data,
    );
    return response.data;
  },
} as const;
