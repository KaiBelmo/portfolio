import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MobilePagination({
  filteredLength,
  pageSize,
  page,
  pageCount,
  onPageChange,
}: {
  filteredLength: number;
  pageSize: number;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  if (filteredLength <= pageSize) return null;

  const start = page * pageSize + 1;
  const end = Math.min(filteredLength, (page + 1) * pageSize);

  return (
    <nav
      className="sticky bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[60] mt-4 grid grid-cols-[52px_minmax(0,1fr)_52px] items-center gap-2 border border-sys-line-strong bg-sys-bg/95 p-2 backdrop-blur mobile:grid"
      aria-label="Project pages"
    >
      <button
        className="inline-flex min-h-11 items-center justify-center border border-sys-line-strong text-sys-cream disabled:cursor-not-allowed disabled:opacity-40"
        type="button"
        disabled={page === 0}
        aria-label="Previous projects"
        onClick={() => onPageChange(Math.max(0, page - 1))}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>
      <span className="text-center font-mono text-[0.62rem] uppercase tracking-[0.08em] text-sys-muted">
        {start}-{end} / {filteredLength}
      </span>
      <button
        className="inline-flex min-h-11 items-center justify-center border border-sys-line-strong text-sys-cream disabled:cursor-not-allowed disabled:opacity-40"
        type="button"
        disabled={page >= pageCount - 1}
        aria-label="Next projects"
        onClick={() => onPageChange(Math.min(pageCount - 1, page + 1))}
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
