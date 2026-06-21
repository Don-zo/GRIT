import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/path";
import GritLogo from "./GritLogo";
import UnderlineAnimation from "./UnderlineAnimation";

export default function HeroSection() {
  const line1 = "공간을 넘어 이어지는";
  const line2Prefix = "우리만의 ";
  const line2Word = "독서실";
  const charDelay = 0.18;
  const imageAnimDuration = 0.8;
  const gritLogoAnimationDuration = 5;

  const navigate = useNavigate();

  const line1TotalDuration = line1.length * charDelay;
  const line2PrefixLength = line2Prefix.length;
  const line2WordLength = line2Word.length;
  const line2TotalDuration = (line2PrefixLength + line2WordLength) * charDelay;

  const gritLogoStartDelay =
    imageAnimDuration + line1TotalDuration + line2TotalDuration + 1.6;

  const [showStartButton, setShowStartButton] = useState(false);

  useEffect(() => {
    const totalDelaySeconds = gritLogoStartDelay + gritLogoAnimationDuration;
    const timer = setTimeout(
      () => setShowStartButton(true),
      totalDelaySeconds * 1000
    );

    return () => clearTimeout(timer);
  }, [gritLogoStartDelay]);

  return (
    <div
      className="w-full min-h-screen pb-32 flex items-center justify-center"
      style={{
        background:
          "linear-gradient(to bottom, #D7E3DA 0, #D7E3DA 100vh, #e7ecea calc(100vh + 8rem))",
      }}
    >
      <div className="relative w-full max-w-6xl h-screen max-h-screen flex items-center justify-start px-6 md:px-10 lg:px-16">
        <img
          src="/hero_section.svg"
          alt="GRIT hero background"
          className="absolute inset-0 w-full h-full scale-120 object-contain translate-x-100 pointer-events-none select-none hero-bg-enter"
        />

        <div className="relative flex flex-col -translate-x-50">
          <div className="font-bold text-h1 text-[#222222]">
            {line1.split("").map((ch, idx) => (
              <span
                key={`l1-${idx}`}
                className="hero-char"
                style={{ animationDelay: `${imageAnimDuration + idx * charDelay}s` }}
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </div>

          <div className="font-bold text-h1 text-[#222222] inline-block mb-10">
            {line2Prefix.split("").map((ch, idx) => (
              <span
                key={`l2-prefix-${idx}`}
                className="hero-char"
                style={{
                  animationDelay: `${
                    imageAnimDuration + line1TotalDuration + idx * charDelay
                  }s`,
                }}
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}

            <span className="relative inline-block">
              {line2Word.split("").map((ch, idx) => (
                <span
                  key={`l2-word-${idx}`}
                  className="hero-char"
                  style={{
                    animationDelay: `${
                      imageAnimDuration +
                      line1TotalDuration +
                      (line2PrefixLength + idx) * charDelay
                    }s`,
                  }}
                >
                  {ch}
                </span>
              ))}

              <div className="absolute left-[-2px] bottom-[-4px]">
                <UnderlineAnimation
                  delaySeconds={
                    imageAnimDuration + line1TotalDuration + line2TotalDuration
                  }
                />
              </div>
            </span>
          </div>

          <GritLogo startDelay={gritLogoStartDelay} />

          <button
            type="button"
            onClick={() => navigate(PATHS.SIGNUP)}
            className={`bg-white mt-8 text-black rounded-[8px] w-30 px-4 py-2 transition-opacity duration-700 ease-out ${
              showStartButton ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            시작하기
            <span className="ml-2 text-[18px]">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
