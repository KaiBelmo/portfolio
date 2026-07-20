import type { Transition, Variants } from "framer-motion";

// A slightly softer ease-out curve for UI elements
export const stateAnimationEase = [0.16, 1, 0.3, 1] as const; 

export const stateRevealVariants: Variants = Object.freeze({
  hidden: { opacity: 0, y: -8, height: 0 },
  visible: { opacity: 1, y: 0, height: "auto" },
});

export const stateListItemVariants: Variants = Object.freeze({
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
});

export function stateTransition(reduceMotion: boolean, duration = 0.25): Transition {
  if (reduceMotion) {
    return { duration: 0 };
  }

  // Splitting transitions allows for a smoother, more natural stagger
  return {
    height: { 
      duration: duration * 1.2, // Let the height take slightly longer
      ease: stateAnimationEase 
    },
    opacity: { 
      duration: duration, // Fade in/out a bit faster than the height
      ease: "easeOut" 
    },
    y: { 
      duration: duration * 1.2, 
      ease: stateAnimationEase 
    },
  };
}