import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface HeroProps {
  headline?: string;
  subheading?: string;
  backgroundImage?: string;
}

const Hero = ({
  headline = "Nurturing Young Minds in a Safe and Creative Environment",
  subheading = "At Ninio Kindergarten, we provide a stimulating educational experience that fosters creativity, curiosity, and confidence in every child.",
  backgroundImage = "https://images.unsplash.com/photo-1587653263995-422546a7a559?w=1512&q=80",
}: HeroProps) => {
  return (
    <div className="relative w-full h-[600px] bg-gray-100 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt="Children in kindergarten"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40 mix-blend-multiply" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {headline}
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-xl">
            {subheading}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="font-semibold">
              Register Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 font-semibold"
            >
              Learn More
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-10" />
      <div className="absolute -bottom-8 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl z-0" />
      <div className="absolute top-20 right-20 w-32 h-32 bg-primary/20 rounded-full blur-2xl z-0" />
    </div>
  );
};

export default Hero;
