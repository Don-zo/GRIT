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
// 오른쪽 끝 막대는 툴팁이 카드 밖으로 나가지 않도록 왼쪽에 표시
const TOOLTIP_FLIP_INDEX = 5;

type WeeklyItem = {
  day: string;
  dateLabel: string;
  progress: number;
  totalCount: number | null;
};

const EMPTY_WEEKLY_DATA: WeeklyItem[] = Array.from(
  { length: 7 },
  (_, index) => {
    const date = dayjs().subtract(7 - index, "day");
    return {
      day: DAY_LABELS[date.day()],
      dateLabel: date.format("M/D"),
      progress: 0,
      totalCount: null,
    };
  },
);

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
  const resolvedWeeklyData: WeeklyItem[] =
    data?.last7Days.map((item) => ({
      day: DAY_LABELS[dayjs(item.date).day()] ?? "",
      dateLabel: dayjs(item.date).format("M/D"),
      progress: item.achievementRate ?? 0,
      totalCount: item.totalCount,
    })) ?? EMPTY_WEEKLY_DATA;

  return (
    <div className="flex min-h-64 w-full flex-col self-stretch rounded-2xl bg-[#2E3039] p-6 select-none lg:w-1/2">
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-green-normal" strokeWidth={2} />
            <span className="text-bodyLg text-white">오늘의 달성도</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-bodyLg text-white">
              {resolvedTodayProgress}%
            </span>
            <button
              type="button"
              onClick={() => navigate(PATHS.TODO)}
              aria-label="할 일로 이동"
              className="shrink-0"
            >
              <Settings
                className="h-4 w-4 cursor-pointer text-white"
                strokeWidth={2}
              />
            </button>
          </div>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-semidark">
          <div
            className="h-full rounded-full bg-green-normal transition-all duration-600"
            style={{ width: `${resolvedTodayProgress}%` }}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-2 mt-2 flex items-center justify-between">
          <h3 className="text-bodyMd text-white">이번 주 기록</h3>
          {isLoading && (
            <span className="text-caption text-gray-light">로딩 중…</span>
          )}
          {isError && !isLoading && (
            <span className="text-caption text-red-300">조회 실패</span>
          )}
        </div>
        <div className="flex min-h-0 flex-1 items-center gap-2 py-3">
          {resolvedWeeklyData.map((item, index) => {
            const hasTodos = (item.totalCount ?? 0) > 0;
            const isFlipped = index >= TOOLTIP_FLIP_INDEX;
            return (
              <div
                key={index}
                tabIndex={0}
                className="group relative flex h-full max-h-36 min-h-0 flex-1 flex-col items-center gap-2 outline-none"
              >
                <div className="relative flex min-h-20 w-5 flex-1 flex-col justify-end overflow-hidden rounded-full bg-gray-semidark">
                  <div
                    className="w-full rounded-full bg-green-normal transition-all duration-600"
                    style={{ height: `${item.progress}%` }}
                  />
                </div>
                <span className="shrink-0 text-bodySm text-white">
                  {item.day}
                </span>

                <div
                  role="tooltip"
                  className={`pointer-events-none invisible absolute top-1/2 z-10 -translate-y-1/2 whitespace-nowrap rounded-xl border border-white/30 bg-[#1e2228] px-3 py-2 text-left opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100 ${
                    isFlipped
                      ? "right-[calc(50%+18px)]"
                      : "left-[calc(50%+18px)]"
                  }`}
                >
                  <div
                    className={`absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-[#1e2228] ${
                      isFlipped
                        ? "right-0 translate-x-1/2 border-t border-r border-white/30"
                        : "left-0 -translate-x-1/2 border-b border-l border-white/30"
                    }`}
                  />
                  <p className="text-caption text-gray-light">
                    {item.dateLabel} ({item.day})
                  </p>
                  {hasTodos ? (
                    <p className="text-bodySm font-semibold text-[#D6FDE5]">
                      {item.progress}%
                    </p>
                  ) : (
                    <p className="text-bodySm text-white">기록 없음</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;
