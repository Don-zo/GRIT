import { useEffect, useState } from "react";
import BaseModal from "@/components/BaseModal";

type AddFriendModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function AddFriendModal({ open, onClose }: AddFriendModalProps) {
  const [friendId, setFriendId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) {
      setFriendId("");
      setSubmitted(false);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!friendId.trim()) return;
    setSubmitted(true);
  };

  const isDisabled = submitted || !friendId.trim();

  return (
    <BaseModal open={open} onClose={onClose}>
      <div className="flex w-full flex-col items-center text-center pb-8">
        <h1 className="mt-6 text-5xl font-extrabold tracking-wide text-[#82C397]">
          GRIT
        </h1>

        <p className="mt-4 text-sm font-medium text-[#D6FDE5]">
          아이디를 입력해 주세요
        </p>

        <div className="mt-12 w-full max-w-[360px]">
          <input
            value={friendId}
            onChange={(e) => setFriendId(e.target.value)}
            disabled={submitted}
            placeholder=""
            className="h-14 w-full rounded-xl bg-white px-6 text-lg text-gray-900 outline-none disabled:opacity-90"
            aria-label="친구 아이디"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isDisabled}
          className={[
            "mt-4 h-14 w-full max-w-[360px] rounded-xl text-lg font-semibold transition",
            isDisabled
              ? "bg-[#C9CDCC] text-white cursor-not-allowed"
              : "bg-[#3E7358] text-[#EDFFF4] hover:bg-emerald-800",
          ].join(" ")}
        >
          친구 추가하기
        </button>

        {submitted && (
          <p className="mt-6 text-sm font-medium text-[#D6FDE5]">
            김윤영 님과 친구가 되었습니다
          </p>
        )}
      </div>
    </BaseModal>
  );
}
