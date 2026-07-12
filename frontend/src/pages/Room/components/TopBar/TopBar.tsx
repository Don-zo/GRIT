import CustomBtn from "@/pages/Room/components/CustomBtn";
import { Pause, Play, ListChecks, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { PATHS } from "@/routes/path";
import { useMember } from "@/hooks/useMember";
import { getDDayDisplayParts } from "@/utils/date";
import { formatStudyGoalAsClock } from "@/utils/studyGoalTime";
import { formatStudySecondsAsClock } from "@/utils/studyTime";

type TopBarProps = {
  isTodoOpen?: boolean;
  onToggleTodo?: () => void;
  displayedStudySeconds?: number;
  isStudyTimerRunning?: boolean;
  isStudyTimerPending?: boolean;
  onToggleStudyTimer?: () => void;
  weeklyStudyTimeGoalSeconds?: number | null;
};

export default function TopBar({
  isTodoOpen = false,
  onToggleTodo,
  displayedStudySeconds = 0,
  isStudyTimerRunning = false,
  isStudyTimerPending = false,
  onToggleStudyTimer,
  weeklyStudyTimeGoalSeconds,
}: TopBarProps) {
  const { data: member } = useMember();

  const { sign: dDaySign, days: dDayDays } = getDDayDisplayParts(
    member?.dDayDate,
  );
  const totalTime =
    weeklyStudyTimeGoalSeconds != null
      ? formatStudySecondsAsClock(weeklyStudyTimeGoalSeconds)
      : formatStudyGoalAsClock(member?.weeklyStudyTimeGoal);

  return (
    <div className="flex items-center justify-between w-full h-20 gap-4 px-6">
      <div className="flex items-center h-full gap-5">
        <Link
          to={PATHS.HOME}
          className="flex items-center h-full font-extrabold text-green-normal text-[50px] cursor-pointer"
          aria-label="홈"
        >
          GRIT
        </Link>

        <div className="flex flex-col justify-center h-full leading-5.5 relative bottom-[2px] text-white">
          <div className="flex gap-1 ml-0.5 text-bodyMd items-center">
            <div>D {dDaySign}</div>
            <div className="text-[#4CAF50]">{dDayDays}</div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleStudyTimer}
              disabled={!onToggleStudyTimer}
              aria-busy={isStudyTimerPending}
              aria-label={
                isStudyTimerRunning ? "공부 타이머 일시정지" : "공부 타이머 시작"
              }
              className="cursor-pointer disabled:cursor-not-allowed"
            >
              {isStudyTimerRunning ? (
                <Pause size={15} className="relative top-[2px]" />
              ) : (
                <Play size={15} className="relative top-[2px]" />
              )}
            </button>
            <div className="flex items-baseline gap-1 leading-none relative top-[1px]">
              <div className="ml-1 font-semibold text-h3">
                {formatStudySecondsAsClock(displayedStudySeconds)}
              </div>
              <div className="text-bodyMd">/ {totalTime}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <CustomBtn
          isToggle
          isActive={isTodoOpen}
          variant="ghost"
          icon={<ListChecks />}
          iconColor="text-green-normal"
          onClick={onToggleTodo}
        />

        <CustomBtn
          isToggle
          variant="ghost"
          icon={<Settings />}
          iconColor="text-green-normal"
        />
      </div>
    </div>
  );
}
