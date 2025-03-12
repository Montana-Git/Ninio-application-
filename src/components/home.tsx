import React from "react";
import Navbar from "./layout/Navbar";
import Hero from "./home/Hero";
import ProgramsSection from "./home/ProgramsSection";
import PhilosophySection from "./home/PhilosophySection";
import FacilitiesSection from "./home/FacilitiesSection";
import Footer from "./layout/Footer";

function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar transparent={true} />
      <main className="flex-1">
        <Hero />
        <ProgramsSection />
        <PhilosophySection />
        <FacilitiesSection />
      </main>
      <Footer />
    </div>
  );
}

export default Home;
