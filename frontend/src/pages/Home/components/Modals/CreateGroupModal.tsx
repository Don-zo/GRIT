import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import Modal from "@/components/Modal";
import { groupApi } from "@/apis/services/group";
import { ImageUploader } from "@/components/ImageUploader";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";

type CreateGroupModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function CreateGroupModal({
  open,
  onClose,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [_, setCopied] = useState(false);

  const queryClient = useQueryClient();

  const { mutateAsync: createNewGroup, isPending } = useMutation({
    mutationFn: async () => {
      const trimmedGroupName = groupName.trim();

      if (imageFile) {
        const { uploadUrl, fileName } = await groupApi.imageUpload();
        await groupApi.putImage(uploadUrl, imageFile);

        return groupApi.create({
          name: trimmedGroupName,
          imageName: fileName,
        });
      }

      return groupApi.create({
        name: trimmedGroupName,
      });
    },
    onSuccess: async (newGroup) => {
      setInviteCode(newGroup.groupCode);
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups.my });
    },
    onError: (error) => {
      console.error("그룹 생성 실패", error);
    },
  });

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      alert("그룹 이름을 입력해주세요");
      return;
    }

    return createNewGroup();
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

  const handleClose = () => {
    setGroupName("");
    setImageFile(null);
    setInviteCode("");
    setCopied(false);
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
          <ImageUploader size={160} onImageChange={setImageFile} />
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
              disabled={isPending || !groupName.trim()}
              className="mt-4 h-14 w-full rounded-lg bg-[#3E7358] text-lg font-semibold text-[#EDFFF4] hover:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "생성 중..." : "그룹 생성하기"}
            </button>

            <p className="mt-6 text-center text-xs text-[#D6FDE5]">
              그룹에 참여 가능한 인원은 최대 8명입니다.
            </p>
          </div>

          {inviteCode && (
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
