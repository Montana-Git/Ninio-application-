import React from "react";
import Hero from "./Hero";
import FacilitiesSection from "./FacilitiesSection";
import PhilosophySection from "./PhilosophySection";
import ProgramsSection from "./ProgramsSection";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero backgroundImage="https://images.unsplash.com/photo-1587653263995-422546a7a559?w=1512&q=80" />
      <FacilitiesSection />
      <PhilosophySection />
      <ProgramsSection />
    </div>
  );
};

export default Home;
