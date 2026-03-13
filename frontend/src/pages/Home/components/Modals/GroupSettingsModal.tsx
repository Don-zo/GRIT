import { useState } from "react";
import Modal from "@/components/Modal";
import { updateGroup } from "@/apis/services/group";
import { ImageUploader } from "@/components/ImageUploader";

type GroupSettingsModalProps = {
  open: boolean;
  onClose: () => void;
  groupId: number;
  initialName?: string; //기존 그룹 이름
  initialImage?: string; //기존 그룹 이미지
};

export default function GroupSettingsModal({
  open,
  onClose,
  groupId,
  initialName = "",
  initialImage = "",
}: GroupSettingsModalProps) {
  const [groupName, setGroupName] = useState(initialName);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  //저장 버튼 핸들러
  const handleSave = async () => {
    if (!groupName.trim()) {
      alert("그룹 이름을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await updateGroup(groupId, 1, {
        name: groupName,
        imageUrl: imageFile
          ? "업로드된_URL"
          : initialImage ||
            "https://grit-s3.ap-northeast-2.amazonaws.com/profile/default.png",
      });

      console.log("그룹 정보 수정 성공", response);
      alert("그룹 정보 수정 성공"); //나중에 toast로 변경
      onClose();
    } catch (error) {
      console.error("그룹 정보 수정 실패:", error);
      alert("그룹 정보 수정 실패");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.CloseButton />

        <Modal.Header className="px-8 pt-8 flex flex-col items-center">
          <Modal.Title />
        </Modal.Header>

        <Modal.Body className="px-8 flex flex-col items-center pb-8">
          <ImageUploader
            size={160}
            initialImage={initialImage}
            onImageChange={(file) => setImageFile(file)}
          />

          {/* 폼 */}
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
              onClick={handleSave}
              disabled={isLoading}
              className="mt-4 h-14 w-full rounded-lg bg-[#3E7358] text-lg font-semibold text-[#EDFFF4] hover:bg-emerald-800 transition disabled:opacity-50"
            >
              {isLoading ? "저장 중..." : "그룹 정보 저장하기"}
            </button>

            <p className="mt-6 text-center text-xs text-[#D6FDE5]">
              그룹에 참여 가능한 인원은 최대 8명입니다.
            </p>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
