import BottomBar from "@/pages/Room/components/BottomBar/BottomBar";
import TopBar from "./components/TopBar/TopBar";

const RoomPage = () => {
  return (
    <div className="flex flex-col w-full h-screen bg-gray-darkest">
      {/* 상단바 */}
      <TopBar />
      
      {/* 본 내용 */}
      <div className="flex items-center justify-center flex-1">
      </div>

      {/* 하단바 */}
      <BottomBar />
    </div>
  );
};

export default RoomPage;
