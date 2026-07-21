import type { GithubActivity } from "@/lib/github-activity";
import {
  HEATMAP_CELL_GAP,
  HEATMAP_CELL_SIZE,
  HEATMAP_COLORS,
  HEATMAP_LABEL_COLUMN_WIDTH,
} from "./contactData";

type HeatmapMonthLabel = {
  label: string;
  column: number;
};

// Total number of week-columns the grid is laid out with. Used both for the
// grid template and to convert a column index into a percentage offset so
// month labels stay aligned regardless of how wide the grid is rendered.
const HEATMAP_TOTAL_COLUMNS = 53;

function getHeatmapThresholds(activity: GithubActivity): [number, number, number, number] {
  const counts = activity.days
    .map((day) => day.contributionCount)
    .filter((count) => count > 0)
    .sort((left, right) => left - right);

  if (!counts.length) return [0, 0, 0, 0];

  const pick = (percentile: number) => counts[Math.min(counts.length - 1, Math.floor((counts.length - 1) * percentile))];

  return [pick(0.18), pick(0.42), pick(0.68), pick(0.9)];
}

function getHeatmapIntensity(count: number, thresholds: [number, number, number, number]): number {
  if (count === 0) return 0;
  if (count >= thresholds[3]) return 4;
  if (count >= thresholds[2]) return 3;
  if (count >= thresholds[1]) return 2;
  return 1;
}

function getMonthLabels(activity: GithubActivity | null): HeatmapMonthLabel[] {
  if (!activity?.days.length) {
    return [
      { label: "Jul", column: 0 },
      { label: "Aug", column: 4 },
      { label: "Sep", column: 8 },
      { label: "Oct", column: 13 },
      { label: "Nov", column: 17 },
      { label: "Dec", column: 22 },
      { label: "Jan", column: 26 },
      { label: "Feb", column: 31 },
      { label: "Mar", column: 35 },
      { label: "Apr", column: 40 },
      { label: "May", column: 44 },
      { label: "Jun", column: 48 },
    ];
  }

  return activity.days
    .reduce<HeatmapMonthLabel[]>((labels, day, index, days) => {
      if (index > 0 && day.date.slice(0, 7) === days[index - 1].date.slice(0, 7)) return labels;

      const label = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" }).format(
        new Date(`${day.date}T00:00:00Z`),
      );
      const column = Math.floor(index / 7);

      if (labels[labels.length - 1]?.label !== label) labels.push({ label, column });

      return labels;
    }, [])
    .slice(-12);
}

function Heatmap({ activity }: { activity: GithubActivity }) {
  const thresholds = getHeatmapThresholds(activity);

  return (
    <div
      className="grid w-max grid-flow-col grid-cols-[repeat(53,var(--heatmap-cell))]"
      style={{
        gridTemplateRows: "repeat(7, var(--heatmap-cell))",
        gap: "var(--heatmap-gap)",
      }}
    >
      {activity.days.map((day) => {
        const intensity = getHeatmapIntensity(day.contributionCount, thresholds);

        return (
          <div
            key={day.date}
            title={`${day.contributionCount} contributions on ${day.date}`}
            aria-label={`${day.contributionCount} contributions on ${day.date}`}
            className="h-[var(--heatmap-cell)] w-[var(--heatmap-cell)] rounded-[2px]"
            style={HEATMAP_COLORS[intensity]}
          />
        );
      })}
    </div>
  );
}

export default function GithubActivityHeatmap({ activity }: { activity: GithubActivity | null }) {
  const heatmapCssVars = {
    "--heatmap-gap": `${HEATMAP_CELL_GAP}px`,
    "--heatmap-max-cell": `${HEATMAP_CELL_SIZE}px`,
    "--heatmap-cell": `clamp(10px, calc((100cqw - var(--heatmap-label-width) - 12px - (${HEATMAP_TOTAL_COLUMNS - 1} * var(--heatmap-gap))) / ${HEATMAP_TOTAL_COLUMNS}), var(--heatmap-max-cell))`,
    "--heatmap-grid-width": `calc((${HEATMAP_TOTAL_COLUMNS} * var(--heatmap-cell)) + (${HEATMAP_TOTAL_COLUMNS - 1} * var(--heatmap-gap)))`,
    "--heatmap-label-width": `${HEATMAP_LABEL_COLUMN_WIDTH}px`,
    "--heatmap-layout-width": `calc(var(--heatmap-label-width) + 12px + var(--heatmap-grid-width))`,
  } as React.CSSProperties;

  return (
    <div className="heatmap-scroll border-t border-line pb-5 pt-4 [container-type:inline-size]" style={heatmapCssVars}>
      <div className="min-w-[var(--heatmap-layout-width)]">
        <div className="grid items-start gap-x-3 grid-cols-[var(--heatmap-label-width)_var(--heatmap-grid-width)]">
          <span aria-hidden="true" />
          <div className="relative mb-2 h-4 w-[var(--heatmap-grid-width)] font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted opacity-60">
            {getMonthLabels(activity).map(({ label, column }) => (
              <span
                key={`${label}-${column}`}
                className="absolute top-0"
                style={{ left: `${(column / HEATMAP_TOTAL_COLUMNS) * 100}%` }}
              >
                {label}
              </span>
            ))}
          </div>
          <div
            className="grid font-mono text-[0.68rem] text-muted [&>span]:flex [&>span]:items-center"
            style={{
              gridTemplateRows: "repeat(7, var(--heatmap-cell))",
              gap: "var(--heatmap-gap)",
            }}
          >
            <span>Sun</span>
            <span aria-hidden="true" />
            <span>Tue</span>
            <span aria-hidden="true" />
            <span>Thu</span>
            <span aria-hidden="true" />
            <span>Sat</span>
          </div>
          {activity ? (
            <Heatmap activity={activity} />
          ) : (
            <p className="m-0 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-muted">
              Set GITHUB_TOKEN to load live contributions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
