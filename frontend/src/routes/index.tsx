import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/Home";
import RoomPage from "@/pages/Room";
import { PATHS } from "@/routes/path";

export const router = createBrowserRouter([
  {
    path: PATHS.HOME,
    element: <HomePage />,
  },
  {
    path: PATHS.ROOM,
    element: <RoomPage />,
  },
]);
