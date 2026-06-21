import type { ReactNode } from "react";

type ModalFooterProps = {
  children: ReactNode;
  className?: string;
};

export function ModalFooter({ children, className = "" }: ModalFooterProps) {
  return <div className={`px-8 pb-8 ${className}`}>{children}</div>;
}
