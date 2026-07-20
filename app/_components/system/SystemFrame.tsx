import React from "react";

interface SystemFrameProps {
  children: React.ReactNode;
  title?: string;
  classification?: string;
  className?: string;
}

export default function SystemFrame({
  children,
  title = "DOSSIER RECORD",
  classification = "UNCLASSIFIED",
  className = "",
}: SystemFrameProps) {
  return (
    <div className={`relative border border-sys-line bg-sys-bg p-6 ${className}`}>
      {/* Top technical border header */}
      <div className="mb-4 flex items-center justify-between border-b border-sys-line pb-2 font-display text-[10px] tracking-wider text-sys-muted">
        <span className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 bg-sys-signal shadow-[0_0_4px_var(--sys-signal)]" />
          {title}
        </span>
        <span className="border border-sys-line bg-sys-raised px-2 py-0.5 font-bold text-sys-cream">
          {classification}
        </span>
      </div>

      {children}

      {/* Corner crosshairs or plus markers */}
      <span className="absolute top-0 left-0 text-[10px] text-[#6b6b66] pointer-events-none select-none font-mono -translate-x-1 -translate-y-2">
        +
      </span>
      <span className="absolute top-0 right-0 text-[10px] text-[#6b6b66] pointer-events-none select-none font-mono translate-x-1 -translate-y-2">
        +
      </span>
      <span className="absolute bottom-0 left-0 text-[10px] text-[#6b6b66] pointer-events-none select-none font-mono -translate-x-1 translate-y-1">
        +
      </span>
      <span className="absolute bottom-0 right-0 text-[10px] text-[#6b6b66] pointer-events-none select-none font-mono translate-x-1 translate-y-1">
        +
      </span>
    </div>
  );
}
