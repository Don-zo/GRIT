import GoogleIcon from "@/assets/icons/google-icon.svg";
import NaverIcon from "@/assets/icons/naver-icon.svg";
import KakaoIcon from "@/assets/icons/kakao-icon.svg";

type Provider = "google" | "naver" | "kakao";

type SocialLoginButtonProps = {
  provider: Provider;
  onClick?: () => void;
};

const providerConfig = {
  google: {
    icon: GoogleIcon,
    text: "Google로 로그인",
    bgColor: "bg-[#ffffff]",
    textColor: "text-gray-700",
    hoverEffect: "hover:bg-gray-50",
    border: "border border-none",
  },
  naver: {
    icon: NaverIcon,
    text: "네이버로 로그인",
    bgColor: "bg-[#03A94D]",
    textColor: "text-white",
    hoverEffect: "hover:brightness-95",
    border: "",
  },
  kakao: {
    icon: KakaoIcon,
    text: "카카오로 로그인",
    bgColor: "bg-[#FEE500]",
    textColor: "text-[#191600]",
    hoverEffect: "hover:brightness-95",
    border: "",
  },
};

export default function SocialLoginButton({
  provider,
  onClick,
}: SocialLoginButtonProps) {
  const config = providerConfig[provider];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-72 h-11 rounded-md flex items-center justify-center text-sm transition ${config.bgColor} ${config.textColor} ${config.hoverEffect} ${config.border} relative cursor-pointer`}
    >
      <img
        src={config.icon}
        alt={provider}
        className="w-6 h-6 absolute left-4"
      />
      <span className="absolute left-0 right-0 text-center">{config.text}</span>
    </button>
  );
}
