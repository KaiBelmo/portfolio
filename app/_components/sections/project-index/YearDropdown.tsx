"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  dropdownFrameClass,
  dropdownMenuClass,
  dropdownOptionClass,
  dropdownTriggerClass,
} from "./constants";
import { stateTransition } from "../../ui/stateAnimations";

export default function YearDropdown({
  className,
  label,
  years,
  value,
  onChange,
}: {
  className?: string;
  label: string;
  years: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const reduceMotion = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const options = ["All", ...years];
  const displayValue = value === "All" ? label : value;

  return (
    <div
      ref={ref}
      className={`${dropdownFrameClass} ${open ? "z-[200]" : "z-auto"} ${className || ""}`}
      onBlur={(event) => {
        if (!ref.current?.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        className={dropdownTriggerClass}
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((value) => !value)}
      >
        <span>{displayValue}</span>
        <ChevronDown
          className={`size-4 opacity-80 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className={dropdownMenuClass}
            role="listbox"
            aria-label={label}
            initial={reduceMotion ? false : { opacity: 0, y: -4, scaleY: 0.98 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.98 }}
            transition={stateTransition(reduceMotion, 0.16)}
            style={{ transformOrigin: "top" }}
          >
            {options.map((item) => (
              <button
                key={item}
                className={dropdownOptionClass}
                type="button"
                role="option"
                aria-selected={value === item}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(item);
                  setOpen(false);
                }}
              >
                {item === "All" ? label : item}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
