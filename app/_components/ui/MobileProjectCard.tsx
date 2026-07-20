"use client";

import { ChevronDown, ExternalLink, Github, Star } from "lucide-react";
import type { Project } from "@/types/project";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(dateStr: string) {
  const parts = dateStr.split("-");
  if (parts.length >= 2) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) return `${MONTHS[monthIndex]} ${year}`;
  }
  return dateStr;
}

function isOpenSource(project: Project) {
  return project.disciplines?.includes("Open source");
}

function projectHref(project: Project) {
  return project.link || project.githubLink;
}

export default function MobileProjectCard({
  project,
  stars,
  expanded,
  onToggle,
}: {
  project: Project;
  stars?: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const starCount = stars || project.stars;
  const showStars = starCount && Number(starCount) > 0;
  const chips = (project.technologies && project.technologies.length > 0 ? project.technologies : project.category).slice(0, 3);
  const primaryLabel = project.link && !isOpenSource(project) ? "View live" : "View repo";

  return (
    <article className={`border border-line bg-[color-mix(in_srgb,var(--ink)_4%,transparent)] transition-[border-color,background-color] duration-[120ms] hover:border-accent hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] ${expanded ? "border-accent bg-[color-mix(in_srgb,var(--accent)_5%,transparent)]" : ""}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left"
        aria-expanded={expanded}
        aria-controls={`mobile-project-panel-${project.id}`}
      >
        <span className="flex min-w-0 flex-col gap-2">
          <span className="flex min-w-0 items-center gap-2">
            <strong className="truncate font-display text-[0.82rem] tracking-[0.01em]">{project.name}</strong>
            {showStars && (
              <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[0.5rem] tracking-[0.04em] text-accent" aria-label={`${starCount} GitHub stars`}>
                <Star size={9} fill="currentColor" aria-hidden="true" />
                {Number(starCount).toLocaleString()}
              </span>
            )}
          </span>
          <span className="flex flex-wrap gap-1">
            {chips.map((tag) => (
              <span key={tag} className="border border-line px-1.5 py-px font-mono text-[0.52rem] uppercase tracking-[0.04em] text-muted">{tag}</span>
            ))}
          </span>
          <span className="line-clamp-2 max-w-full font-body text-[0.7rem] leading-[1.42] text-muted">
            {project.homepageEvidence || project.description}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2 pt-1">
          <span className="font-mono text-[0.5rem] uppercase tracking-[0.05em] text-muted">{formatDate(project.date)}</span>
          <ChevronDown size={12} aria-hidden="true" className={`text-muted transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
        </span>
      </button>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-line px-4 pb-4 pt-3.5" id={`mobile-project-panel-${project.id}`}>
          {project.features && project.features.length > 0 && (
            <ul className="m-0 grid list-disc gap-1 pl-3.5">
              {project.features.slice(0, 3).map((feature) => (
                <li key={feature} className="font-body text-[0.68rem] leading-[1.42] text-muted">{feature}</li>
              ))}
            </ul>
          )}

          {isOpenSource(project) && project.pullRequests && project.pullRequests.length > 0 && (
            <div className="border-t border-line pt-2">
              <span className="mb-2 block font-display text-[0.58rem] uppercase tracking-[0.08em] text-muted">Pull Requests ({project.pullRequests.length})</span>
              <ul className="m-0 flex list-none flex-col gap-1 p-0">
                {project.pullRequests.map((pr) => (
                  <li key={pr.number}>
                    <a href={pr.url} target="_blank" rel="noreferrer" className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-2 text-[0.68rem] leading-[1.35] transition-colors hover:text-accent hover:underline">
                      <span className="shrink-0 font-display text-accent">{pr.number}</span>
                      {pr.title && <span className="min-w-0 truncate text-muted">{pr.title}</span>}
                      <ExternalLink size={9} aria-hidden="true" className="shrink-0 text-muted" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-1.5 min-[420px]:grid-cols-2">
            <a href={projectHref(project)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-1.5 border border-accent px-3 py-2 font-display text-[0.62rem] uppercase tracking-[0.04em] text-accent transition-colors duration-[120ms] hover:bg-accent hover:text-canvas">
              {primaryLabel}
              <ExternalLink size={12} aria-hidden="true" />
            </a>
            {project.link && project.githubLink && !isOpenSource(project) && (
              <a href={project.githubLink} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-1.5 border border-line px-3 py-2 font-display text-[0.62rem] uppercase tracking-[0.04em] text-ink transition-colors duration-[120ms] hover:border-accent hover:text-accent">
                View repo
                <Github size={13} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
