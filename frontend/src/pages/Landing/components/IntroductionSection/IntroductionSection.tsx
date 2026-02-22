import { useEffect, useRef } from "react";
import Header from "@/pages/Landing/components/Header";
import IntroductionCard from "@/pages/Landing/components/IntroductionSection/IntroductionCard";

export default function IntroductionSection() {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= 0.6 &&
            !isScrollingRef.current
          ) {
            isScrollingRef.current = true;
            entry.target.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });

            setTimeout(() => {
              isScrollingRef.current = false;
            }, 1000);
          }
        });
      },
      {
        threshold: [0.5, 0.7, 1.0],
      },
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Header />

      <section
        ref={(sec) => {
          sectionsRef.current[0] = sec;
        }}
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
      >
        <IntroductionCard
          functionName="투두리스트 관리"
          functionDescription="오늘 해야 할 일을 정리하고 끝까지 완주"
        />
      </section>
    </>
  );
}
