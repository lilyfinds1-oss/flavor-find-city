import { Button } from "@/components/ui/button";

const quickPrompts = [
  { icon: "🍕", text: "Something quick and cheap" },
  { icon: "🥩", text: "A nice steakhouse for date night" },
  { icon: "🍛", text: "Best desi food nearby" },
  { icon: "🥗", text: "Healthy vegan options" },
  { icon: "🥙", text: "Halal restaurants" },
  { icon: "☕", text: "Cozy cafe for work" },
];

interface QuickPromptsProps {
  onSelect: (text: string) => void;
  disabled?: boolean;
}

export function QuickPrompts({ onSelect, disabled }: QuickPromptsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {quickPrompts.map((prompt, i) => (
        <Button
          key={i}
          variant="outline"
          size="sm"
          onClick={() => onSelect(prompt.text)}
          disabled={disabled}
          className="gap-2"
        >
          <span>{prompt.icon}</span>
          {prompt.text}
        </Button>
      ))}
    </div>
  );
}
