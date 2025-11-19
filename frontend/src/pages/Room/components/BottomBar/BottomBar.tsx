import CustomBtn from "@/pages/Room/components/BottomBar/CustomBtn";
import { useState } from "react";
import { Mic, MicOff, Video, VideoOff, Smile, X} from 'lucide-react';

export default function BottomBar() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  return (
    <div className="flex items-center justify-center w-full gap-4 h-25">
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
        icon={<Smile />}
        bgColor="bg-green-semidark"
        onClick={() => console.log("이모티콘")}
      />

      {/* 뽀모도로 */}
      <CustomBtn
        icon={<img src="/icons/ic_pomodoro.svg" className="w-6 h-7" />}
        bgColor="bg-gray-dark"
        onClick={() => console.log("뽀모도로")}
        className="py-[14px]"
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