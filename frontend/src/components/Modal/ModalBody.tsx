import type { ReactNode } from "react";

type ModalBodyProps = {
  children: ReactNode;
  className?: string;
};

export function ModalBody({ children, className = "" }: ModalBodyProps) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
