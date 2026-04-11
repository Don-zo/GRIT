export interface MemberResponse {
  id: number;
  nickname: string;
  email: string;
  introduction: string;
  imageUrl: string | null;
  dDayDate: string | null;
  dDayTitle: string | null;
  weeklyStudyTimeGoal: string | null;
}

export interface CreateMemberRequest {
  nickname: string;
  introduction: string;
  imageName?: string | null;
  dDayDate?: string | null;
  dDayTitle?: string | null;
  weeklyStudyTimeGoal?: string | null;
}

export interface UpdateMemberRequest {
  nickname?: string;
  introduction?: string;
  imageName?: string;
  dDayDate?: string | null;
  dDayTitle?: string | null;
  weeklyStudyTimeGoal?: string | null;
}

export interface NicknameAvailabilityResponse {
  isAvailable: boolean;
}
export interface GoogleLoginRequest {
  code: string;
  redirectUri: string;
}
export interface GoogleLoginResponse {
  member: MemberResponse;
  accessToken: string;
  firstTimeUser: boolean;
}

export interface RefreshTokenResponse {
  accessToken: string;
}
