import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    gsap.set(el, { scaleX: 0, transformOrigin: "left center" });
    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        gsap.to(el, { scaleX: self.progress, duration: 0.1, overwrite: true });
      },
    });
    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[200] pointer-events-none">
      <div
        ref={barRef}
        className="h-full w-full bg-gradient-to-r from-primary via-ai-pulse to-amber"
      />
    </div>
  );
}
