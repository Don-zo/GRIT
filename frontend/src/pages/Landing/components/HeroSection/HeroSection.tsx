import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/path";
import { getAccessToken } from "@/utils/tokenStorage";
import heroGroupImage from "@/assets/landing/hero_group.png";
import SplitText from "@/pages/Landing/components/HeroSection/SplitText";

export default function HeroSection() {
  const navigate = useNavigate();
  const windowRef = useRef<HTMLDivElement>(null);

  const handleStartClick = () => {
    navigate(getAccessToken() ? PATHS.HOME : PATHS.SIGNUP);
  };

  const handleWindowMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!windowRef.current) return;

    const windowElement = windowRef.current;
    const bounds = windowElement.getBoundingClientRect();
    const normalizedX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const normalizedY = (event.clientY - bounds.top) / bounds.height - 0.5;

    windowElement.style.transform = `perspective(1000px) rotateX(${-normalizedY * 10}deg) rotateY(${normalizedX * 10}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleWindowMouseLeave = () => {
    if (!windowRef.current) return;
    windowRef.current.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  };

  return (
    <main className="relative min-h-screen overflow-x-clip text-[#1c1e27]">
      <div className="pointer-events-none absolute left-1/2 top-32 h-[520px] w-[min(900px,90vw)] -translate-x-1/2 rounded-full bg-[#82c397]/25 blur-3xl" />

      <div className="relative flex flex-col w-full min-h-screen px-6 pb-0 mx-auto max-w-7xl pt-28 sm:px-10 lg:px-16">
        <div className="flex flex-col items-center max-w-3xl mx-auto text-center">
          {/* <div className="hero-fade-in mb-7 inline-flex items-center gap-2 rounded-full border border-[#aebbb3] px-4 py-2 font-mono text-[11px] font-medium tracking-[0.14em] text-[#3e7358] uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3e7358]" />
            지금 2,400개 스터디룸이 열려 있어요
          </div> */}
          <h1 className="font-bold leading-[1.03] tracking-[-0.055em] text-[#1c1e27] text-[clamp(2.7rem,7vw,5.8rem)]">
            <SplitText text="공간을 넘어 이어지는" delay={0.1} className="font-semibold" />
            <br />
            <SplitText text="우리만의 " delay={0.5} className="font-semibold" />
            <SplitText text="GRIT." delay={0.68} className="text-[#3e7358]" />
          </h1>
          <p className="hero-fade-in-delay-2 mt-6 max-w-xl text-[15px] leading-7 text-[#555] sm:text-[17px]">
            화상으로 연결된 스터디룸, 투두리스트와 타이머, 취향 플레이리스트까지.
            <br />
            흩어진 우리를 다시 책상 앞으로 모아드립니다.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8 hero-fade-in-delay-3">
            <button
              type="button"
              onClick={handleStartClick}
              className="group inline-flex items-center gap-2 rounded-[9px] bg-[#3e7358] px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(62,115,88,0.2)] transition hover:-translate-y-0.5 hover:bg-[#284f43]"
            >
              시작하기
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        <div className="relative w-full max-w-5xl mx-auto mt-16 hero-window-enter">
          <div className="absolute -inset-x-8 -top-20 -z-10 h-64 rounded-full bg-[#82c397]/20 blur-3xl" />
          <div
            ref={windowRef}
            onMouseMove={handleWindowMouseMove}
            onMouseLeave={handleWindowMouseLeave}
            className="relative w-full rounded-2xl bg-[#f3f4f3] p-8 shadow-lg transition-transform duration-200 ease-out"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="absolute flex items-center gap-2 left-5 top-5">
              <span className="h-3.5 w-3.5 rounded-full bg-[#f87171]" />
              <span className="h-3.5 w-3.5 rounded-full bg-[#facc15]" />
              <span className="h-3.5 w-3.5 rounded-full bg-[#4ade80]" />
            </div>
            <div className="absolute flex flex-col gap-1 right-5 top-5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#9ca3af]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#9ca3af]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#9ca3af]" />
            </div>
            <img
              src={heroGroupImage}
              alt="GRIT 스터디룸"
              className="mt-8 block aspect-[3024/1720] w-full rounded-2xl object-cover shadow-lg"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
