import { useState } from "react";
import BottomBar from "@/pages/Room/components/BottomBar/BottomBar";
import TopBar from "@/pages/Room/components/TopBar/TopBar";
import Pomodoro from "@/pages/Room/components/Cam/Pomodoro";
import CamLayout from "@/pages/Room/components/Cam/CamLayout";

type PomodoroConfig = {
  studyMinutes: number;
  breakMinutes: number;
  repeat: number;
  enabled: boolean;
};

const RoomPage = () => {
  const participants = [
    { id: "p1", name: "김윤영", isMuted: false },
    { id: "p2", name: "양준영", isMuted: true },
    { id: "p3", name: "이유민", isMuted: false },
    { id: "p4", name: "이차현", isMuted: false },
    { id: "p5", name: "김윤영김윤영", isMuted: true },
    { id: "p6", name: "양준영양준영", isMuted: false },
    { id: "p7", name: "이유민이유민", isMuted: true },
    { id: "p8", name: "이차현이차현", isMuted: false },
  ];
  const [muted, setMuted] = useState(false);
  const [pomodoroConfig, setPomodoroConfig] = useState<PomodoroConfig>({
    studyMinutes: 45,
    breakMinutes: 15,
    repeat: 1,
    enabled: false,
  });

  const handlePomodoroFinish = () => {
    setPomodoroConfig((prev) => ({
      ...prev,
      enabled: false,
    }));
  };

  const pomodoroNode = (
    <Pomodoro
      studyMinutes={pomodoroConfig.studyMinutes}
      breakMinutes={pomodoroConfig.breakMinutes}
      repeat={pomodoroConfig.repeat}
      autoStart={pomodoroConfig.enabled}
      onFinish={handlePomodoroFinish}
    />
  );
  
  return (
    <div className="flex flex-col w-full h-screen bg-gray-darkest">
      {/* 상단바 */}
      <TopBar />

      {/* 본 내용 */}
      <div className="flex items-center justify-center flex-1 mx-20">
        <CamLayout participants={participants} pomodoro={pomodoroNode} />
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
