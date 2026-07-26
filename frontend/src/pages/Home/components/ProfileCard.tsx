import { useState, useEffect } from "react";
import { Settings, MessageCircle, UserRound } from "lucide-react";
import Avatar from "@/components/Avatar";
import SettingsModal from "@/pages/Home/components/Modals/ProfileSettingsModal";
import { useMember } from "@/hooks/useMember";
import { useStudyTime } from "@/hooks/useStudyTime";
import { formatDisplayDate, getDDayDisplayParts } from "@/utils/date";
import { formatStudyGoalDisplay } from "@/utils/studyGoalTime";
import {
  getDisplayedStudySeconds,
  getStudyTimeProgressPercent,
} from "@/utils/studyTime";

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

  const { data: member, isLoading, isError, refetch } = useMember();
  const { data: studyTime } = useStudyTime();

  useEffect(() => {
    if (initialSettingsOpen && oauthFirstTimeUser) {
      setIsInitialProfileSave(true);
      setIsSettingsOpen(true);
    }
  }, [initialSettingsOpen, oauthFirstTimeUser]);

  const { sign: dDaySign, days: dDayDays } = getDDayDisplayParts(
    member?.dDayDate,
  );
  const targetDateLabel = member ? formatDisplayDate(member.dDayDate) : "—";
  const examName = member?.dDayTitle?.trim() || "미설정";
  const displayName = member?.nickname?.trim() || member?.email || "—";
  const motivation = member?.introduction?.trim() || "소개를 입력해주세요";
  const goalTimeLabel = formatStudyGoalDisplay(member?.weeklyStudyTimeGoal);
  const studyProgressPercent = getStudyTimeProgressPercent(
    getDisplayedStudySeconds(studyTime),
    studyTime?.weeklyStudyTimeGoalSeconds,
  );

  const openSettings = () => {
    setIsInitialProfileSave(false);
    setIsSettingsOpen(true);
  };

  return (
    <div className="flex min-h-64 w-full flex-col rounded-2xl bg-green-dark p-6 lg:w-1/2">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserRound className="h-5 w-5 text-green-normal" strokeWidth={2} />
          <span className="text-bodyLg leading-bodyLg text-white">내 정보</span>
        </div>
        <button
          type="button"
          onClick={openSettings}
          disabled={isLoading}
          aria-label="설정"
          className="rounded-md p-1 text-white transition-colors hover:bg-green-darkest/40 disabled:opacity-50"
        >
          <Settings className="h-4 w-4 cursor-pointer" strokeWidth={2} />
        </button>
      </div>

      {isError && (
        <p className="mb-3 text-sm text-red-300">
          프로필을 불러오지 못했습니다.{" "}
          <button
            type="button"
            onClick={() => refetch()}
            className="cursor-pointer underline"
          >
            다시 시도
          </button>
        </p>
      )}

      <div className="mb-4 flex flex-1 items-stretch gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <Avatar size={64} src={member?.imageUrl} />
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
            <p className="break-keep text-white">
              <span className="text-h4 font-bold leading-h4">
                {isLoading ? "…" : displayName}
              </span>
              <span className="text-bodyMd leading-bodyMd"> 님, 화이팅 ^^</span>
            </p>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 shrink-0 text-green-light" />
              <p className="line-clamp-2 break-keep text-caption leading-caption text-green-light">
                {isLoading ? "불러오는 중…" : motivation}
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-[158px] shrink-0 flex-col justify-center rounded-xl bg-green-darkest/45 px-3.5 py-3.5">
          <p className="break-keep text-[11px] leading-4 tracking-wide text-white/50">
            {targetDateLabel}까지
          </p>

          <div className="mt-1.5 flex items-baseline gap-0.5 text-green-normal">
            <span className="text-[22px] font-bold leading-none">
              D{dDaySign}
            </span>
            <span className="text-[32px] font-bold leading-none tracking-tight">
              {dDayDays}
            </span>
          </div>

          <div className="mt-2.5 border-t border-white/10 pt-2">
            <p className="line-clamp-2 break-keep text-bodySm font-medium leading-bodySm text-white/85">
              {examName}
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="shrink-0 text-bodyMd leading-bodyMd text-white">
            이번 주 목표 공부시간
          </span>
          <span className="break-keep text-right text-bodyMd leading-bodyMd text-white">
            {isLoading ? "…" : goalTimeLabel}
          </span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-dark">
          <div
            className="h-full rounded-full bg-green-normal transition-all duration-300"
            style={{ width: `${studyProgressPercent}%` }}
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
