import { useState } from "react";
import { Pencil } from "lucide-react";
import LiveBadge from "./LiveBadge";
import GroupSettingsModal from "@/pages/Home/components/Modals/GroupSettingsModal";
import type { Group } from "@/apis/domains/group/type";

type GroupCardProps = Group & {
  isLive?: boolean;
  liveMembers?: number;
};

export default function GroupCard({
  groupCode,
  name,
  imageUrl,
  memberCount,
  isLive = true,
  liveMembers = 6,
}: GroupCardProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="w-full h-fit bg-gray-dark rounded-2xl shadow-xl/20">
      {/* 그룹 사진 (없으면 회색 배경) */}
      <div className="flex flex-col overflow-hidden relative aspect-square rounded-2xl w-full bg-gray-semidark">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={name}
            className="absolute inset-0 w-full object-cover"
          />
        )}

        <div className="relative z-10 flex flex-col h-full pointer-events-none">
          {/* 라이브 뱃지 */}
          <div className="flex justify-between p-4">
            {isLive ? <LiveBadge /> : <div />}
          </div>

          {/* 이름 & 설정 & 인원 */}
          <div className="mt-auto flex items-center justify-between bg-green-semidark px-5 py-3 text-white">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="truncate text-[15px] tracking-tight">{name}</h3>
              <button
                type="button"
                aria-label="그룹 설정 열기"
                onClick={() => setIsSettingsOpen(true)}
                className="pointer-events-auto shrink-0 cursor-pointer transition-transform hover:scale-110"
              >
                <Pencil className="h-4 w-4 text-green-light" />
              </button>
            </div>
            <span className="flex shrink-0 text-[15px] font-thin opacity-90">
              {liveMembers}/{memberCount}
            </span>
          </div>
        </div>
      </div>

      <GroupSettingsModal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        groupCode={groupCode}
        initialName={name}
        initialImage={imageUrl}
      />
    </div>
  );
}
