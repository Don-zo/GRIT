import PlaylistCard from "@/pages/Room/components/PlaylistCard/PlaylistCard";
import TodoCamCard from "@/pages/Room/components/todo/TodoCamCard";

const RoomPage = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen gap-8 p-8 bg-gray-darkest">
      <PlaylistCard />
      <TodoCamCard />
    </div>
  );
};

export default RoomPage;
