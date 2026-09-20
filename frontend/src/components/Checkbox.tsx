interface CustomCheckboxProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  ariaLabel?: string;
  size?: "md" | "sm";
}

export default function CustomCheckbox({
  checked,
  onChange,
  label,
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
      className="flex min-w-0 flex-1 cursor-pointer select-none items-start gap-2"
    >
      <div
        className={`
          flex shrink-0 items-center justify-center mt-0.5
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

      {/* 라벨 */}
      {label && (
        <span
          className={`
            min-w-0 break-words text-left transition-all duration-200 ease-out text-bodyMd
            ${
              checked
                ? "text-gray-semidark line-through decoration-gray-semidark/60"
                : "text-gray-darkest"
            }
          `}
          style={{
            fontFamily:
              '"Pretendard Variable", Pretendard, -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          {label}
        </span>
      )}
    </button>
  );
}