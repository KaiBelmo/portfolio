import type { Project } from "@/types/project";

export const disciplines = ["All", "Web Apps", "Real-time", "Low-level", "Open source"];
export const mobileProjectPageSize = 4;

export const disciplineMobileSpans: Record<string, string> = {
  All: "mobile:col-span-2",
  "Web Apps": "mobile:col-span-4",
  "Real-time": "mobile:col-span-3",
  "Low-level": "mobile:col-span-3",
  "Open source": "mobile:col-span-6",
};

export const filterControlClass =
  "min-h-11 border border-sys-line bg-[color-mix(in_srgb,var(--sys-bg)_84%,transparent)] px-[13px] py-2 text-[0.76rem] text-sys-cream tablet:flex-1 tablet:basis-[140px] aria-pressed:bg-sys-signal aria-pressed:text-sys-bg disabled:cursor-not-allowed disabled:opacity-40";
export const dropdownFrameClass =
  "relative inline-flex min-h-11 text-[0.76rem] text-sys-cream tablet:flex-1 tablet:basis-[140px] mobile:h-11 mobile:min-h-0 mobile:w-full mobile:flex-none";
export const dropdownTriggerClass =
  "inline-flex min-h-11 w-full items-center justify-between gap-3 border border-sys-line bg-[color-mix(in_srgb,var(--sys-bg)_84%,transparent)] px-[13px] py-2 text-left transition-colors hover:border-sys-line-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sys-focus mobile:h-11 mobile:min-h-0 mobile:px-4 mobile:py-0";
export const dropdownMenuClass =
  "absolute left-0 top-[calc(100%+4px)] z-[200] max-h-60 w-full overflow-y-auto overscroll-contain border border-sys-line-strong bg-sys-bg py-1 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.7)] mobile:w-[calc(200%+0.5rem)]";
export const dropdownOptionClass =
  "block min-h-11 w-full border-l-2 border-transparent px-[13px] py-2 text-left text-sys-cream transition-colors hover:bg-[color-mix(in_srgb,var(--sys-signal)_14%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--sys-signal)_14%,transparent)] focus-visible:outline-none aria-selected:border-l-sys-signal aria-selected:bg-[color-mix(in_srgb,var(--sys-signal)_12%,var(--sys-bg))] aria-selected:text-sys-signal mobile:px-4";
export const projectActionClass =
  "inline-flex min-h-11 flex-auto items-center justify-center gap-2 border border-sys-signal bg-transparent px-4 py-[9px] text-center font-display text-[0.68rem] uppercase tracking-[0.04em] text-sys-signal hover:bg-sys-signal hover:text-sys-bg";
export const iconActionClass =
  "inline-flex min-h-11 flex-[0_0_44px] items-center justify-center border border-sys-line-strong bg-transparent text-sys-cream hover:bg-sys-cream hover:text-sys-bg";

export function isOpenSource(project: Project) {
  return project.disciplines?.includes("Open source");
}

export function actionLabel(project: Project) {
  if (isOpenSource(project)) return "View Repo";
  if (!project.link) return "View Repo";
  return "View Live Site";
}

export function projectHref(project: Project) {
  return project.link || project.githubLink;
}
