import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/Home";
import LandingPage from "@/pages/Landing";
import LoginPage from "@/pages/Login";
import RoomPage from "@/pages/Room";
import { PATHS } from "@/routes/path";

export const router = createBrowserRouter([
  {
    path: PATHS.HOME,
    element: <HomePage />,
  },
  {
    path: PATHS.LANDING,
    element: <LandingPage />,
  },
  {
    path: PATHS.LOGIN,
    element: <LoginPage />,
  },
  {
    path: PATHS.ROOM,
    element: <RoomPage />,
  },
]);
