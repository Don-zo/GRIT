import React from "react";

interface ToggleBtnProps {
  checked: boolean;
  onChange: (v: boolean) => void;

  /** circle 안에 아이콘 */
  circleIconOn?: React.ReactNode;
  circleIconOff?: React.ReactNode;

  /** 트랙 안 텍스트 */
  labelOn?: string;
  labelOff?: string;
}

export default function ToggleBtn({
  checked,
  onChange,
  circleIconOn,
  circleIconOff,
  labelOn,
  labelOff,
}: ToggleBtnProps) {
  const isLabelMode = !!labelOn || !!labelOff || !!circleIconOn || !!circleIconOff;

  const circleIcon = checked ? circleIconOn : circleIconOff;
  const label = checked ? labelOn : labelOff;

  /* ==========================================================
     1) LABEL + CIRCLE ICON MODE
     ========================================================== */
  if (isLabelMode) {
    return (
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="
          relative inline-flex items-center rounded-full
          h-7 px-3 bg-green-semidark text-caption font-extralight text-white
          min-w-[84px] transition-all duration-300 overflow-hidden
        "
      >
        {/* ================= 동그라미 ================= */}
        <span
          className={`
            absolute top-1 left-1 w-5 h-5 rounded-full bg-white
            flex items-center justify-center text-green-dark
            transition-transform duration-300
            ${checked ? "translate-x-14" : "translate-x-0"}
          `}
        >
          {circleIcon}
        </span>

        {/* ================= 부드러운 LABEL ================= */}
        {label && (
          <span
            className={`
              absolute inset-0 flex items-center 
              transition-all duration-300 ease-out
              ${checked 
                ? "justify-start pl-6 opacity-100 translate-x-0" 
                : "justify-end pr-3 opacity-100 translate-x-0"
              }
            `}
          >
            {/* Fade, slight slide */}
            <span
              className={`
                transition-all duration-300 ease-out
                ${checked 
                  ? "opacity-100 translate-x-0" 
                  : "opacity-100 translate-x-0"
                }
              `}
            >
              {label}
            </span>
          </span>
        )}
      </button>
    );
  }

  /* ==========================================================
     2) BASIC MODE
     ========================================================== */
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="
        relative inline-flex items-center rounded-full
        h-7 w-[52px] bg-green-semidark
        transition-all duration-300
      "
    >
      <span
        className={`
          absolute left-1 top-1 w-5 h-5 rounded-full bg-white
          transition-transform duration-300
          ${checked ? "translate-x-6" : "translate-x-0"}
        `}
      />
    </button>
  );
}