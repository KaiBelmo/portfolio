"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import { usePathname } from "next/navigation";
import {
  DEFAULT_THEME,
  ThemeType,
  getThemeFromHour,
  THEME_PALETTES,
} from "@/lib/theme";
import {
  RoomThemeAnimation,
  canUseRoomVideo,
  coerceAvailableTheme,
  createRoomThemeAnimation,
  isThemeAvailable,
  prefersReducedThemeMotion,
  shouldSkipSpeculativePreload,
  warmRoomPoster,
  warmRoomTransitionAssets,
} from "@/lib/theme-animation";
import ThemeBackgroundFlare from "../ui/ThemeBackgroundFlare";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Extra time we wait for a slow clip after the wall-clock timer before finishing anyway. */
const VIDEO_GRACE_MS = 4000;
/** Pause after the final palette commit before tearing the transition down. */
const SETTLE_MS = 300;
/** Delay before speculative clip warming so it never competes with first paint. */
const IDLE_WARM_DELAY_MS = 2500;

interface ThemeContextType {
  theme: ThemeType;
  selectedTheme: ThemeType | null;
  isAuto: boolean;
  isThemeTransitioning: boolean;
  isRoomAnimationPlaying: boolean;
  roomAnimation: RoomThemeAnimation | null;
  /** True when the current transition drives the room clip, not only the mosaic. */
  roomVideoEnabled: boolean;
  animationStartedAt: number;
  videoMediaTimeRef: React.MutableRefObject<number>;
  reportVideoFrame: (mediaTime: number) => void;
  setThemeOverride: (theme: ThemeType | null) => void;
  /** Warms the clips and posters reachable from the current theme. Safe to call often. */
  warmThemeAssets: () => void;
  finishRoomAnimation: (id: number) => void;
  failRoomAnimation: (id: number) => void;
}

interface ActiveTransition {
  id: number;
  animation: RoomThemeAnimation;
  startedAt: number;
  timerDone: boolean;
  videoDone: boolean;
  finishing: boolean;
  timers: number[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [clockTheme, setClockTheme] = useState<ThemeType>(DEFAULT_THEME);
  const [themeOverride, setThemeOverrideState] = useState<ThemeType | null>(null);

  const targetTheme = useMemo(
    () => coerceAvailableTheme(themeOverride ?? clockTheme),
    [themeOverride, clockTheme],
  );
  const [displayedTheme, setDisplayedTheme] = useState<ThemeType>(DEFAULT_THEME);
  const [roomAnimation, setRoomAnimation] = useState<RoomThemeAnimation | null>(null);
  const [roomVideoEnabled, setRoomVideoEnabled] = useState(false);
  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);
  const [isRoomAnimationPlaying, setIsRoomAnimationPlaying] = useState(false);
  const [animationStartedAt, setAnimationStartedAt] = useState(0);

  const displayedThemeRef = useRef(targetTheme);
  const activeRef = useRef<ActiveTransition | null>(null);
  const transitionIdRef = useRef(0);
  const isFirstRenderRef = useRef(true);
  const videoMediaTimeRef = useRef(0);

  const reportVideoFrame = useCallback((mediaTime: number) => {
    videoMediaTimeRef.current = mediaTime;
  }, []);

  const commitTheme = useCallback((nextTheme: ThemeType) => {
    const availableTheme = coerceAvailableTheme(nextTheme);
    displayedThemeRef.current = availableTheme;
    setDisplayedTheme(availableTheme);
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = availableTheme;
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", THEME_PALETTES[availableTheme].canvas);
    }
  }, []);

  const clearTransition = useCallback(() => {
    const active = activeRef.current;
    if (active) active.timers.forEach((timer) => window.clearTimeout(timer));
    activeRef.current = null;
    setRoomAnimation(null);
    setRoomVideoEnabled(false);
    setIsRoomAnimationPlaying(false);
    setAnimationStartedAt(0);
    videoMediaTimeRef.current = 0;
    setIsThemeTransitioning(false);
  }, []);

  // Runs once both the wall-clock timer and the clip (if any) have finished.
  const completeTransition = useCallback(
    (id: number) => {
      const active = activeRef.current;
      if (!active || active.id !== id || active.finishing) return;
      active.finishing = true;

      const { animation } = active;
      const maxFlareEndMs = animation.flarePhases.reduce(
        (max, phase) => Math.max(max, phase.startMs + phase.durationMs),
        0,
      );
      const delay = Math.max(0, maxFlareEndMs - (performance.now() - active.startedAt));

      const settle = () => {
        if (activeRef.current?.id !== id) return;
        commitTheme(animation.to);
        active.timers.push(
          window.setTimeout(() => {
            if (activeRef.current?.id === id) clearTransition();
          }, SETTLE_MS),
        );
      };

      if (delay > 0) active.timers.push(window.setTimeout(settle, delay));
      else settle();
    },
    [clearTransition, commitTheme],
  );

  const tryFinish = useCallback(
    (id: number) => {
      const active = activeRef.current;
      if (!active || active.id !== id) return;
      if (active.timerDone && active.videoDone) completeTransition(id);
    },
    [completeTransition],
  );

  // The clip reporting its end or an error both release the same gate; the
  // mosaic keeps its own clock either way.
  const finishRoomAnimation = useCallback(
    (id: number) => {
      const active = activeRef.current;
      if (!active || active.id !== id) return;
      active.videoDone = true;
      tryFinish(id);
    },
    [tryFinish],
  );
  const failRoomAnimation = finishRoomAnimation;

  const startThemeTransition = useCallback(
    (requestedTheme: ThemeType) => {
      const nextTheme = coerceAvailableTheme(requestedTheme);
      const from = displayedThemeRef.current;
      if (from === nextTheme || activeRef.current) return;

      transitionIdRef.current += 1;
      const id = transitionIdRef.current;
      const animation = createRoomThemeAnimation(id, from, nextTheme);

      if (animation === null || prefersReducedThemeMotion()) {
        commitTheme(nextTheme);
        return;
      }

      // Everything starts on the wall clock immediately. The clip, where it
      // runs, syncs in whenever its first frame arrives instead of holding
      // the mosaic back.
      const usesVideo = pathname === "/" && canUseRoomVideo();
      const startedAt = performance.now();
      const active: ActiveTransition = {
        id,
        animation,
        startedAt,
        timerDone: false,
        videoDone: !usesVideo,
        finishing: false,
        timers: [],
      };
      activeRef.current = active;
      videoMediaTimeRef.current = 0;

      if (usesVideo) warmRoomPoster(nextTheme);

      setIsThemeTransitioning(true);
      setRoomAnimation(animation);
      setRoomVideoEnabled(usesVideo);
      setAnimationStartedAt(startedAt);
      setIsRoomAnimationPlaying(true);

      const whenStillActive = (callback: () => void) => () => {
        if (activeRef.current?.id === id) callback();
      };

      active.timers.push(
        window.setTimeout(
          whenStillActive(() => commitTheme(nextTheme)),
          animation.durationMs / 2,
        ),
      );
      active.timers.push(
        window.setTimeout(
          whenStillActive(() => {
            active.timerDone = true;
            tryFinish(id);
          }),
          animation.durationMs,
        ),
      );
      if (usesVideo) {
        active.timers.push(
          window.setTimeout(
            whenStillActive(() => {
              active.videoDone = true;
              tryFinish(id);
            }),
            animation.durationMs + VIDEO_GRACE_MS,
          ),
        );
      }
    },
    [commitTheme, pathname, tryFinish],
  );

  const setThemeOverride = useCallback(
    (nextOverride: ThemeType | null) => {
      if (nextOverride !== null && !isThemeAvailable(nextOverride)) return;

      // Cancel any in-flight transition so the new one can start immediately
      if (activeRef.current) {
        transitionIdRef.current += 1;
        clearTransition();
      }

      setThemeOverrideState(nextOverride);
      const nextTheme = coerceAvailableTheme(nextOverride ?? getThemeFromHour());
      if (nextOverride === null) setClockTheme(nextTheme);
      startThemeTransition(nextTheme);
    },
    [clearTransition, startThemeTransition],
  );

  const warmThemeAssets = useCallback(() => {
    if (pathname !== "/") return;
    warmRoomTransitionAssets(displayedThemeRef.current);
  }, [pathname]);

  // Speculative warming: only the clips reachable from the current theme,
  // only on the desktop home route, only after the page has settled, and
  // never on a metered connection.
  useEffect(() => {
    if (pathname !== "/" || !canUseRoomVideo() || shouldSkipSpeculativePreload()) return;

    let cancelled = false;
    let idleId = 0;
    const run = () => {
      if (!cancelled) warmRoomTransitionAssets(displayedThemeRef.current);
    };
    const timerId = window.setTimeout(() => {
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(run, { timeout: 4000 });
      } else {
        run();
      }
    }, IDLE_WARM_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
      if (idleId && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
    };
  }, [pathname, displayedTheme]);

  // Auto-update clock theme every minute
  useIsomorphicLayoutEffect(() => {
    const updateClockTheme = () => {
      if (themeOverride === null) {
        const nextTheme = coerceAvailableTheme(getThemeFromHour());
        setClockTheme(nextTheme);

        // The server must render the stable morning fallback, but the first
        // client sync should apply the user's local time without animating
        // from that fallback theme.
        if (isFirstRenderRef.current && nextTheme !== displayedThemeRef.current) {
          commitTheme(nextTheme);
        }
      }
    };

    // Resolve the current local hour immediately on mount instead of waiting
    // for the first interval tick.
    updateClockTheme();
    const timer = window.setInterval(
      updateClockTheme,
      60000,
    );
    return () => {
      window.clearInterval(timer);
    };
  }, [commitTheme, themeOverride]);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    if (themeOverride !== null || activeRef.current) return;
    startThemeTransition(clockTheme);
  }, [clockTheme, startThemeTransition, themeOverride]);

  useEffect(() => {
    document.documentElement.dataset.theme = displayedTheme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", THEME_PALETTES[displayedTheme].canvas);
  }, [displayedTheme]);

  useEffect(
    () => () => {
      transitionIdRef.current += 1;
      activeRef.current?.timers.forEach((timer) => window.clearTimeout(timer));
      activeRef.current = null;
    },
    [],
  );

  const contextValue = useMemo<ThemeContextType>(
    () => ({
      theme: displayedTheme,
      selectedTheme: themeOverride,
      isAuto: themeOverride === null,
      isThemeTransitioning,
      isRoomAnimationPlaying,
      roomAnimation,
      roomVideoEnabled,
      animationStartedAt,
      videoMediaTimeRef,
      reportVideoFrame,
      setThemeOverride,
      warmThemeAssets,
      finishRoomAnimation,
      failRoomAnimation,
    }),
    [
      displayedTheme,
      failRoomAnimation,
      finishRoomAnimation,
      isRoomAnimationPlaying,
      isThemeTransitioning,
      roomAnimation,
      roomVideoEnabled,
      animationStartedAt,
      reportVideoFrame,
      setThemeOverride,
      warmThemeAssets,
      themeOverride,
    ],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <div
        className={`app theme-${displayedTheme}`}
        data-theme-transitioning={isRoomAnimationPlaying ? "true" : "false"}
      >
        <div className="site-theme-background" aria-hidden="true" />
        <div className="pixel-grid" aria-hidden="true" />
        <ThemeBackgroundFlare />
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
