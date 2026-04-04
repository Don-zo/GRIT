import { useState } from "react";
import { Plus, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import AddFriendModal from "@/pages/Home/components/Modals/AddFriendModal";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { friendApi } from "@/apis/services/friend";
import type { FriendDetail } from "@/apis/types/friend";

type LeftSidebarProps = {
  onAddFriend?: () => void;
  onSelectFriend?: (nickname: string) => void;
  selectedFriendId?: string;
};

export default function LeftSidebar({
  onAddFriend,
  onSelectFriend,
  selectedFriendId,
}: LeftSidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hovered, setHovered] = useState<FriendDetail | null>(null);

  const {
    data: friends = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: QUERY_KEYS.friend.all,
    queryFn: friendApi.getList,
  });

  const handleAddFriend = () => {
    setIsModalOpen(true);
    onAddFriend?.();
  };

  return (
    <aside className="relative flex w-17 flex-col items-center bg-[#2E323A] py-5">
      <button
        type="button"
        onClick={handleAddFriend}
        aria-label="친구 추가"
        className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#3E7358] text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:brightness-110 transition"
      >
        <Plus size={24} />
      </button>

      <AddFriendModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {isError && (
        <p className="mb-2 px-2 text-center text-[10px] text-red-300">
          친구 목록을 불러오지 못했습니다
        </p>
      )}

      <nav className="flex w-full flex-1 flex-col items-center gap-2 overflow-visible px-2">
        {!isLoading &&
          friends.map((f) => {
            const selected = f.nickname === selectedFriendId;

            return (
              <div
                key={f.nickname}
                className="relative flex w-full flex-col items-center"
                onMouseEnter={() => setHovered(f)}
                onMouseLeave={() => setHovered(null)}
              >
                <button
                  type="button"
                  onClick={() => onSelectFriend?.(f.nickname)}
                  className="flex w-full flex-col items-center"
                  aria-label={`${f.nickname} 프로필`}
                >
                  <div
                    className={[
                      "grid h-12 w-12 place-items-center overflow-hidden rounded-2xl",
                      "bg-[#3E7358] shadow-[0_10px_30px_rgba(0,0,0,0.30)]",
                      "ring-2 ring-transparent",
                      selected ? "ring-[#82C397]" : "",
                    ].join(" ")}
                  >
                    {f.imageUrl ? (
                      <img
                        src={f.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User size={22} className="text-white" />
                    )}
                  </div>
                </button>

                {hovered?.nickname === f.nickname && (
                  <div
                    role="tooltip"
                    className="whitespace-nowrap absolute left-full top-1/2 z-50 ml-4 -translate-y-1/2 rounded-xl border border-white/30  bg-[#1e2228] px-3 py-2 text-center"
                  >
                    <div className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l border-b border-white/30 bg-[#1e2228] " />
                    <p className="text-sm font-semibold text-[#D6FDE5]">
                      {f.nickname}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
      </nav>
    </aside>
  );
}
