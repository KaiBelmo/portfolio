"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Project } from "@/types/project";
import { GithubIcon } from "@/app/contact/contactData";
import ProjectVisual from "../ui/ProjectVisual";
import SystemFrame from "../system/SystemFrame";
import RecordHeader from "../system/RecordHeader";
import DataRow from "../system/DataRow";

const disciplines = ["All", "Web Apps", "Real-time", "Low-level", "Open source"];
const filterControlClass =
  "min-h-11 border border-sys-line bg-[color-mix(in_srgb,var(--sys-bg)_84%,transparent)] px-[13px] py-2 text-[0.76rem] text-sys-cream tablet:flex-1 tablet:basis-[140px] aria-pressed:bg-sys-signal aria-pressed:text-sys-bg";
const projectActionClass =
  "inline-flex min-h-11 flex-auto items-center justify-center gap-2 border border-sys-signal bg-transparent px-4 py-[9px] text-center font-display text-[0.68rem] uppercase tracking-[0.04em] text-sys-signal hover:bg-sys-signal hover:text-sys-bg";
const iconActionClass =
  "inline-flex min-h-11 flex-[0_0_44px] items-center justify-center border border-sys-line-strong bg-transparent text-sys-cream hover:bg-sys-cream hover:text-sys-bg";
const projectGithubIcon = <span className="[&>svg]:size-4">{GithubIcon}</span>;

function isOpenSource(project: Project) {
  return project.disciplines?.includes("Open source");
}

function actionLabel(project: Project) {
  if (isOpenSource(project)) return "View Repo";
  if (!project.link) return "View Repo";
  return "View Live Site";
}

function projectHref(project: Project) {
  return project.link || project.githubLink;
}

export default function ProjectIndex({
  projects,
  totalProjects,
  showViewAll = true,
}: {
  projects: Project[];
  totalProjects: number;
  showViewAll?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialDiscipline = searchParams.get("discipline") || "All";
  
  const [discipline, setDiscipline] = useState(
    disciplines.includes(initialDiscipline) ? initialDiscipline : "All"
  );
  const [year, setYear] = useState(searchParams.get("year") || "All");
  const [technology, setTechnology] = useState<string[]>(
    searchParams.get("technology") ? searchParams.get("technology")!.split(",") : []
  );
  const [showTechnologies, setShowTechnologies] = useState(Boolean(searchParams.get("technology")));
  const [activeId, setActiveId] = useState(projects[0]?.id);
  const [expandedId, setExpandedId] = useState<string>();

  // stars: map of project id → star count string
  const [starsMap, setStarsMap] = useState<Record<string, string>>(() =>
    Object.fromEntries(projects.filter((p) => p.stars).map((p) => [p.id, p.stars!]))
  );

  useEffect(() => {
    fetch("/api/github-stars")
      .then((r) => r.json())
      .then((data: { id: string; stars: string | null }[]) => {
        const map: Record<string, string> = {};
        for (const entry of data) {
          if (entry.stars) map[entry.id] = entry.stars;
        }
        setStarsMap(map);
      })
      .catch(() => {/* keep static fallback already in state */});
  }, []);

  const years = useMemo(() => {
    return Array.from(
      new Set(projects.map((project) => String(new Date(project.date).getFullYear())))
    )
      .sort()
      .reverse();
  }, [projects]);

  const technologies = useMemo(() => {
    return Array.from(new Set(projects.flatMap((project) => project.technologies || []))).sort();
  }, [projects]);

  const counts = useMemo(() => {
    return Object.fromEntries(
      disciplines.map((item) => [
        item,
        item === "All"
          ? projects.length
          : projects.filter((project) => project.disciplines?.includes(item)).length,
      ])
    );
  }, [projects]);

  const filtered = projects.filter(
    (project) =>
      (discipline === "All" || project.disciplines?.includes(discipline)) &&
      (year === "All" || String(new Date(project.date).getFullYear()) === year) &&
      (technology.length === 0 || technology.some((t) => project.technologies?.includes(t)))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const active = filtered.find((project) => project.id === activeId) || filtered[0];

  useEffect(() => {
    const params = new URLSearchParams();
    if (discipline !== "All") params.set("discipline", discipline);
    if (year !== "All") params.set("year", year);
    if (technology.length > 0) params.set("technology", technology.join(","));
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false });
  }, [discipline, year, technology, pathname, router]);

  const clear = () => {
    setDiscipline("All");
    setYear("All");
    setTechnology([]);
  };

  return (
    <section className="px-[clamp(20px,5vw,72px)] pb-[clamp(64px,8vw,120px)] pt-[clamp(36px,5vw,72px)] scroll-mt-5 tablet:px-4 tablet:py-[58px]" aria-labelledby="project-index-heading">
      <nav className="mb-[10px] flex min-h-11 items-center gap-2.5 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted" aria-label="Breadcrumb">
        <Link href="/" className="flex min-h-11 items-center underline-offset-4 hover:text-accent hover:underline">Room</Link>
        <span aria-hidden="true">/</span>
        <strong className="font-bold text-ink" aria-current="page">Projects</strong>
      </nav>

      <h1 id="project-index-heading" className="m-0 mb-4 font-display text-[clamp(3rem,7vw,6.2rem)] font-normal leading-none">Projects</h1>

      <p className="mb-7 text-sm leading-relaxed text-sys-muted">
        Projects I built, contributed to, or developed within an{" "}
        <span className="group relative inline-block">
          <span className="cursor-default text-sys-cream underline decoration-sys-signal decoration-wavy underline-offset-4 outline-offset-2 focus-visible:rounded-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sys-focus" tabIndex={0}>organization</span>
          <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 w-max max-w-[260px] -translate-x-1/2 translate-y-1 border border-sys-line-strong bg-sys-raised px-3 py-2 text-[0.72rem] leading-[1.5] text-sys-cream opacity-0 transition-[opacity,transform] duration-150 ease-out after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-[5px] after:border-transparent after:border-t-sys-line-strong group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 motion-reduce:transition-opacity" role="tooltip">
            Shared here with the organization&apos;s agreement and blessing
          </span>
          
        </span>
        ; and chose to open source.
      </p>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-[18px] gap-y-2.5 border-y border-sys-line-strong py-3.5 tablet:grid-cols-1" aria-label="Filter projects" data-scroll-reveal data-scroll-reveal-state="visible" suppressHydrationWarning>
        <div className="flex flex-wrap gap-2" aria-label="Discipline">
          {disciplines.map((item) => (
            <button
              key={item}
              type="button"
              className={filterControlClass}
              aria-pressed={discipline === item}
              onClick={() => setDiscipline(item)}
            >
              {item} <span>[{counts[item]}]</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 tablet:justify-start">
          {years.length > 1 && (
            <label className="flex min-h-11 items-center gap-2 font-display text-[0.76rem] text-sys-cream tablet:flex-1 tablet:basis-[220px]">
              Year{" "}
              <select className={`${filterControlClass} min-w-24 tablet:flex-1`} value={year} onChange={(event) => setYear(event.target.value)}>
                <option>All</option>
                {years.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          )}
          <button
            className={filterControlClass}
            type="button"
            aria-expanded={showTechnologies}
            aria-controls="technology-filters"
            onClick={() => setShowTechnologies((value) => !value)}
          >
            Tech filter {showTechnologies ? "−" : "+"}
          </button>
          <button
            className={filterControlClass}
            type="button"
            onClick={clear}
            disabled={discipline === "All" && year === "All" && technology.length === 0}
          >
            Clear filters
          </button>
        </div>
        {showTechnologies && (
          <div className="col-span-full flex flex-wrap gap-2 pt-0.5" id="technology-filters">
            <p className="m-0 mb-1 w-full font-display text-[0.68rem] tracking-[0.03em] text-sys-muted opacity-70">
              Ctrl+click to select multiple — shows projects matching any selected tech
            </p>
            {technologies.map((item) => (
              <button
                type="button"
                key={item}
                className={filterControlClass}
                aria-pressed={technology.includes(item)}
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    // toggle this item in/out of the selection
                    setTechnology((prev) =>
                      prev.includes(item)
                        ? prev.filter((t) => t !== item)
                        : [...prev, item]
                    );
                  } else {
                    // normal click: select only this one, or deselect if already sole selection
                    setTechnology((prev) =>
                      prev.length === 1 && prev[0] === item ? [] : [item]
                    );
                  }
                }}
              >
                {item}
              </button>
            ))}
            {technology.length > 0 && (
              <button
                type="button"
                className="min-h-11 border border-sys-line bg-transparent px-2 py-0.5 font-display text-[0.72rem] text-sys-signal"
                onClick={() => setTechnology([])}
              >
                Clear ×
              </button>
            )}
          </div>
        )}
      </div>

      {filtered.length ? (
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(0,460px)] items-start gap-6 tablet:grid-cols-1 tablet:min-w-0">
          <div className="border-t border-sys-line-strong tablet:min-w-0 tablet:border-sys-line">
            {filtered.map((project, index) => {
              const expanded = expandedId === project.id;
              return (
                <article
                  data-scroll-reveal
                  data-scroll-reveal-state="visible"
                  suppressHydrationWarning
                  className={`border-b border-sys-line tablet:min-w-0 ${active?.id === project.id ? "bg-sys-signal-soft tablet:bg-transparent" : ""}`}
                  key={project.id}
                  onMouseEnter={() => setActiveId(project.id)}
                  onFocus={() => setActiveId(project.id)}
                >
                  <button
                    className="grid w-full grid-cols-[42px_minmax(0,1fr)_150px] items-center gap-4 border-0 bg-transparent px-3 py-[22px] text-left text-inherit tablet:grid-cols-[30px_1fr] tablet:gap-3 tablet:px-0 tablet:py-[18px] tablet:[&[aria-expanded=true]]:pb-3 tablet:[&>span]:min-w-0"
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={`project-panel-${project.id}`}
                    onClick={() => setExpandedId(expanded ? undefined : project.id)}
                  >
                    <span className="font-display text-[0.72rem] text-sys-signal">{String(index + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="inline-flex min-w-0 flex-wrap items-baseline gap-x-2">
                          <strong className="font-display text-base [overflow-wrap:anywhere]">{project.name}</strong>
                          {starsMap[project.id] && Number(starsMap[project.id]) > 0 && (
                            <span className="font-mono text-[0.65rem] text-sys-signal" aria-label={`${starsMap[project.id]} GitHub stars`}>
                              ★ {Number(starsMap[project.id]).toLocaleString()}
                            </span>
                          )}
                        </span>
                        <span className="font-display text-[0.78rem] leading-none text-sys-muted">{new Date(project.date).getFullYear()}</span>
                      </span>
                      <span className="block text-[0.8rem] text-sys-muted tablet:mt-1.5 [overflow-wrap:anywhere]">{project.homepageEvidence}</span>
                      <span className="mt-2 flex flex-wrap gap-1.5 [overflow-wrap:anywhere] [&>span]:border [&>span]:border-sys-line [&>span]:px-1.5 [&>span]:py-0.5 [&>span]:font-mono [&>span]:text-[0.65rem] tablet:[&>span:nth-child(n+3)]:hidden">
                        {project.technologies?.slice(0, 3).map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </span>
                    </span>
                    <span className="block text-right text-[0.8rem] text-sys-muted [overflow-wrap:anywhere] tablet:col-start-2 tablet:flex tablet:justify-between tablet:gap-3 tablet:text-left">
                      <span className="mb-5 block tablet:m-0 tablet:max-w-[58%]">{project.projectType}</span>
                      <span className="mb-5 block font-display text-[0.72rem] text-sys-signal tablet:hidden">{actionLabel(project)} →</span>
                      <span className="mb-5 hidden font-display text-[0.72rem] text-sys-signal tablet:m-0 tablet:block tablet:flex-none">{expanded ? "Close" : "Details"} {expanded ? "−" : "+"}</span>
                    </span>
                  </button>
                  <div
                    className="hidden tablet:block tablet:pb-[22px] tablet:pl-[42px] max-[420px]:pl-0"
                    id={`project-panel-${project.id}`}
                    hidden={!expanded}
                  >
                    <div className={`relative mb-3.5 h-40 overflow-hidden border border-sys-line bg-sys-bg max-[420px]:h-[138px] frame-${project.visualType}`}>
                      <ProjectVisual project={project} />
                    </div>
                    <div className="mb-3.5 flex flex-wrap gap-2">
                      <a className={`${projectActionClass} tablet:flex-1 tablet:basis-[150px]`} href={projectHref(project)} target="_blank" rel="noreferrer">
                        {actionLabel(project)}
                        <ExternalLink size={14} aria-hidden="true" />
                      </a>
                      {project.link && !isOpenSource(project) ? (
                        <a className={iconActionClass} href={project.githubLink} target="_blank" rel="noreferrer" aria-label={`${project.name} GitHub repository`}>
                          {projectGithubIcon}
                        </a>
                      ) : null}
                    </div>
                    <div className="border-t border-sys-line">
                      {isOpenSource(project) && (
                        <>
                          <DataRow label="My Contribution" value={project.homepageEvidence} stacked noUppercase />
                          {project.pullRequests && project.pullRequests.length > 0 && (
                            <div className="py-2">
                              <span className="block font-display text-[0.65rem] uppercase tracking-wider text-sys-muted mb-2">Pull Requests</span>
                              <ul className="flex flex-col gap-1">
                                {project.pullRequests.map((pr) => (
                                  <li key={pr.number}>
                                    <a
                                      href={pr.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-baseline justify-between gap-2 text-xs hover:text-sys-signal hover:underline transition-colors"
                                    >
                                      <span className="font-display text-sys-signal">{pr.number}</span>
                                      {pr.title && <span className="text-right text-sys-cream/70 text-[0.68rem]">{pr.title}</span>}
                                      <span className="ml-auto text-sys-muted text-[0.65rem] shrink-0">↗</span>
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          
          {active && (
            <aside className="sticky top-[100px] w-full overflow-hidden border border-sys-line-strong tablet:hidden" aria-label={`${active.name} preview`}>
              <SystemFrame title="RECORD PREVIEW" classification={active.classification || "CONFIDENTIAL"}>
                <div className={`relative h-[180px] overflow-hidden border-b border-sys-line bg-sys-bg frame-${active.visualType}`}>
                  <ProjectVisual project={active} priority />
                </div>
                <div className="p-[22px]">
                  <RecordHeader
                    id={active.id}
                    name={active.name}
                    category={active.projectType || ""}
                    date={active.date}
                    description={active.description}
                  />
                  {isOpenSource(active) && (
                    <dl className="flex flex-col gap-1">
                      <DataRow label="My Contribution" value={active.homepageEvidence} stacked noUppercase />
                      {active.pullRequests && active.pullRequests.length > 0 && (
                        <div className="py-2">
                          <span className="block font-display text-[0.65rem] uppercase tracking-wider text-sys-muted mb-2">Pull Requests</span>
                          <ul className="flex flex-col gap-1">
                            {active.pullRequests.map((pr) => (
                              <li key={pr.number}>
                                <a
                                  href={pr.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-baseline justify-between gap-2 text-xs hover:text-sys-signal hover:underline transition-colors"
                                >
                                  <span className="font-display text-sys-signal">{pr.number}</span>
                                  {pr.title && <span className="text-right text-sys-cream/70 text-[0.68rem]">{pr.title}</span>}
                                  <span className="ml-auto text-sys-muted text-[0.65rem] shrink-0">↗</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </dl>
                  )}
                  <div className={`flex gap-2 ${isOpenSource(active) ? "mt-4" : "mt-3"}`}>
                    <a className={projectActionClass} href={projectHref(active)} target="_blank" rel="noreferrer">
                      {actionLabel(active)}
                      <ExternalLink size={14} aria-hidden="true" />
                    </a>
                    {active.link && !isOpenSource(active) ? (
                      <a className={iconActionClass} href={active.githubLink} target="_blank" rel="noreferrer" aria-label={`${active.name} GitHub repository`}>
                        {projectGithubIcon}
                      </a>
                    ) : null}
                  </div>
                </div>
              </SystemFrame>
            </aside>
          )}
        </div>
      ) : (
        <p className="border border-sys-line p-8 text-sys-muted [&_button]:border-0 [&_button]:border-b [&_button]:border-sys-signal [&_button]:bg-transparent [&_button]:text-sys-signal">
          No records match these parameters.{" "}
          <button type="button" onClick={clear}>
            Reset filter variables
          </button>
        </p>
      )}
      
      {showViewAll && (
        <Link className="mt-6 inline-flex border-b border-sys-signal pb-1 text-sys-signal" href="/projects">
          Query All {totalProjects} Dossiers →
        </Link>
      )}
    </section>
  );
}
