import apiClient from "@/apis/client/apiClient";
import type { TokenResponse } from "@/apis/domains/livekit/type";
import { ENDPOINTS } from "@/apis/constants/endpoints";

export const getLiveKitToken = async (groupCode: string): Promise<string> => {
  const response = await apiClient.get<TokenResponse>(
    ENDPOINTS.LIVEKIT.TOKEN(groupCode),
  );
  return response.data.token;
};
