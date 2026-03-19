import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export function PWAInstallPopup() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Don't show if already installed or dismissed this session
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (sessionStorage.getItem("pwa-popup-dismissed")) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show after a short delay so it doesn't feel intrusive
      setTimeout(() => setShow(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // For iOS (no beforeinstallprompt), show manual prompt after delay
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && isMobile) {
      setTimeout(() => setShow(true), 5000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isMobile]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
    handleDismiss();
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem("pwa-popup-dismissed", "true");
  };

  if (!show || dismissed || !isMobile) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] animate-slide-in-bottom">
      <div className="bg-card border border-border rounded-2xl p-4 shadow-2xl shadow-black/30">
        <button onClick={handleDismiss} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-ai flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-sm text-foreground">Get CityBites App</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Install for faster access, offline mode & push notifications
            </p>
            <div className="flex gap-2 mt-3">
              {deferredPrompt ? (
                <Button size="sm" variant="hero" onClick={handleInstall} className="gap-1.5 text-xs h-8">
                  <Download className="w-3.5 h-3.5" />
                  Install Now
                </Button>
              ) : (
                <Button size="sm" variant="hero" onClick={() => window.location.href = "/install"} className="gap-1.5 text-xs h-8">
                  <Download className="w-3.5 h-3.5" />
                  How to Install
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={handleDismiss} className="text-xs h-8 text-muted-foreground">
                Not now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
