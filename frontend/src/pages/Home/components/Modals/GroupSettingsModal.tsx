import BaseModal from "@/components/BaseModal";

type GroupSettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function GroupSettingsModal({
  open,
  onClose,
}: GroupSettingsModalProps) {
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
          <button
            type="button"
            className="relative h-40 w-40 overflow-hidden rounded-2xl bg-white shadow-md"
            aria-label="그룹 이미지 업로드"
          >
            <span className="absolute inset-0 grid place-items-center text-6xl font-light text-gray-300">
              +
            </span>
          </button>
        </div>

        {/* 폼 */}
        <div className="mx-auto mt-10 w-full max-w-[360px]">
          <label className="mb-2 block text-sm font-medium text-[#D6FDE5]">
            그룹 이름
          </label>

          <input
            type="text"
            className="h-14 w-full rounded-lg bg-white px-4 text-gray-900 outline-none"
          />

          <button
            type="button"
            className="mt-4 h-14 w-full rounded-lg bg-[#3E7358] text-lg font-semibold text-[#EDFFF4] hover:bg-emerald-800 transition"
          >
            그룹 정보 저장하기
          </button>

          <p className="mt-6 text-center text-xs text-[#D6FDE5]">
            그룹에 참여 가능한 인원은 최대 8명입니다.
          </p>
        </div>
      </div>
    </BaseModal>
  );
}
