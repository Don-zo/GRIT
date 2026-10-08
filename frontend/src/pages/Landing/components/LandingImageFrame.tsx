import { useRef, type MouseEvent, type ReactNode } from "react";

export default function LandingImageFrame({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);

  const handleWindowMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!frameRef.current) return;

    const windowElement = frameRef.current;
    const bounds = windowElement.getBoundingClientRect();
    const normalizedX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const normalizedY = (event.clientY - bounds.top) / bounds.height - 0.5;

    windowElement.style.transform = `perspective(1000px) rotateX(${-normalizedY * 10}deg) rotateY(${normalizedX * 10}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleWindowMouseLeave = () => {
    if (!frameRef.current) return;
    frameRef.current.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  };

  return (
    <div
      ref={frameRef}
      onMouseMove={handleWindowMouseMove}
      onMouseLeave={handleWindowMouseLeave}
      className="relative w-full max-w-5xl mx-auto rounded-2xl bg-[#f3f4f3] p-8 shadow-lg transition-transform duration-200 ease-out"
      style={{ transformStyle: "preserve-3d" }}
      data-landing-image-frame
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
      <div className="relative mt-8 w-full aspect-[3024/1720]">
        {children}
      </div>
    </div>
  );
}
