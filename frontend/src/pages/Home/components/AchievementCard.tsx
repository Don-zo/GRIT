import React from "react";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Trophy, Settings } from "lucide-react";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { todoApi } from "@/apis/domains/todo/api";
import { userApi } from "@/apis/domains/user/api";
import { getAccessToken } from "@/utils/tokenStorage";
import { PATHS } from "@/routes/path";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;
const EMPTY_WEEKLY_DATA = Array.from({ length: 7 }, (_, index) => {
  const date = dayjs().subtract(7 - index, "day");
  return {
    day: DAY_LABELS[date.day()],
    progress: 0,
  };
});

const AchievementCard: React.FC = () => {
  const navigate = useNavigate();
  const accessToken = getAccessToken();
  const { data: member } = useQuery({
    queryKey: QUERY_KEYS.member.me,
    queryFn: userApi.get,
    enabled: accessToken != null,
  });
  const userId = member?.id ?? null;

  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.todos.achievement(userId),
    queryFn: () => {
      if (userId == null) {
        throw new Error("로그인 사용자 정보가 필요합니다.");
      }
      return todoApi.getAchievement();
    },
    enabled: userId != null,
  });

  const resolvedTodayProgress = data?.today.achievementRate ?? 0;
  const resolvedWeeklyData =
    data?.last7Days.map((item) => ({
      day: DAY_LABELS[dayjs(item.date).day()] ?? "",
      progress: item.achievementRate ?? 0,
    })) ?? EMPTY_WEEKLY_DATA;

  return (
    <div className="w-full lg:w-1/2 h-64 bg-[#2E3039] rounded-2xl p-6 select-none">
      {/* 오늘의 달성도 섹션 */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-green-normal" strokeWidth={2} />
            <span className="text-white text-bodyLg">오늘의 달성도</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white text-bodyLg">
              {resolvedTodayProgress}%
            </span>
            <button
              type="button"
              onClick={() => navigate(PATHS.TODO)}
              aria-label="할 일로 이동"
              className="shrink-0"
            >
              <Settings
                className="w-4 h-4 text-white cursor-pointer"
                strokeWidth={2}
              />
            </button>
          </div>
        </div>
        <div className="w-full h-4 bg-gray-semidark rounded-full overflow-hidden">
          <div
            className="h-full bg-green-normal rounded-full transition-all duration-600"
            style={{ width: `${resolvedTodayProgress}%` }}
          />
        </div>
      </div>

      {/* 이번 주 기록 섹션 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-white text-bodyMd">이번 주 기록</h3>
          {isLoading && <span className="text-caption text-gray-light">로딩 중…</span>}
          {isError && !isLoading && (
            <span className="text-caption text-red-300">조회 실패</span>
          )}
        </div>
        <div className="flex items-end gap-2">
          {resolvedWeeklyData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-5 h-16 bg-gray-semidark rounded-full overflow-hidden relative flex flex-col justify-end">
                <div
                  className="w-full bg-green-normal rounded-full transition-all duration-600"
                  style={{ height: `${item.progress}%` }}
                />
              </div>
              <span className="text-white text-bodySm">{item.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;
