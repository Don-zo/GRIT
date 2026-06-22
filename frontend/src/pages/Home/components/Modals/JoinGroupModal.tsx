import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useToastContext } from "@/contexts/ToastContext";
import Modal from "@/components/Modal";
import { groupApi } from "@/apis/domains/group/api";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";

type JoinGroupModalProps = {
  open: boolean;
  onClose: () => void;
};

const GROUP_FULL_ERROR_MESSAGE = "그룹의 최대 가입 가능 인원은 6명입니다";

export default function JoinGroupModal({ open, onClose }: JoinGroupModalProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { notify } = useToastContext();
  const queryClient = useQueryClient();

  const { mutate: joinGroup, isPending } = useMutation({
    mutationFn: (groupCode: string) => groupApi.join(groupCode),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups.my });
      setInviteCode("");
      setErrorMessage("");
      onClose();
      notify("그룹 참여가 완료되었습니다", "success");
    },
    onError: (error) => {
      console.log("그룹 참여 실패", error);

      if (isAxiosError(error) && error.response?.status === 409) {
        setErrorMessage(GROUP_FULL_ERROR_MESSAGE);
        return;
      }

      notify("그룹 참여에 실패했습니다. 다시 시도해주세요.", "error");
    },
  });

  const handleJoinNewGroup = () => {
    const groupCode = inviteCode.trim();
    if (!groupCode) {
      return;
    }
    setErrorMessage("");
    joinGroup(groupCode);
  };

  const handleClose = () => {
    setInviteCode("");
    setErrorMessage("");
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={handleClose}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header className="flex flex-col items-center text-center">
          <Modal.Title size="lg" />
          <p className="mt-4 text-sm font-medium text-gray-200">
            초대 코드를 입력해주세요
          </p>
        </Modal.Header>

        <Modal.Body className="flex flex-col items-center pb-12">
          <div className="mt-6 w-full max-w-[320px]">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value);
                setErrorMessage("");
              }}
              className="h-12 w-full rounded-xl bg-white px-4 text-base text-gray-900 outline-none"
              aria-label="초대 코드"
              placeholder="초대 코드를 입력하세요"
              disabled={isPending}
            />
          </div>

          <button
            type="button"
            onClick={handleJoinNewGroup}
            disabled={isPending || !inviteCode.trim()}
            className="mt-3 h-12 w-full max-w-[320px] rounded-xl bg-[#3E7358] text-base font-semibold text-white hover:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "참여 중..." : "참여하기"}
          </button>

          {errorMessage && (
            <p className="mt-4 text-center text-sm font-medium text-red-400">
              {errorMessage}
            </p>
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
