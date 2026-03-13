import type { ReactNode } from "react";

type ModalHeaderProps = {
  children: ReactNode;
  className?: string;
};

export function ModalHeader({ children, className = "" }: ModalHeaderProps) {
  return <div className={`px-8 pt-8 ${className}`}>{children}</div>;
}
