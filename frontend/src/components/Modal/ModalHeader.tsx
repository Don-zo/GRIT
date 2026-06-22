import type { ReactNode } from "react";

type ModalHeaderProps = {
  children: ReactNode;
  className?: string;
};

export function ModalHeader({ children, className = "" }: ModalHeaderProps) {
  return <div className={`px-6 pt-6 ${className}`}>{children}</div>;
}
