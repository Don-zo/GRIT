type IntroductionCardProps = {
  functionName: string;
  functionDescription: string;
};

export default function IntroductionCard({
  functionName,
  functionDescription,
}: IntroductionCardProps) {
  return (
    <div className="min-h-screen bg-[#e7ecea] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-3xl bg-[#f3f4f3] rounded-2xl shadow-lg p-8 relative">
        <div className="flex items-center gap-2 absolute top-5 left-5">
          <div className="w-3.5 h-3.5 rounded-full bg-[#f87171]"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-[#facc15]"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-[#4ade80]"></div>
        </div>

        <div className="absolute top-5 right-5 flex flex-col gap-1">
          <div className="w-1.5 h-1.5 bg-[#9ca3af] rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-[#9ca3af] rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-[#9ca3af] rounded-full"></div>
        </div>

        <div className="text-center mt-8 mb-8">
          <p className="text-lg text-[#4b5563] mb-2">{functionName}</p>
          <h2 className="text-2xl font-bold text-[#111827]">
            {functionDescription}
          </h2>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-xl h-[280px] bg-[#d1d5db] rounded-2xl shadow-md flex items-center justify-center text-[#374151] text-base font-medium"></div>
        </div>
      </div>
    </div>
  );
}
