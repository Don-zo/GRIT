import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/path";
import { getCurrentUser, logout } from "@/apis/services/auth";

export default function Header() {
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight;

      setIsHeaderVisible(scrollY > heroHeight * 0.8);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
  }, []);

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
      className={`w-full bg-[#e7ecea] px-10 py-4 fixed top-0 left-0 right-0 z-[var(--z-header)] transition-all duration-500 ${
        isHeaderVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-full pointer-events-none"
      }`}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-green-semidark/80">GRIT</h1>

        <div className="flex gap-3 items-center">
          {user ? (
            <>
              <span className="text-sm text-gray-700">
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
                onClick={() => navigate(PATHS.LOGIN)}
                className="px-6 py-2 rounded-lg bg-green-semidark/80 text-white text-sm shadow-md hover:bg-green-semidark transition cursor-pointer"
              >
                로그인
              </button>
              <button
                onClick={() => navigate(PATHS.SIGNUP)}
                className="px-6 py-2 rounded-lg bg-green-semidark/80 text-white text-sm shadow-md hover:bg-green-semidark transition cursor-pointer"
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
