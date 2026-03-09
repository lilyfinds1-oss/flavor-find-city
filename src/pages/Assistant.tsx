import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, ArrowRight, Zap } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurants } from "@/hooks/useRestaurants";
import { ChatMessage } from "@/components/assistant/ChatMessage";
import { cn } from "@/lib/utils";
import { SEOHead } from "@/components/seo/SEOHead";
import { useCity } from "@/contexts/CityContext";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: {
    name: string;
    slug: string;
    cuisine: string;
    price: string;
    match: string;
  }[];
};

const quickPrompts = [
  { emoji: "🔥", text: "What's trending right now?" },
  { emoji: "💑", text: "Perfect spot for a date night" },
  { emoji: "🍛", text: "Best biryani in Lahore" },
  { emoji: "🌙", text: "Open late night" },
  { emoji: "💰", text: "Great food under 1500 PKR" },
  { emoji: "🥗", text: "Healthy options nearby" },
];

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hey! 👋 I'm your AI food companion. Tell me what you're in the mood for — cuisine, budget, vibe, anything — and I'll find the perfect spot for you in Lahore.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data: restaurants } = useRestaurants({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke("food-assistant", {
        body: { 
          messages: conversationHistory,
          restaurants: restaurants?.slice(0, 20)
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || "I'm sorry, I couldn't process that request.",
        suggestions: data.suggestions,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling food assistant:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment! 🍽️",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead title="AI Food Assistant" description="Ask our AI assistant for personalized restaurant recommendations in Lahore based on your mood, cravings, or occasion." />
      <Header />
      
      <main className="flex-1 flex flex-col">
        {/* Hero section */}
        <div className="relative py-12 px-4 border-b border-border/30">
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-ai-pulse/5 rounded-full blur-[120px]" />
          
          <div className="relative max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ai-pulse/10 text-ai-pulse mb-4 animate-fade-in">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Discovery</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3 animate-fade-in-up">
              What should I eat <span className="gradient-text-ai">today</span>?
            </h1>
            <p className="text-muted-foreground animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              Describe your mood, cravings, or occasion. I'll find the perfect match.
            </p>
          </div>
        </div>

        {/* Chat container */}
        <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  "animate-fade-in-up",
                  index > 0 && "opacity-0"
                )}
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}
              >
                <ChatMessage message={message} />
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="glass rounded-2xl px-5 py-4">
                  <div className="typing-indicator text-ai-pulse">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts - show only when few messages */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-4 pb-4">
              <p className="text-xs text-muted-foreground mb-3 text-center">Try asking</p>
              <div className="flex flex-wrap justify-center gap-2">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt.text)}
                    disabled={isLoading}
                    className={cn(
                      "chip hover:bg-muted/80 hover:scale-105 active:scale-95 transition-all duration-200",
                      "opacity-0 animate-fade-in-up"
                    )}
                    style={{ animationDelay: `${i * 50}ms`, animationFillMode: "forwards" }}
                  >
                    <span>{prompt.emoji}</span>
                    <span className="text-sm">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="sticky bottom-0 p-4 glass-heavy border-t border-border/30">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="max-w-2xl mx-auto"
            >
              <div
                className={cn(
                  "relative flex items-center gap-3 p-2 rounded-2xl transition-all duration-300",
                  "bg-card border-2",
                  isFocused 
                    ? "border-ai-pulse/50 shadow-lg shadow-ai-pulse/10" 
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                {/* AI indicator */}
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
                  isFocused ? "bg-gradient-ai" : "bg-muted"
                )}>
                  <Sparkles className={cn(
                    "w-4 h-4 transition-colors",
                    isFocused ? "text-white" : "text-muted-foreground"
                  )} />
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="I'm craving something spicy and affordable..."
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none py-2"
                  disabled={isLoading}
                />

                <Button 
                  type="submit" 
                  variant="ai" 
                  size="icon"
                  className="rounded-xl"
                  disabled={isLoading || !input.trim()}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Glow effect */}
              {isFocused && (
                <div className="absolute -inset-1 bg-gradient-ai rounded-3xl opacity-10 blur-xl -z-10" />
              )}
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
