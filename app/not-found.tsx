import Link from "next/link";
import SystemFrame from "./_components/system/SystemFrame";

export default function NotFound() {
  return (
    <section className="grid min-h-[70svh] place-items-center border-b border-sys-line-strong p-8 text-center scroll-mt-5">
      <SystemFrame title="SYSTEM ALERT" classification="EXCEPTION">
        <div className="py-12 px-6 text-center font-mono">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-sys-signal">
            ERROR_CODE: 404_NOT_FOUND
          </p>
          <h1 className="mb-4 font-display text-3xl text-sys-cream">
            PAGE OUTSIDE ADDRESS SPACE
          </h1>
          <p className="mx-auto mb-8 max-w-[400px] text-xs text-sys-muted">
            The requested resource cannot be retrieved from local archives. Verify segment path
            and request variables.
          </p>
          <Link className="inline-flex min-h-11 items-center justify-center border border-sys-signal bg-transparent px-4 py-[9px] font-display text-[0.68rem] uppercase tracking-[0.04em] text-sys-signal hover:bg-sys-signal hover:text-sys-bg" href="/">
            Return to Core Shell
          </Link>
        </div>
      </SystemFrame>
    </section>
  );
}
