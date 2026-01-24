import { useState, useRef } from "react";
import BaseModal from "@/components/BaseModal";
import { updateGroup } from "@/apis/services/group";

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
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialImage || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
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
        imageUrl:
          previewImage ||
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
    <BaseModal open={open} onClose={onClose}>
      <div className="flex w-full flex-col items-center pb-8">
        {/* 상단 로고 */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-wide text-[#82C397]">
            GRIT
          </h1>
        </div>

        {/* 이미지 업로드 박스 */}
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
      </div>
    </BaseModal>
  );
}
