import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Download, Smartphone, Wifi, Zap, CheckCircle, Apple, Monitor, Share, MoreVertical, Plus, ChevronRight, Bell, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const platforms = [
  {
    id: "ios",
    label: "iPhone / iPad",
    icon: Apple,
    color: "from-gray-600 to-gray-800",
    steps: [
      { icon: Globe, title: "Open in Safari", desc: "CityBites must be opened in Safari browser (not Chrome or Firefox)" },
      { icon: Share, title: "Tap the Share button", desc: "Tap the share icon (square with arrow) at the bottom of Safari" },
      { icon: Plus, title: "Add to Home Screen", desc: "Scroll down and tap 'Add to Home Screen'" },
      { icon: CheckCircle, title: "Confirm & Launch", desc: "Tap 'Add' in the top right, then find the app on your home screen" },
    ],
  },
  {
    id: "android",
    label: "Android",
    icon: Smartphone,
    color: "from-green-600 to-green-800",
    steps: [
      { icon: Globe, title: "Open in Chrome", desc: "Open CityBites in Google Chrome browser" },
      { icon: MoreVertical, title: "Tap the menu (⋮)", desc: "Tap the three dots in the top-right corner" },
      { icon: Download, title: "Install App", desc: "Tap 'Install app' or 'Add to Home screen'" },
      { icon: CheckCircle, title: "Confirm & Launch", desc: "Tap 'Install' in the popup, then find the app in your app drawer" },
    ],
  },
  {
    id: "desktop",
    label: "Desktop",
    icon: Monitor,
    color: "from-blue-600 to-blue-800",
    steps: [
      { icon: Globe, title: "Open in Chrome or Edge", desc: "Navigate to CityBites in a supported browser" },
      { icon: Download, title: "Click install icon", desc: "Look for the install icon (⊕) in the address bar on the right" },
      { icon: CheckCircle, title: "Confirm installation", desc: "Click 'Install' in the popup dialog" },
      { icon: Monitor, title: "Launch from desktop", desc: "Find CityBites in your Start Menu, Dock, or Applications folder" },
    ],
  },
];

const faqs = [
  { q: "Is this a real app?", a: "Yes! CityBites is a Progressive Web App (PWA) — it works just like a native app with offline support, push notifications, and full-screen mode, but doesn't need to be downloaded from the App Store or Play Store." },
  { q: "Does it take up a lot of space?", a: "No. PWAs are extremely lightweight — typically under 5MB, compared to 50-200MB for a traditional app. It caches intelligently so you only download what you need." },
  { q: "Will I get push notifications?", a: "Yes, on Android and desktop you'll receive push notifications for new deals, review approvals, and more. iOS support for push notifications is available on iOS 16.4 and later." },
  { q: "Can I use it offline?", a: "Absolutely! Once installed, you can browse previously loaded restaurants, view cached content, and access core features even without an internet connection." },
  { q: "How do I uninstall it?", a: "Same as any app — on mobile, long-press the icon and tap Remove/Uninstall. On desktop, right-click the icon or go to chrome://apps and remove it." },
  { q: "Is it free?", a: "100% free to install and use. CityBites is free for all users with optional premium features for restaurant owners." },
];

const benefits = [
  { icon: Zap, title: "2x Faster", desc: "Loads instantly from cache" },
  { icon: Wifi, title: "Works Offline", desc: "No internet? No problem" },
  { icon: Bell, title: "Push Alerts", desc: "Never miss a deal" },
  { icon: Smartphone, title: "Full Screen", desc: "No browser UI clutter" },
];

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("ios");

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    if (window.matchMedia("(display-mode: standalone)").matches) setIsInstalled(true);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const activePlatform = platforms.find((p) => p.id === selectedPlatform)!;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead title="Install CityBites App" description="Install CityBites on your phone or desktop for the best food discovery experience — faster, offline-ready, and always one tap away." />
      <Header />
      <PageTransition>
        <main className="flex-1">
          {/* Hero */}
          <section className="relative overflow-hidden py-16 md:py-20">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            <div className="container relative max-w-3xl mx-auto text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-ai flex items-center justify-center shadow-lg shadow-primary/20">
                <Download className="w-10 h-10 text-white" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Install <span className="gradient-text">CityBites</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Get the full app experience — faster, offline-ready, and always one tap away. No app store needed.
              </p>

              {isInstalled ? (
                <div className="flex items-center justify-center gap-2 text-green-500 mb-8">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">App is already installed!</span>
                </div>
              ) : deferredPrompt ? (
                <Button size="xl" variant="hero" className="gap-2 mb-8" onClick={handleInstall}>
                  <Download className="w-5 h-5" />
                  Install CityBites Now
                </Button>
              ) : null}

              {/* Benefits grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
                {benefits.map((b) => (
                  <div key={b.title} className="p-4 rounded-2xl bg-card border border-border text-center">
                    <b.icon className="w-7 h-7 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold text-sm text-foreground">{b.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Installation Steps */}
          <section className="py-12 md:py-16">
            <div className="container max-w-3xl mx-auto">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">
                How to Install
              </h2>

              {/* Platform Tabs */}
              <div className="flex justify-center gap-2 mb-8">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlatform(p.id)}
                    className={cn(
                      "flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all",
                      selectedPlatform === p.id
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
                    )}
                  >
                    <p.icon className="w-4 h-4" />
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Steps */}
              <div className="space-y-4">
                {activePlatform.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white bg-gradient-to-br", activePlatform.color)}>
                      <span className="font-bold text-sm">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <step.icon className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-foreground">{step.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
                    </div>
                    {i < activePlatform.steps.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-3" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-12 md:py-16 bg-card/50">
            <div className="container max-w-2xl mx-auto">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-xl px-5 data-[state=open]:border-primary/20">
                    <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}
