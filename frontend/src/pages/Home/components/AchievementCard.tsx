import React from "react";
import { Trophy } from "lucide-react";

interface AchievementCardProps {
  todayProgress?: number; // 0-100
  weeklyData?: {
    day: string;
    progress: number; // 0-100
  }[];
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  todayProgress = 70,
  weeklyData = [
    { day: "목", progress: 75 },
    { day: "금", progress: 55 },
    { day: "토", progress: 85 },
    { day: "일", progress: 25 },
    { day: "월", progress: 45 },
    { day: "화", progress: 65 },
    { day: "수", progress: 55 },
  ],
}) => {
  return (
    <div className="w-1/2 h-70 bg-[#2E3039] rounded-2xl p-6">
        
      {/* 오늘의 달성도 섹션 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-green-normal" strokeWidth={2} />
            <span className="text-white text-bodyLg">오늘의 달성도</span>
          </div>
          <span className="text-white text-bodyLg">
            {todayProgress}%
          </span>
        </div>
        <div className="w-full h-4 bg-gray-semidark rounded-full overflow-hidden">
          <div
            className="h-full bg-green-normal rounded-full transition-all duration-300"
            style={{ width: `${todayProgress}%` }}
          />
        </div>
      </div>

      {/* 이번 주 기록 섹션 */}
      <div>
        <h3 className="text-white text-bodyMd mb-4">이번 주 기록</h3>
        <div className="flex items-end gap-3">
          {weeklyData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-6 h-20 bg-gray-semidark rounded-full overflow-hidden relative flex flex-col justify-end">
                <div
                  className="w-full bg-green-normal rounded-full transition-all duration-300"
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
