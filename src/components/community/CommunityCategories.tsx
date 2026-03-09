import { useCommunityCategories } from "@/hooks/useCommunity";
import { cn } from "@/lib/utils";
import { MessageSquare, Gem, Store, Camera, Tag, HelpCircle } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "food-recommendations": <MessageSquare className="w-4 h-4" />,
  "hidden-gems": <Gem className="w-4 h-4" />,
  "restaurant-discussions": <Store className="w-4 h-4" />,
  "food-photos": <Camera className="w-4 h-4" />,
  "deals-discounts": <Tag className="w-4 h-4" />,
  "questions": <HelpCircle className="w-4 h-4" />,
};

interface Props {
  selected?: string;
  onSelect: (slug: string | undefined) => void;
}

export function CommunityCategories({ selected, onSelect }: Props) {
  const { data: categories } = useCommunityCategories();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(undefined)}
        className={cn(
          "px-3 py-1.5 rounded-xl text-sm font-medium transition-colors",
          !selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
        )}
      >
        All
      </button>
      {categories?.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.slug)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors",
            selected === cat.slug ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          {iconMap[cat.slug] || <MessageSquare className="w-4 h-4" />}
          {cat.name}
        </button>
      ))}
    </div>
  );
}
