import CustomBtn from "@/pages/Room/components/CustomBtn";
import { useState } from "react";
import { Mic, MicOff, Video, VideoOff, Smile, X } from "lucide-react";
import EmojiModal from "./EmojiModal";
import PomodoroModal from "./PomodoroModal";

type PomodoroConfig = {
  studyMinutes: number;
  breakMinutes: number;
  repeat: number;
  enabled: boolean;
};

type BottomBarProps = {
  onPomodoroStart?: (config: PomodoroConfig) => void;
};

export default function BottomBar({ onPomodoroStart }: BottomBarProps) {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);

  return (
    <div className="relative flex items-center justify-center w-full gap-4 h-25">
      {/* 마이크 on/off */}
      <CustomBtn
        isToggle
        isActive={micOn}
        icon={<MicOff />}               
        activeIcon={<Mic />}           
        bgColor="bg-gray-dark"
        activeBgColor="bg-green-semidark"
        onClick={() => setMicOn((prev) => !prev)}
      />

      {/* 카메라 on/off */}
      <CustomBtn
        isToggle
        isActive={camOn}
        icon={<VideoOff />}
        activeIcon={<Video />}
        bgColor="bg-gray-dark"
        activeBgColor="bg-green-semidark"
        onClick={() => setCamOn((prev) => !prev)}
      />

      {/* 이모티콘 */}
      <CustomBtn
        isToggle
        isActive={emojiOpen}
        icon={<Smile />}
        bgColor="bg-gray-dark"
        activeBgColor="bg-green-semidark"
        onClick={() =>
          setEmojiOpen((prev) => {
            const next = !prev;
            if (next) setPomodoroOpen(false);
            return next;
          })
        }
      />

      {/* 이모지 모달 */}
      <EmojiModal
        open={emojiOpen}
        onSelect={(emoji) => {
          console.log(emoji, "를 선택하였습니다.");
        }}
        onClose={() => setEmojiOpen(false)}
      />

      {/* 뽀모도로 */}
      <div className="relative">
        <CustomBtn
          isToggle
          isActive={pomodoroOpen} 
          icon={<img src="/icons/ic_pomodoro.svg" className="w-6 h-[26px]" />}
          activeBgColor="bg-green-semidark"
          onClick={() =>
            setPomodoroOpen((prev) => {
              const next = !prev;
              if (next) setEmojiOpen(false);
              return next;
            })
          }
          className="py-[18px]"
        />

        {/* 뽀모도로 모달 */}
        <PomodoroModal
          open={pomodoroOpen}
          onClose={() => setPomodoroOpen(false)}
          onStart={(config) => {
            onPomodoroStart?.(config);
            setPomodoroOpen(false);
          }}
        />
      </div>
      
      {/* 나가기 */}
      <CustomBtn
        icon={<X />}
        bgColor="bg-tomato"
        onClick={() => console.log("나가기")}
      />

    </div>
  );
};