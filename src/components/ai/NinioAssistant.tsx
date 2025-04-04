import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, User, Languages, Loader2, X } from "lucide-react";
import { getGroqChatCompletion } from "@/lib/groq";
import { retry } from "@/utils/api";
import { ApiError } from "@/utils/errors";

interface Message {
  role: "user" | "assistant";
  content: string;
  language: "en" | "fr";
}

interface NinioAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const NinioAssistant: React.FC<NinioAssistantProps> = ({ isOpen, onClose }) => {
  // Function to generate mock responses when API fails
  const getMockResponse = (query: string, lang: "en" | "fr"): string => {
    const lowerQuery = query.toLowerCase();

    // English responses
    if (lang === "en") {
      if (
        lowerQuery.includes("activities") ||
        lowerQuery.includes("programs")
      ) {
        return "Our kindergarten offers various activities including arts and crafts, music, outdoor play, storytelling, and basic numeracy and literacy. Our programs run from Monday to Friday, 8 AM to 3 PM, with extended care available until 5 PM.";
      } else if (
        lowerQuery.includes("schedule") ||
        lowerQuery.includes("hours")
      ) {
        return "Ninio Kindergarten is open Monday to Friday from 8 AM to 3 PM. Extended care is available from 3 PM to 5 PM for an additional fee. We follow the local school district calendar for holidays and breaks.";
      } else if (
        lowerQuery.includes("contact") ||
        lowerQuery.includes("phone") ||
        lowerQuery.includes("email")
      ) {
        return "You can contact Ninio Kindergarten at info@niniokindergarten.com or call us at (555) 123-4567. Our administrative office is open weekdays from 8 AM to 4 PM.";
      } else if (
        lowerQuery.includes("enroll") ||
        lowerQuery.includes("register") ||
        lowerQuery.includes("admission")
      ) {
        return "To enroll your child at Ninio Kindergarten, please complete the registration form on our website or visit our office. We require proof of age, medical records, and a registration fee. Enrollment is open year-round, subject to availability.";
      } else {
        return "Thank you for your question about Ninio Kindergarten. We're a nurturing environment focused on early childhood development through play-based learning. How else can I assist you with information about our programs, activities, or enrollment process?";
      }
    }
    // French responses
    else {
      if (
        lowerQuery.includes("activités") ||
        lowerQuery.includes("programmes")
      ) {
        return "Notre école maternelle propose diverses activités, notamment des arts plastiques, de la musique, des jeux en plein air, des contes et des notions de base en calcul et en lecture. Nos programmes se déroulent du lundi au vendredi, de 8h à 15h, avec une garde prolongée disponible jusqu'à 17h.";
      } else if (
        lowerQuery.includes("horaire") ||
        lowerQuery.includes("heures")
      ) {
        return "L'école maternelle Ninio est ouverte du lundi au vendredi de 8h à 15h. Une garde prolongée est disponible de 15h à 17h moyennant des frais supplémentaires. Nous suivons le calendrier du district scolaire local pour les vacances et les pauses.";
      } else if (
        lowerQuery.includes("contact") ||
        lowerQuery.includes("téléphone") ||
        lowerQuery.includes("email")
      ) {
        return "Vous pouvez contacter l'école maternelle Ninio à info@niniokindergarten.com ou nous appeler au (555) 123-4567. Notre bureau administratif est ouvert en semaine de 8h à 16h.";
      } else if (
        lowerQuery.includes("inscrire") ||
        lowerQuery.includes("inscription") ||
        lowerQuery.includes("admission")
      ) {
        return "Pour inscrire votre enfant à l'école maternelle Ninio, veuillez remplir le formulaire d'inscription sur notre site web ou visiter notre bureau. Nous avons besoin d'une preuve d'âge, de dossiers médicaux et de frais d'inscription. L'inscription est ouverte toute l'année, sous réserve de disponibilité.";
      } else {
        return "Merci pour votre question sur l'école maternelle Ninio. Nous sommes un environnement nourricier axé sur le développement de la petite enfance par l'apprentissage par le jeu. Comment puis-je vous aider davantage avec des informations sur nos programmes, activités ou processus d'inscription ?";
      }
    }
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<"en" | "fr">("en");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            language === "en"
              ? "Hello! I'm Ninio Assistant. I can help you with information about activities, events, and programs at our kindergarten. How can I assist you today?"
              : "Bonjour! Je suis l'Assistant Ninio. Je peux vous aider avec des informations sur les activités, les événements et les programmes de notre école maternelle. Comment puis-je vous aider aujourd'hui?",
          language,
        },
      ]);
    }
  }, [language, messages.length]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      language,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Format conversation history for the API
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add the new user message
      conversationHistory.push({
        role: "user",
        content: input,
      });

      // Prepare system message based on language
      const systemMessage =
        language === "en"
          ? "You are Ninio Assistant, an AI helper for Ninio Kindergarten. Provide helpful information about kindergarten activities, programs, and events. Always respond in English."
          : "Vous êtes l'Assistant Ninio, une IA d'aide pour l'école maternelle Ninio. Fournissez des informations utiles sur les activités, les programmes et les événements de la maternelle. Répondez toujours en français.";

      // Add system message to the beginning of the messages array
      const apiMessages = [
        { role: "system", content: systemMessage },
        ...conversationHistory,
      ];

      // Call the Groq API using our utility function with retry logic
      let assistantResponse;
      try {
        const completion = await retry(
          async () => getGroqChatCompletion(apiMessages),
          {
            maxRetries: 3,
            initialDelay: 500,
            onRetry: (error, attempt) => {
              console.warn(`AI API call failed, retrying (${attempt}/3)...`, error);
              setMessages(prev => [
                ...prev,
                {
                  role: "assistant",
                  content: `I'm thinking... (retry ${attempt}/3)`,
                  language,
                }
              ]);
            }
          }
        );
        assistantResponse = completion.choices[0].message.content;
      } catch (apiError) {
        console.error("Error calling Groq API after retries:", apiError);

        // Check if the error is related to browser environment
        if (apiError.message && apiError.message.includes('browser-like environment')) {
          console.warn('Using mock response due to browser environment restrictions');
          assistantResponse = getMockResponse(userMessage.content, language);
        } else {
          // For other errors, use a generic fallback response
          assistantResponse = "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later or contact support if the problem persists.";
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: assistantResponse,
          language,
        },
      ]);
    } catch (error) {
      console.error("Error calling AI API:", error);

      // Use mock response if API fails
      const mockResponse = getMockResponse(input, language);

      // Add mock response or error message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: mockResponse,
          language,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "fr" : "en"));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md">
      <Card className="border-primary shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-full">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg">Ninio Assistant</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                className="h-8 w-8"
                title={
                  language === "en" ? "Switch to French" : "Switch to English"
                }
              >
                <Languages className="h-4 w-4" />
                <span className="sr-only">Toggle Language</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
          <CardDescription>
            {language === "en"
              ? "Ask me about kindergarten activities and programs"
              : "Posez-moi des questions sur les activités et programmes de la maternelle"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-md">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-2 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${message.role === "user" ? "bg-blue-100" : "bg-primary/10"}`}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Bot className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg ${message.role === "user" ? "bg-blue-100" : "bg-white border"}`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {message.language === "en" ? "English" : "Français"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[80%]">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="p-3 rounded-lg bg-white border">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <CardFooter className="border-t pt-3">
          <div className="flex w-full items-center space-x-2">
            <Input
              placeholder={
                language === "en"
                  ? "Type your message..."
                  : "Tapez votre message..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NinioAssistant;
