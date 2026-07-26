interface CustomCheckboxProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  labelClassName?: string;
  ariaLabel?: string;
  size?: "md" | "sm";
}

export default function CustomCheckbox({
  checked,
  onChange,
  label,
  labelClassName = "text-gray-darkest",
  ariaLabel,
  size = "md",
}: CustomCheckboxProps) {
  const isSm = size === "sm";
  const boxClass = isSm
    ? "h-4 w-4 rounded-full border-[0.5px] border-green-semidark bg-white"
    : "h-5 w-5 rounded-full border-[0.5px] border-green-semidark bg-white";
  const svgSize = isSm ? 14 : 18;

  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-label={ariaLabel}
      className="flex cursor-pointer select-none items-center gap-2"
    >
      <div
        className={`
          flex items-center justify-center
          ${boxClass}
          transition-all duration-200 ease-out
          ${checked ? "scale-110" : "scale-100"}
        `}
      >
        <svg
          width={svgSize}
          height={svgSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3E7358"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`
            transition-opacity duration-200 ease-out
            ${checked ? "opacity-100" : "opacity-0"}
          `}
        >
          <polyline points="6 13 10 17 18 7" />
        </svg>
      </div>

      {label && (
        <span
          className={`
            text-bodyMd transition-all duration-200 ease-out
            ${labelClassName}
            ${checked ? "opacity-40 line-through decoration-current" : "opacity-100"}
          `}
        >
          {label}
        </span>
      )}
    </button>
  );
}