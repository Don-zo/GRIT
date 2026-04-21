import type { ReactNode } from "react";

type ModalContentProps = {
  children: ReactNode;
  className?: string;
};

export function ModalContent({ children, className = "" }: ModalContentProps) {
  return (
    <div
      className={`relative w-[500px] max-w-[88vw] rounded-xl bg-[#2B2F36] ${className}`}
    >
      {children}
    </div>
  );
}
