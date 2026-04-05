type FriendTooltipProps = {
  nickname: string;
  introduction: string;
};

export default function FriendTooltip({
  nickname,
  introduction,
}: FriendTooltipProps) {
  return (
    <div
      role="tooltip"
      className="absolute left-full top-1/2 z-50 ml-4 -translate-y-1/2 whitespace-nowrap rounded-xl border border-white/30 bg-[#1e2228] px-3 py-2 text-left"
    >
      <div className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-l border-white/30 bg-[#1e2228]" />
      <p className="text-sm font-semibold text-[#D6FDE5]">
        {nickname} <span className="text-[10px] font-thin">{introduction}</span>
      </p>
    </div>
  );
}
