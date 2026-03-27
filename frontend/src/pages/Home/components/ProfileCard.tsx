import { useState, useEffect } from "react";
import { Settings, MessageCircle } from "lucide-react";
import Avatar from "@/pages/Room/components/Cam/Avatar";
import SettingsModal from "@/pages/Home/components/Modals/ProfileSettingsModal";

interface ProfileCardProps {
  userName?: string;
  motivation?: string;
  targetDate?: string;
  daysLeft?: number;
  examName?: string;
  currentTime?: string;
  targetTime?: string;
  initialSettingsOpen: boolean;
}

const ProfileCard = ({
  userName = "김윤영",
  motivation = "앞으로 열심히 살자 아자스!",
  targetDate = "2026.01.23",
  daysLeft = 11,
  examName = "sqld 시험",
  currentTime = "2:37:23",
  targetTime = "4:00:00",
  initialSettingsOpen = false,
}: ProfileCardProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (initialSettingsOpen) {
      setIsSettingsOpen(true);
    }
  }, [initialSettingsOpen]);

  const timeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(":").map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  const currentSeconds = timeToSeconds(currentTime);
  const targetSeconds = timeToSeconds(targetTime);
  const progress =
    targetSeconds > 0
      ? Math.min((currentSeconds / targetSeconds) * 100, 100)
      : 0;
  return (
    <div className="w-1/2 h-70 bg-green-dark rounded-2xl p-6">
      {/* 설정 아이콘 - 상단 우측 */}
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          aria-label="설정"
        >
          <Settings
            className="w-4 h-4 text-white cursor-pointer"
            strokeWidth={2}
          />
        </button>
      </div>

      {/* 상단 섹션 */}
      <div className="flex items-stretch justify-between mb-14">
        {/* 왼쪽: 프로필 정보 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Avatar size={80} />
            <div className="flex flex-col gap-1">
              <div className="text-white flex items-center gap-1">
                <span className="text-h4 font-bold">{userName}</span>
                <span className="text-bodyMd">님, 화이팅 ^^</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-light" />
                <span className="text-green-light text-caption">
                  {motivation}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-[1.5px] bg-green-darkest self-stretch"></div>

        {/* 오른쪽: 목표 날짜 정보 */}
        <div className="flex flex-col items-end">
          <div className="flex items-center text-white text-bodySm gap-1">
            <span className="font-medium">{targetDate}</span>
            <span className="font-normal">까지</span>
          </div>
          <span className="text-white text-h1 font-bold">D-{daysLeft}</span>
          <span className="text-white text-bodySm">{examName}</span>
        </div>
      </div>

      {/* 하단: 이번 주 목표 공부시간 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-white text-bodyMd">이번 주 목표 공부시간</span>
          <div className="flex items-center gap-1">
            <span className="text-white text-bodyMd">{currentTime}</span>
            <span className="text-white text-bodySm font-light">
              / {targetTime}
            </span>
          </div>
        </div>
        <div className="w-full h-4 bg-gray-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-green-normal rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 설정 모달 */}
      <SettingsModal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default ProfileCard;
