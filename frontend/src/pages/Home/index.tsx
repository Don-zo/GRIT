import { useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import GroupSection from "@/pages/Home/components/GroupSection/GroupSection";
import Achievement from "@/pages/Home/components/AchievementCard";
import ProfileCard from "@/pages/Home/components/ProfileCard";
import LeftSidebar from "@/pages/Home/components/LeftSidebar";

type HomeLocationState = {
  openProfileSetupModal: boolean;
};

const HomePage = () => {
  const location = useLocation();
  const state = location.state as HomeLocationState;

  const shouldOpenProfileSetup = state?.openProfileSetupModal === true;

  return (
    <div className="flex flex-col pt-[65px] w-full h-auto bg-gray-darkest">
      <Header variant="dark" alwaysVisible />

      <div className="flex">
        <LeftSidebar />

        <div className="flex-1 ">
          <div className="flex items-center justify-center flex-1 mx-20 mt-10 gap-6">
            <Achievement />
            <ProfileCard initialSettingsOpen={shouldOpenProfileSetup} />
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
