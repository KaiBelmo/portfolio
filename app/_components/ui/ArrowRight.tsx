/**
 * A pixel-drawn right arrow that matches the display font. Typing "->" in
 * Pixelify Sans renders a hyphen and an oversized chevron that never join
 * into an arrow, so links use this glyph instead. It scales with font size
 * and inherits the text colour.
 */
export default function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 9 5"
      width="1.125em"
      height="0.625em"
      fill="currentColor"
      shapeRendering="crispEdges"
      className={`inline-block shrink-0 ${className}`}
    >
      <rect x="0" y="2" width="8" height="1" />
      <rect x="5" y="0" width="1" height="1" />
      <rect x="6" y="1" width="1" height="1" />
      <rect x="6" y="3" width="1" height="1" />
      <rect x="5" y="4" width="1" height="1" />
    </svg>
  );
}
