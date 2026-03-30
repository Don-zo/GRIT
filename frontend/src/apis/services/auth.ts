import apiClient from "@/apis/client/apiClient";
import type {
  GoogleLoginRequest,
  GoogleLoginResponse,
} from "@/apis/types/auth";
import { OAUTH_CONFIG } from "@/apis/constants/oauth";
import { ENDPOINTS } from "@/apis/constants/endpoints";
import type { Member, RefreshTokenResponse } from "@/apis/types/auth";

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
    ENDPOINTS.AUTH.REFRESH,
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

export const logout = async (): Promise<void> => {
  await apiClient.post(ENDPOINTS.AUTH.LOGOUT, {
    withCredentials: true,
  });
  localStorage.removeItem("auth-storage");
};

export const signout = async (): Promise<void> => {
  await apiClient.delete(ENDPOINTS.MY.INFO);
  localStorage.removeItem("auth-storage");
};

/** 로컬에 저장된 로그인 회원 정보 (없으면 null) */
export function getStoredMember(): Member | null {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { member?: Member } };
    return parsed.state?.member ?? null;
  } catch {
    return null;
  }
}
