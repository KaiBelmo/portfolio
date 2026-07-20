"use client";

import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Project } from "@/types/project";
import { GithubIcon } from "@/app/contact/contactData";
import ProjectVisual from "../ui/ProjectVisual";
import MobileProjectCard from "../ui/MobileProjectCard";
import SystemFrame from "../system/SystemFrame";
import RecordHeader from "../system/RecordHeader";
import DataRow from "../system/DataRow";
import StateReveal from "../ui/StateReveal";
import {
  stateAnimationEase,
  stateListItemVariants,
  stateTransition,
} from "../ui/stateAnimations";

const disciplines = ["All", "Web Apps", "Real-time", "Low-level", "Open source"];
const mobileProjectPageSize = 4;
const disciplineMobileSpans: Record<string, string> = {
  All: "mobile:col-span-2",
  "Web Apps": "mobile:col-span-4",
  "Real-time": "mobile:col-span-3",
  "Low-level": "mobile:col-span-3",
  "Open source": "mobile:col-span-6",
};

const filterControlClass =
  "min-h-11 border border-sys-line bg-[color-mix(in_srgb,var(--sys-bg)_84%,transparent)] px-[13px] py-2 text-[0.76rem] text-sys-cream tablet:flex-1 tablet:basis-[140px] aria-pressed:bg-sys-signal aria-pressed:text-sys-bg";
const dropdownFrameClass =
  "relative inline-flex min-h-11 text-[0.76rem] text-sys-cream tablet:flex-1 tablet:basis-[140px] mobile:h-11 mobile:min-h-0 mobile:w-full mobile:flex-none";
const dropdownTriggerClass =
  "inline-flex min-h-11 w-full items-center justify-between gap-3 border border-sys-line bg-[color-mix(in_srgb,var(--sys-bg)_84%,transparent)] px-[13px] py-2 text-left transition-colors hover:border-sys-line-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sys-focus mobile:h-11 mobile:min-h-0 mobile:px-4 mobile:py-0";
const dropdownMenuClass =
  "absolute left-0 top-[calc(100%+4px)] z-[200] max-h-60 w-full overflow-y-auto overscroll-contain border border-sys-line-strong bg-sys-bg py-1 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.7)] mobile:w-[calc(200%+0.5rem)]";
const dropdownOptionClass =
  "block min-h-11 w-full border-l-2 border-transparent px-[13px] py-2 text-left text-sys-cream transition-colors hover:bg-[color-mix(in_srgb,var(--sys-signal)_14%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--sys-signal)_14%,transparent)] focus-visible:outline-none aria-selected:border-l-sys-signal aria-selected:bg-[color-mix(in_srgb,var(--sys-signal)_12%,var(--sys-bg))] aria-selected:text-sys-signal mobile:px-4";
const projectActionClass =
  "inline-flex min-h-11 flex-auto items-center justify-center gap-2 border border-sys-signal bg-transparent px-4 py-[9px] text-center font-display text-[0.68rem] uppercase tracking-[0.04em] text-sys-signal hover:bg-sys-signal hover:text-sys-bg";
const iconActionClass =
  "inline-flex min-h-11 flex-[0_0_44px] items-center justify-center border border-sys-line-strong bg-transparent text-sys-cream hover:bg-sys-cream hover:text-sys-bg";
const projectGithubIcon = <span className="[&>svg]:size-4">{GithubIcon}</span>;

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const update = () => setMatches(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, [query]);

  return matches;
}

function filterControlClasses(className?: string) {
  return className ? `${filterControlClass} ${className}` : filterControlClass;
}

function FilterButton({ className, ...props }: ComponentPropsWithoutRef<"button">) {
  return <button className={filterControlClasses(className)} {...props} />;
}

function YearDropdown({
  className,
  label,
  years,
  value,
  onChange,
}: {
  className?: string;
  label: string;
  years: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const reduceMotion = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const options = ["All", ...years];
  const displayValue = value === "All" ? label : value;

  return (
    <div
      ref={ref}
      className={`${dropdownFrameClass} ${open ? "z-[200]" : "z-auto"} ${className || ""}`}
      onBlur={(event) => {
        if (!ref.current?.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        className={dropdownTriggerClass}
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((value) => !value)}
      >
        <span>{displayValue}</span>
        <ChevronDown
          className={`size-4 opacity-80 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className={dropdownMenuClass}
            role="listbox"
            aria-label={label}
            initial={reduceMotion ? false : { opacity: 0, y: -4, scaleY: 0.98 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.98 }}
            transition={stateTransition(reduceMotion, 0.16)}
            style={{ transformOrigin: "top" }}
          >
            {options.map((item) => (
              <button
                key={item}
                className={dropdownOptionClass}
                type="button"
                role="option"
                aria-selected={value === item}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(item);
                  setOpen(false);
                }}
              >
                {item === "All" ? label : item}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  const reduceMotion = !!useReducedMotion();
  const isTabletLayout = useMediaQuery("(max-width: 1024px)");
  const isMobileLayout = useMediaQuery("(max-width: 600px)");
  const initialDiscipline = searchParams.get("discipline") || "All";
  
  const [discipline, setDiscipline] = useState(
    disciplines.includes(initialDiscipline) ? initialDiscipline : "All"
  );
  const [year, setYear] = useState(searchParams.get("year") || "All");
  const [technology, setTechnology] = useState<string[]>(
    searchParams.get("technology") ? searchParams.get("technology")!.split(",") : []
  );
  const [showTechnologies, setShowTechnologies] = useState(Boolean(searchParams.get("technology")));
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [mobileProjectPage, setMobileProjectPage] = useState(0);
  const [activeId, setActiveId] = useState(projects[0]?.id);
  const [expandedId, setExpandedId] = useState<string>();

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

  const hasActiveFilters = discipline !== "All" || year !== "All" || technology.length > 0;

  const filtered = projects.filter(
    (project) =>
      (discipline === "All" || project.disciplines?.includes(discipline)) &&
      (year === "All" || String(new Date(project.date).getFullYear()) === year) &&
      (technology.length === 0 || technology.some((t) => project.technologies?.includes(t)))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const active = filtered.find((project) => project.id === activeId) || filtered[0];
  const mobileProjectPageCount = Math.max(1, Math.ceil(filtered.length / mobileProjectPageSize));
  const currentMobileProjectPage = Math.min(mobileProjectPage, mobileProjectPageCount - 1);
  const visibleProjects = isMobileLayout
    ? filtered.slice(
        currentMobileProjectPage * mobileProjectPageSize,
        currentMobileProjectPage * mobileProjectPageSize + mobileProjectPageSize
      )
    : filtered;

  useEffect(() => {
    const params = new URLSearchParams();
    if (discipline !== "All") params.set("discipline", discipline);
    if (year !== "All") params.set("year", year);
    if (technology.length > 0) params.set("technology", technology.join(","));
    startTransition(() => {
      router.replace(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false });
    });
  }, [discipline, year, technology, pathname, router]);

  const clear = () => {
    setDiscipline("All");
    setYear("All");
    setTechnology([]);
    setMobileProjectPage(0);
  };

  const mobileFilterLabel = hasActiveFilters
    ? `Filters (${filtered.length}/${projects.length})`
    : "Filters";

  return (
    <section className="route-shell scroll-mt-5" aria-labelledby="project-index-heading">
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
          <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 w-max max-w-[260px] -translate-x-1/2 translate-y-1 border border-sys-line-strong bg-sys-raised px-3 py-2 text-[0.72rem] leading-[1.5] text-sys-cream opacity-0 transition-[opacity,transform] duration-150 ease-out after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-[5px] after:border-transparent after:border-t-sys-line-strong group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 motion-reduce:transition-opacity mobile:left-0 mobile:w-[min(260px,calc(100vw-32px))] mobile:translate-x-0 mobile:after:left-6 mobile:after:translate-x-0" role="tooltip">
            Shared here with the organization&apos;s agreement and blessing
          </span>
          
        </span>
        ; and chose to open source.
      </p>

      <button
        className="mb-3 hidden min-h-11 w-full items-center justify-between border border-sys-line-strong bg-transparent px-4 py-2 font-display text-[0.78rem] text-sys-cream mobile:flex"
        type="button"
        aria-expanded={showMobileFilters}
        aria-controls="project-filter-panel"
        onClick={() => setShowMobileFilters((value) => !value)}
      >
        <span>{mobileFilterLabel}</span>
        <span aria-hidden="true">{showMobileFilters ? "-" : "+"}</span>
      </button>

      <motion.div
        id="project-filter-panel"
        className={`relative z-50 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-[18px] gap-y-2.5 border-y border-sys-line-strong py-3.5 tablet:grid-cols-1 mobile:border-0 mobile:pt-0 ${showMobileFilters ? "mobile:grid" : "mobile:hidden"}`}
        aria-label="Filter projects"
        data-scroll-reveal
        data-scroll-reveal-state="visible"
        suppressHydrationWarning
        layout={!reduceMotion}
        transition={stateTransition(reduceMotion)}
      >
        {/* Discipline buttons - natural width, wrap on mobile */}
        <div className="flex flex-wrap gap-2 mobile:grid mobile:grid-cols-6" aria-label="Discipline">
          {disciplines.map((item) => (
            <FilterButton
              key={item}
              type="button"
              className={`mobile:flex-none mobile:shrink-0 ${disciplineMobileSpans[item] || "mobile:col-span-3"}`}
              aria-pressed={discipline === item}
              onClick={() => {
                setDiscipline(item);
                setMobileProjectPage(0);
              }}
            >
              {item} <span>[{counts[item]}]</span>
            </FilterButton>
          ))}
        </div>

        {/* Year / Tech / Clear - compact row on mobile */}
        <div className="flex flex-wrap items-center justify-end gap-2 tablet:justify-start mobile:grid mobile:w-full mobile:grid-cols-2">
          {years.length > 1 && (
            <>
              <label className="flex min-h-11 items-center gap-2 font-display text-[0.76rem] text-sys-cream tablet:flex-1 tablet:basis-[220px] mobile:hidden">
                Year{" "}
                <YearDropdown
                  className="min-w-24 tablet:flex-1"
                  label="All"
                  years={years}
                  value={year}
                  onChange={(value) => {
                    setYear(value);
                    setMobileProjectPage(0);
                  }}
                />
              </label>
              <YearDropdown
                className="hidden min-w-0 mobile:flex mobile:h-11 mobile:min-h-0 mobile:w-full mobile:flex-none"
                label="Years"
                years={years}
                value={year}
                onChange={(value) => {
                  setYear(value);
                  setMobileProjectPage(0);
                }}
              />
            </>
          )}
          <FilterButton
            className="mobile:inline-flex mobile:min-h-14 mobile:w-full mobile:flex-none mobile:basis-auto mobile:items-center mobile:justify-between mobile:px-4 mobile:py-0 mobile:text-left mobile:text-[1rem]"
            type="button"
            aria-expanded={showTechnologies}
            aria-controls="technology-filters"
            onClick={() => setShowTechnologies((value) => !value)}
          >
            Tech filter {showTechnologies ? "-" : "+"}
          </FilterButton>
          {hasActiveFilters && (
            <FilterButton
              className="mobile:flex-none mobile:basis-auto"
              type="button"
              onClick={clear}
            >
              Clear filters
            </FilterButton>
          )}
        </div>

        {/* Technology chips - natural width, wrap */}
        <StateReveal
          show={showTechnologies}
          className="col-span-full flex flex-wrap gap-2 overflow-hidden pt-0.5"
          id="technology-filters"
        >
          <p className="m-0 mb-1 w-full font-display text-[0.68rem] tracking-[0.03em] text-sys-muted opacity-70">
            Ctrl+click to select multiple - shows projects matching any selected tech
          </p>
          {technologies.map((item) => (
            <FilterButton
              type="button"
              key={item}
              className={`mobile:flex-none mobile:shrink-0 ${disciplineMobileSpans[item] || "mobile:col-span-3"}`}
              aria-pressed={technology.includes(item)}
              onClick={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  setTechnology((prev) =>
                    prev.includes(item)
                      ? prev.filter((t) => t !== item)
                      : [...prev, item]
                  );
                } else {
                  setTechnology((prev) =>
                    prev.length === 1 && prev[0] === item ? [] : [item]
                  );
                }
                setMobileProjectPage(0);
              }}
            >
              {item}
            </FilterButton>
          ))}
          {technology.length > 0 && (
            <button
              type="button"
              className="min-h-11 border border-sys-line bg-transparent px-2 py-0.5 font-display text-[0.72rem] text-sys-signal"
              onClick={() => {
                setTechnology([]);
                setMobileProjectPage(0);
              }}
            >
              Clear x
            </button>
          )}
        </StateReveal>
      </motion.div>

      {filtered.length ? (
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(0,460px)] items-start gap-6 tablet:grid-cols-1 tablet:min-w-0 mobile:mt-3">
          <div className="border-t border-sys-line-strong tablet:grid tablet:min-w-0 tablet:gap-[6px] tablet:border-0">
            <>
            {visibleProjects.map((project, index) => {
              const expanded = expandedId === project.id;
              const projectNumber = isMobileLayout
                ? currentMobileProjectPage * mobileProjectPageSize + index + 1
                : index + 1;
              return (
                <motion.article
                  data-scroll-reveal
                  data-scroll-reveal-state="visible"
                  suppressHydrationWarning
                  className="border-b border-sys-line tablet:min-w-0 tablet:border-0"
                  key={project.id}
                  variants={stateListItemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={stateTransition(reduceMotion)}
                  onMouseEnter={() => setActiveId(project.id)}
                  onFocus={() => setActiveId(project.id)}
                >
                  {isTabletLayout ? (
                    <MobileProjectCard
                    project={project}
                    stars={starsMap[project.id]}
                    expanded={expanded}
                    onToggle={() => setExpandedId(expanded ? undefined : project.id)}
                  />
                  ) : (
                    <>
                      <button
                        className={`grid w-full grid-cols-[42px_minmax(0,1fr)_150px] items-center gap-4 border-0 px-3 py-[22px] text-left text-inherit ${active?.id === project.id ? "bg-sys-signal-soft" : "bg-transparent"}`}
                        type="button"
                        aria-current={active?.id === project.id}
                        onClick={() => setActiveId(project.id)}
                      >
                    <span className="font-display text-[0.72rem] text-sys-signal">{String(projectNumber).padStart(2, "0")}</span>
                    <span>
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="inline-flex min-w-0 flex-wrap items-baseline gap-x-2">
                          <strong className="font-display text-base [overflow-wrap:anywhere]">{project.name}</strong>
                          {starsMap[project.id] && Number(starsMap[project.id]) > 0 && (
                            <span className="font-mono text-[0.65rem] text-sys-signal" aria-label={`${starsMap[project.id]} GitHub stars`}>
                              * {Number(starsMap[project.id]).toLocaleString()}
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
                    <span className="block text-right text-[0.8rem] text-sys-muted [overflow-wrap:anywhere] tablet:col-start-2 tablet:flex tablet:flex-wrap tablet:items-center tablet:justify-between tablet:gap-x-3 tablet:gap-y-1 tablet:text-left">
                      <span className="mb-5 block tablet:m-0 tablet:min-w-0 tablet:flex-1 tablet:basis-[12rem]">{project.projectType}</span>
                      <span className="mb-5 block font-display text-[0.72rem] text-sys-signal tablet:hidden">{actionLabel(project)} -&gt;</span>
                    </span>
                      </button>
                    </>
                  )}
                </motion.article>
              );
            })}
            </>
            {isMobileLayout && filtered.length > mobileProjectPageSize && (
              <nav className="sticky bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[60] mt-4 grid grid-cols-[52px_minmax(0,1fr)_52px] items-center gap-2 border border-sys-line-strong bg-sys-bg/95 p-2 backdrop-blur mobile:grid" aria-label="Project pages">
                <button
                  className="inline-flex min-h-11 items-center justify-center border border-sys-line-strong text-sys-cream disabled:cursor-not-allowed disabled:opacity-40"
                  type="button"
                  disabled={currentMobileProjectPage === 0}
                  aria-label="Previous projects"
                  onClick={() => setMobileProjectPage((page) => Math.max(0, page - 1))}
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </button>
                <span className="text-center font-mono text-[0.62rem] uppercase tracking-[0.08em] text-sys-muted">
                  {currentMobileProjectPage * mobileProjectPageSize + 1}-{Math.min(filtered.length, (currentMobileProjectPage + 1) * mobileProjectPageSize)} / {filtered.length}
                </span>
                <button
                  className="inline-flex min-h-11 items-center justify-center border border-sys-line-strong text-sys-cream disabled:cursor-not-allowed disabled:opacity-40"
                  type="button"
                  disabled={currentMobileProjectPage >= mobileProjectPageCount - 1}
                  aria-label="Next projects"
                  onClick={() => setMobileProjectPage((page) => Math.min(mobileProjectPageCount - 1, page + 1))}
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
                </button>
              </nav>
            )}
          </div>
          
          {active && (
            <motion.aside
              key={active.id}
              className="sticky top-[100px] w-full overflow-hidden border border-sys-line-strong tablet:hidden"
              aria-label={`${active.name} preview`}
              initial={reduceMotion ? false : { opacity: 0.72 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.16, ease: stateAnimationEase }}
            >
              <SystemFrame title="RECORD PREVIEW" classification={active.classification || "CONFIDENTIAL"}>
                <div className={`relative overflow-hidden border-b border-sys-line bg-sys-bg frame-${active.visualType}`}>
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
                          <span className="block font-display text-[0.65rem] uppercase tracking-wider text-sys-muted mb-2">Pull Requests ({active.pullRequests.length})</span>
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
                                  {pr.title && <span className="min-w-0 flex-1 text-right text-sys-cream/70 text-[0.68rem] [overflow-wrap:anywhere]">{pr.title}</span>}
                                  <span className="ml-auto text-sys-muted text-[0.65rem] shrink-0">open</span>
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
            </motion.aside>
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
          Query All {totalProjects} Dossiers -&gt;
        </Link>
      )}
    </section>
  );
}
