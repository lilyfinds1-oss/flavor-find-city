import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Wifi, Zap, CheckCircle } from "lucide-react";

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const features = [
    { icon: Zap, title: "Lightning Fast", desc: "Loads instantly, even on slow connections" },
    { icon: Wifi, title: "Works Offline", desc: "Browse restaurants without internet" },
    { icon: Smartphone, title: "Home Screen", desc: "Launch like a native app from your phone" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <PageTransition>
        <main className="flex-1 container py-16">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-ai flex items-center justify-center shadow-lg">
              <Download className="w-10 h-10 text-white" />
            </div>

            <h1 className="font-display text-4xl font-bold mb-4">
              Install <span className="gradient-text">CityBites</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Get the full app experience on your phone — faster, offline-ready, and always one tap away.
            </p>

            {isInstalled ? (
              <div className="flex items-center justify-center gap-2 text-success mb-8">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">App is installed!</span>
              </div>
            ) : deferredPrompt ? (
              <Button size="lg" variant="hero" className="gap-2 mb-8" onClick={handleInstall}>
                <Download className="w-5 h-5" />
                Install CityBites
              </Button>
            ) : (
              <div className="bg-card rounded-xl border border-border p-6 mb-8 text-left">
                <p className="font-semibold mb-3">How to install:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><strong>iPhone:</strong> Tap the Share button → "Add to Home Screen"</li>
                  <li><strong>Android:</strong> Tap the menu (⋮) → "Install App" or "Add to Home Screen"</li>
                  <li><strong>Desktop:</strong> Click the install icon in the address bar</li>
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {features.map((f) => (
                <div key={f.title} className="bg-card rounded-xl border border-border p-5 text-center">
                  <f.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}
