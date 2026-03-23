import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { SEOHead } from "@/components/seo/SEOHead";
import { Briefcase, Heart } from "lucide-react";

export default function Careers() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead title="Careers — CityBites" description="Join the CityBites team and help build Pakistan's leading food discovery platform." />
      <Header />
      <PageTransition>
        <main className="flex-1">
          <section className="relative bg-gradient-to-b from-primary/10 to-background py-20 sm:py-28">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-ai flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Join the <span className="gradient-text">CityBites</span> Team
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We're a passionate team building the future of food discovery in Pakistan. Come build something delicious with us.
              </p>
            </div>
          </section>

          <section className="max-w-3xl mx-auto px-4 py-16 text-center">
            <div className="bg-card border border-border/50 rounded-2xl p-10">
              <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">No Open Positions Right Now</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're not actively hiring at the moment, but we're always looking for talented people. Drop us a line at{" "}
                <a href="mailto:careers@citybites.pk" className="text-primary hover:underline">careers@citybites.pk</a> and we'll keep your profile on file.
              </p>
            </div>
          </section>
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}
