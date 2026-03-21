import apiClient from "@/apis/client/apiClient";

import type {
  GoogleLoginRequest,
  GoogleLoginResponse,
  Member,
} from "@/apis/types/auth";
import { OAUTH_CONFIG } from "@/apis/constants/oauth";
import { API_ENDPOINTS } from "@/apis/constants/endpoints";
import type { RefreshTokenResponse } from "@/apis/types/auth";

export const loginGoogle = async (
  code: string,
): Promise<GoogleLoginResponse> => {
  const requestBody: GoogleLoginRequest = {
    code,
    redirectUri: OAUTH_CONFIG.GOOGLE.REDIRECT_URI,
  };
  const response = await apiClient.post<GoogleLoginResponse>(
    API_ENDPOINTS.AUTH.GOOGLE,
    requestBody,
    { withCredentials: true },
  );
  const { member, accessToken, firstTimeUser } = response.data;
  const authStorage = {
    state: {
      accessToken,
      member,
    },
  };
  localStorage.setItem("auth-storage", JSON.stringify(authStorage));
  console.log({
    memberId: member.id,
    nickname: member.nickname,
    firstTimeUser,
  });

  return response.data;
};

export const refreshAccessToken = async (): Promise<string> => {
  const response = await apiClient.post<RefreshTokenResponse>(
    API_ENDPOINTS.AUTH.REFRESH,
    {},
    { withCredentials: true },
  );
  const { accessToken } = response.data;

  const authStorage = localStorage.getItem("auth-storage");
  if (authStorage) {
    const parsed = JSON.parse(authStorage);
    parsed.state.accessToken = accessToken;
    localStorage.setItem("auth-storage", JSON.stringify(parsed));
  }
  return accessToken;
};

export const getUserInfo = async (): Promise<Member> => {
  const response = await apiClient.get<Member>(API_ENDPOINTS.AUTH.INFO);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {
    withCredentials: true,
  });
  localStorage.removeItem("auth-storage");
};

export const signout = async (): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.AUTH.INFO);
  localStorage.removeItem("auth-storage");
};
