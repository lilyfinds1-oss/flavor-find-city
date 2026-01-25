import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MapPin, DollarSign, Utensils, Leaf } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurants } from "@/hooks/useRestaurants";
import { ChatMessage } from "@/components/assistant/ChatMessage";
import { QuickPrompts } from "@/components/assistant/QuickPrompts";

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

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hey there! 👋 I'm your personal food assistant. Tell me what you're craving, your budget, or any dietary preferences, and I'll find the perfect restaurant for you!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
      // Prepare conversation history for the API
      const conversationHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke("food-assistant", {
        body: { 
          messages: conversationHistory,
          restaurants: restaurants?.slice(0, 20) // Send top 20 restaurants for context
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
      <Header />
      
      <main className="flex-1 container max-w-3xl py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">AI-Powered</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            What should I eat today?
          </h1>
          <p className="text-muted-foreground">
            Tell me your mood, budget, and preferences. I'll find your perfect match!
          </p>
        </div>

        {/* Quick Prompts */}
        <QuickPrompts onSelect={handleSend} disabled={isLoading} />

        {/* Chat Area */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {/* Messages */}
          <div className="h-[400px] overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="I'm craving something spicy and affordable..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" variant="hero" disabled={isLoading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { icon: DollarSign, label: "Budget" },
            { icon: Utensils, label: "Cuisine" },
            { icon: MapPin, label: "Location" },
            { icon: Leaf, label: "Dietary" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <item.icon className="w-4 h-4 text-primary" />
              <span>Considers {item.label.toLowerCase()}</span>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
