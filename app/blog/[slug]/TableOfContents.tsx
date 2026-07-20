"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/blog";

export default function TableOfContents({ entries }: { entries: TocEntry[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (entries.length === 0) return;

    const headingEls = entries
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (headingEls.length === 0) return;

    const observer = new IntersectionObserver(
      (obs) => {
        // Pick the topmost visible heading
        const visible = obs
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );

    headingEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <aside aria-label="Table of contents" className="sticky top-[82px] w-[300px] shrink-0 desktop-sm:hidden">
      <div className="mb-4 flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.09em] text-muted">
        <span className="inline-block h-2 w-2 bg-signal" aria-hidden="true" />
        On this page
      </div>

      <nav>
        <ul className="m-0 list-none p-0">
          {entries.map(({ id, text, level }) => {
            const isActive = activeId === id;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={[
                    "block border-l-2 py-1.5 transition-colors duration-100",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-focus)]",
                    "pl-4 font-mono text-[0.72rem]",
                    "leading-[1.5]",
                    isActive
                      ? "border-accent text-ink"
                      : "border-line text-muted hover:border-line-strong hover:text-ink",
                  ].join(" ")}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    setActiveId(id);
                  }}
                >
                  {text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
