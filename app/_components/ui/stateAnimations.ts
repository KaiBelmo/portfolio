import type { Transition, Variants } from "framer-motion";

export const stateAnimationEase = [0.4, 0, 0.2, 1] as const;

export const stateRevealVariants: Variants = Object.freeze({
  hidden: { 
    height: 0, 
    opacity: 0,
    transition: { 
      height: { duration: 0.2, ease: stateAnimationEase },
      opacity: { duration: 0.1 },
      staggerChildren: 0.02, 
      staggerDirection: -1 // Reverse stagger when hiding initially
    }
  },
  visible: { 
    height: "auto", 
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: stateAnimationEase },
      opacity: { duration: 0.2, ease: "easeOut" },
      staggerChildren: 0.04, // Elements appear one by one (40ms apart)
      delayChildren: 0.05 // Wait for container to start expanding first
    }
  },
  exit: { 
    height: 0, 
    opacity: 0,
    transition: {
      // Delay the container collapse so children have time to fade out first
      height: { duration: 0.3, ease: stateAnimationEase, delay: 0.15 }, 
      opacity: { duration: 0.2, delay: 0.1 },
      staggerChildren: 0.02, 
      staggerDirection: -1 // Elements disappear one by one in reverse
    }
  },
});

export const stateListItemVariants: Variants = Object.freeze({
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15, ease: "easeIn" } },
});

export function stateTransition(reduceMotion: boolean, duration = 0.3): Transition {
  if (reduceMotion) return { duration: 0 };
  return {
    duration: duration,
    ease: stateAnimationEase,
  };
}