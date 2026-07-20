"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, startTransition } from "react";
import type { Project } from "@/types/project";
import MobileProjectCard from "../ui/MobileProjectCard";
import { disciplines, mobileProjectPageSize } from "./project-index/constants";
import { useMediaQuery } from "./project-index/useMediaQuery";
import FilterPanel from "./project-index/FilterPanel";
import ProjectRow from "./project-index/ProjectRow";
import RecordPreview from "./project-index/RecordPreview";
import MobilePagination from "./project-index/MobilePagination";

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

  // Dynamic span to ensure perfect grid alignment whether Years is present or not
  const filterColSpan = years.length > 1 ? "mobile:col-span-2" : "mobile:col-span-3";

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

  const toggleTechnology = (item: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      setTechnology((prev) =>
        prev.includes(item) ? prev.filter((t) => t !== item) : [...prev, item]
      );
    } else {
      setTechnology((prev) => (prev.length === 1 && prev[0] === item ? [] : [item]));
    }
    setMobileProjectPage(0);
  };

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

      <FilterPanel
        counts={counts}
        discipline={discipline}
        onDiscipline={(value) => {
          setDiscipline(value);
          setMobileProjectPage(0);
        }}
        years={years}
        year={year}
        onYear={(value) => {
          setYear(value);
          setMobileProjectPage(0);
        }}
        technologies={technologies}
        technology={technology}
        onToggleTechnology={toggleTechnology}
        onClearTechnology={() => {
          setTechnology([]);
          setMobileProjectPage(0);
        }}
        showTechnologies={showTechnologies}
        onToggleTechnologies={() => setShowTechnologies((value) => !value)}
        hasActiveFilters={hasActiveFilters}
        onClear={clear}
        showMobileFilters={showMobileFilters}
        filterColSpan={filterColSpan}
      />

      {filtered.length ? (
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(0,460px)] items-start gap-6 tablet:grid-cols-1 tablet:min-w-0 mobile:mt-3">
          <div className="border-t border-sys-line-strong tablet:grid tablet:min-w-0 tablet:gap-[6px] tablet:border-0">
            {visibleProjects.map((project, index) => {
              const expanded = expandedId === project.id;
              const projectNumber = isMobileLayout
                ? currentMobileProjectPage * mobileProjectPageSize + index + 1
                : index + 1;
              return isTabletLayout ? (
                <MobileProjectCard
                  key={project.id}
                  project={project}
                  stars={starsMap[project.id]}
                  expanded={expanded}
                  onToggle={() => setExpandedId(expanded ? undefined : project.id)}
                />
              ) : (
                <ProjectRow
                  key={project.id}
                  project={project}
                  projectNumber={projectNumber}
                  active={active?.id === project.id}
                  stars={starsMap[project.id]}
                  onActivate={() => setActiveId(project.id)}
                />
              );
            })}
            {isMobileLayout && (
              <MobilePagination
                filteredLength={filtered.length}
                pageSize={mobileProjectPageSize}
                page={currentMobileProjectPage}
                pageCount={mobileProjectPageCount}
                onPageChange={setMobileProjectPage}
              />
            )}
          </div>

          {active && <RecordPreview project={active} />}
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
