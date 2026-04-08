import apiClient from "@/apis/client/apiClient";
import { ENDPOINTS } from "@/apis/constants/endpoints";
import type { FriendDetail } from "@/apis/types/friend";

export const friendApi = {
  getList: async (): Promise<FriendDetail[]> => {
    const response = await apiClient.get<FriendDetail[]>(ENDPOINTS.FRIEND.LIST);
    return response.data;
  },
  addFriend: async (nickname: string): Promise<FriendDetail> => {
    const response = await apiClient.post<FriendDetail>(
      ENDPOINTS.FRIEND.DETAIL(nickname),
    );
    return response.data;
  },
  removeFriend: async (nickname: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.FRIEND.DETAIL(nickname));
  },
};
