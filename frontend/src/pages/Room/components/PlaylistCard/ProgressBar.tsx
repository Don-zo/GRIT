import type { ProgressBarProps } from "@/types/playlist";

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, onChange }) => {
  return (
    <div className="w-full">
      <input
        type="range"
        min={0}
        max={100}
        value={progress}
        onChange={(e) => onChange(Number(e.target.value))}
        className="
          w-full h-1 appearance-none rounded-lg
          bg-gray-300
          cursor-pointer

          /* Webkit (Chrome, Edge, Safari) */
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-0
          [&::-webkit-slider-thumb]:h-0
          [&::-webkit-slider-thumb]:bg-transparent
          [&::-webkit-slider-thumb]:border-none
        "
        style={{
          background: `linear-gradient(to right, #284F43 ${progress}%, #D1D5DB ${progress}%)`,
        }}
      />
    </div>
  );
};

export default ProgressBar;
