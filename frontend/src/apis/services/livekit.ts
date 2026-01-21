import apiClient from "@/apis/client/apiClient";
import type { TokenResponse } from "@/apis/types/livekit";
import { LIVEKIT_TOKEN_ENDPOINT } from "@/apis/constants/endpoints";

export const getLiveKitToken = async (
  room: string,
  user: string
): Promise<string> => {
  const response = await apiClient.get<TokenResponse>(LIVEKIT_TOKEN_ENDPOINT, {
    params: { room, user },
  });
  return response.data.token;
};