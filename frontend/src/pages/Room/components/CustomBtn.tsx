import React from "react";

type CustomBtnProps = {
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  bgColor?: string;
  className?: string;
  isToggle?: boolean;
  isActive?: boolean;
  activeIcon?: React.ReactNode;
  activeBgColor?: string;
  variant?: "solid" | "ghost";
  iconColor?: string;
  activeIconColor?: string;
  spin?: boolean;
  label?: React.ReactNode;
};

export default function CustomBtn({
  icon,
  onClick,
  disabled = false,
  bgColor = "bg-gray-dark",
  className = "",
  isToggle = false,
  isActive = false,
  activeIcon,
  activeBgColor,
  variant = "solid",
  iconColor = "text-white",
  activeIconColor,
  spin = false,
  label,
}: CustomBtnProps) {
  const currentIcon = isToggle && isActive && activeIcon ? activeIcon : icon;

  let appliedBg =
    isToggle && isActive && activeBgColor ? activeBgColor : bgColor;

  if (variant === "ghost") {
    appliedBg = "bg-transparent hover:bg-gray-700/30";
  }

  const currentIconColor =
    isToggle && isActive && activeIconColor ? activeIconColor : iconColor;

  const spinClass = spin ? "animate-spin" : "";
  const iconSizeClass = variant === "ghost" ? "scale-150" : "scale-120";

  const button = (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center
        p-[19px] rounded-[20px]
        transition-all active:scale-[0.96]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${appliedBg} ${className}
      `}
    >
      <span
        className={`flex items-center ${currentIconColor} ${iconSizeClass} ${spinClass}`}
      >
        {currentIcon}
      </span>
    </button>
  );

  if (!label) {
    return button;
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-3 item-center text-bodyLg text-green-normal select-none">
        <div className="font-bold">{label}</div>
        <div>재생 중···</div>
      </div>
      {button}
    </div>
  );
}