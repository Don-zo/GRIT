import TopBar from "@/pages/Room/components/TopBar/TopBar";
import GroupSection from "@/pages/Home/components/GroupSection/GroupSection";
import Achievement from "@/pages/Home/components/AchievementCard";
import ProfileCard from "@/pages/Home/components/ProfileCard";
import LeftSidebar from "@/pages/Home/components/LeftSidebar";

const HomePage = () => {
  return (
    <div className="flex flex-col w-full h-auto bg-gray-darkest">
      <TopBar />

      <div className="flex">
        <LeftSidebar />

        <div className="flex-1">
          <div className="flex items-center justify-center flex-1 mx-20 mt-10 gap-6">
            <Achievement />
            <ProfileCard />
          </div>

          <div className="m-20">
            <GroupSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
