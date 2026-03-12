import apiClient from "@/apis/client/apiClient";

import type {
  GoogleLoginRequest,
  GoogleLoginResponse,
  Member,
} from "@/apis/types/auth";
import { OAUTH_CONFIG } from "@/apis/constants/oauth";
import { AUTH_GOOGLE_ENDPOINT } from "@/apis/constants/endpoints";
import { AUTH_REFRESH_ENDPOINT } from "@/apis/constants/endpoints";
import { AUTH_LOGOUT_ENDPOINT } from "@/apis/constants/endpoints";
import type { RefreshTokenResponse } from "@/apis/types/auth";

//구글에서 받은 code를 백엔드로 전송
//토큰과 사용자 정보를 받아오기
export const loginGoogle = async (
  code: string,
): Promise<GoogleLoginResponse> => {
  //백엔드에게 보낼 데이터를 객체로 만들기
  const requestBody: GoogleLoginRequest = {
    code,
    redirectUri: OAUTH_CONFIG.GOOGLE.REDIRECT_URI,
  };

  const response = await apiClient.post<GoogleLoginResponse>(
    AUTH_GOOGLE_ENDPOINT,
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

//리프레시 토큰
export const refreshAccessToken = async (): Promise<string> => {
  const response = await apiClient.post<RefreshTokenResponse>(
    AUTH_REFRESH_ENDPOINT,
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

//로그인한 사용자 정보 가져오기
export const getCurrentUser = (): Member | null => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return null;

    const { state } = JSON.parse(authStorage);
    return state?.member || null;
  } catch (error) {
    console.error("사용자 정보 오류", error);
    return null;
  }
};

//로그아웃
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post(
      AUTH_LOGOUT_ENDPOINT,
      {},
      {
        withCredentials: true,
      },
    );
    console.log("로그아웃 성공");
  } catch (error) {
    console.error(error);
    console.log("로그아웃 실패");
  } finally {
    localStorage.removeItem("auth-storage");
    console.log("로컬 데이터 삭제");
  }
};
