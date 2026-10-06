export type MemberStudyTimeResponse = {
  weekStartDate: string;
  weeklyStudyTimeGoalSeconds: number | null;
  currentWeekStudyTimeSeconds: number;
  running: boolean;
  serverNow: string;
  lastStartedAt: string | null;
};

export type GroupMemberStudyTimeResponse = MemberStudyTimeResponse & {
  memberId: number;
  nickname: string;
};
