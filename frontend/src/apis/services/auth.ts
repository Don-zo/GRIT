import apiClient, { refreshClient } from "@/apis/client/apiClient";
import type {
  GoogleLoginRequest,
  GoogleLoginResponse,
} from "@/apis/types/auth";
import { OAUTH_CONFIG } from "@/apis/constants/oauth";
import { ENDPOINTS } from "@/apis/constants/endpoints";
import type { MemberResponse, RefreshTokenResponse } from "@/apis/types/auth";

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
    { withCredentials: true },
  );
  const { member, accessToken, firstTimeUser } = response.data;
  const authStorage = {
    state: {
      accessToken,
    },
  };
  localStorage.setItem("auth-storage", JSON.stringify(authStorage));
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
  const storedAuth = localStorage.getItem("auth-storage");

  if (storedAuth) {
    const parsed = JSON.parse(storedAuth);
    parsed.state.accessToken = accessToken;
    localStorage.setItem("auth-storage", JSON.stringify(parsed));
  }

  return accessToken;
};

export const logout = async (): Promise<void> => {
  await apiClient.post(ENDPOINTS.AUTH.LOGOUT, {});
  localStorage.removeItem("auth-storage");
};

export const signout = async (): Promise<void> => {
  await apiClient.delete(ENDPOINTS.MY.INFO);
  localStorage.removeItem("auth-storage");
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
