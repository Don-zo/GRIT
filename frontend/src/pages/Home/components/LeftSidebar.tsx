import { useState } from "react";
import { Plus, User, UserCog } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import AddFriendModal from "@/pages/Home/components/Modals/AddFriendModal";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { friendApi } from "@/apis/domains/friend/api";
import type { FriendDetail } from "@/apis/domains/friend/type";
import FriendTooltip from "./FriendTooltip";

type LeftSidebarProps = {
  onOpenFriendManage?: () => void;
  onAddFriend?: () => void;
  onSelectFriend?: (nickname: string) => void;
  selectedFriendId?: string;
};

export default function LeftSidebar({
  onAddFriend,
  onSelectFriend,
  selectedFriendId,
  onOpenFriendManage,
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

  const handleFriendManageModalOpen = () => {
    onOpenFriendManage?.();
  };

  const handleAddFriend = () => {
    setIsModalOpen(true);
    onAddFriend?.();
  };

  return (
    <aside className="relative flex w-17 flex-col items-center bg-[#2E323A] py-5">
      <button
        type="button"
        onClick={handleFriendManageModalOpen}
        aria-label="친구 관리"
        className="mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-[#3E7358] border-none text-white hover:brightness-110 transition"
      >
        <UserCog size={21} />
      </button>
      <button
        type="button"
        onClick={handleAddFriend}
        aria-label="친구 추가"
        className="mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-[#3E7358] text-white hover:brightness-110 transition"
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
                  <FriendTooltip
                    nickname={f.nickname}
                    introduction={f.introduction}
                  />
                )}
              </div>
            );
          })}
      </nav>
    </aside>
  );
}
