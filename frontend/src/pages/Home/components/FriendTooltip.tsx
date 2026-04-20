import { createPortal } from "react-dom";

type FriendTooltipProps = {
  nickname: string;
  introduction: string;
  top: number;
  left: number;
};

export default function FriendTooltip({
  nickname,
  introduction,
  top,
  left,
}: FriendTooltipProps) {
  return createPortal(
    <div
      role="tooltip"
      className="fixed z-50 whitespace-nowrap rounded-xl border border-white/30 bg-[#1e2228] px-3 py-2 text-left"
      style={{
        top,
        left,
        transform: "translateY(-50%)",
      }}
    >
      <div className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-l border-white/30 bg-[#1e2228]" />
      <p className="text-sm font-semibold text-[#D6FDE5]">
        {nickname} <span className="text-[10px] font-thin">{introduction}</span>
      </p>
    </div>,
    document.body,
  );
}
