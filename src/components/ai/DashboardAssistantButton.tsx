import { useState } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import NinioAssistant from "./NinioAssistant";

const DashboardAssistantButton = () => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const handleToggleAssistant = () => {
    setIsAssistantOpen(!isAssistantOpen);
  };

  return (
    <>
      {/* Assistant Dialog */}
      {isAssistantOpen && (
        <div className="fixed bottom-20 right-6 z-50">
          <NinioAssistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
        </div>
      )}

      {/* Assistant Button */}
      <Button
        onClick={handleToggleAssistant}
        className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg z-50"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>
    </>
  );
};

export default DashboardAssistantButton;
