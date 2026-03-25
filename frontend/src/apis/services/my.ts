import apiClient from "@/apis/client/apiClient";
import type { Member } from "@/apis/types/auth";
import { ENDPOINTS } from "@/apis/constants/endpoints";

export const getUserInfo = async (): Promise<Member> => {
  const response = await apiClient.get<Member>(ENDPOINTS.MY.INFO);
  return response.data;
};
