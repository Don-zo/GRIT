import CustomBtn from "@/pages/Room/components/CustomBtn";
import { useState } from "react";
import { Mic, MicOff, Video, VideoOff, Smile, X } from "lucide-react";
import type { Reaction } from "@/apis/domains/livekit/type";
import EmojiModal from "./EmojiModal";
import PomodoroModal from "./PomodoroModal";
import type { StartPomodoroRequest } from "@/apis/domains/pomodoro/type";

type BottomBarProps = {
  reactions?: Reaction[];
  onSendReaction?: (reaction: Reaction) => void;
  onPomodoroStart?: (body: StartPomodoroRequest) => void;
  isStartingPomodoro?: boolean;
  onToggleMic?: () => void;
  onToggleCam?: () => void;
  onLeaveRoom?: () => void;
};

export default function BottomBar({
  reactions = [],
  onSendReaction,
  onPomodoroStart,
  isStartingPomodoro = false,
  onToggleMic,
  onToggleCam,
  onLeaveRoom,
}: BottomBarProps) {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);

  const handleMicToggle = () => {
    setMicOn((prev) => !prev);

    if (onToggleMic) {
      onToggleMic();
    }
  };

  const handleCamToggle = () => {
    setCamOn((prev) => !prev);

    if (onToggleCam) {
      onToggleCam();
    }
  };

  const handleLeaveRoom = () => {
    if (onLeaveRoom) {
      onLeaveRoom();
    } else {
      console.log("바이 나 나감");
    }
  };

  return (
    <div className="relative flex items-center justify-center w-full gap-4 h-25">
      {/* 마이크 on/off */}
      <CustomBtn
        isToggle
        isActive={micOn}
        icon={<MicOff />}
        activeIcon={<Mic />}
        bgColor="bg-tomato"
        activeBgColor="bg-green-semidark"
        onClick={handleMicToggle}
      />

      {/* 카메라 on/off */}
      <CustomBtn
        isToggle
        isActive={camOn}
        icon={<VideoOff />}
        activeIcon={<Video />}
        bgColor="bg-tomato"
        activeBgColor="bg-green-semidark"
        onClick={handleCamToggle}
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
        reactions={reactions}
        onSelect={(reaction) => {
          onSendReaction?.(reaction);
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
          isStarting={isStartingPomodoro}
          onStart={(body) => {
            onPomodoroStart?.(body);
            setPomodoroOpen(false);
          }}
        />
      </div>

      {/* 나가기 */}
      <CustomBtn icon={<X />} bgColor="bg-tomato" onClick={handleLeaveRoom} />
    </div>
  );
}
