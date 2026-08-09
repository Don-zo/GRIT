import { useMember } from "@/hooks/useMember";
import { useStudyTime } from "@/hooks/useStudyTime";
import { formatStudyGoalDisplay } from "@/utils/studyGoalTime";
import {
  getDisplayedStudySeconds,
  getStudyTimeProgressPercent,
} from "@/utils/studyTime";

export default function WeeklyStudyGoalCard() {
  const { data: member, isLoading } = useMember();
  const { data: studyTime } = useStudyTime();

  const goalTimeLabel = formatStudyGoalDisplay(member?.weeklyStudyTimeGoal);
  const studyProgressPercent = getStudyTimeProgressPercent(
    getDisplayedStudySeconds(studyTime),
    studyTime?.weeklyStudyTimeGoalSeconds,
  );

  return (
    <div className="w-full rounded-2xl bg-[#2E3039] p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="shrink-0 text-bodyMd leading-bodyMd text-white">
          이번 주 목표 공부시간
        </span>
        <span className="break-keep text-right text-bodyMd leading-bodyMd text-white">
          {isLoading ? "…" : goalTimeLabel}
        </span>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-full bg-gray-semidark">
        <div
          className="h-full rounded-full bg-green-normal transition-all duration-300"
          style={{ width: `${studyProgressPercent}%` }}
        />
      </div>
    </div>
  );
}
