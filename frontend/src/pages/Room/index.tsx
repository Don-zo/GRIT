import PlaylistCard from "@/pages/Room/components/PlaylistCard/PlaylistCard";
import TodoCamCard from "@/pages/Room/components/todo/TodoCamCard";

const RoomPage = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center gap-8 p-8">
      <PlaylistCard />
      <TodoCamCard />
    </div>
  );
};

export default RoomPage;
