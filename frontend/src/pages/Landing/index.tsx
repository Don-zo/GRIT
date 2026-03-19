import { useEffect, useRef } from "react";
import HeroSection from "@/pages/Landing/components/HeroSection/HeroSection";
import IntroductionSection from "@/pages/Landing/components/IntroductionSection/IntroductionSection";
import { Header } from "@/components/Header";

const LandingPage = () => {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const currentIndexRef = useRef(0);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrollingRef.current) {
        e.preventDefault();
        return;
      }

      const delta = e.deltaY;
      const total = sectionsRef.current.length;
      let nextIndex = currentIndexRef.current;

      if (delta > 0 && nextIndex < total - 1) nextIndex++;
      else if (delta < 0 && nextIndex > 0) nextIndex--;

      if (nextIndex !== currentIndexRef.current) {
        e.preventDefault();
        currentIndexRef.current = nextIndex;
        isScrollingRef.current = true;

        sectionsRef.current[nextIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        setTimeout(() => {
          isScrollingRef.current = false;
        }, 1000);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <>
      <Header variant="light" />
      <section
        ref={(el) => {
          sectionsRef.current[0] = el;
        }}
      >
        <HeroSection />
      </section>
      <IntroductionSection sectionsRef={sectionsRef} startIndex={1} />
    </>
  );
};
export default LandingPage;
