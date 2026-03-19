import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, Zap, Wifi, Bell, Smartphone } from "lucide-react";

const features = [
  { icon: Zap, title: "Lightning Fast", desc: "Instant load times, smooth animations" },
  { icon: Wifi, title: "Works Offline", desc: "Browse restaurants without internet" },
  { icon: Bell, title: "Push Notifications", desc: "Get deal alerts & review updates" },
  { icon: Smartphone, title: "Home Screen", desc: "One tap to launch, just like native" },
];

export function PWASection() {
  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="container relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Available on all devices</span>
          </div>

          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Take <span className="gradient-text">CityBites</span> everywhere
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Install our app for the best experience — works on iPhone, Android, and desktop. No app store needed.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {features.map((f) => (
              <div key={f.title} className="p-4 rounded-2xl bg-card border border-border hover:border-primary/20 transition-colors">
                <f.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-sm text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>

          <Link to="/install">
            <Button variant="hero" size="xl" className="gap-2">
              <Download className="w-5 h-5" />
              Install CityBites App
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
