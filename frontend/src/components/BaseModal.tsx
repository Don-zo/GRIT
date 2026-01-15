type BaseModalProps = {
  open: boolean;
  onClose: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
};

export default function BaseModal({ open, onClose, children }: BaseModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* 모달 뒤 검정 배경 - 오버레이 */}
      <button
        type="button"
        aria-label="Close modal overlay"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <div className="relative w-[600px] max-w-[90vw] rounded-3xl bg-[#2B2F36] shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          <span className="text-2xl leading-none">X</span>
        </button>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
