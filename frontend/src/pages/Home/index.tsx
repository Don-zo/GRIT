import { useState } from "react";
import TopBar from "@/pages/Room/components/TopBar/TopBar";
import GroupSection from "./components/GroupSection/GroupSection";
import Achievement from "@/pages/Home/components/AchievementCard";
import ProfileCard from "@/pages/Home/components/ProfileCard";

const HomePage = () => {
  
  return (
    <div className="flex flex-col w-full h-auto bg-gray-darkest">
      {/* 상단바 */}
      <TopBar />

      {/* 본 내용 */}
      <div className="flex items-center justify-center flex-1 mx-20 mt-10 gap-6">
        <Achievement />
        <ProfileCard />
      </div>

      <div className="m-20">
        <GroupSection />
      </div>
    </div>
  );
};

export default HomePage;
