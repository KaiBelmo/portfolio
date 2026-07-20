import type { CSSProperties } from "react";

export const GithubIcon = (
  <svg className="size-7 shrink-0" viewBox="0 0 9 9" fill="currentColor" aria-hidden="true">
    <path d="M2 0v1h1v1h3V1h1V0H2Zm0 1H1v1H0v5h1v1h1V7h1V6H1V3h1V1Zm5 0v2h1v3H6v3h1V8h1V7h1V2H8V1H7ZM2 8h1v1H2V8Z" />
  </svg>
);

export const XIcon = (
  <svg className="size-7 shrink-0" viewBox="0 0 9 9" fill="currentColor" aria-hidden="true">
    <polygon points="3,2 3,1 1,1 1,3 2,3 2,2" />
    <rect x="3" y="2" width="1" height="1" />
    <polygon points="6,3 4,3 4,4 5,4 5,5 6,5" />
    <rect x="6" y="5" width="1" height="1" />
    <polygon points="6,7 6,8 8,8 8,6 7,6 7,7" />
    <rect x="5" y="6" width="1" height="1" />
    <polygon points="4,5 4,4 3,4 3,6 5,6 5,5" />
    <rect x="2" y="3" width="1" height="1" />
    <rect x="7" y="1" width="1" height="1" />
    <rect x="6" y="2" width="1" height="1" />
    <rect x="2" y="6" width="1" height="1" />
    <rect x="1" y="7" width="1" height="1" />
  </svg>
);

export const LinkedInIcon = (
  <svg className="size-7 shrink-0" viewBox="0 0 9 9" fill="currentColor" aria-hidden="true">
    <path d="M1 1h7v7H1V1Zm1 1v1h1V2H2Zm0 2v3h1V4H2Zm2 0v3h1V5h1v2h1V4H4Z" fillRule="evenodd" />
  </svg>
);

export const GmailIcon = (
  <svg className="size-7 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M1 4h3v2h1v1h1v1h1v1h2V8h1V7h1V6h1V4h3v10h-3V8h-1v1h-1v1H9v1H7v-1H6V9H5V8H4v6H1V4Z" />
  </svg>
);

export const KeyIcon = (
  <svg className="size-5 shrink-0" viewBox="0 0 9 9" fill="currentColor" aria-hidden="true">
    <path d="M6,1V0H3v1H2v2h1v1h1v5h2V8H5V7h1V6H5V4h1V3h1V1H6z M5,1v1H4V1H5z" />
  </svg>
);

export const ActivityIcon = (
  <svg className="size-5 shrink-0" viewBox="0 0 9 9" fill="currentColor" aria-hidden="true">
    <path d="M2 1h5v5H5v2H2V1Zm1 1v1h3V2H3Zm0 2v1h3V4H3Zm0 2v1h2V6H3Zm3 1h1V6H6v1Z" fillRule="evenodd" />
  </svg>
);

export const ArrowIcon = (
  <svg className="size-4 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M9 3h4v4h-2V6h-1v1H9v1H8v1H7v1H6v1H5v1H3v-2h1V9h1V8h1V7h1V6h1V5h1V3Z" />
  </svg>
);

export const EMAIL = "contact@kaibelmo.dev";
export const PGP_FINGERPRINT_GROUPS = ["82AA", "C9C6", "3DEF", "160C", "DF0A", "AD8A", "231B", "8142", "4099", "27BE"];
export const NORMALIZED_PGP_FINGERPRINT = PGP_FINGERPRINT_GROUPS.join(" ");
export const PGP_KEY_ID = "0x409927BE";

export const HEATMAP_COLORS: CSSProperties[] = [
  { backgroundColor: "color-mix(in srgb, var(--ink) 7%, transparent)" },
  { backgroundColor: "color-mix(in srgb, var(--accent) 18%, transparent)" },
  { backgroundColor: "color-mix(in srgb, var(--accent) 32%, transparent)" },
  { backgroundColor: "color-mix(in srgb, var(--accent) 52%, transparent)" },
  { backgroundColor: "color-mix(in srgb, var(--accent) 72%, var(--canvas))" },
];

export const HEATMAP_WEEK_COUNT = 53;
export const HEATMAP_CELL_SIZE = 12;
export const HEATMAP_CELL_GAP = 3;
export const HEATMAP_LABEL_COLUMN_WIDTH = 38;
export const HEATMAP_GRID_WIDTH = HEATMAP_WEEK_COUNT * HEATMAP_CELL_SIZE + (HEATMAP_WEEK_COUNT - 1) * HEATMAP_CELL_GAP;
export const HEATMAP_LAYOUT_WIDTH = HEATMAP_LABEL_COLUMN_WIDTH + 12 + HEATMAP_GRID_WIDTH;

