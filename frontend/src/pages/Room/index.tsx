import React, { useState } from "react";
import BottomBar from "@/pages/Room/components/BottomBar/BottomBar";
import TopBar from "./components/TopBar/TopBar";
import { NameBadge } from "./components/Cam/NameBadge";
import Avatar from "./components/Cam/Avatar";
import CamLayout from "./components/Cam/CamLayout";

const RoomPage = () => {
  const [muted, setMuted] = useState(false);

  const participants = [
    { id: "p1", video: <div className="bg-red-500 w-full h-full" /> },
    { id: "p2", video: <div className="bg-blue-500 w-full h-full" /> },
    { id: "p3", video: <div className="bg-green-500 w-full h-full" /> },
    { id: "p4", video: <div className="bg-yellow-500 w-full h-full" /> },
    { id: "p5", video: <div className="bg-purple-500 w-full h-full" /> },
    { id: "p6", video: <div className="bg-purple-500 w-full h-full" /> },
    // { id: "p7", video: <div className="bg-purple-500 w-full h-full" /> },
    // { id: "p8", video: <div className="bg-purple-500 w-full h-full" /> },
  ];

  return (
    <div className="flex flex-col w-full h-screen bg-gray-darkest">
      {/* 상단바 */}
      <TopBar />
      
      {/* 본 내용 */}
      <div className="flex flex-1 mx-20 items-center justify-center">
        {/* <NameBadge
          name="이유민이유민"
          isMuted={muted}
          onToggleMute={() => setMuted(!muted)}
        />
        <Avatar /> */}
        <CamLayout participants={participants} />
      </div>

      {/* 하단바 */}
      <BottomBar />
    </div>
  );
};

export default RoomPage;
