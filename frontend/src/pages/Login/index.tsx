import SocialLoginButton from "@/components/auth/SocialLoginButton";

const LoginPage = () => {
  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,rgba(34,34,34,0)_0%,rgba(62,115,88,0.3)_100%)]">
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <h1 className="mb-10 text-4xl font-extrabold tracking-wide text-[var(--color-green-semidark)]/80">
          GRIT
        </h1>

        <div className="w-[420px] max-w-[92vw] rounded-md bg-[#f5f5f5] shadow-[0px_16px_48px_0px_#00000059]">
          <div className="px-10 py-10">
            <h2 className="mb-8 text-center text-2xl font-bold text-[var(--color-green-semidark)]/80">
              로그인
            </h2>

            <div className="flex flex-col items-center space-y-5">
              <SocialLoginButton provider="google" />
              <SocialLoginButton provider="naver" />
              <SocialLoginButton provider="kakao" />
            </div>

            <p className="mt-6 text-center text-[11px] text-[#6b8a7a]">
              아직 계정이 없으신가요?{" "}
              <a
                href="#"
                className="font-semibold underline underline-offset-2"
              >
                회원가입
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
