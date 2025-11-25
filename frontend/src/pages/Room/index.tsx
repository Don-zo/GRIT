import BottomBar from "@/pages/Room/components/BottomBar/BottomBar";
import TopBar from "./components/TopBar/TopBar";
import CamLayout from "./components/Cam/CamLayout";

const RoomPage = () => {
  const participants = [
    { id: "p1", name: "김윤영", isMuted: false },
    { id: "p2", name: "양준영", isMuted: true },
    { id: "p3", name: "이유민", isMuted: false },
    { id: "p4", name: "이차현", isMuted: false },
    { id: "p5", name: "김윤영김윤영", isMuted: true },
    { id: "p6", name: "양준영양준영", isMuted: false },
    // { id: "p7", name: "이유민이유민", isMuted: true },
    // { id: "p8", name: "이차현이차현", isMuted: false },
  ];

  return (
    <div className="flex flex-col w-full h-screen bg-gray-darkest">
      {/* 상단바 */}
      <TopBar />
      
      {/* 본 내용 */}
      <div className="flex flex-1 mx-20 items-center justify-center">
        <CamLayout participants={participants} />
      </div>

      {/* 하단바 */}
      <BottomBar />
    </div>
  );
};

export default RoomPage;
