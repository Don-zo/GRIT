import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/Home";
import LandingPage from "@/pages/Landing";
import SignupPage from "@/pages/Signup";
import RoomPage from "@/pages/Room";
import GoogleOAuthRedirectPage from "@/pages/OAuthRedirect";
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
    path: PATHS.SIGNUP,
    element: <SignupPage />,
  },
  {
    path: PATHS.ROOM,
    element: <RoomPage />,
  },
  {
    path: PATHS.GOOGLE_OAUTH_REDIRECT,
    element: <GoogleOAuthRedirectPage />,
  },
]);
