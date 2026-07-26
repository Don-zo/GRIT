import type { ReactNode } from "react";

type ModalTitleProps = {
  size?: "sm" | "lg";
  className?: string;
  children?: ReactNode;
};

export function ModalTitle({
  size = "sm",
  className = "",
  children,
}: ModalTitleProps) {
  const sizeClasses = {
    sm: "text-2xl",
    lg: "mt-4 text-4xl",
  };

  const brandClasses = `font-extrabold tracking-wide text-[#82C397] ${sizeClasses[size]} ${className}`;

  if (children) {
    return (
      <>
        <p aria-hidden="true" className={brandClasses}>
          GRIT
        </p>
        <h2 id="modal-title" className="mt-2 text-sm font-medium text-green-light">
          {children}
        </h2>
      </>
    );
  }

  return (
    <h1 id="modal-title" className={brandClasses}>
      GRIT
    </h1>
  );
}
