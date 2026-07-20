import type { GithubActivity } from "@/lib/github-activity";
import {
  HEATMAP_CELL_GAP,
  HEATMAP_CELL_SIZE,
  HEATMAP_COLORS,
  HEATMAP_GRID_WIDTH,
  HEATMAP_LABEL_COLUMN_WIDTH,
  HEATMAP_LAYOUT_WIDTH,
} from "./contactData";

type HeatmapMonthLabel = {
  label: string;
  column: number;
};

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
      className="grid w-max grid-flow-col"
      style={{
        gridTemplateColumns: `repeat(53, ${HEATMAP_CELL_SIZE}px)`,
        gridTemplateRows: `repeat(7, ${HEATMAP_CELL_SIZE}px)`,
        gap: `${HEATMAP_CELL_GAP}px`,
      }}
    >
      {activity.days.map((day) => {
        const intensity = getHeatmapIntensity(day.contributionCount, thresholds);

        return (
          <div
            key={day.date}
            title={`${day.contributionCount} contributions on ${day.date}`}
            aria-label={`${day.contributionCount} contributions on ${day.date}`}
            className="rounded-[2px]"
            style={{
              ...HEATMAP_COLORS[intensity],
              height: `${HEATMAP_CELL_SIZE}px`,
              width: `${HEATMAP_CELL_SIZE}px`,
            }}
          />
        );
      })}
    </div>
  );
}

export default function GithubActivityHeatmap({ activity }: { activity: GithubActivity | null }) {
  return (
    <div className="overflow-x-auto border-t border-line pt-4">
      <div style={{ minWidth: `${HEATMAP_LAYOUT_WIDTH}px` }}>
        <div
          className="grid items-start gap-x-3"
          style={{ gridTemplateColumns: `${HEATMAP_LABEL_COLUMN_WIDTH}px ${HEATMAP_GRID_WIDTH}px` }}
        >
          <span aria-hidden="true" />
          <div
            className="relative mb-2 h-4 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted opacity-60"
            style={{ width: `${HEATMAP_GRID_WIDTH}px` }}
          >
            {getMonthLabels(activity).map(({ label, column }) => (
              <span
                key={`${label}-${column}`}
                className="absolute top-0"
                style={{ left: `${column * (HEATMAP_CELL_SIZE + HEATMAP_CELL_GAP)}px` }}
              >
                {label}
              </span>
            ))}
          </div>
          <div
            className="grid pt-[13px] font-mono text-[0.68rem] text-muted"
            style={{
              gridTemplateRows: `repeat(7, ${HEATMAP_CELL_SIZE}px)`,
              gap: `${HEATMAP_CELL_GAP}px`,
              lineHeight: `${HEATMAP_CELL_SIZE}px`,
            }}
          >
            <span />
            <span>Mon</span>
            <span />
            <span>Wed</span>
            <span />
            <span>Fri</span>
            <span />
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
