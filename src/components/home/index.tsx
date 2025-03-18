import React from "react";
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
      <Hero backgroundImage="https://images.unsplash.com/photo-1587653263995-422546a7a559?w=1512&q=80" />
      <FacilitiesSection />
      <PhilosophySection />
      <ProgramsSection />
      <AssistantSection onOpenAssistant={() => {}} />
    </div>
  );
};

export default Home;
