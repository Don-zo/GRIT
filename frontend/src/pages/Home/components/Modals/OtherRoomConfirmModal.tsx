import Modal from "@/components/Modal";

type OtherRoomConfirmModalProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
};

export default function OtherRoomConfirmModal({
  open,
  onConfirm,
  onCancel,
  isPending = false,
}: OtherRoomConfirmModalProps) {
  return (
    <Modal isOpen={open} onClose={onCancel}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header className="flex flex-col items-center text-center">
          <Modal.Title size="lg" />
          <p className="mt-4 text-md font-medium text-[#D6FDE5]">
            이미 다른 방에 참여 중입니다.
          </p>
        </Modal.Header>

        <Modal.Body className="flex flex-col items-center pb-12">
          <p className="mt-2 text-center text-sm font-medium text-gray-200">
            기존 방에서 나간 뒤 이 방에 입장하시겠습니까?
          </p>

          <div className="flex justify-center items-center w-3/4 gap-3 mt-6">
            <button
                type="button"
                onClick={onCancel}
                disabled={isPending}
                className="h-12 w-full max-w-[320px] rounded-xl bg-white/10 text-base font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                취소
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className="h-12 w-full max-w-[320px] rounded-xl bg-[#3E7358] text-base font-semibold text-[#EDFFF4] transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "이동 중..." : "확인"}
            </button>

          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
