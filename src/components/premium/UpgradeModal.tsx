import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ChefHat, Megaphone, Rocket } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Unlock AI Tools</DialogTitle>
          <DialogDescription className="text-center">
            Upgrade your restaurant to access premium AI-powered features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <ChefHat className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">AI Menu Analyzer</p>
              <p className="text-xs text-muted-foreground">Extract dishes from photos or text automatically</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Megaphone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">AI Marketing Assistant</p>
              <p className="text-xs text-muted-foreground">Generate social media posts and ad copy instantly</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Rocket className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">Advanced AI Tools</p>
              <p className="text-xs text-muted-foreground">Menu intelligence, trend analysis, and more</p>
            </div>
          </div>
        </div>

        <Link to="/pricing" className="block">
          <Button className="w-full gap-2" size="lg">
            <Sparkles className="w-4 h-4" />
            View Plans
          </Button>
        </Link>
      </DialogContent>
    </Dialog>
  );
}
