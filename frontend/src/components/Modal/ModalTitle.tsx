type ModalTitleProps = {
  size?: "sm" | "lg";
  className?: string;
};

export function ModalTitle({ size = "sm", className = "" }: ModalTitleProps) {
  const sizeClasses = {
    sm: "text-3xl",
    lg: "text-5xl mt-6",
  };

  return (
    <h1
      className={`font-extrabold tracking-wide text-[#82C397] ${sizeClasses[size]} ${className}`}
    >
      GRIT
    </h1>
  );
}
