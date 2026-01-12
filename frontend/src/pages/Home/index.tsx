import { useState } from "react";
import TopBar from "@/pages/Room/components/TopBar/TopBar";
import GroupSection from "./components/GroupSection/GroupSection";

const HomePage = () => {
  
  return (
    <div className="flex flex-col w-full h-screen bg-gray-darkest">
      {/* 상단바 */}
      <TopBar />

      {/* 본 내용 */}
      <div className="flex items-center justify-center flex-1 mx-20 gap-6">
        <GroupSection />
      </div>

    </div>
  );
};