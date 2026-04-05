import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import GroupSection from "@/pages/Home/components/GroupSection/GroupSection";
import Achievement from "@/pages/Home/components/AchievementCard";
import ProfileCard from "@/pages/Home/components/ProfileCard";
import LeftSidebar from "@/pages/Home/components/LeftSidebar";
import FriendManageModal from "@/pages/Home/components/Modals/FriendManageModal";

type HomeLocationState = {
  openProfileSetupModal: boolean;
  firstTimeUser: boolean;
};

const HomePage = () => {
  const [isFriendManageOpen, setIsFriendManageOpen] = useState(false);
  const location = useLocation();
  const state = location.state as HomeLocationState;

  const shouldOpenProfileSetup = state?.openProfileSetupModal === true;
  const oauthFirstTimeUser = state?.firstTimeUser === true;

  return (
    <div className="flex flex-col pt-[65px] w-full h-auto bg-gray-darkest">
      <Header
        variant="dark"
        alwaysVisible
        onOpenFriendManage={() => setIsFriendManageOpen(true)}
      />

      <div className="flex">
        <LeftSidebar />

        <div className="flex-1 ">
          <div className="flex items-center justify-center flex-1 mx-20 mt-10 gap-6">
            <Achievement />
            <ProfileCard
              initialSettingsOpen={shouldOpenProfileSetup}
              oauthFirstTimeUser={oauthFirstTimeUser}
            />
          </div>

          <div className="m-20">
            <GroupSection />
          </div>
        </div>
      </div>
      <FriendManageModal
        open={isFriendManageOpen}
        onClose={() => setIsFriendManageOpen(false)}
      />
    </div>
  );
};

export default HomePage;
