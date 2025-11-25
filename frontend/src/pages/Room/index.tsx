import React, { useState } from "react";
import BottomBar from "@/pages/Room/components/BottomBar/BottomBar";
import TopBar from "./components/TopBar/TopBar";
import { NameBadge } from "./components/Cam/NameBadge";
import Avatar from "./components/Cam/Avatar";
import Pomodoro from "./components/Cam/Pomodoro";

type PomodoroConfig = {
  studyMinutes: number;
  breakMinutes: number;
  repeat: number;
  enabled: boolean;
};

const RoomPage = () => {
  const [muted, setMuted] = useState(false);
  const [pomodoroConfig, setPomodoroConfig] = useState<PomodoroConfig | null>(
    null
  );

  return (
    <div className="flex flex-col w-full h-screen bg-gray-darkest">
      {/* 상단바 */}
      <TopBar />
      
      {/* 본 내용 */}
      <div className="flex items-center justify-center flex-1">
        <NameBadge
          name="이유민이유민"
          isMuted={muted}
          onToggleMute={() => setMuted(!muted)}
        />
        <Avatar />
        <Pomodoro
          studyMinutes={pomodoroConfig?.studyMinutes ?? 45}
          autoStart={pomodoroConfig?.enabled ?? false}
        />
      </div>

      {/* 하단바 */}
      <BottomBar
        onPomodoroStart={(config) => {
          setPomodoroConfig(config);
        }}
      />
    </div>
  );
};

export default RoomPage;
