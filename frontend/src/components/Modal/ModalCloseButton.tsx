import { useModalContext } from "./index";

type ModalCloseButtonProps = {
  className?: string;
};

export function ModalCloseButton({ className = "" }: ModalCloseButtonProps) {
  const { onClose } = useModalContext();
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="닫기"
      className={`absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-white/30 ${className}`}
    >
      <span className="text-2xl leading-none">X</span>
    </button>
  );
}
