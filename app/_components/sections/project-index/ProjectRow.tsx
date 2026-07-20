"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import type { Project } from "@/types/project";
import { actionLabel } from "./constants";
import { stateListItemVariants, stateTransition } from "../../ui/stateAnimations";

export default function ProjectRow({
  project,
  projectNumber,
  active,
  stars,
  onActivate,
}: {
  project: Project;
  projectNumber: number;
  active: boolean;
  stars?: string;
  onActivate: () => void;
}) {
  const reduceMotion = !!useReducedMotion();

  return (
    <motion.article
      data-scroll-reveal
      data-scroll-reveal-state="visible"
      suppressHydrationWarning
      className="border-b border-sys-line tablet:min-w-0 tablet:border-0"
      variants={stateListItemVariants}
      initial="hidden"
      animate="visible"
      transition={stateTransition(reduceMotion)}
      onMouseEnter={onActivate}
      onFocus={onActivate}
    >
      <button
        className={`grid w-full grid-cols-[42px_minmax(0,1fr)_150px] items-center gap-4 border-0 px-3 py-[22px] text-left text-inherit ${active ? "bg-sys-signal-soft" : "bg-transparent"}`}
        type="button"
        aria-current={active}
        onClick={onActivate}
      >
        <span className="font-display text-[0.72rem] text-sys-signal">
          {String(projectNumber).padStart(2, "0")}
        </span>
        <span>
          <span className="flex items-baseline justify-between gap-3">
            <span className="inline-flex min-w-0 flex-wrap items-baseline gap-x-2">
              <strong className="font-display text-base [overflow-wrap:anywhere]">{project.name}</strong>
              {stars && Number(stars) > 0 && (
                <span
                  className="font-mono text-[0.65rem] text-sys-signal"
                  aria-label={`${stars} GitHub stars`}
                >
                  * {Number(stars).toLocaleString()}
                </span>
              )}
            </span>
            <span className="font-display text-[0.78rem] leading-none text-sys-muted">
              {new Date(project.date).getFullYear()}
            </span>
          </span>
          <span className="block text-[0.8rem] text-sys-muted tablet:mt-1.5 [overflow-wrap:anywhere]">
            {project.homepageEvidence}
          </span>
          <span className="mt-2 flex flex-wrap gap-1.5 [overflow-wrap:anywhere] [&>span]:border [&>span]:border-sys-line [&>span]:px-1.5 [&>span]:py-0.5 [&>span]:font-mono [&>span]:text-[0.65rem] tablet:[&>span:nth-child(n+3)]:hidden">
            {project.technologies?.slice(0, 3).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </span>
        </span>
        <span className="block text-right text-[0.8rem] text-sys-muted [overflow-wrap:anywhere] tablet:col-start-2 tablet:flex tablet:flex-wrap tablet:items-center tablet:justify-between tablet:gap-x-3 tablet:gap-y-1 tablet:text-left">
          <span className="mb-5 block tablet:m-0 tablet:min-w-0 tablet:flex-1 tablet:basis-[12rem]">
            {project.projectType}
          </span>
          <span className="mb-5 block font-display text-[0.72rem] text-sys-signal tablet:hidden">
            {actionLabel(project)} -&gt;
          </span>
        </span>
      </button>
    </motion.article>
  );
}
