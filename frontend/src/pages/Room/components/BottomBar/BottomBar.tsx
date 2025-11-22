import CustomBtn from "@/pages/Room/components/CustomBtn";
import { useState } from "react";
import { Mic, MicOff, Video, VideoOff, Smile, X} from 'lucide-react';
import EmojiModal from "./EmojiModal";

export default function BottomBar() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [emojiOpen, setEmojiOpen] = useState(false);

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
        onClick={() => setMicOn(prev => !prev)}
      />

      {/* 카메라 on/off */}
      <CustomBtn
        isToggle
        isActive={camOn}
        icon={<VideoOff />}
        activeIcon={<Video />}
        bgColor="bg-gray-dark"
        activeBgColor="bg-green-semidark"
        onClick={() => setCamOn(prev => !prev)}
      />

      {/* 이모티콘 */}
      <CustomBtn
        isToggle
        isActive={emojiOpen}
        icon={<Smile />}
        bgColor="bg-gray-dark"
        activeBgColor="bg-green-semidark"
        onClick={() => setEmojiOpen(prev => !prev)}
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
      <CustomBtn
        icon={<img src="/icons/ic_pomodoro.svg" className="w-6 h-[26px]" />}
        bgColor="bg-gray-dark"
        onClick={() => console.log("뽀모도로")}
        className="py-[18px]"
      />
      
      {/* 나가기 */}
      <CustomBtn
        icon={<X />}
        bgColor="bg-tomato"
        onClick={() => console.log("나가기")}
      />

    </div>
  );
};