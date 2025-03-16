import React, { useState } from "react";
import Navbar from "./layout/Navbar";
import Hero from "./home/Hero";
import ProgramsSection from "./home/ProgramsSection";
import PhilosophySection from "./home/PhilosophySection";
import FacilitiesSection from "./home/FacilitiesSection";
import AssistantSection from "./home/AssistantSection";
import NinioAssistant from "./ai/NinioAssistant";
import Footer from "./layout/Footer";

function Home() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const handleOpenAssistant = () => {
    setIsAssistantOpen(true);
  };

  const handleCloseAssistant = () => {
    setIsAssistantOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar transparent={true} />
      <main className="flex-1">
        <Hero />
        <ProgramsSection />
        <PhilosophySection />
        <FacilitiesSection />
        <AssistantSection onOpenAssistant={handleOpenAssistant} />
      </main>
      <Footer />
      <NinioAssistant isOpen={isAssistantOpen} onClose={handleCloseAssistant} />
    </div>
  );
}

export default Home;
