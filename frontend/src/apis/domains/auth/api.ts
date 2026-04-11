import apiClient, { refreshClient } from "@/apis/client/apiClient";
import type {
  GoogleLoginRequest,
  GoogleLoginResponse,
} from "@/apis/domains/auth/type";
import { OAUTH_CONFIG } from "@/apis/constants/oauth";
import { ENDPOINTS } from "@/apis/constants/endpoints";
import type {
  MemberResponse,
  RefreshTokenResponse,
} from "@/apis/domains/auth/type";
import { setAccessToken, removeAccessToken } from "@/utils/tokenStorage";

export const loginGoogle = async (
  code: string,
): Promise<GoogleLoginResponse> => {
  const requestBody: GoogleLoginRequest = {
    code,
    redirectUri: OAUTH_CONFIG.GOOGLE.REDIRECT_URI,
  };
  const response = await apiClient.post<GoogleLoginResponse>(
    ENDPOINTS.AUTH.GOOGLE,
    requestBody,
  );
  const { member, accessToken, firstTimeUser } = response.data;
  setAccessToken(accessToken);
  console.log({
    member,
    firstTimeUser,
  });

  return response.data;
};

export const refreshAccessToken = async (): Promise<string> => {
  const response = await refreshClient.post<RefreshTokenResponse>(
    ENDPOINTS.AUTH.REFRESH,
    {},
  );
  const { accessToken } = response.data;
  setAccessToken(accessToken);
  return accessToken;
};

export const logout = async (): Promise<void> => {
  await apiClient.post(ENDPOINTS.AUTH.LOGOUT, {});
  removeAccessToken();
};

export const signout = async (): Promise<void> => {
  await apiClient.delete(ENDPOINTS.MY.INFO);
  removeAccessToken();
};

export function getStoredMember(): MemberResponse | null {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { member?: MemberResponse } };
    return parsed.state?.member ?? null;
  } catch {
    return null;
  }
}
