import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "@/components/Modal";
import { groupApi } from "@/apis/services/group";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";

type JoinGroupModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function JoinGroupModal({ open, onClose }: JoinGroupModalProps) {
  const [inviteCode, setInviteCode] = useState("");
  const queryClient = useQueryClient();

  const { mutateAsync: joinGroup, isPending } = useMutation({
    mutationFn: (groupCode: string) => groupApi.join(groupCode),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups.my });
      setInviteCode("");
      onClose();
    },
    onError: (error) => {
      console.log("그룹 참여 실패", error);
    },
  });

  const handleJoinNewGroup = async () => {
    const groupCode = inviteCode.trim();
    if (!groupCode) {
      return;
    }
    await joinGroup(groupCode);
  };

  return (
    <Modal isOpen={open} onClose={onClose}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header className="px-8 pt-8 flex flex-col items-center text-center">
          <Modal.Title size="lg" />
          <p className="mt-6 text-md font-medium text-gray-200">
            초대 코드를 입력해주세요
          </p>
        </Modal.Header>

        <Modal.Body className="px-8 pb-16 flex flex-col items-center">
          <div className="mt-10 w-full max-w-[360px]">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="h-14 w-full rounded-xl bg-white px-6 text-lg text-gray-900 outline-none"
              aria-label="초대 코드"
              placeholder="초대 코드를 입력하세요"
              disabled={isPending}
            />
          </div>

          <button
            type="button"
            onClick={handleJoinNewGroup}
            disabled={isPending || !inviteCode.trim()}
            className="mt-4 h-14 w-full max-w-[360px] rounded-xl bg-[#3E7358] text-lg font-semibold text-white hover:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "참여 중..." : "참여하기"}
          </button>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
