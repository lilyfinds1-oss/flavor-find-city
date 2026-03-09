import { useState } from "react";
import { Share2, Copy, Check, Twitter, Facebook, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ShareRestaurantProps {
  name: string;
  slug: string;
  description?: string | null;
  variant?: "icon" | "button";
}

export function ShareRestaurant({ name, slug, description, variant = "icon" }: ShareRestaurantProps) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/restaurant/${slug}`;
  const text = `Check out ${name} on CityBites! ${description ? description.slice(0, 100) : ""}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: name, text, url });
        return;
      } catch {}
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTwitter = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
  const shareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, "_blank");

  // Try native share first on mobile
  if (navigator.share && variant === "icon") {
    return (
      <Button variant="glass" size="icon" className="w-9 h-9 sm:w-10 sm:h-10" onClick={handleNativeShare}>
        <Share2 className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "icon" ? (
          <Button variant="glass" size="icon" className="w-9 h-9 sm:w-10 sm:h-10">
            <Share2 className="w-5 h-5" />
          </Button>
        ) : (
          <Button variant="outline" size="lg" className="w-full gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopy} className="gap-2">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Link"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareTwitter} className="gap-2">
          <Twitter className="w-4 h-4" />
          Twitter / X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareFacebook} className="gap-2">
          <Facebook className="w-4 h-4" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareWhatsApp} className="gap-2">
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
