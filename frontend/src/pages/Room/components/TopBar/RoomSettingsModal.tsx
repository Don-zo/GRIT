import ToggleBtn from "@/components/ToggleBtn";

type RoomSettingsModalProps = {
  open: boolean;
  isBackgroundBlurEnabled: boolean;
  onToggleBackgroundBlur: (enabled: boolean) => void;
};

export default function RoomSettingsModal({
  open,
  isBackgroundBlurEnabled,
  onToggleBackgroundBlur,
}: RoomSettingsModalProps) {
  if (!open) return null;

  return (
    <div className="absolute right-0 z-50" style={{ top: "calc(100% + 12px)" }}>
      <div className="relative w-[260px] rounded-2xl bg-gray-dark px-5 py-4 text-white shadow-xl">
        <div className="absolute -top-1.5 right-6 h-4 w-4 rotate-45 rounded-sm bg-inherit" />

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold">배경 흐리게</span>
          <div
            className={`background-blur-toggle ${
              !isBackgroundBlurEnabled ? "background-blur-toggle--off" : ""
            }`}
          >
            <ToggleBtn
              checked={isBackgroundBlurEnabled}
              onChange={onToggleBackgroundBlur}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
