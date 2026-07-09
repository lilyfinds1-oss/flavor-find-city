import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

interface AnimatedListProps<T> {
  items: T[];
  keyFor: (item: T, index: number) => string;
  render: (item: T, index: number) => React.ReactNode;
  className?: string;
  itemClassName?: string;
  stagger?: number;
  emptyState?: React.ReactNode;
}

/**
 * GSAP-driven list: children fade + slide in on mount and whenever the item
 * set changes. Prepended items (new notifications) get a distinct highlight.
 */
export function AnimatedList<T>({
  items, keyFor, render, className, itemClassName, stagger = 0.06, emptyState,
}: AnimatedListProps<T>) {
  const containerRef = useRef<HTMLUListElement>(null);
  const prevKeys = useRef<Set<string>>(new Set());

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const nodes = Array.from(el.querySelectorAll<HTMLLIElement>("[data-al-item]"));
    if (!nodes.length) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const currentKeys = new Set(nodes.map((n) => n.dataset.alKey || ""));
    const isFirstRender = prevKeys.current.size === 0;

    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set(nodes, { opacity: 1, y: 0 });
        return;
      }

      if (isFirstRender) {
        gsap.fromTo(
          nodes,
          { opacity: 0, y: 14, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out", stagger }
        );
      } else {
        // Highlight only genuinely new items
        const newNodes = nodes.filter((n) => !prevKeys.current.has(n.dataset.alKey || ""));
        if (newNodes.length) {
          gsap.fromTo(
            newNodes,
            { opacity: 0, y: -12, scale: 0.96, backgroundColor: "hsl(var(--primary) / 0.15)" },
            {
              opacity: 1, y: 0, scale: 1, backgroundColor: "hsl(var(--primary) / 0)",
              duration: 0.6, ease: "power3.out",
            }
          );
        }
      }
    }, el);

    prevKeys.current = currentKeys;
    return () => ctx.revert();
  }, [items, stagger]);

  if (!items.length && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <ul ref={containerRef} className={cn("flex flex-col", className)}>
      {items.map((item, i) => {
        const key = keyFor(item, i);
        return (
          <li key={key} data-al-item data-al-key={key} className={itemClassName}>
            {render(item, i)}
          </li>
        );
      })}
    </ul>
  );
}
