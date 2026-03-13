import { useState } from "react";
import { Copy } from "lucide-react";
import Modal from "@/components/Modal";
import { createGroup } from "@/apis/services/group";
import { ImageUploader } from "@/components/ImageUploader";

type CreateGroupModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function CreateGroupModal({
  open,
  onClose,
}: CreateGroupModalProps) {
  //group input 값
  const [groupName, setGroupName] = useState("");

  const [showInviteCode, setShowInviteCode] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleShowCode = () => {
    setShowInviteCode(true);
    setCopied(false);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert("그룹 이름을 입력해주세요");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createGroup(2, {
        name: groupName,
        imageUrl:
          "https://grit-s3.ap-northeast-2.amazonaws.com/profile/default.png",
      });

      console.log("그룹 생성 성공:", result);

      setInviteCode(result.inviteCode);
      setShowInviteCode(true);
    } catch (err) {
      console.error("그룹 생성 실패:", err);
      alert("그룹 생성에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  //모달 닫을 때 전체 초기화
  const handleClose = () => {
    setGroupName("");
    setShowInviteCode(false);
    setInviteCode("");
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={handleClose}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.CloseButton />

        <Modal.Header className="px-8 pt-8 flex flex-col items-center">
          <Modal.Title />
        </Modal.Header>

        <Modal.Body className="px-8 flex flex-col items-center pb-8">
          <ImageUploader size={160} />
          <div className="mx-auto mt-10 w-full max-w-[360px]">
            <label className="mb-2 block text-sm font-medium text-[#D6FDE5]">
              그룹 이름
            </label>

            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="h-14 w-full rounded-lg bg-white px-4 text-gray-900 outline-none"
              placeholder="그룹 이름을 입력하세요"
            />

            <button
              type="button"
              onClick={handleCreateGroup}
              disabled={isLoading || !groupName.trim()}
              className="mt-4 h-14 w-full rounded-lg bg-[#3E7358] text-lg font-semibold text-[#EDFFF4] hover:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "생성 중..." : "그룹 생성하기"}
            </button>

            <p className="mt-6 text-center text-xs text-[#D6FDE5]">
              그룹에 참여 가능한 인원은 최대 8명입니다.
            </p>
          </div>

          {showInviteCode && (
            <div className="mt-6 flex items-center gap-1 rounded-xl bg-white px-4 py-2">
              <span className="text-sm font-bold text-[#3E7358]">
                {inviteCode}
              </span>

              <button
                type="button"
                onClick={handleCopy}
                className="grid h-8 w-8 place-items-center rounded-lg cursor-pointer"
                aria-label="초대코드 복사"
                title="복사"
              >
                <Copy size={18} className="text-[#3E7358]" />
              </button>
            </div>
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
