export interface Member {
  id: number;
  nickname: string;
  email: string;
  introduction: string;
  imageUrl?: string;
  dDayDate?: string;
  dDayTitle?: string;
  weeklyStudyTimeGoal?: string;
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

export interface RefreshTokenResponse {
  accessToken: string;
}
