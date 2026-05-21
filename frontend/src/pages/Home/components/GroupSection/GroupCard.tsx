import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import LiveBadge from "./LiveBadge";
import GroupCodeBadge from "./GroupCodeBadge";
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
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const handleGoToRoom = () => {
    navigate(`/room/${groupCode}`);
  };

  return (
    <div
      onClick={handleGoToRoom}
      className="w-full h-fit bg-gray-dark rounded-2xl shadow-xl/20"
    >
      <div className="group/card flex flex-col overflow-hidden relative aspect-square rounded-2xl w-full bg-gray-semidark">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={name}
            className="absolute inset-0 w-full object-cover"
          />
        )}

        <div className="relative z-10 flex flex-col h-full pointer-events-none">
          <div className="flex items-start p-4">
            {isLive && <LiveBadge />}
            <div className="pointer-events-none ml-auto opacity-0 transition-opacity group-hover/card:opacity-100 group-hover/card:pointer-events-auto focus-within:pointer-events-auto focus-within:opacity-100">
              <GroupCodeBadge groupCode={groupCode} />
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between bg-green-semidark px-5 py-3 text-white">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="truncate text-[15px] leading-4 tracking-tight">
                {name}
              </h3>
              <button
                type="button"
                aria-label="그룹 설정 열기"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSettingsOpen(true);
                }}
                className="pointer-events-none flex h-4 w-4 shrink-0 items-center justify-center opacity-0 transition-opacity group-hover/card:pointer-events-auto group-hover/card:opacity-100"
              >
                <Pencil className="h-4 w-4 text-green-light transition-transform group-hover/card:scale-110" />
              </button>
            </div>
            <span className="flex shrink-0 text-[15px] font-thin opacity-90">
              {memberCount}/{liveMembers}
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
