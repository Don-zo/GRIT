import { useModalContext } from "./index";

type ModalOverlayProps = {
  className?: string;
};

export function ModalOverlay({ className = "" }: ModalOverlayProps) {
  const { onClose } = useModalContext();

  return (
    <button
      type="button"
      aria-label="오버레이 닫기"
      className={`absolute inset-0 bg-black/80 ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    />
  );
}
