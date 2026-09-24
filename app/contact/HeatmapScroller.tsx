"use client";

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Horizontal scroll container for the contributions heatmap.
 *
 * The grid is chronological left-to-right, so on screens where it overflows
 * we start scrolled to the end: the most recent weeks are what the headline
 * ("N contributions in the last year") is talking about.
 */
export default function HeatmapScroller({
  className,
  style,
  children,
}: {
  className: string;
  style: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth - el.clientWidth;
  }, []);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
