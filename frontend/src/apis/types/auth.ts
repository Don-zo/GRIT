//구글 로그인
export interface Member {
  id: number;
  nickname: string;
  email: string;
  introduction: string;
  dDayDate: string;
  dDayTitle: string;
  weeklyStudyTimeGoal: string;
}
export interface GoogleLoginRequest {
  code: string;
  redirectUri: string;
}
export interface GoogleLoginResponse {
  member: Member;
  accessToken: string;
  firstTimeUser: boolean;
}

//토큰
export interface RefreshTokenResponse {
  accessToken: string;
}
