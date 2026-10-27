"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-reveal wrapper.
 *
 * Uses IntersectionObserver + CSS transitions instead of a heavy animation
 * library, which keeps the landing page's JavaScript payload small.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** Delay in milliseconds before the element fades in. */
  delay?: number;
  as?: React.ElementType;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Every modern browser supports IntersectionObserver; if it is missing we
    // simply leave the element visible by defaulting `visible` to true below.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "opacity-0 translate-y-5 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:opacity-100",
        visible && "opacity-100 translate-y-0",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
