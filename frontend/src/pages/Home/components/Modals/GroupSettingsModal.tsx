import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useToastContext } from "@/contexts/ToastContext";
import Modal from "@/components/Modal";
import { groupApi } from "@/apis/domains/group/api";
import { fileApi } from "@/apis/domains/file/api";
import { ImageUploader } from "@/components/ImageUploader";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";

type GroupSettingsModalProps = {
  open: boolean;
  onClose: () => void;
  groupCode: string;
  initialName?: string;
  initialImage?: string;
};

export default function GroupSettingsModal({
  open,
  onClose,
  groupCode,
  initialName = "",
  initialImage = "",
}: GroupSettingsModalProps) {
  const [baseGroupName, setBaseGroupName] = useState(initialName);
  const [baseGroupImage, setBaseGroupImage] = useState(initialImage);
  const [groupName, setGroupName] = useState(initialName);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { notify } = useToastContext();

  const { data: groupInfo } = useQuery({
    queryKey: QUERY_KEYS.groups.detail(groupCode),
    queryFn: () => groupApi.getMyGroup(groupCode),
    enabled: open && !!groupCode,
  });

  useEffect(() => {
    if (!open || !groupInfo) return;

    setBaseGroupName(groupInfo.name);
    setBaseGroupImage(groupInfo.imageUrl ?? "");
    setGroupName(groupInfo.name);
    setImageFile(null);
  }, [open, groupInfo]);

  const handleClose = () => {
    setGroupName(baseGroupName);
    setImageFile(null);
    onClose();
  };

  const queryClient = useQueryClient();

  const { mutateAsync: updateGroup, isPending: isGroupInfoSaving } =
    useMutation({
      mutationFn: async () => {
        const trimmedGroupName = groupName.trim();
        if (imageFile) {
          const imageName = await fileApi.uploadFileWithPresignedInfo(
            imageFile,
            groupApi.getPresignedInfo,
          );
          return groupApi.update(groupCode, {
            name: trimmedGroupName,
            imageName,
          });
        }
        return groupApi.update(groupCode, {
          name: trimmedGroupName,
        });
      },

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.groups.detail(groupCode),
        });
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.groups.my,
        });
        handleClose();
        notify("그룹 정보가 수정되었습니다", "success");
      },

      onError: (error) => {
        console.error("그룹 정보 수정 실패:", error);
        notify("그룹 정보 수정에 실패했습니다. 다시 시도해주세요", "error");
      },
    });

  const handleSave = async () => {
    if (!groupName.trim()) {
      notify("그룹 이름을 입력해주세요", "error");
      return;
    }
    await updateGroup();
  };

  const { mutateAsync: signoutGroup, isPending: isGroupSignoutPending } =
    useMutation({
      mutationFn: async () => {
        await groupApi.signout(groupCode);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups.my });
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.groups.detail(groupCode),
        });
        handleClose();
      },
      onError: (error) => {
        console.error("그룹 탈퇴 실패:", error);
      },
    });

  const handleSignoutGroup = async () => {
    const ok = window.confirm("정말 이 그룹에서 탈퇴하시겠어요?");
    if (!ok) return;
    await signoutGroup();
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
          <ImageUploader
            size={160}
            initialImage={baseGroupImage}
            onImageChange={(file) => setImageFile(file)}
          />

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

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isGroupInfoSaving || isGroupSignoutPending}
                className="h-14 w-full rounded-lg bg-[#3E7358] text-lg font-semibold text-[#EDFFF4] hover:bg-emerald-800 transition disabled:opacity-50"
              >
                {isGroupInfoSaving ? "저장 중..." : "그룹 정보 저장하기"}
              </button>
              <button
                type="button"
                onClick={handleSignoutGroup}
                disabled={isGroupInfoSaving || isGroupSignoutPending}
                className="h-14 w-full rounded-lg bg-red-600 text-lg font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {isGroupSignoutPending ? "탈퇴 중..." : "탈퇴하기"}
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-[#D6FDE5]">
              그룹에 참여 가능한 인원은 최대 8명입니다.
            </p>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
