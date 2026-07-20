"use client";

export default function ErrorState({ reset }: { reset: () => void }) {
  return <section className="grid min-h-[70svh] place-items-center border-b border-sys-line-strong px-[clamp(20px,5vw,72px)] py-[clamp(64px,8vw,120px)] text-center scroll-mt-5 tablet:px-4 tablet:py-[58px]"><div><p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-sys-muted">Record request failed</p><h1 className="font-display">ARCHIVE UNAVAILABLE</h1><p>The requested record could not be opened.</p><button className="inline-flex min-h-11 items-center justify-center border border-sys-signal bg-transparent px-4 py-[9px] font-display text-[0.68rem] uppercase tracking-[0.04em] text-sys-signal hover:bg-sys-signal hover:text-sys-bg" type="button" onClick={reset}>Retry request</button></div></section>;
}
