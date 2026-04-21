const LiveBadge = () => {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-dark/60 px-3 py-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
        <span className="text-[11px] font-medium tracking-wide text-white">
            LIVE
        </span>
    </div>
  );
};

export default LiveBadge;