import { createContext, useContext, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ModalOverlay } from "./ModalOverlay";
import { ModalHeader } from "./ModalHeader";
import { ModalBody } from "./ModalBody";
import { ModalContent } from "./ModalContent";
import { ModalFooter } from "./ModalFooter";
import { ModalCloseButton } from "./ModalCloseButton";
import { ModalTitle } from "./ModalTitle";

type ModalContextType = {
  isOpen: boolean;
  onClose: () => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export const useModalContext = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("모달 내부에서만 사용할 수 있습니다.");
  }
  return context;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <ModalContext.Provider value={{ isOpen, onClose }}>
      <div
        className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </ModalContext.Provider>,
    document.body
  );
}

Modal.Overlay = ModalOverlay;
Modal.Content = ModalContent;
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.CloseButton = ModalCloseButton;
Modal.Title = ModalTitle;

export default Modal;
