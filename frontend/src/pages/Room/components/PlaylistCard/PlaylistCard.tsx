import { useState } from "react";
import { Play, Square, SkipForward } from "lucide-react";

import PlaylistInput from "@/pages/Room/components/PlaylistCard/PlaylistInput";
import PlaylistItems from "@/pages/Room/components/PlaylistCard/PlaylistItems";
import VolumeBar from "@/pages/Room/components/PlaylistCard/VolumeBar";
import ProgressBar from "@/pages/Room/components/PlaylistCard/ProgressBar";

export default function PlaylistCard() {
  const [progress, setProgress] = useState(30);
  const [volume, setVolume] = useState(70);

  return (
    <div className="w-[400px] h-auto bg-gray-light rounded-xl flex flex-col items-start p-7 py-8">
      <h2 className="text-md font-semibold text-green-dark mb-4">
        클래식 재생목록 1
      </h2>
      <ProgressBar progress={progress} onChange={setProgress} />
      <div className="w-full text-green-dark flex items-start gap-8 p-2 py-6">
        <Play className="w-4.5 h-4.5" strokeWidth={1.7} />
        <Square className="w-4.5 h-4.5" strokeWidth={1.7} />
        <SkipForward className="w-4.5 h-4.5" strokeWidth={1.7} />
        <div className="ml-auto">
          <VolumeBar volume={volume} onChange={setVolume} />
        </div>
      </div>

      <PlaylistInput />
      <PlaylistItems
        items={[
          "클래식 재생목록 1",
          "클래식 재생목록 2",
          "클래식 재생목록 3",
          "크리스마스 재생목록 1",
          "크리스마스 재생목록 2",
        ]}
        selectedIndex={0}
      />
    </div>
  );
}
