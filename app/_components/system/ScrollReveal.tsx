"use client";

import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const REVEAL_SELECTOR = [
  "[data-scroll-reveal]",
  ".blog-prose > h2",
  ".blog-prose > h3",
  ".blog-prose > p",
  ".blog-prose > pre",
  ".blog-prose > blockquote",
  ".blog-prose > ul",
  ".blog-prose > ol",
  ".blog-prose > hr",
  ".blog-prose > img",
].join(",");

export default function ScrollReveal({
  children,
}: {
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = Boolean(useReducedMotion());

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = Array.from(
      root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
    ).filter((element) => {
      const parentReveal = element.parentElement?.closest("[data-scroll-reveal]");
      return !parentReveal || parentReveal === element;
    });

    if (!targets.length) return;

    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      for (const target of targets) {
        target.dataset.scrollRevealState = "visible";
      }
      return;
    }

    const viewportCutoff = window.innerHeight * 0.9;
    const pending: HTMLElement[] = [];

    for (const [index, target] of targets.entries()) {
      const rect = target.getBoundingClientRect();

      // The page transition already handles content that starts in the first
      // viewport. Scroll reveals are reserved for content encountered later.
      if (rect.top < viewportCutoff) {
        target.dataset.scrollRevealState = "visible";
        continue;
      }

      target.dataset.scrollRevealState = "pending";
      target.style.setProperty(
        "--scroll-reveal-delay",
        `${(index % 3) * 45}ms`,
      );
      pending.push(target);
    }

    if (!pending.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const target = entry.target as HTMLElement;
          target.dataset.scrollRevealState = "visible";
          observer.unobserve(target);
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.08,
      },
    );

    for (const target of pending) observer.observe(target);

    return () => observer.disconnect();
  }, [reduceMotion]);

  return (
    <div className="scroll-reveal-scope" ref={rootRef}>
      {children}
    </div>
  );
}
