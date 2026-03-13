import Modal from "@/components/Modal";
import { Divider } from "@/components/Divider";
import { FormInput } from "@/components/FormInput";
import { ImageUploader } from "@/components/ImageUploader";

type ProfileSettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function ProfileSettingsModal({
  open,
  onClose,
}: ProfileSettingsModalProps) {
  return (
    <Modal isOpen={open} onClose={onClose}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.CloseButton />

        <Modal.Header className="px-8 pt-8">
          <Modal.Title />
        </Modal.Header>

        <Modal.Body className="px-8 w-full">
          <section className="w-full">
            <h2 className="text-lg font-semibold text-[#D6FDE5]">
              개인 정보 설정
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
              <ImageUploader
                size={180}
                className="shadow-[0_14px_40px_rgba(0,0,0,0.35)]"
              />
              <div className="flex flex-col gap-5">
                <FormInput label="닉네임" type="text" />
                <FormInput label="한 줄 소개" type="text" />
              </div>
            </div>
          </section>

          <Divider />

          <section className="w-full">
            <h3 className="text-lg font-semibold text-[#D6FDE5]">D-day 설정</h3>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormInput label="D-day 날짜" type="date" />
              <FormInput label="D-day 이름" type="text" />
            </div>
          </section>

          <Divider />

          <section className="w-full">
            <div className="flex items-end justify-between">
              <h3 className="text-lg font-semibold text-[#D6FDE5]">
                이번주 목표 공부시간 설정
              </h3>
              <span className="text-sm font-medium text-[#D6FDE5]">
                6시간 30분
              </span>
            </div>

            <div className="mt-4">
              <input
                type="range"
                min={0}
                max={12 * 60}
                defaultValue={390}
                className="w-full accent-[#82C397]"
              />
            </div>
          </section>
        </Modal.Body>

        <Modal.Footer className="px-8 pb-8 flex justify-center">
          <button
            type="button"
            className="h-14 w-full max-w-[360px] rounded-lg bg-[#3E7358] text-lg font-semibold text-[#EDFFF4] hover:bg-emerald-800 transition"
          >
            저장하기
          </button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
