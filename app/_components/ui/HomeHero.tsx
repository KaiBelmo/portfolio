"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import RoomScene from "./RoomScene";
import MobileProjectCard from "./MobileProjectCard";
import { useTheme } from "../system/ThemeProvider";
import { projects } from "@/data/projects";
import styles from "./HomeHero.module.css";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(dateStr: string) {
  const parts = dateStr.split("-");
  if (parts.length >= 2) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${MONTHS[monthIndex]} ${year}`;
    }
  }
  return dateStr;
}


export default function HomeHero() {
  const {
    theme,
    roomAnimation,
    startRoomAnimation,
    finishRoomAnimation,
    failRoomAnimation,
    reportVideoFrame,
  } = useTheme();

  const [expandedMobileProjectId, setExpandedMobileProjectId] = useState<string>();
  const sceneRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const card = cardRef.current;
    if (!scene || !card) return;

    const MAX = 8;
    let cachedRect: DOMRect | null = null;
    let rafPending = false;
    let lastEvent: PointerEvent | null = null;

    function updateRect() {
      cachedRect = scene!.getBoundingClientRect();
    }

    function reset() {
      scene!.classList.remove("is-hover");
      card!.classList.remove("is-tilting");
      card!.style.setProperty("--tilt-rx", "0deg");
      card!.style.setProperty("--tilt-ry", "0deg");
    }

    function applyTilt(e: PointerEvent) {
      if (!cachedRect) updateRect();
      const r = cachedRect!;
      const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      scene!.classList.add("is-hover");
      card!.classList.add("is-tilting");
      card!.style.setProperty("--tilt-ry", ((px - 0.5) * MAX).toFixed(2) + "deg");
      card!.style.setProperty("--tilt-rx", ((0.5 - py) * MAX).toFixed(2) + "deg");
      card!.style.setProperty("--tilt-gx", (px * 100).toFixed(1) + "%");
      card!.style.setProperty("--tilt-gy", (py * 100).toFixed(1) + "%");
    }

    function track(e: PointerEvent) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      lastEvent = e;
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        if (lastEvent) { applyTilt(lastEvent); lastEvent = null; }
        rafPending = false;
      });
    }

    function onPointerDown(e: PointerEvent) {
      if (e.pointerType !== "mouse") {
        try { scene!.setPointerCapture(e.pointerId); } catch (_) {}
      }
    }

    function onPointerLeave(e: PointerEvent) {
      if (e.pointerType === "mouse") reset();
    }

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, { passive: true });
    scene.addEventListener("pointerdown", onPointerDown);
    scene.addEventListener("pointermove", track);
    scene.addEventListener("pointerup", reset);
    scene.addEventListener("pointercancel", reset);
    scene.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
      scene.removeEventListener("pointerdown", onPointerDown);
      scene.removeEventListener("pointermove", track);
      scene.removeEventListener("pointerup", reset);
      scene.removeEventListener("pointercancel", reset);
      scene.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  const featuredProjects = ["infill", "voidgen", "lessshare"]
    .map((id) => projects.find((project) => project.id === id))
    .filter((project): project is (typeof projects)[number] => Boolean(project));

  return (
    <section className="flex overflow-hidden bg-transparent" id="home" aria-labelledby="home-hero-title">
      <div className={`${styles.heroGrid} mx-auto grid w-[min(1480px,100%)] grid-cols-[minmax(440px,1fr)_minmax(520px,1.2fr)] items-start gap-[clamp(24px,4vw,48px)] px-[clamp(28px,5vw,76px)] pt-[clamp(64px,6vw,92px)] desktop-md:grid-cols-[minmax(390px,0.9fr)_minmax(470px,1.1fr)] desktop-md:px-[clamp(24px,4vw,52px)] desktop-sm:grid-cols-1 desktop-sm:gap-9 tablet:grid-cols-1 tablet:gap-9 tablet:px-5 tablet:pb-11 tablet:pt-[54px] compact:px-[18px] compact:pb-10 compact:pt-12`}>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Copy column Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <div className="relative z-[6] max-w-[700px]">

          <p className="m-0 inline-flex min-h-11 max-w-full flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[clamp(0.48rem,0.58vw,0.56rem)] font-normal uppercase leading-[1.2] tracking-[0.06em] text-[color-mix(in_srgb,var(--ink)_82%,#000)] no-underline">
            <span aria-hidden="true" className="block h-px w-[clamp(22px,2.4vw,34px)] flex-none bg-current" />
            <span>Prefer the retro version?</span>
            <a className="min-w-0 [overflow-wrap:anywhere] text-[color-mix(in_srgb,var(--ink)_70%,#fff)] underline underline-offset-[3px] transition-colors duration-[120ms] ease-out hover:text-accent focus-visible:text-accent" href="https://portfolio-win95.vercel.app/" target="_blank" rel="noreferrer">
              Open the Windows 95 portfolio.
            </a>
          </p>

          <h1
            className={`${styles.titleOverlap} relative z-[6] mt-[8px] mb-[22px] font-display text-6xl font-bold text-ink tablet:text-3xl compact:text-2xl`}
            id="home-hero-title"
          >
            Kai is a Chimera Made From Engineering, Art, And Everything Between Them.
          </h1>

          <p className="mb-10 max-w-[650px] font-body text-[clamp(1rem,1.3vw,1.15rem)] leading-[1.65] text-muted tablet:text-base">
            He builds front-ends and back-end servers, while debugging issues, optimizing performance, and exploring his love of math. more on{" "}
            <Link
              href="/about/"
              className="text-ink underline decoration-transparent underline-offset-[3px] transition-[color,text-decoration-color] duration-[120ms] ease-out hover:text-accent hover:decoration-accent"
            >
              /about
            </Link>
          </p>

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ Desktop columns Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
          <div className="mt-7 grid grid-cols-2 gap-[clamp(24px,4vw,48px)] tablet:hidden">

            {/* Projects */}
            <div className="grid gap-[18px]">
              <h2 className="mb-2 font-display text-[0.82rem] font-bold uppercase tracking-[0.06em] text-ink">Projects Ã¢â€ â€œ</h2>
              <div className="grid gap-[10px]">
                {featuredProjects.map((project) => (
                  <div key={project.id} className="grid min-h-[2.65rem] gap-1">
                    <a
                      href={project.githubLink || project.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink font-display text-[0.95rem] font-normal leading-[1.2] tracking-[0.02em] underline decoration-transparent underline-offset-[3px] transition-[color,text-decoration-color] duration-[120ms] ease-out hover:text-accent hover:decoration-accent"
                    >
                      {project.name} @ {project.category[0]}
                    </a>
                    <span className="text-muted font-mono text-[0.66rem] tracking-[0.06em] uppercase">
                      {formatDate(project.date)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="grid gap-[10px]">
              <h2 className="mb-2 font-display text-[0.82rem] font-bold uppercase tracking-[0.06em] text-ink">Contact Ã¢â€ â€œ</h2>
              <div className="grid gap-[10px]">
                {[
                  { label: "Email", href: "mailto:contact@kaibelmo.dev", text: "contact@kaibelmo.dev", external: false },
                  { label: "LinkedIn", href: "https://www.linkedin.com/in/belmo/", text: "linkedin.com/in/belmo", external: true },
                  { label: "Resume", href: "/resume.pdf", text: "resume.pdf", external: true },
                ].map(({ label, href, text, external }) => (
                  <div key={label} className="grid min-h-[2.65rem] content-start gap-1">
                    <a
                      href={href}
                      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                      className="text-ink font-display text-[0.95rem] font-normal leading-[1.2] underline decoration-transparent underline-offset-[3px] transition-[color,text-decoration-color] duration-[120ms] ease-out hover:text-accent hover:decoration-accent"
                    >
                      {text}
                    </a>
                    <span className="text-muted font-mono text-[0.66rem] tracking-[0.06em] uppercase">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ Mobile columns (Ã¢â€°Â¤800px) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
          <div className="hidden tablet:grid grid-cols-1 gap-4 mt-5">

            {/* Mobile projects */}
            <div className="grid gap-2">
              <h2 className="font-display text-[0.72rem] tracking-[0.08em] uppercase text-muted">Projects Ã¢â€ â€œ</h2>
              <div className="grid gap-[6px]">
                {featuredProjects.map((project) => (
                  <MobileProjectCard
                    key={project.id}
                    project={project}
                    expanded={expandedMobileProjectId === project.id}
                    onToggle={() => setExpandedMobileProjectId(expandedMobileProjectId === project.id ? undefined : project.id)}
                  />
                ))}
              </div>
              <Link
                className="flex items-center justify-center min-h-[40px] border border-accent font-display text-[0.62rem] tracking-[0.04em] uppercase text-accent hover:bg-accent hover:text-canvas transition-colors duration-[120ms]"
                href="/projects"
              >
                All projects -&gt;
              </Link>
            </div>

            {/* Mobile contact */}
            <div className="grid gap-2">
              <h2 className="font-display text-[0.72rem] tracking-[0.08em] uppercase text-muted">Contact Ã¢â€ â€œ</h2>
              <p className="m-0 font-body text-[0.74rem] leading-[1.5] text-muted">Reach out Ã¢â‚¬â€ I usually reply within two working days.</p>
              <div className="border border-line">
                {[
                  { label: "Email", href: "mailto:contact@kaibelmo.dev", text: "contact@kaibelmo.dev", external: false },
                  { label: "LinkedIn", href: "https://www.linkedin.com/in/belmo/", text: "linkedin.com/in/belmo", external: true },
                  { label: "Resume", href: "/resume.pdf", text: "resume.pdf", external: true },
                ].map(({ label, href, text, external }) => (
                  <div key={label} className="grid grid-cols-[56px_1fr] items-baseline gap-2 px-3 py-2 border-b border-line last:border-b-0">
                    <span className="font-mono text-[0.5rem] tracking-[0.06em] uppercase text-muted">{label}</span>
                    <a
                      href={href}
                      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                      className="text-ink font-display text-[0.72rem] leading-[1.2] truncate underline decoration-transparent underline-offset-[3px] transition-[color,text-decoration-color] duration-[120ms] hover:text-accent hover:decoration-accent"
                    >
                      {text}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Scene aside Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <aside
          ref={sceneRef}
          className={`${styles.scene} relative z-[2] -ml-[clamp(0px,1.5vw,12px)] self-start [perspective:var(--tilt-perspective)] desktop-md:-ml-[54px] desktop-sm:ml-0 tablet:hidden`}
          aria-label="Interactive pixel-art workspace"
        >
          <div ref={cardRef} className={`${styles.sceneCard} relative border-none shadow-[0_8px_24px_color-mix(in_srgb,var(--shadow)_24%,transparent)] [transform-style:preserve-3d]`}>
            <div className="absolute z-[4] top-3.5 right-3.5 grid gap-[3px] px-[11px] py-2 text-surface bg-ink font-mono text-[0.5rem] font-bold tracking-[0.07em] uppercase shadow-pixel-accent">
              <span>Workspace / {roomAnimation ? roomAnimation.to : theme}</span>
              <span className="text-[color-mix(in_srgb,var(--surface)_66%,transparent)]">{roomAnimation ? "Time-lapse running" : "Explore Ã¢â‚¬â€ hover or tab through objects"}</span>
            </div>
            <RoomScene
              theme={theme}
              animation={roomAnimation}
              onAnimationStart={startRoomAnimation}
              onAnimationComplete={finishRoomAnimation}
              onAnimationError={failRoomAnimation}
              onFrame={reportVideoFrame}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}
