import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Subtle 3D tilt + spotlight follow on hover.
 * Attach the returned ref to the element you want to tilt.
 */
export function useTilt<T extends HTMLElement = HTMLElement>(max = 6) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    el.style.transformStyle = "preserve-3d";
    el.style.willChange = "transform";

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (py - 0.5) * -2 * max;
      const ry = (px - 0.5) * 2 * max;
      gsap.to(el, {
        rotateX: rx,
        rotateY: ry,
        transformPerspective: 800,
        duration: 0.4,
        ease: "power3.out",
      });
      el.style.setProperty("--mouse-x", `${px * 100}%`);
      el.style.setProperty("--mouse-y", `${py * 100}%`);
    };
    const onLeave = () => {
      gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" });
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [max]);

  return ref;
}
