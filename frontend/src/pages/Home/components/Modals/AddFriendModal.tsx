import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { friendApi } from "@/apis/domains/friend/api";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type AddFriendModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function AddFriendModal({ open, onClose }: AddFriendModalProps) {
  const [friendNickname, setFriendNickname] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) {
      setFriendNickname("");
      setSubmitted(false);
    }
  }, [open]);

  const { mutateAsync: addFriend, isPending: isAddingFriend } = useMutation({
    mutationFn: (nickname: string) => friendApi.addFriend(nickname),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friend.all });
      console.log("친구 추가 성공"); //TODO: 토스트
    },
    onError: () => {
      console.log("친구 추가 실패"); //TODO: 토스트
    },
  });

  const handleSubmit = async () => {
    const trimmedFriendNickname = friendNickname.trim();
    try {
      if (!trimmedFriendNickname) return;
      await addFriend(trimmedFriendNickname);
      setSubmitted(true);
      onClose();
    } catch (error) {
      console.log("친구 추가 에러", error);
    }
  };

  const isDisabled = submitted || isAddingFriend || !friendNickname.trim();

  return (
    <Modal isOpen={open} onClose={onClose}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header className="flex flex-col items-center text-center">
          <Modal.Title size="lg" />
          <p className="mt-4 text-sm font-medium text-[#D6FDE5]">
            닉네임을 입력해 주세요
          </p>
        </Modal.Header>
        <Modal.Body className="flex flex-col items-center pb-16">
          <div className="mt-6 w-full max-w-[360px]">
            <input
              value={friendNickname}
              onChange={(e) => setFriendNickname(e.target.value)}
              disabled={submitted}
              placeholder=""
              className="h-14 w-full rounded-xl bg-white px-6 text-lg text-gray-900 outline-none disabled:opacity-90"
              aria-label="친구 닉네임"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isDisabled}
            className={[
              "mt-3 h-14 w-full max-w-[360px] rounded-xl text-lg font-semibold transition",
              isDisabled
                ? "bg-[#C9CDCC] text-white cursor-not-allowed"
                : "bg-[#3E7358] text-[#EDFFF4] hover:bg-emerald-800",
            ].join(" ")}
          >
            친구 추가하기
          </button>

          {submitted && (
            <p className="mt-6 text-sm font-medium text-[#D6FDE5]">
              {friendNickname} 님과 친구가 되었습니다
            </p>
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
