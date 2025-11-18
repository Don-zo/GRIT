import { createBrowserRouter } from "react-router-dom";
import RoomPage from "@/pages/Room";
import { PATHS } from "@/routes/path";

export const router = createBrowserRouter([
  {
    path: PATHS.ROOM,
    element: <RoomPage />,
  },
]);
