type DividerProps = {
  className?: string;
};

export function Divider({ className = "" }: DividerProps) {
  return (
    <div
      className={`my-8 h-px w-full bg-[#82C397]/30 ${className}`}
      role="separator"
      aria-orientation="horizontal"
    />
  );
}
