import { useEffect, useRef } from "react";
import HeroSection from "@/pages/Landing/components/HeroSection/HeroSection";
import IntroductionSection from "@/pages/Landing/components/IntroductionSection/IntroductionSection";
import { Header } from "@/components/Header";

const SCROLL_LOCK_MS = 700;

const LandingPage = () => {
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY === 0 || isAnimatingRef.current) return;

      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-landing-section]"),
      );
      if (sections.length === 0) return;

      const offsets = sections.map((section) => section.offsetTop);
      const currentScroll = window.scrollY;

      // 히어로 섹션(첫 스냅 지점 이전)에서는 자유 스크롤만 허용한다.
      if (currentScroll < offsets[0] - 1) return;

      const currentIndex = offsets.reduce(
        (closestIndex, offset, index) => (offset <= currentScroll + 1 ? index : closestIndex),
        0,
      );

      const direction = event.deltaY > 0 ? 1 : -1;
      const nextIndex = currentIndex + direction;

      if (nextIndex < 0) return;

      event.preventDefault();
      if (nextIndex > offsets.length - 1 || offsets[nextIndex] === currentScroll) return;

      isAnimatingRef.current = true;
      window.scrollTo({ top: offsets[nextIndex], behavior: "smooth" });
      window.setTimeout(() => {
        isAnimatingRef.current = false;
      }, SCROLL_LOCK_MS);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <>
      <Header variant="light" alwaysVisible />
      <div className="landing-page-background">
        <HeroSection />
        <IntroductionSection />
      </div>
    </>
  );
};
export default LandingPage;
