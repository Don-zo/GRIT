import { useState } from "react";
import { Plus, User } from "lucide-react";
import AddFriendModal from "@/pages/Home/components/Modals/AddFriendModal";

type Friend = {
  id: string;
  name: string;
  avatarUrl?: string;
};

type LeftSidebarProps = {
  friends?: Friend[];
  onAddFriend?: () => void;
  onSelectFriend?: (friendId: string) => void;
  selectedFriendId?: string;
};

const defaultFriends: Friend[] = [
  { id: "1", name: "김철수" },
];

export default function LeftSidebar({
  friends = defaultFriends,
  onAddFriend,
  onSelectFriend,
  selectedFriendId,
}: LeftSidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddFriend = () => {
    setIsModalOpen(true);
    onAddFriend?.();
  };

  return (
    <aside className="flex w-20 flex-col items-center bg-[#2E323A] py-5">
      <button
        type="button"
        onClick={handleAddFriend}
        aria-label="친구 초대"
        className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#3E7358] text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:brightness-110 transition"
      >
        <Plus size={24} />
      </button>

      <AddFriendModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <nav className="flex w-full flex-1 flex-col items-center gap-4 overflow-y-auto px-2 pb-6">
        {friends.map((f) => {
          const selected = f.id === selectedFriendId;

          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelectFriend?.(f.id)}
              className="flex w-full flex-col items-center"
              aria-label={`${f.name} 프로필`}
            >
              <div
                className={[
                  "grid h-12 w-12 place-items-center rounded-2xl",
                  "bg-[#3E7358] shadow-[0_10px_30px_rgba(0,0,0,0.30)]",
                  "ring-2 ring-transparent",
                  selected ? "ring-[#82C397]" : "",
                ].join(" ")}
              >
                {f.avatarUrl ? (
                  <img
                    src={f.avatarUrl}
                    alt={f.name}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  <User size={22} className="text-white" />
                )}
              </div>

              <span className="mt-1 text-[10px] font-medium text-[#D6FDE5]/90">
                {f.name}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
