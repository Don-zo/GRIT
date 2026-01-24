import { useState } from "react";
import { Settings } from "lucide-react";
import LiveBadge from "./LiveBadge";
import GroupSettingsModal from "@/pages/Home/components/Modals/GroupSettingsModal";
import type { Group } from "@/types/group";

export default function GroupCard({
  id,
  groupName,
  image,
  isLive,
  totalMembers,
  liveMembers,
}: Group) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="w-full h-fit bg-gray-dark rounded-3xl shadow-xl/20">
      {/* 그룹 사진 (없으면 회색 배경) */}
      <div className="flex flex-col overflow-hidden relative aspect-square rounded-3xl w-full bg-gray-semidark">
        {image && (
          <img
            src={image}
            alt={groupName}
            className="absolute inset-0 w-full object-cover"
          />
        )}

        <div className="relative z-10 flex flex-col h-full pointer-events-none">
          {/* 라이브 뱃지 & 설정 아이콘 */}
          <div className="flex justify-between p-4">
            {isLive ? <LiveBadge /> : <div />}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="transition-transform hover:scale-110 pointer-events-auto"
            >
              <Settings className="h-8 w-8 text-green-light" />
            </button>
          </div>

          {/* 이름 & 인원 */}
          <div className="mt-auto flex items-center justify-between px-7 py-5 text-white bg-green-semidark">
            <h3 className="truncate text-[17px] tracking-tight">{groupName}</h3>
            <span className="flex shrink-0 text-[17px] font-thin opacity-90">
              {liveMembers}/{totalMembers}
            </span>
          </div>
        </div>
      </div>

      <GroupSettingsModal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        groupId={id}
        initialName={groupName}
        initialImage={image}
      />
    </div>
  );
}
