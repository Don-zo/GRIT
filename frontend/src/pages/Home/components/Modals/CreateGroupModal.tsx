import { useState, useRef } from "react";
import { Copy } from "lucide-react";
import BaseModal from "@/components/BaseModal";
import { createGroup } from "@/apis/services/group";

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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showInviteCode, setShowInviteCode] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleShowCode = () => {
    setShowInviteCode(true);
    setCopied(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    setPreviewImage(null);
    setShowInviteCode(false);
    setInviteCode("");
    onClose();
  };

  return (
    <BaseModal open={open} onClose={onClose}>
      <div className="flex w-full flex-col items-center pb-8">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-wide text-[#82C397]">
            GRIT
          </h1>
        </div>

        <div className="flex justify-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleImageClick}
            className="relative h-40 w-40 overflow-hidden rounded-2xl bg-white shadow-md transition hover:opacity-80"
            aria-label="그룹 이미지 업로드"
          >
            {previewImage ? (
              <img
                src={previewImage}
                alt="그룹 이미지 미리보기"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="absolute inset-0 grid place-items-center text-6xl font-light text-gray-300">
                +
              </span>
            )}
          </button>
        </div>

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
      </div>
    </BaseModal>
  );
}
