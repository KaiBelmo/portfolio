"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ArrowRight from "./_components/ui/ArrowRight";
import styles from "./not-found.module.css";

const PRIMARY_ACTION =
  "inline-flex min-h-11 items-center justify-center gap-2 border border-accent bg-transparent px-5 py-2 font-display text-[0.68rem] uppercase tracking-[0.06em] text-accent transition-colors duration-[120ms] ease-out hover:bg-accent hover:text-canvas focus-visible:bg-accent focus-visible:text-canvas";

const SECONDARY_ACTION =
  "inline-flex min-h-11 items-center justify-center gap-2 border border-line bg-transparent px-5 py-2 font-display text-[0.68rem] uppercase tracking-[0.06em] text-ink transition-colors duration-[120ms] ease-out hover:border-accent hover:text-accent focus-visible:border-accent focus-visible:text-accent";

// Curated pool of verified Giphy 404 GIFs (media.giphy.com).
// Direct media URLs comply with CSP (img-src https:) and require no API key.
const NOT_FOUND_GIFS = [
  {
    src: "https://media.giphy.com/media/PIBuZutkhuKqV09TEf/giphy.gif",
    alt: "404 not found typography",
    width: 480,
    height: 426,
  },
  {
    src: "https://media.giphy.com/media/UoeaPqYrimha6rdTFV/giphy.gif",
    alt: "Neon 404 glitch animation",
    width: 480,
    height: 270,
  },
  {
    src: "https://media.giphy.com/media/C21GGDOpKT6Z4VuByn/giphy.gif",
    alt: "404 digital distortion",
    width: 480,
    height: 270,
  },
  {
    src: "https://media.giphy.com/media/tvU9iTev6uBIQ/giphy.gif",
    alt: "Retro computer screen 404",
    width: 480,
    height: 324,
  },
  {
    src: "https://media.giphy.com/media/l2JehQ2GitHGdVG9y/giphy.gif",
    alt: "404 radar in deep space",
    width: 480,
    height: 362,
  },
  {
    src: "https://media.giphy.com/media/YyKPbc5OOTSQE/giphy.gif",
    alt: "404 static screen glitch",
    width: 500,
    height: 500,
  },
  {
    src: "https://media.giphy.com/media/hEc4k5ERazM1G/giphy.gif",
    alt: "404 error animation",
    width: 480,
    height: 270,
  },
];

export default function NotFound() {
  const [gif, setGif] = useState(() => NOT_FOUND_GIFS[0]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * NOT_FOUND_GIFS.length);
    setGif(NOT_FOUND_GIFS[randomIndex]);
  }, []);

  return (
    <section className="route-shell scroll-mt-5" aria-labelledby="not-found-title">
      <nav
        className="mb-[10px] flex min-h-11 items-center gap-2.5 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="flex min-h-11 items-center underline-offset-4 hover:text-accent hover:underline">
          Room
        </Link>
        <span aria-hidden="true">/</span>
        <strong className="font-bold text-ink" aria-current="page">
          Not found
        </strong>
      </nav>

      <div className="grid items-center gap-x-[clamp(28px,4vw,52px)] gap-y-[clamp(28px,4vw,44px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div
          data-scroll-reveal
          data-scroll-reveal-state="visible"
          suppressHydrationWarning
        >
          <p className="m-0 mb-[18px] flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted">
            <span
              aria-hidden="true"
              className={`inline-block h-1.5 w-1.5 shrink-0 bg-accent ${styles.statusPulse}`}
            />
            <span className="font-bold text-accent">404</span>
            <span aria-hidden="true" className="text-line-strong">
              |
            </span>
            <span>route not registered</span>
          </p>

          <h1
            id="not-found-title"
            className="m-0 mb-6 max-w-[15ch] font-display text-[clamp(3rem,7vw,6.2rem)] font-normal leading-[0.94] tracking-[-0.035em] text-ink"
          >
            No room at this address
          </h1>

          <p className="m-0 mb-8 max-w-[62ch] text-[1.05rem] leading-[1.65] text-muted">
            Nothing is registered on this path. The page may have moved, or the link that
            brought you here was typed by hand.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link className={PRIMARY_ACTION} href="/">
              Back to the room
              <ArrowRight />
            </Link>
            <Link className={SECONDARY_ACTION} href="/projects">
              All projects
              <ArrowRight />
            </Link>
          </div>
        </div>

        <aside
          className="flex min-w-0 items-center justify-center lg:self-center"
          aria-label="Route visual"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gif.src}
            width={gif.width}
            height={gif.height}
            alt={gif.alt}
            className="block h-auto w-full max-w-[420px] object-contain"
            decoding="async"
            suppressHydrationWarning
          />
        </aside>
      </div>
    </section>
  );
}
