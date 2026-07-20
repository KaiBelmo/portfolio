"use client";

import React, { useContext } from "react";
import { usePathname } from "next/navigation";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import ScrollReveal from "./ScrollReveal";

// Keep the leaving route bound to the router context it rendered with. Without
// this, App Router can update the exiting tree with the incoming route's data.
function FrozenRoute({
  children,
  context,
}: {
  children: React.ReactNode;
  context: React.ContextType<typeof LayoutRouterContext>;
}) {
  return (
    <LayoutRouterContext.Provider value={context}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

type TransitionTokens = {
  duration: number;
  distance: number;
  stagger: number;
};

const DEFAULT_TOKENS: TransitionTokens = {
  duration: 0.25,
  distance: 12,
  stagger: 0,
};

let tokenCache: TransitionTokens | null = null;

function getTokens(): TransitionTokens {
  if (tokenCache) return tokenCache;
  if (typeof window === "undefined") return DEFAULT_TOKENS;

  const styles = getComputedStyle(document.documentElement);

  const parseTime = (value: string) => {
    const token = value.trim();
    const number = Number.parseFloat(token);
    if (!Number.isFinite(number)) return null;
    if (token.endsWith("ms")) return number / 1000;
    if (token.endsWith("s")) return number;
    return null;
  };

  const parseLength = (value: string) => {
    const token = value.trim();
    const number = Number.parseFloat(token);
    if (!Number.isFinite(number)) return null;
    return token.endsWith("px") ? number : null;
  };

  tokenCache = {
    duration:
      parseTime(styles.getPropertyValue("--page-slide-dur")) ??
      DEFAULT_TOKENS.duration,
    distance:
      parseLength(styles.getPropertyValue("--page-slide-distance")) ??
      DEFAULT_TOKENS.distance,
    stagger:
      parseTime(styles.getPropertyValue("--page-stagger")) ??
      DEFAULT_TOKENS.stagger,
  };

  return tokenCache;
}

const ENTER_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EXIT_EASE: [number, number, number, number] = [0.4, 0, 1, 1];

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const routerContext = useContext(LayoutRouterContext);
  const reduceMotion = Boolean(useReducedMotion());
  const tokens = getTokens();

  const variants: Variants = reduceMotion
    ? {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 1, y: 0 },
      }
    : {
        initial: {
          opacity: 0,
          y: Math.min(tokens.distance, 10),
        },
        animate: {
          opacity: 1,
          y: 0,
          transition: {
            duration: tokens.duration,
            delay: tokens.stagger,
            ease: ENTER_EASE,
          },
        },
        exit: {
          opacity: 0,
          y: -Math.min(tokens.distance * 0.5, 6),
          transition: {
            duration: Math.min(tokens.duration * 0.6, 0.16),
            ease: EXIT_EASE,
          },
        },
      };

  return (
    <div className="t-page-slide">
      <AnimatePresence mode="wait" initial={!reduceMotion}>
        <motion.div
          className="t-page-slide__page"
          key={pathname}
          variants={variants}
          initial={reduceMotion ? false : "initial"}
          animate="animate"
          exit="exit"
        >
          <ScrollReveal>
            <FrozenRoute context={routerContext}>{children}</FrozenRoute>
          </ScrollReveal>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
