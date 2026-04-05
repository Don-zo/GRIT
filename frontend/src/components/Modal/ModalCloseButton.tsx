import { X } from "lucide-react";
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
      className={`cursor-pointer absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white focus:outline-none  ${className}`}
    >
      <X />
    </button>
  );
}
