import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import InteractiveBackground from "../three/InteractiveBackground";

interface HeroProps {
  headline?: string;
  subheading?: string;
  backgroundImage?: string;
  useThreeJsBackground?: boolean;
}

const Hero = ({
  headline,
  subheading,
  backgroundImage = "https://images.unsplash.com/photo-1587653263995-422546a7a559?w=1512&q=80",
  useThreeJsBackground = true, // Default to using Three.js background
}: HeroProps) => {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fallback image in case the provided URL fails
  const fallbackImage =
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1512&q=80";

  // Reset states when backgroundImage changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [backgroundImage]);

  return (
    <div className="relative w-full h-[650px] bg-gray-100 overflow-hidden">
      {/* Background */}
      {useThreeJsBackground ? (
        <>
          <InteractiveBackground />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-primary/30 mix-blend-multiply z-1" />
        </>
      ) : (
        <>
          {/* Background Image (fallback) */}
          <div className="absolute inset-0 z-0">
            <img
              src={imageError ? fallbackImage : backgroundImage}
              alt="Children in kindergarten"
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/50 mix-blend-multiply" />
          </div>

          {/* Loading state */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-gray-200">
              <p className="text-gray-600">Loading image...</p>
            </div>
          )}
        </>
      )}

      {/* Content Container */}
      <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in-up">
            {headline || t("home.hero.title")}
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-xl animate-fade-in-up animation-delay-200">
            {subheading || t("home.hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-400">
            <Link to="/auth/register">
              <Button size="lg" className="font-semibold w-full sm:w-auto">
                {t("home.hero.cta")}
              </Button>
            </Link>
            <Link to="/programs">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 font-semibold w-full sm:w-auto"
              >
                {t("nav.learnMore", "Learn More")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-10" />
      <div className="absolute -bottom-8 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl z-5" />
      <div className="absolute top-20 right-20 w-32 h-32 bg-primary/20 rounded-full blur-2xl z-5" />
    </div>
  );
};

export default Hero;
