import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PATHS } from "@/routes/path";
import { logout, signout } from "@/apis/domains/auth/api";
import { userApi } from "@/apis/domains/user/api";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";

type HeaderProps = {
  variant: "light" | "dark";
  alwaysVisible?: boolean;
};

export function Header({ variant, alwaysVisible = false }: HeaderProps) {
  const [isHeaderVisible, setIsHeaderVisible] = useState(alwaysVisible);
  const [isDropDownOpen, SetIsDropDownOpen] = useState(false);
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: QUERY_KEYS.member.me,
    queryFn: userApi.get,
  });

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

  const toggleDropdown = () => {
    SetIsDropDownOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate(PATHS.SIGNUP);
    } catch (error) {
      console.error("로그아웃 실패", error);
    }
  };

  const handleSignout = async () => {
    try {
      await signout();
      navigate(PATHS.SIGNUP);
    } catch (error) {
      console.error("회원탈퇴 실패", error);
    }
  };

  return (
    <header
      className={`w-full ${currentStyle.bg} px-12 py-4 fixed top-0 left-0 right-0 z-[var(--z-header)] transition-all duration-500 ${
        isHeaderVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-full pointer-events-none"
      }`}
    >
      <div className="mx-auto flex w-full items-center justify-between">
        <h1 className={`text-3xl font-extrabold ${currentStyle.text}`}>GRIT</h1>

        <div className="flex gap-3 items-center">
          {user ? (
            <>
              <span className={`text-sm ${currentStyle.userInfo}`}>
                {user.nickname || user.email} 님
              </span>
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleDropdown}
                  className={`p-1 rounded-full transition cursor-pointer ${
                    isDropDownOpen ? "bg-white/20" : "hover:bg-white/20"
                  }`}
                >
                  {isDropDownOpen ? (
                    <ChevronUp size={18} className="text-gray-50" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-50" />
                  )}
                </button>

                {isDropDownOpen && (
                  <div className="absolute bg-[#2B2F36] right-0 mt-6 w-28  rounded-lg shadow-lg border-none p-1 z-50">
                    <button
                      type="button"
                      className="text-white w-full px-4 py-2 text-center text-sm text-gray-700 hover:bg-gray-900 hover:rounded-md transition cursor-pointer"
                      onClick={handleLogout}
                    >
                      로그아웃
                    </button>
                    <button
                      type="button"
                      className="w-full px-4 py-2 text-center text-sm text-red-500 hover:bg-gray-900 hover:rounded-md transition transition cursor-pointer"
                      onClick={handleSignout}
                    >
                      탈퇴하기
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => navigate(PATHS.SIGNUP)}
              className="px-6 py-2 rounded-lg bg-green-semidark/80 text-white text-sm shadow-md hover:bg-green-semidark transition cursor-pointer"
            >
              GRIT 시작하기
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
