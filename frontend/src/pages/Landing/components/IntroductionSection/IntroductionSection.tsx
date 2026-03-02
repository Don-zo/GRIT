import { useEffect, useRef, useState } from "react";
import Header from "@/pages/Landing/components/Header";
import IntroductionCard from "@/pages/Landing/components/IntroductionSection/IntroductionCard";

export default function IntroductionSection() {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrollingRef.current) {
        e.preventDefault();
        return;
      }

      const delta = e.deltaY;
      let nextSection = currentSection;

      if (delta > 0 && currentSection < sectionsRef.current.length - 1) {
        nextSection = currentSection + 1;
      } else if (delta < 0 && currentSection > 0) {
        nextSection = currentSection - 1;
      }

      if (nextSection !== currentSection) {
        e.preventDefault();
        isScrollingRef.current = true;
        setCurrentSection(nextSection);

        sectionsRef.current[nextSection]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        setTimeout(() => {
          isScrollingRef.current = false;
        }, 1500);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [currentSection]);

  return (
    <>
      <Header />

      <section
        ref={(sec) => {
          sectionsRef.current[0] = sec;
        }}
        className="h-screen"
      >
        <IntroductionCard
          functionName="캠스터디"
          functionDescription="함께 켜고, 함께 버티는 실시간 집중 공간"
        />
      </section>

      <section
        ref={(sec) => {
          sectionsRef.current[1] = sec;
        }}
        className="h-screen"
      >
        <IntroductionCard
          functionName="뽀모도로"
          functionDescription="집중과 휴식을 반복하며 그릿을 쌓는 시간 관리"
        />
      </section>

      <section
        ref={(sec) => {
          sectionsRef.current[2] = sec;
        }}
        className="h-screen"
      >
        <IntroductionCard
          functionName="투두리스트 관리"
          functionDescription="오늘 해야 할 일을 정리하고 끝까지 완주"
        />
      </section>
    </>
  );
}