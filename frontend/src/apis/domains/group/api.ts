import apiClient from "@/apis/client/apiClient";
import { ENDPOINTS } from "@/apis/constants/endpoints";
import type {
  CreateGroupRequest,
  UpdateGroupRequest,
  Group,
  GroupMember,
  GroupMemberTodoView,
  GroupMemberTodosResponse,
} from "./type";
import type { S3uploadResponse } from "../file/type";

export const groupApi = {
  create: async (data: CreateGroupRequest): Promise<Group> => {
    const response = await apiClient.post<Group>(ENDPOINTS.GROUP.CREATE, data);
    return response.data;
  },

  getMyGroup: async (groupCode: string): Promise<Group> => {
    const response = await apiClient.get<Group>(
      ENDPOINTS.GROUP.INFO(groupCode),
    );
    return response.data;
  },

  getMyGroupList: async (): Promise<Group[]> => {
    const response = await apiClient.get<Group[]>(ENDPOINTS.GROUP.MY);
    return response.data;
  },

  getGroupMembers: async (groupCode: string): Promise<GroupMember[]> => {
    const response = await apiClient.get<GroupMember[]>(
      ENDPOINTS.GROUP.MEMBERS(groupCode),
    );
    return response.data;
  },

  getMemberTodos: async (
    groupCode: string,
    memberId: number,
    view: GroupMemberTodoView = "day",
  ): Promise<GroupMemberTodosResponse> => {
    const response = await apiClient.get<GroupMemberTodosResponse>(
      ENDPOINTS.GROUP.MEMBER_TODOS(groupCode, memberId),
      { params: { view } },
    );
    return response.data;
  },

  join: async (groupCode: string): Promise<Group> => {
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

  getPresignedInfo: async (): Promise<S3uploadResponse> => {
    const response = await apiClient.get<S3uploadResponse>(
      ENDPOINTS.GROUP.IMAGE_UPLOAD,
    );
    return response.data;
  },

  signout: async (groupCode: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.GROUP.INFO(groupCode));
  },
} as const;
