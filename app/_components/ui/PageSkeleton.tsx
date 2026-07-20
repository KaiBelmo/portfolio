function Block({ className = "" }: { className?: string }) {
  return <div className={`bg-[color-mix(in_srgb,var(--sys-muted)_18%,transparent)] ${className}`} />;
}

export default function PageSkeleton() {
  return (
    <section
      className="border-b border-sys-line-strong px-[clamp(20px,5vw,72px)] py-[clamp(64px,8vw,120px)] scroll-mt-5 tablet:px-4 tablet:py-[58px]"
      aria-label="Loading page"
      aria-busy="true"
      data-route-loading="true"
    >
      <Block className="mb-5 h-5 w-28" />
      <Block className="mb-12 h-[clamp(58px,8vw,96px)] w-[min(620px,100%)]" />
      <div className="grid grid-cols-[7fr_5fr] gap-6 tablet:grid-cols-1">
        <div className="border-y border-sys-line-strong">
          {[0, 1, 2, 3].map((item) => (
            <div className="grid grid-cols-[42px_1fr_150px] gap-4 border-b border-sys-line px-3 py-6 last:border-b-0 tablet:grid-cols-[32px_1fr]" key={item}>
              <Block className="h-4 w-6" />
              <div>
                <Block className="mb-3 h-5 w-[min(360px,80%)]" />
                <Block className="mb-3 h-4 w-full" />
                <div className="flex gap-2">
                  <Block className="h-5 w-16" />
                  <Block className="h-5 w-20" />
                  <Block className="h-5 w-14" />
                </div>
              </div>
              <Block className="h-5 w-full tablet:col-start-2 tablet:w-28" />
            </div>
          ))}
        </div>
        <aside className="border border-sys-line-strong p-4 tablet:hidden">
          <Block className="mb-5 aspect-[16/10] w-full" />
          <Block className="mb-4 h-6 w-3/4" />
          <Block className="mb-2 h-4 w-full" />
          <Block className="mb-2 h-4 w-5/6" />
          <Block className="mt-6 h-11 w-full" />
        </aside>
      </div>
    </section>
  );
}
