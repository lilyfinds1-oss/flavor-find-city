import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent! We'll get back to you soon.");
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead title="Contact Us — CityBites" description="Get in touch with the CityBites team. We'd love to hear from you." />
      <Header />
      <PageTransition>
        <main className="flex-1">
          <section className="relative bg-gradient-to-b from-primary/10 to-background py-20 sm:py-28">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Get in <span className="gradient-text">Touch</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Have a question, suggestion, or partnership inquiry? We'd love to hear from you.
              </p>
            </div>
          </section>

          <section className="max-w-5xl mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">Contact Information</h2>
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Email</p>
                        <a href="mailto:hello@citybites.pk" className="text-muted-foreground hover:text-primary transition-colors">hello@citybites.pk</a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Community</p>
                        <p className="text-muted-foreground">Join the discussion on our community forum</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Location</p>
                        <p className="text-muted-foreground">Lahore, Pakistan</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8">
                <h3 className="font-display text-xl font-semibold text-foreground mb-6">Send a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input placeholder="Your name" required className="bg-muted/50" />
                    <Input type="email" placeholder="Your email" required className="bg-muted/50" />
                  </div>
                  <Input placeholder="Subject" required className="bg-muted/50" />
                  <Textarea placeholder="Your message..." required rows={5} className="bg-muted/50 resize-none" />
                  <Button variant="hero" className="w-full" disabled={sending}>
                    {sending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>
            </div>
          </section>
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}
