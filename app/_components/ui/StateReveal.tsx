"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { stateRevealVariants, stateTransition } from "./stateAnimations";

type StateRevealProps = Omit<HTMLMotionProps<"div">, "animate" | "exit" | "initial" | "transition"> & {
  show: boolean;
  duration?: number;
};

export default function StateReveal({
  show,
  duration = 0.4, // Default duration increased slightly
  children,
  ...props
}: StateRevealProps) {
  const reduceMotion = !!useReducedMotion();

  return (
    <AnimatePresence initial={false} mode="wait">
      {show && (
        <motion.div
          {...props}
          style={{ overflow: "hidden", ...props.style }}
          variants={stateRevealVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={stateTransition(reduceMotion, duration)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}