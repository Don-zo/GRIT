import CustomBtn from "@/pages/Room/components/CustomBtn";
import { useState, useEffect } from 'react';
import { Play, Disc3, ListChecks, Settings } from 'lucide-react';

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TopBar() {
  const [dDay] = useState(23);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const totalTime = "4:00:00";
  const playlistName = "[Playlist] 싸이월드 감성 BGM";

  return (
    <div className="flex items-center justify-between w-full h-20 gap-4 px-6">

      <div className="flex items-center h-full gap-5">
        <div className="flex items-center h-full font-extrabold text-green-normal text-[50px]">
          GRIT
        </div>

        <div className="flex flex-col justify-center h-full leading-5.5 relative bottom-[2px] text-white">
          <div className="flex gap-1 ml-0.5 text-bodyMd items-center">
            <div>D -</div>
            <div className="text-[#4CAF50]">{dDay}</div>
          </div>

          <div className="flex items-center gap-1.5">
            <Play size={15} className="relative top-[2px]" />
            <div className="flex items-baseline gap-1 leading-none relative top-[1px]">
              <div className="ml-1 font-semibold text-h3">{formatTime(elapsedSeconds)}</div>
              <div className="text-bodyMd">/ {totalTime}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <CustomBtn
          isToggle
          variant="ghost"
          icon={<Disc3 />}
          iconColor="text-green-normal"
          spin
          label={playlistName}
        />

        <CustomBtn
          isToggle
          variant="ghost"
          icon={<ListChecks />}
          iconColor="text-green-normal"
        />

        <CustomBtn
          isToggle
          variant="ghost"
          icon={<Settings />}
          iconColor="text-green-normal"
        />
      </div>
    </div>
  );
}