import { useState } from "react";
import Navbar from "./layout/Navbar";
import Hero from "./home/Hero";
import ProgramsSection from "./home/ProgramsSection";
import PhilosophySection from "./home/PhilosophySection";
import FacilitiesSection from "./home/FacilitiesSection";
import AssistantSection from "./home/AssistantSection";
import NinioAssistant from "./ai/NinioAssistant";
import Footer from "./layout/Footer";
import { useAuth } from "@/contexts/AuthContext";

function Home() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const { user } = useAuth();

  const handleOpenAssistant = () => {
    setIsAssistantOpen(true);
  };

  const handleCloseAssistant = () => {
    setIsAssistantOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar transparent={true} user={user} onOpenAssistant={handleOpenAssistant} />
      <main className="flex-1">
        <Hero useThreeJsBackground={true} />
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
