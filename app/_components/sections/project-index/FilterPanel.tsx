"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import { disciplineMobileSpans, disciplines } from "./constants";
import FilterButton from "./FilterButton";
import YearDropdown from "./YearDropdown";
import { stateTransition } from "../../ui/stateAnimations";
import StateReveal from "../../ui/StateReveal";

export default function FilterPanel({
  counts,
  discipline,
  onDiscipline,
  years,
  year,
  onYear,
  technologies,
  technology,
  onToggleTechnology,
  onClearTechnology,
  showTechnologies,
  onToggleTechnologies,
  hasActiveFilters,
  onClear,
  showMobileFilters,
  filterColSpan,
}: {
  counts: Record<string, number>;
  discipline: string;
  onDiscipline: (value: string) => void;
  years: string[];
  year: string;
  onYear: (value: string) => void;
  technologies: string[];
  technology: string[];
  onToggleTechnology: (tech: string, event: React.MouseEvent) => void;
  onClearTechnology: () => void;
  showTechnologies: boolean;
  onToggleTechnologies: () => void;
  hasActiveFilters: boolean;
  onClear: () => void;
  showMobileFilters: boolean;
  filterColSpan: string;
}) {
  const reduceMotion = !!useReducedMotion();

  return (
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
            onClick={() => onDiscipline(item)}
          >
            {item} <span>[{counts[item]}]</span>
          </FilterButton>
        ))}
      </div>

      {/* Year / Tech / Clear - matching grid layout on mobile */}
      <div className="flex flex-wrap items-center justify-end gap-2 tablet:justify-start mobile:grid mobile:w-full mobile:grid-cols-6">
        {years.length > 1 && (
          <>
            <label className="flex min-h-11 items-center gap-2 font-display text-[0.76rem] text-sys-cream tablet:flex-1 tablet:basis-[220px] mobile:hidden">
              Year{" "}
              <YearDropdown
                className="min-w-24 tablet:flex-1"
                label="All"
                years={years}
                value={year}
                onChange={onYear}
              />
            </label>
            <YearDropdown
              className={`hidden min-w-0 mobile:flex mobile:h-11 mobile:min-h-0 mobile:w-full mobile:flex-none ${filterColSpan}`}
              label="Years"
              years={years}
              value={year}
              onChange={onYear}
            />
          </>
        )}
        <FilterButton
          className={`mobile:hidden mobile:h-11 mobile:min-h-0 mobile:w-full mobile:flex-none mobile:basis-auto mobile:items-center mobile:justify-between mobile:px-4 mobile:py-0 mobile:text-left ${filterColSpan}`}
          type="button"
          aria-expanded={showTechnologies}
          aria-controls="technology-filters"
          onClick={onToggleTechnologies}
        >
          Tech filter {showTechnologies ? "-" : "+"}
        </FilterButton>
        <FilterButton
          className={`mobile:h-11 mobile:min-h-0 mobile:w-full mobile:flex-none mobile:basis-auto mobile:px-4 mobile:py-0 ${filterColSpan}`}
          type="button"
          disabled={!hasActiveFilters}
          onClick={onClear}
        >
          <span className="mobile:hidden">Clear filters</span>
          <span className="hidden mobile:inline">Clear filter</span>
        </FilterButton>
      </div>

      {/* Technology chips - natural width, wrap */}
      <StateReveal
        show={showTechnologies}
        className="col-span-full flex flex-wrap gap-2 overflow-hidden pt-0.5 mobile:hidden"
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
            onClick={(e) => onToggleTechnology(item, e)}
          >
            {item}
          </FilterButton>
        ))}
        {technology.length > 0 && (
          <button
            type="button"
            className="min-h-11 border border-sys-line bg-transparent px-2 py-0.5 font-display text-[0.72rem] text-sys-signal"
            onClick={onClearTechnology}
          >
            Clear x
          </button>
        )}
      </StateReveal>
    </motion.div>
  );
}
