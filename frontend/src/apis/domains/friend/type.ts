export interface Friend {
  friendId: number;
  nickname: string;
  introduction: string;
}

export interface FriendDetail {
  nickname: string;
  introduction: string;
  imageUrl: string;
  dDayDate: string;
  dDayTitle: string;
  weeklyStudyTimeGoal: string;
}

export interface FriendListResponse {
  data: FriendDetail[];
}
