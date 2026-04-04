import apiClient from "@/apis/client/apiClient";
import { ENDPOINTS } from "@/apis/constants/endpoints";
import type { Friend, FriendListResponse } from "@/apis/types/friend";

export const friendApi = {
  getList: async (): Promise<FriendListResponse[]> => {
    const response = await apiClient.get<FriendListResponse[]>(
      ENDPOINTS.FRIEND.LIST,
    );
    return response.data;
  },
  addFriend: async (nickname: string): Promise<Friend> => {
    const response = await apiClient.post<Friend>(
      ENDPOINTS.FRIEND.DETAIL(nickname),
    );
    return response.data;
  },
  removeFriend: async (nickname: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.FRIEND.DETAIL(nickname));
  },
};
