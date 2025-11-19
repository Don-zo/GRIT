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
}: CustomBtnProps) {
  const currentIcon = isToggle && isActive && activeIcon ? activeIcon : icon;
  const currentBgColor =
    isToggle && isActive && activeBgColor ? activeBgColor : bgColor;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center
        p-4 rounded-[20px] text-white
        transition-all active:scale-[0.96]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${currentBgColor} ${className}
      `}
    >
      <span className="flex items-center">{currentIcon}</span>
    </button>
  );
}