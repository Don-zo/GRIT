import HeroSection from "@/pages/Landing/components/HeroSection/HeroSection";
import IntroductionSection from "@/pages/Landing/components/IntroductionSection/IntroductionSection";
import { Header } from "@/components/Header";

const LandingPage = () => {
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
