import Modal from "@/components/Modal";

type JoinGroupModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function JoinGroupModal({ open, onClose }: JoinGroupModalProps) {
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
              className="h-14 w-full rounded-xl bg-white px-6 text-lg text-gray-900 outline-none"
              aria-label="초대 코드"
            />
          </div>

          <button
            type="button"
            className="mt-4 h-14 w-full max-w-[360px] rounded-xl bg-[#3E7358] text-lg font-semibold text-white hover:bg-emerald-800 transition"
          >
            참여하기
          </button>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
