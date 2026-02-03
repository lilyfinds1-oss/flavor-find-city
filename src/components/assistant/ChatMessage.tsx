import { Link } from "react-router-dom";
import { ChevronRight, Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Suggestion = {
  name: string;
  slug: string;
  cuisine: string;
  price: string;
  match: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: Suggestion[];
};

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={cn(
      "flex",
      message.role === "user" ? "justify-end" : "justify-start"
    )}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3",
          message.role === "user"
            ? "bg-gradient-primary text-white"
            : "glass border border-border/50"
        )}
      >
        <p className={cn(
          "whitespace-pre-wrap text-sm leading-relaxed",
          message.role === "assistant" && "text-foreground"
        )}>
          {message.content}
        </p>

        {/* Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-4 space-y-2">
            {message.suggestions.map((suggestion, i) => (
              <Link
                key={i}
                to={`/restaurant/${suggestion.slug}`}
                className="block bg-card/80 rounded-xl p-3 hover:bg-card transition-colors border border-border/50 group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {suggestion.name}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                      <span>{suggestion.cuisine}</span>
                      <span className="text-primary font-medium">{suggestion.price}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className="bg-success/20 text-success border-0 text-xs">
                      {suggestion.match}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
