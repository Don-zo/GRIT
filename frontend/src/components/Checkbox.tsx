interface CustomCheckboxProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

export default function CustomCheckbox({
  checked,
  onChange,
  label,
}: CustomCheckboxProps) {
  const weight = checked ? 700 : 400;

  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 cursor-pointer select-none"
    >
      {/* 동그라미 체크 박스 */}
      <div
        className={`
          w-5 h-5 rounded-full flex items-center justify-center
          border-[0.5px] border-green-semidark bg-white
          transition-all duration-200 ease-out
          ${checked ? "scale-110" : "scale-100"}
        `}
      >
        <svg
          width="18"
          height="18"
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
          className="transition-all duration-200 ease-out text-bodyMd text-gray-darkest"
          style={{
            fontFamily:
              '"Pretendard Variable", Pretendard, -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontVariationSettings: `"wght" ${weight}`,
            fontWeight: weight,
          }}
        >
          {label}
        </span>
      )}
    </button>
  );
}