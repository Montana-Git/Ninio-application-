import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Languages, MessageSquare, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface AssistantSectionProps {
  onOpenAssistant: () => void;
}

const AssistantSection: React.FC<AssistantSectionProps> = ({
  onOpenAssistant,
}) => {
  const { t } = useTranslation();

  return (
    <section className="w-full py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2 space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {t("assistant.newFeature", "New Feature")}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {t("assistant.title", "Meet Our Bilingual AI Assistant")}
            </h2>

            <p className="text-lg text-gray-600">
              {t(
                "assistant.description",
                "Introducing Ninio Assistant, your helpful companion for all kindergarten-related questions. Get instant information about activities, programs, and events in both English and French.",
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={onOpenAssistant} className="gap-2">
                <MessageSquare className="h-5 w-5" />
                {t("assistant.chatButton", "Chat with Assistant")}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={onOpenAssistant}
              >
                <Languages className="h-5 w-5" />
                {t("assistant.frenchButton", "Parlez en Français")}
              </Button>
            </div>
          </div>

          <div className="md:w-1/2">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-xl z-0" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-200/30 rounded-full blur-xl z-0" />

              <Card className="relative z-10 border-2 border-primary/20 shadow-xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary p-2 rounded-full">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <p className="text-gray-800">
                          {t(
                            "assistant.englishGreeting",
                            "Hello! I'm Ninio Assistant. I can help you with information about our kindergarten activities and programs. How can I assist you today?",
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-primary p-2 rounded-full">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <p className="text-gray-800">
                          {t(
                            "assistant.frenchGreeting",
                            "Bonjour! Je suis l'Assistant Ninio. Je peux vous aider avec des informations sur les activités et les programmes de notre école maternelle. Comment puis-je vous aider aujourd'hui?",
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={onOpenAssistant} className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        {t("assistant.startChatting", "Start Chatting")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-t-4 border-t-blue-500">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-3 text-blue-700">
                {t("assistant.feature1.title", "Bilingual Support")}
              </h3>
              <p className="text-gray-600">
                {t(
                  "assistant.feature1.description",
                  "Get assistance in both English and French. Our AI assistant is fluent in both languages, making it accessible for all families in our community.",
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-green-500">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-3 text-green-700">
                {t("assistant.feature2.title", "Activity Information")}
              </h3>
              <p className="text-gray-600">
                {t(
                  "assistant.feature2.description",
                  "Ask about our educational activities, age-appropriate programs, and special events. Get detailed information to help your child make the most of their time at Ninio.",
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-purple-500">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-3 text-purple-700">
                {t("assistant.feature3.title", "24/7 Availability")}
              </h3>
              <p className="text-gray-600">
                {t(
                  "assistant.feature3.description",
                  "Our AI assistant is available anytime you need information, whether it's late at night or early in the morning. Get answers to your questions whenever it's convenient for you.",
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AssistantSection;
