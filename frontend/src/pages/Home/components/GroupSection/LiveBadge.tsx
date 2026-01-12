const LiveBadge = () => {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-dark/60 rounded-full">
        <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
        <span className="text-white text-[13px] font-medium tracking-wider">
            LIVE
        </span>
    </div>
  );
};

export default LiveBadge;