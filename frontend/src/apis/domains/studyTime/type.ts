export type MemberStudyTimeResponse = {
  weekStartDate: string;
  weeklyStudyTimeGoalSeconds: number | null;
  currentWeekStudyTimeSeconds: number;
  running: boolean;
  serverNow: string;
  lastStartedAt: string | null;
};
