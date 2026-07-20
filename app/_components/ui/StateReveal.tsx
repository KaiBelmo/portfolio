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
  duration = 0.25, // Increased slightly from 0.18s for a smoother feel
  children,
  ...props
}: StateRevealProps) {
  const reduceMotion = !!useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          {...props}
          // overflow: hidden is crucial when animating height to prevent content spilling
          style={{ overflow: "hidden", ...props.style }} 
          variants={stateRevealVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={stateTransition(reduceMotion, duration)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}