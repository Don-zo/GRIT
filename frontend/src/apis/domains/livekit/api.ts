import apiClient from "@/apis/client/apiClient";
import type {
  TokenResponse,
  Reaction,
  SendReactionRequest,
} from "@/apis/domains/livekit/type";
import { ENDPOINTS } from "@/apis/constants/endpoints";

export const getLiveKitToken = async (groupCode: string): Promise<string> => {
  const response = await apiClient.get<TokenResponse>(
    ENDPOINTS.LIVEKIT.TOKEN(groupCode),
  );
  return response.data.token;
};

export const getReactions = async (groupCode: string): Promise<Reaction[]> => {
  const response = await apiClient.get<Reaction[]>(
    ENDPOINTS.LIVEKIT.REACTIONS(groupCode),
  );
  return response.data;
};

export const sendReaction = async (
  groupCode: string,
  body: SendReactionRequest,
): Promise<void> => {
  await apiClient.post(ENDPOINTS.LIVEKIT.REACTION(groupCode), body);
};
