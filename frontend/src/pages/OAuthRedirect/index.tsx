import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PATHS } from "@/routes/path";
import { loginGoogle } from "@/apis/services/auth";

const GoogleOAuthRedirectPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasCalledApi = useRef(false);

  useEffect(() => {
    if (hasCalledApi.current) {
      return;
    }
    hasCalledApi.current = true;

    const handleCallback = async () => {
      const minLoadingTime = new Promise((resolve) =>
        setTimeout(resolve, 1000),
      );

      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        await minLoadingTime;
        console.error("구글 로그인 에러", error);
        navigate(PATHS.SIGNUP);
        return;
      }

      if (!code) {
        await minLoadingTime;
        console.error("인증 코드 없음");
        navigate(PATHS.SIGNUP);
        return;
      }

      try {
        //console.log("인증 코드", code);
        const { member, firstTimeUser } = await loginGoogle(code);

        await minLoadingTime;

        console.log("로그인 성공", member.nickname);

        if (firstTimeUser) {
          navigate(PATHS.HOME); //추후 프로필 설정 모달로 이동 구현
        } else {
          navigate(PATHS.HOME);
        }
      } catch (error) {
        await minLoadingTime;
        console.error("로그인 도중 오류", error);
        alert("오류");
        navigate(PATHS.SIGNUP);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,rgba(34,34,34,0)_0%,rgba(62,115,88,0.3)_100%)] flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--color-green-semidark)] border-r-transparent"></div>
        <div className="mb-4 text-2xl font-bold text-[var(--color-green-semidark)]/80">
          로그인 중
        </div>
        <div className="text-[#6b8a7a]">잠시만 기다려주세요</div>
      </div>
    </div>
  );
};

export default GoogleOAuthRedirectPage;
