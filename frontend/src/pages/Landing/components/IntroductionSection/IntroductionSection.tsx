import Header from "@/pages/Landing/components/Header";
import IntroductionCard from "@/pages/Landing/components/IntroductionSection/IntroductionCard";

export default function IntroductionSection() {
  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth">
      <div className="snap-start">
        <Header />
      </div>

      <section className="snap-start">
        <IntroductionCard
          functionName="캠스터디"
          functionDescription="함께 켜고, 함께 버티는 실시간 집중 공간"
        />
      </section>

      <section className="snap-start">
        <IntroductionCard
          functionName="뽀모도로"
          functionDescription="집중과 휴식을 반복하며 그릿을 쌓는 시간 관리"
        />
      </section>

      <section className="snap-start">
        <IntroductionCard
          functionName="투두리스트 관리"
          functionDescription="오늘 해야 할 일을 정리하고 끝까지 완주"
        />
      </section>
    </div>
  );
}
