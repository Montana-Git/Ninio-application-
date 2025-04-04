
import { useTranslation } from "react-i18next";
import Hero from "./Hero";
import FacilitiesSection from "./FacilitiesSection";
import PhilosophySection from "./PhilosophySection";
import ProgramsSection from "./ProgramsSection";
import AssistantSection from "./AssistantSection";

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Hero useThreeJsBackground={true} />
      <FacilitiesSection />
      <PhilosophySection />
      <ProgramsSection />
      <AssistantSection onOpenAssistant={() => {}} />
    </div>
  );
};

export default Home;
