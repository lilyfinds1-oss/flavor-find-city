import { useState } from "react";
import { Share2, Twitter, Facebook, Link as LinkIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ShareReviewProps {
  restaurantName: string;
  restaurantSlug: string;
  rating: number;
  reviewTitle?: string | null;
}

export function ShareReview({ restaurantName, restaurantSlug, rating, reviewTitle }: ShareReviewProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/restaurant/${restaurantSlug}`;
  const shareText = reviewTitle
    ? `${reviewTitle} — ${rating}★ review of ${restaurantName} on CityBites`
    : `Check out my ${rating}★ review of ${restaurantName} on CityBites!`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const handleFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
      "_blank"
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Share2 className="w-3.5 h-3.5" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleTwitter} className="gap-2 cursor-pointer">
          <Twitter className="w-4 h-4" />
          Twitter / X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleFacebook} className="gap-2 cursor-pointer">
          <Facebook className="w-4 h-4" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWhatsApp} className="gap-2 cursor-pointer">
          <span className="text-base leading-none">💬</span>
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className="gap-2 cursor-pointer">
          {copied ? <Check className="w-4 h-4 text-success" /> : <LinkIcon className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Link"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
