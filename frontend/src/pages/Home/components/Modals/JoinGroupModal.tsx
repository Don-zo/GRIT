import BaseModal from "@/components/BaseModal";

type JoinGroupModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function JoinGroupModal({ open, onClose }: JoinGroupModalProps) {
  return (
    <BaseModal open={open} onClose={onClose}>
      <div className="flex w-full flex-col items-center text-center">
        <h1 className="mt-6 text-5xl font-extrabold tracking-wide text-[#82C397]">
          GRIT
        </h1>

        <p className="mt-6 text-lg font-medium text-gray-200">
          초대 코드를 입력해주세요
        </p>

        <div className="mt-10 w-full max-w-[360px]">
          <input
            type="text"
            className="h-14 w-full rounded-xl bg-white px-6 text-lg text-gray-900 outline-none"
            aria-label="초대 코드"
          />
        </div>

        <button
          type="button"
          className="mt-4 mb-8 h-14 w-full max-w-[360px] rounded-xl bg-[#3E7358] text-xl font-semibold text-white hover:bg-emerald-800 transition"
        >
          참여하기
        </button>
      </div>
    </BaseModal>
  );
}
