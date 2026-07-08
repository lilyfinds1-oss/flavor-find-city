import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BentoGridProps {
  className?: string;
  children: ReactNode;
}

export function BentoGrid({ className, children }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[12rem] gap-3 sm:gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  className?: string;
  children: ReactNode;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2 | 3;
  gradient?: string;
  as?: "div" | "a";
  href?: string;
}

const colMap: Record<number, string> = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
};
const rowMap: Record<number, string> = {
  1: "row-span-1",
  2: "row-span-2",
  3: "row-span-3",
};

export function BentoCard({
  className,
  children,
  colSpan = 1,
  rowSpan = 1,
  gradient,
}: BentoCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card",
        "transition-all duration-500 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5",
        colMap[colSpan],
        rowMap[rowSpan],
        className,
      )}
    >
      {gradient && (
        <div
          className="absolute inset-0 opacity-40 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none"
          style={{ background: gradient }}
        />
      )}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), hsl(var(--primary) / 0.15), transparent 40%)",
        }}
      />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
