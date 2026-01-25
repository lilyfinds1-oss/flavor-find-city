import { useState } from "react";
import { Send, Sparkles, MapPin, DollarSign, Utensils, Clock, Leaf, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
  { icon: "🍕", text: "Something quick and cheap" },
  { icon: "🥩", text: "A nice steakhouse for date night" },
  { icon: "🍛", text: "Best desi food nearby" },
  { icon: "🥗", text: "Healthy vegan options" },
  { icon: "🥙", text: "Halal restaurants" },
  { icon: "☕", text: "Cozy cafe for work" },
];

const mockSuggestions = [
  { name: "Spice Garden", slug: "spice-garden", cuisine: "Desi • Indian", price: "$$", match: "95% match" },
  { name: "Karahi Point", slug: "karahi-point", cuisine: "Pakistani • Halal", price: "$$", match: "92% match" },
  { name: "Mediterranean Grill", slug: "mediterranean-grill", cuisine: "Mediterranean • Halal", price: "$$", match: "88% match" },
];

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

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Based on your request for "${messageText}", here are my top picks! These restaurants match your preferences perfectly. 🎯`,
        suggestions: mockSuggestions,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
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
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {quickPrompts.map((prompt, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => handleSend(prompt.text)}
              className="gap-2"
            >
              <span>{prompt.icon}</span>
              {prompt.text}
            </Button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {/* Messages */}
          <div className="h-[400px] overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <p>{message.content}</p>

                  {/* Suggestions */}
                  {message.suggestions && (
                    <div className="mt-4 space-y-2">
                      {message.suggestions.map((suggestion, i) => (
                        <Link
                          key={i}
                          to={`/restaurant/${suggestion.slug}`}
                          className="block bg-card rounded-xl p-3 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-display font-semibold text-foreground">
                                {suggestion.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {suggestion.cuisine} • {suggestion.price}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-success/20 text-success">
                                {suggestion.match}
                              </Badge>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
