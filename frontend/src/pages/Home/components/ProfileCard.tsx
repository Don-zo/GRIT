import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Settings, MessageCircle } from "lucide-react";
import Avatar from "@/components/Avatar";
import SettingsModal from "@/pages/Home/components/Modals/ProfileSettingsModal";
import { userApi } from "@/apis/domains/user/api";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { formatDisplayDate, getDaysUntilDDay } from "@/utils/date";
import { formatStudyGoalDisplay } from "@/utils/studyGoalTime";

interface ProfileCardProps {
  initialSettingsOpen: boolean;
  oauthFirstTimeUser: boolean;
}

const ProfileCard = ({
  initialSettingsOpen = false,
  oauthFirstTimeUser = false,
}: ProfileCardProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInitialProfileSave, setIsInitialProfileSave] = useState(false);

  const {
    data: member,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.member.me,
    queryFn: userApi.get,
  });

  useEffect(() => {
    if (initialSettingsOpen && oauthFirstTimeUser) {
      setIsInitialProfileSave(true);
      setIsSettingsOpen(true);
    }
  }, [initialSettingsOpen, oauthFirstTimeUser]);

  const daysLeft = member ? getDaysUntilDDay(member.dDayDate) : null;
  const targetDateLabel = member ? formatDisplayDate(member.dDayDate) : "—";
  const examName = member?.dDayTitle?.trim() || "미설정";
  const displayName = member?.nickname?.trim() || member?.email || "—";
  const motivation = member?.introduction?.trim() || "소개를 입력해주세요";
  const goalTimeLabel = formatStudyGoalDisplay(member?.weeklyStudyTimeGoal);

  return (
    <div className="w-full lg:w-1/2 h-64 bg-green-dark rounded-2xl p-6">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setIsInitialProfileSave(false);
            setIsSettingsOpen(true);
          }}
          disabled={isLoading}
          aria-label="설정"
          className="disabled:opacity-50"
        >
          <Settings
            className="w-4 h-4 text-white cursor-pointer"
            strokeWidth={2}
          />
        </button>
      </div>

      {isError && (
        <p className="mb-4 text-sm text-red-300">
          프로필을 불러오지 못했습니다.{" "}
          <button
            type="button"
            onClick={() => refetch()}
            className="underline cursor-pointer"
          >
            다시 시도
          </button>
        </p>
      )}

      <div className="mb-8 flex items-stretch justify-between">
        <div className="flex items-start gap-3">
          <Avatar size={72} src={member?.imageUrl} />
          <div className="flex min-w-0 flex-col gap-2">
            <div className="text-white flex flex-wrap items-center gap-1">
              <span className="text-h4 font-bold">
                {isLoading ? "…" : displayName}
              </span>
              <span className="text-bodyMd">님, 화이팅 ^^</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-light shrink-0" />
              <span className="text-green-light text-caption line-clamp-2">
                {isLoading ? "불러오는 중…" : motivation}
              </span>
            </div>
          </div>
        </div>

        <div className="mx-4 w-[1.5px] shrink-0 self-stretch bg-green-darkest" />

        <div className="flex flex-col items-end text-right shrink-0">
          <div className="flex items-center text-white text-bodySm gap-1">
            <span className="font-medium">{targetDateLabel}</span>
            <span className="font-normal">까지</span>
          </div>
          <span className="text-white text-h1 font-bold">
            {daysLeft === null
              ? "D-?"
              : daysLeft >= 0
                ? `D-${daysLeft}`
                : `D+${Math.abs(daysLeft)}`}
          </span>
          <span className="text-white text-bodySm">{examName}</span>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-white text-bodyMd">이번 주 목표 공부시간</span>
          <span className="text-white text-bodyMd">
            {isLoading ? "…" : `${goalTimeLabel}`}
          </span>
        </div>
        <div className="w-full h-4 bg-gray-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-green-normal rounded-full transition-all duration-300"
            style={{ width: "0%" }}
            title="실시간 공부 시간 연동 전"
          />
        </div>
      </div>

      <SettingsModal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isInitialProfile={isInitialProfileSave}
      />
    </div>
  );
};

export default ProfileCard;
