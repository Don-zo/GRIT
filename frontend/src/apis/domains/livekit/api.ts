import apiClient from "@/apis/client/apiClient";
import type { TokenResponse } from "@/apis/domains/livekit/type";
import { ENDPOINTS } from "@/apis/constants/endpoints";

export const getLiveKitToken = async (room: string): Promise<string> => {
  const response = await apiClient.get<TokenResponse>(ENDPOINTS.LIVEKIT.TOKEN, {
    params: { room },
  });
  return response.data.token;
};
