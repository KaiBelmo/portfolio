import React from "react";

interface RecordHeaderProps {
  id?: string;
  name: string;
  category: string;
  date?: string;
  description?: string;
}

export default function RecordHeader({
  id,
  name,
  category,
  date,
  description,
}: RecordHeaderProps) {
  return (
    <div className="pb-4 font-mono">
      <div className="flex justify-between items-start gap-4">
        <div>
          {id && (
            <span className="mb-1 block text-[10px] text-sys-signal">
              ID: {id.toUpperCase()}
            </span>
          )}
          <h2 className="m-0 font-display text-xl font-bold tracking-tight text-sys-cream md:text-2xl">
            {name}
          </h2>
        </div>
        {date && (
          <div className="text-right">
            <span className="block text-[10px] text-sys-muted">FILE_DATE</span>
            <span className="text-xs font-bold text-sys-cream">{date}</span>
          </div>
        )}
      </div>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-sys-cream/80">{description}</p>
      ) : (
        <div className="mt-2 text-[10px] uppercase tracking-wide text-sys-muted">
          RECORD_TYPE // {category}
        </div>
      )}
    </div>
  );
}
