import confetti from "canvas-confetti";

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Burst of celebratory confetti — used for XP earn / redemption. */
export function celebrateXP(amount?: number) {
  if (prefersReduced()) return;
  const colors = ["#ff8a4c", "#ffb347", "#ffd166", "#a78bfa", "#22d3ee"];
  confetti({
    particleCount: Math.min(120, 40 + (amount ?? 40)),
    spread: 70,
    startVelocity: 45,
    origin: { y: 0.7 },
    colors,
    scalar: 0.9,
    ticks: 180,
  });
  setTimeout(() => {
    confetti({
      particleCount: 60,
      spread: 100,
      angle: 60,
      origin: { x: 0, y: 0.8 },
      colors,
    });
    confetti({
      particleCount: 60,
      spread: 100,
      angle: 120,
      origin: { x: 1, y: 0.8 },
      colors,
    });
  }, 180);
}

/** Small "sparkle" burst at pointer / element for lightweight interactions. */
export function sparkleAt(target?: HTMLElement | null) {
  if (prefersReduced()) return;
  const rect = target?.getBoundingClientRect();
  const origin = rect
    ? {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      }
    : { x: 0.5, y: 0.5 };
  confetti({
    particleCount: 24,
    spread: 55,
    startVelocity: 25,
    scalar: 0.7,
    ticks: 120,
    origin,
    colors: ["#ffd166", "#ff8a4c", "#a78bfa"],
  });
}

/** Adds a temporary "xp-glow" class so consumers can pulse an element. */
export function pulseGlow(el?: HTMLElement | null, ms = 900) {
  if (!el || prefersReduced()) return;
  el.classList.add("xp-glow");
  window.setTimeout(() => el.classList.remove("xp-glow"), ms);
}
