import React from "react";

interface DataRowProps {
  label: string;
  value: React.ReactNode;
  stacked?: boolean;
  noUppercase?: boolean;
}

export default function DataRow({ label, value, stacked, noUppercase }: DataRowProps) {
  const labelClass = `font-display tracking-wider text-sys-muted ${noUppercase ? "" : "uppercase"}`;

  if (stacked) {
    return (
      <div className="flex flex-col gap-1 border-t border-b border-sys-line/30 py-2.5 text-xs md:text-sm">
        <span className={labelClass}>{label}</span>
        <span className="font-medium text-sys-cream leading-relaxed">{value}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-b border-sys-line/30 py-2 text-xs md:text-sm">
      <span className={labelClass}>{label}</span>
      <span className="text-right font-medium text-sys-cream">{value}</span>
    </div>
  );
}
