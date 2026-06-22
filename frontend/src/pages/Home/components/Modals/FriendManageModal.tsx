import { User } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/contexts/ToastContext";
import Modal from "@/components/Modal";
import { friendApi } from "@/apis/domains/friend/api";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";

type FriendManageModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function FriendManageModal({
  open,
  onClose,
}: FriendManageModalProps) {
  const { notify } = useToastContext();
  const queryClient = useQueryClient();

  const [removingNickname, setRemovingNickname] = useState<string | null>(null);

  const {
    data: friends = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.friend.all,
    queryFn: friendApi.getList,
    enabled: open,
  });

  const { mutateAsync: removeFriend } = useMutation({
    mutationFn: (nickname: string) => friendApi.removeFriend(nickname),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friend.all });
      notify("친구가 해제되었습니다.", "success");
    },
    onError: (error) => {
      console.log("친구 해제 실패", error);
      notify("친구 해제에 실패했습니다.", "error");
    },
  });

  const handleRemove = async (nickname: string) => {
    const ok = window.confirm(`${nickname} 님을 친구 목록에서 해제할까요?`); //TODO: confirm 모달
    if (!ok) return;
    setRemovingNickname(nickname);
    try {
      await removeFriend(nickname);
    } catch {
      // onError에서 로깅
    } finally {
      setRemovingNickname(null);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header className="flex flex-col items-center text-center">
          <Modal.Title size="sm" />
          <p className="mt-2 text-sm font-medium text-[#D6FDE5]">친구 관리</p>
        </Modal.Header>

        <Modal.Body className="max-h-[min(400px,56vh)] overflow-y-auto pb-10">
          {isLoading && (
            <p className="mt-6 text-center text-sm text-[#D6FDE5]/80">
              불러오는 중…
            </p>
          )}
          {isError && (
            <div className="mt-6 text-center">
              <p className="text-sm text-red-300">
                목록을 불러오지 못했습니다.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-2 text-sm text-[#82C397] underline"
              >
                다시 시도
              </button>
            </div>
          )}
          {!isLoading && !isError && friends.length === 0 && (
            <p className="mt-6 text-center text-sm text-[#D6FDE5]/80">
              등록된 친구가 없습니다.
            </p>
          )}
          {!isLoading && !isError && friends.length > 0 && (
            <ul className="mx-auto mt-3 w-full max-w-[320px]">
              {friends.map((friend) => {
                const isRemoving = removingNickname === friend.nickname;
                return (
                  <li
                    key={friend.nickname}
                    className="flex items-center justify-between py-2.5"
                  >
                    <div className="flex flex-row items-center gap-4">
                      <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#3E7358]">
                        {friend.imageUrl ? (
                          <img
                            src={friend.imageUrl}
                            alt={friend.nickname}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User size={20} className="text-white" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-[#D6FDE5]">
                        {friend.nickname}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(friend.nickname)}
                      disabled={isRemoving}
                      className="shrink-0 rounded-lg border border-red-500/30
                                  px-3 py-1.5 text-xs font-medium text-red-400
                                  transition
                                  hover:bg-red-500/10
                                  hover:border-red-500
                                  hover:text-red-300
                                  active:scale-95
                                  disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRemoving ? "해제 중…" : "친구 해제"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
