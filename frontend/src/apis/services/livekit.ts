import apiClient from "@/apis/client/apiClient";
import type { TokenResponse } from "@/apis/types/livekit";
import { API_ENDPOINTS } from "@/apis/constants/endpoints";

export const getLiveKitToken = async (
  room: string,
  user: string,
): Promise<string> => {
  const response = await apiClient.get<TokenResponse>(
    API_ENDPOINTS.LIVEKIT.TOKEN,
    {
      params: { room, user },
    },
  );
  return response.data.token;
};
