import { useState, useEffect } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingAssistantButtonProps {
  onClick: () => void;
}

const FloatingAssistantButton = ({ onClick }: FloatingAssistantButtonProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when user scrolls down 300px from the top
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);
    
    // Initial check
    handleScroll();
    
    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div 
      className={cn(
        "fixed bottom-6 right-6 z-50 transition-all duration-300 transform",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
      )}
    >
      <Button 
        size="lg" 
        className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
        onClick={onClick}
        aria-label="Open AI Assistant"
      >
        <Bot className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default FloatingAssistantButton;
