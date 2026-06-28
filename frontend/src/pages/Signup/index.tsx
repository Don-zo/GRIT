import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SocialLoginButton from "@/components/auth/SocialLoginButton";
import { PATHS } from "@/routes/path";
import { redirectToGoogleAuth } from "@/utils/oauth";

const SignupPage = () => {
  const handleGoogleLogin = () => {
    redirectToGoogleAuth();
  };
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#f5f5f5]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(34,34,34,0)_0%,rgba(62,115,88,0.12)_100%)]" />

      <div className="pointer-events-none absolute inset-y-0 right-0 w-[52%]">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[52%]">
          <motion.div
            initial={{ y: "100vh", rotate: 120 }}
            animate={{ y: 0, rotate: 18 }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 0 }}
            className="absolute -right-35 -top-48 h-[600px] w-[900px] rounded-[24px] bg-[var(--color-green-dark)] opacity-90"
          />

          <motion.div
            initial={{ y: "100vh", rotate: -120 }}
            animate={{ y: 0, rotate: -18 }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 0.2 }}
            className="absolute -right-28 top-42 h-[600px] w-[900px] rounded-[24px] bg-[var(--color-green-normal)] opacity-70"
          />

          <motion.div
            initial={{ y: "100vh", rotate: 250 }}
            animate={{ y: 0, rotate: 320 }}
            transition={{ duration: 1.3, ease: "easeOut", delay: 0.5 }}
            className="absolute -right-38 top-120 h-[600px] w-[900px] rounded-[24px] bg-[var(--color-green-semidark)] opacity-85"
          />
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="px-8 pt-6">
          <h1 className="text-4xl font-extrabold text-[var(--color-green-semidark)]/80">
            <Link
              to={PATHS.LANDING}
              className="cursor-pointer"
              aria-label="랜딩 페이지"
            >
              GRIT
            </Link>
          </h1>
        </header>

        <main className="flex flex-1 text-center items-center sm:pl-16 md:pl-32 lg:pl-56 xl:pl-64">
          <div className="w-full flex">
            <div className="max-w-[480px]">
              <h2 className="text-[32px] font-extrabold text-[#4a4a4a]">
                로그인
              </h2>
              <p className="mt-2 text-sm text-[#8a8a8a]">
                소셜 계정으로 쉽게 시작해 보세요
              </p>

              <div className="mt-8 flex w-[320px] max-w-[92vw] flex-col items-center space-y-5">
                <SocialLoginButton
                  provider="google"
                  onClick={handleGoogleLogin}
                />
                {/* <SocialLoginButton provider="naver" />
                <SocialLoginButton provider="kakao" /> */}
              </div>

              {/* <p className="mt-6 w-[320px] max-w-[92vw] text-center text-[11px] text-[#6b8a7a]">
                이미 계정이 있으신가요?{" "}
                <a
                  href="#"
                  className="font-semibold underline underline-offset-2"
                >
                  로그인
                </a>
              </p> */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SignupPage;
