import React from "react";
import { Volume1, Volume2, VolumeX } from "lucide-react";

interface VolumeBarProps {
  volume: number; // 0 ~ 100
  onChange: (value: number) => void;
}

const VolumeBar: React.FC<VolumeBarProps> = ({ volume, onChange }) => {
  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="w-5 h-5" strokeWidth={1.5}/>;
    if (volume <= 50) return <Volume1 className="w-5 h-5" strokeWidth={1.5} />;
    return <Volume2 className="w-5 h-5" strokeWidth={1.5} />;
  };

  return (
    <div className="flex items-center space-x-3">
      {getVolumeIcon()}

      <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-32 h-[8px] appearance-none rounded-lg bg-gray-300 
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-[15px]
          [&::-webkit-slider-thumb]:h-[15px]
          [&::-webkit-slider-thumb]:bg-green-dark 
          [&::-webkit-slider-thumb]:rounded-full 
          [&::-webkit-slider-thumb]:cursor-pointer
          "
          style={{ background: `linear-gradient(to right, #284F43 ${volume}%, #D1D5DB ${volume}%)`}}
        />
    </div>
  );
};

export default VolumeBar;