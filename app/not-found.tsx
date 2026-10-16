import Link from "next/link";
import ArrowRight from "./_components/ui/ArrowRight";
import SystemFrame from "./_components/system/SystemFrame";
import DataRow from "./_components/system/DataRow";
import styles from "./not-found.module.css";

const DETOURS = [
  {
    href: "/about",
    label: "About",
    path: "/about",
    note: "Background, writing, and recent work",
  },
  {
    href: "/blog",
    label: "Blog",
    path: "/blog",
    note: "Notes on tooling, systems, and interfaces",
  },
  {
    href: "/contact",
    label: "Contact",
    path: "/contact",
    note: "Email, socials, and GitHub activity",
  },
];

const ROUTE_LOG = [
  { label: "Status", value: "404 · not found" },
  { label: "Segment", value: "no matching route" },
  { label: "Archive", value: "nothing on file" },
  { label: "Fallback", value: "core shell" },
];

const PRIMARY_ACTION =
  "inline-flex min-h-11 items-center justify-center gap-2 border border-accent bg-transparent px-5 py-2 font-display text-[0.68rem] uppercase tracking-[0.06em] text-accent transition-colors duration-[120ms] ease-out hover:bg-accent hover:text-canvas focus-visible:bg-accent focus-visible:text-canvas";

const SECONDARY_ACTION =
  "inline-flex min-h-11 items-center justify-center gap-2 border border-line bg-transparent px-5 py-2 font-display text-[0.68rem] uppercase tracking-[0.06em] text-ink transition-colors duration-[120ms] ease-out hover:border-accent hover:text-accent focus-visible:border-accent focus-visible:text-accent";

// Direct Giphy media URL — no API key, no iframe, no CSP change.
// media.giphy.com is covered by the existing `img-src 'self' data: https:`.
const NOT_FOUND_GIF =
  "https://media.giphy.com/media/PIBuZutkhuKqV09TEf/giphy.gif";

export default function NotFound() {
  return (
    <section className="route-shell scroll-mt-5" aria-labelledby="not-found-title">
      <nav
        className="mb-[10px] flex min-h-11 items-center gap-2.5 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="flex min-h-11 items-center underline-offset-4 hover:text-accent hover:underline">
          Room
        </Link>
        <span aria-hidden="true">/</span>
        <strong className="font-bold text-ink" aria-current="page">
          Not found
        </strong>
      </nav>

      {/* One column on narrow screens; from lg (1024px min) the diagnostic
          panel takes the right rail and spans both rows, so the detour list
          can start directly under the header instead of below the panel.

          Note: the config's `desktop-md` / `desktop-sm` are MAX-width
          breakpoints, so they cannot key a two-column layout. */}
      <div className="grid items-start gap-x-[clamp(28px,4vw,52px)] gap-y-[clamp(28px,4vw,44px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,348px)] lg:grid-rows-[auto_auto]">
        <div
          className="lg:col-start-1 lg:row-start-1"
          data-scroll-reveal
          data-scroll-reveal-state="visible"
          suppressHydrationWarning
        >
          <p className="m-0 mb-[18px] flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted">
            <span
              aria-hidden="true"
              className={`inline-block h-1.5 w-1.5 shrink-0 bg-accent ${styles.statusPulse}`}
            />
            <span className="font-bold text-accent">404</span>
            <span aria-hidden="true" className="text-line-strong">
              |
            </span>
            <span>route not registered</span>
          </p>

          <h1
            id="not-found-title"
            className="m-0 mb-6 max-w-[15ch] font-display text-[clamp(3rem,7vw,6.2rem)] font-normal leading-[0.94] tracking-[-0.035em] text-ink"
          >
            No room at this address
          </h1>

          <p className="m-0 mb-8 max-w-[62ch] text-[1.05rem] leading-[1.65] text-muted">
            Nothing is registered on this path. The page may have moved, or the link that
            brought you here was typed by hand.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link className={PRIMARY_ACTION} href="/">
              Back to the room
              <ArrowRight />
            </Link>
            <Link className={SECONDARY_ACTION} href="/projects">
              All projects
              <ArrowRight />
            </Link>
          </div>
        </div>

        <aside
          className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
          aria-label="Route diagnostics"
        >
          {/* Swap the id for any other media.giphy.com/media/<id>/giphy.gif URL.
              Kept as a plain <img> on purpose: next/image would need a
              remotePatterns entry, and your CSP already allows img-src https:. */}
          <figure
            className={`m-0 mb-[clamp(28px,4vw,44px)] border border-sys-line bg-sys-surface p-3 ${styles.gifFrame}`}
          >
            <img
              src={NOT_FOUND_GIF}
              width={480}
              height={360}
              alt="A terminal reading 404 not found"
              className={`block h-auto w-full border border-sys-line ${styles.gifImage}`}
              loading="lazy"
              decoding="async"
            />
            <figcaption className="mt-3 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted">
              &gt; signal acquired
            </figcaption>
          </figure>

          <SystemFrame title="ROUTE LOG" classification="404">
            <div className="relative border-b border-sys-line p-[22px]">
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 ${styles.voidGrid}`}
              />
              <p className="relative m-0 w-fit bg-sys-bg px-3 py-1.5 font-display text-[clamp(3.1rem,6.5vw,4.8rem)] font-normal leading-none tracking-[-0.03em] text-ink shadow-pixel-accent">
                404
              </p>
              <p className="relative m-0 mt-5 max-w-[34ch] font-mono text-[0.58rem] uppercase leading-[1.8] tracking-[0.08em] text-muted">
                Unresolved path. Nothing rendered at this segment.
              </p>
            </div>

            <div className="px-[22px] pb-[22px] pt-1">
              {ROUTE_LOG.map((row) => (
                <DataRow key={row.label} label={row.label} value={row.value} />
              ))}
            </div>
          </SystemFrame>
        </aside>

        <section
          className="lg:col-start-1 lg:row-start-2"
          aria-labelledby="not-found-detours"
          data-scroll-reveal
          data-scroll-reveal-state="visible"
          suppressHydrationWarning
        >
          <h2
            id="not-found-detours"
            className="m-0 border-b border-line pb-3 font-mono text-[0.84rem] font-extrabold uppercase tracking-[0.08em] text-accent"
          >
            &gt; other rooms
          </h2>

          <ul className="m-0">
            {DETOURS.map((item) => (
              <li key={item.href}>
                <Link
                  className="group flex items-center justify-between gap-4 border-b border-line py-4 transition-colors duration-150 ease-out hover:text-accent focus-visible:text-accent"
                  href={item.href}
                >
                  <span className="min-w-0">
                    <span className="block font-display text-[1.05rem] leading-[1.2]">
                      {item.label}
                    </span>
                    <span className="mt-1 block font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted">
                      {item.path} — {item.note}
                    </span>
                  </span>
                  <span className="shrink-0 text-muted transition-colors duration-150 ease-out group-hover:text-accent group-focus-visible:text-accent">
                    <ArrowRight />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
