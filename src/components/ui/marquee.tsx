import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  className?: string;
  children: ReactNode;
  pauseOnHover?: boolean;
  reverse?: boolean;
  durationSec?: number;
}

/**
 * Infinite horizontal marquee. Content is duplicated for seamless looping.
 * Uses CSS keyframes defined inline for zero-runtime cost.
 */
export function Marquee({
  className,
  children,
  pauseOnHover = true,
  reverse = false,
  durationSec = 40,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "group relative flex w-full overflow-hidden [--gap:1.5rem]",
        "[mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden={i === 1}
          className={cn(
            "flex shrink-0 items-center gap-[var(--gap)] pr-[var(--gap)]",
            "motion-safe:animate-[marquee_var(--dur)_linear_infinite]",
            reverse && "[animation-direction:reverse]",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
          )}
          style={{ ["--dur" as string]: `${durationSec}s` }}
        >
          {children}
        </div>
      ))}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-100% - var(--gap))); }
        }
      `}</style>
    </div>
  );
}
