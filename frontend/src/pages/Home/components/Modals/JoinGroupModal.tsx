import { useState } from "react";
import Modal from "@/components/Modal";
import { groupApi } from "@/apis/services/group";

type JoinGroupModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function JoinGroupModal({ open, onClose }: JoinGroupModalProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinNewGroup = async () => {
    const groupCode = inviteCode.trim();

    if (!groupCode) {
      alert("초대 코드 입력 요망");
      return;
    }

    setIsLoading(true);
    try {
      await groupApi.join(groupCode);
      setInviteCode("");
      onClose();
    } catch (error) {
      console.log("그룹 참여 실패", error);
      alert("그룹 참여 실패");
    } finally {
      setIsLoading(false);
    }
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
              disabled={isLoading}
            />
          </div>

          <button
            type="button"
            onClick={handleJoinNewGroup}
            disabled={isLoading || !inviteCode.trim()}
            className="mt-4 h-14 w-full max-w-[360px] rounded-xl bg-[#3E7358] text-lg font-semibold text-white hover:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "참여 중..." : "참여하기"}
          </button>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
