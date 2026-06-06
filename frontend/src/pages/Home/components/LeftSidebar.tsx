import { useState } from "react";
import { Plus, User, UserCog } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import AddFriendModal from "@/pages/Home/components/Modals/AddFriendModal";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { friendApi } from "@/apis/domains/friend/api";
import { userApi } from "@/apis/domains/user/api";
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
  const [hovered, setHovered] = useState<{
    key: string;
    nickname: string;
    introduction: string;
  } | null>(null);

  const { data: member, isLoading: isMemberLoading } = useQuery({
    queryKey: QUERY_KEYS.member.me,
    queryFn: userApi.get,
  });

  const {
    data: friends = [],
    isLoading: isFriendsLoading,
    isError,
  } = useQuery({
    queryKey: QUERY_KEYS.friend.all,
    queryFn: friendApi.getList,
  });

  const myNickname = member?.nickname?.trim() || member?.email || "나";
  const myIntroduction = member?.introduction?.trim() ?? "";

  const handleFriendManageModalOpen = () => {
    onOpenFriendManage?.();
  };

  const handleAddFriend = () => {
    setIsModalOpen(true);
    onAddFriend?.();
  };

  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLButtonElement>,
    profile: { key: string; nickname: string; introduction: string },
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHovered(profile);
    setTooltipPosition({
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });
  };

  const handleMouseLeave = () => {
    setHovered(null);
    setTooltipPosition(null);
  };

  return (
    <aside className="flex w-17 flex-col items-center bg-[#2E323A] py-5">
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
        {!isMemberLoading && member && (
          <div className="relative flex w-full flex-col items-center">
            <button
              type="button"
              onMouseEnter={(e) =>
                handleMouseEnter(e, {
                  key: "me",
                  nickname: myNickname,
                  introduction: myIntroduction,
                })
              }
              onMouseLeave={handleMouseLeave}
              className="flex w-full flex-col items-center"
              aria-label="내 프로필"
            >
              <div
                className={[
                  "grid h-12 w-12 place-items-center overflow-hidden rounded-2xl",
                  "bg-[#3E7358] shadow-[0_10px_30px_rgba(0,0,0,0.30)]",
                  "ring-2 ring-transparent",
                ].join(" ")}
              >
                {member.imageUrl ? (
                  <img
                    src={member.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={22} className="text-white" />
                )}
              </div>
            </button>
          </div>
        )}

        {!isMemberLoading && member && (
          <div
            className="my-1 w-8 border-t border-white/20"
            aria-hidden="true"
          />
        )}

        <button
          type="button"
          onClick={handleFriendManageModalOpen}
          aria-label="친구 관리"
          className="grid h-12 w-12 place-items-center rounded-2xl bg-[#3E7358] border-none text-white hover:brightness-110 transition"
        >
          <UserCog size={21} />
        </button>

        {!isFriendsLoading &&
          friends.map((f) => {
            const selected = f.nickname === selectedFriendId;

            return (
              <div
                key={f.nickname}
                className="relative flex w-full flex-col items-center"
              >
                <button
                  type="button"
                  onClick={() => onSelectFriend?.(f.nickname)}
                  onMouseEnter={(e) =>
                    handleMouseEnter(e, {
                      key: f.nickname,
                      nickname: f.nickname,
                      introduction: f.introduction,
                    })
                  }
                  onMouseLeave={handleMouseLeave}
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
              </div>
            );
          })}

        {hovered && tooltipPosition && (
          <FriendTooltip
            nickname={hovered.nickname}
            introduction={hovered.introduction}
            top={tooltipPosition.top}
            left={tooltipPosition.left}
          />
        )}
        <button
          type="button"
          onClick={handleAddFriend}
          aria-label="친구 추가"
          className="mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-white hover:bg-[#3E7358] transition"
        >
          <Plus size={24} />
        </button>
      </nav>
    </aside>
  );
}
