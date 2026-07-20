"use client";

import { useCallback, useEffect, useId, useState } from "react";

const CheckIcon = (
  <svg className="size-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 8.5 6.5 12 13 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type CopyStatus = "idle" | "copied" | "failed";

type ContactCopyButtonProps = {
  children: string;
  className: string;
  value: string;
};

export default function ContactCopyButton({ children, className, value }: ContactCopyButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const statusId = useId();

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }, [value]);

  useEffect(() => {
    if (status === "idle") return;
    const timer = window.setTimeout(() => setStatus("idle"), 2000);
    return () => window.clearTimeout(timer);
  }, [status]);

  return (
    <>
      <button type="button" onClick={copy} className={className} aria-describedby={status === "idle" ? undefined : statusId}>
        {status === "copied" ? (
          <>
            {CheckIcon}
            Copied
          </>
        ) : status === "failed" ? (
          "Copy failed"
        ) : (
          children
        )}
      </button>
      <span id={statusId} className="sr-only" role="status">
        {status === "copied" ? "Copied to clipboard." : status === "failed" ? "Copy failed. Select and copy the text manually." : ""}
      </span>
    </>
  );
}
