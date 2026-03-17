import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/path";
import { getCurrentUser, logout } from "@/apis/services/auth";

type HeaderProps = {
  variant: "light" | "dark";
  alwaysVisible?: boolean;
};

export function Header({ variant, alwaysVisible = false }: HeaderProps) {
  const [isHeaderVisible, setIsHeaderVisible] = useState(alwaysVisible);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (alwaysVisible) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight;
      setIsHeaderVisible(scrollY > heroHeight * 0.8);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [alwaysVisible]);

  const styles = {
    light: {
      bg: "bg-[#e7ecea]",
      text: "text-green-semidark/80",
      userInfo: "text-gray-700",
      button: "bg-green-semidark/80 hover:bg-green-semidark",
    },
    dark: {
      bg: "bg-[#2B2F36]",
      text: "text-[#3E7358]",
      userInfo: "text-gray-300",
      button: "bg-[#3E7358] hover:bg-emerald-800",
    },
  };

  const currentStyle = styles[variant];

  const handleLogout = async () => {
    try {
      await logout();
      navigate(PATHS.SIGNUP);
    } catch (error) {
      console.error("로그아웃 실패", error);
    }
  };

  return (
    <header
      className={`w-full ${currentStyle.bg} px-10 py-4 fixed top-0 left-0 right-0 z-[var(--z-header)] transition-all duration-500 ${
        isHeaderVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-full pointer-events-none"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className={`text-3xl font-extrabold ${currentStyle.text}`}>GRIT</h1>

        <div className="flex gap-3 items-center">
          {user ? (
            <>
              <span className={`text-sm ${currentStyle.userInfo}`}>
                {user.nickname || user.email}님
              </span>
              <button
                onClick={handleLogout}
                className="px-6 py-2 rounded-lg bg-green-semidark/80 text-white text-sm shadow-md hover:bg-green-semidark transition cursor-pointer"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate(PATHS.SIGNUP)}
                className="px-6 py-2 rounded-lg bg-green-semidark/80 text-white text-sm shadow-md hover:bg-green-semidark transition cursor-pointer"
              >
                GRIT 시작하기
              </button>
              {/* <button
                onClick={() => navigate(PATHS.SIGNUP)}
                className="px-6 py-2 rounded-lg bg-green-semidark/80 text-white text-sm shadow-md hover:bg-green-semidark transition cursor-pointer"
              >
                회원가입
              </button> */}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
