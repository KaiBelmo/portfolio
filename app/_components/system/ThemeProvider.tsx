"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import {
  ThemeType,
  getThemeFromHour,
  THEME_PALETTES,
  DEFAULT_THEME,
} from "@/lib/theme";
import {
  RoomThemeAnimation,
  coerceAvailableTheme,
  createRoomThemeAnimation,
  isThemeAvailable,
  prefersReducedThemeMotion,
  preloadRoomThemeAnimation,
  staticRoomAsset,
  supportsTransparentRoomVideo,
} from "@/lib/theme-animation";
import ThemeBackgroundFlare from "../ui/ThemeBackgroundFlare";

interface ThemeContextType {
  theme: ThemeType;
  selectedTheme: ThemeType | null;
  isAuto: boolean;
  isThemeTransitioning: boolean;
  isRoomAnimationPlaying: boolean;
  roomAnimation: RoomThemeAnimation | null;
  animationStartedAt: number;
  videoMediaTimeRef: React.MutableRefObject<number>;
  reportVideoFrame: (mediaTime: number) => void;
  setThemeOverride: (theme: ThemeType | null) => void;
  startRoomAnimation: (id: number) => void;
  finishRoomAnimation: (id: number) => void;
  failRoomAnimation: (id: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function nextPaint(frames = 1) {
  return new Promise<void>((resolve) => {
    const tick = (remaining: number) => {
      window.requestAnimationFrame(() => {
        if (remaining <= 1) resolve();
        else tick(remaining - 1);
      });
    };
    tick(frames);
  });
}

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
  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);
  const [isRoomAnimationPlaying, setIsRoomAnimationPlaying] = useState(false);
  const [animationStartedAt, setAnimationStartedAt] = useState(0);

  const displayedThemeRef = useRef(targetTheme);
  const roomAnimationRef = useRef<RoomThemeAnimation | null>(null);
  const transitionIdRef = useRef(0);
  const transitionRunningRef = useRef(false);
  const animationStartedAtRef = useRef(0);
  const paletteCommitTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);
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
    if (paletteCommitTimerRef.current !== null) {
      window.clearTimeout(paletteCommitTimerRef.current);
      paletteCommitTimerRef.current = null;
    }
    if (finishTimerRef.current !== null) {
      window.clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
    roomAnimationRef.current = null;
    setRoomAnimation(null);
    setIsRoomAnimationPlaying(false);
    setAnimationStartedAt(0);
    videoMediaTimeRef.current = 0;
    transitionRunningRef.current = false;
    setIsThemeTransitioning(false);
  }, []);

  const startRoomAnimation = useCallback(
    (id: number) => {
      const active = roomAnimationRef.current;
      if (!active || active.id !== id) return;

      const now = performance.now();
      animationStartedAtRef.current = now;
      setAnimationStartedAt(now);
      setIsRoomAnimationPlaying(true);

      paletteCommitTimerRef.current = window.setTimeout(() => {
        if (roomAnimationRef.current?.id !== id) return;
        commitTheme(active.to);
        paletteCommitTimerRef.current = null;
      }, active.durationMs / 2);
    },
    [commitTheme],
  );

  const finishRoomAnimation = useCallback(
    (id: number) => {
      const active = roomAnimationRef.current;
      if (!active || active.id !== id) return;

      const elapsed = performance.now() - animationStartedAtRef.current;
      const maxFlareEndMs = active.flarePhases.reduce(
        (max, phase) => Math.max(max, phase.startMs + phase.durationMs),
        0,
      );
      const delay = Math.max(0, maxFlareEndMs - elapsed);

      const complete = () => {
        const currentActive = roomAnimationRef.current;
        if (!currentActive || currentActive.id !== id) return;
        commitTheme(currentActive.to);
        setTimeout(() => {
          if (roomAnimationRef.current?.id !== id) return;
          clearTransition();
        }, 300);
      };

      if (delay > 0) {
        setTimeout(complete, delay);
      } else {
        complete();
      }
    },
    [clearTransition, commitTheme],
  );

  const failRoomAnimation = useCallback(
    (id: number) => {
      const active = roomAnimationRef.current;
      if (!active || active.id !== id) return;
      commitTheme(active.to);
      clearTransition();
    },
    [clearTransition, commitTheme],
  );

  const startThemeTransition = useCallback(
    async (requestedTheme: ThemeType) => {
      const nextTheme = coerceAvailableTheme(requestedTheme);
      const from = displayedThemeRef.current;
      if (from === nextTheme || transitionRunningRef.current) return;

      transitionIdRef.current += 1;
      const transitionId = transitionIdRef.current;
      const animation = createRoomThemeAnimation(transitionId, from, nextTheme);
      const isHomeRoute = pathname === "/";
      const isMobile =
        typeof window !== "undefined" && window.innerWidth <= 800;

      const shouldSwitchDirectly =
        prefersReducedThemeMotion() ||
        (!isMobile && isHomeRoute && !supportsTransparentRoomVideo()) ||
        animation === null;

      if (shouldSwitchDirectly) {
        commitTheme(nextTheme);
        return;
      }

      if (isHomeRoute && !isMobile && typeof window !== "undefined") {
        const img = new Image();
        img.src = staticRoomAsset(nextTheme);
        img.decode().catch(() => {});
      }

      transitionRunningRef.current = true;
      setIsThemeTransitioning(true);
      setIsRoomAnimationPlaying(false);

      // On desktop home route, preload the video segment before starting
      if (isHomeRoute && !isMobile) {
        try {
          await preloadRoomThemeAnimation(animation);
        } catch {
          if (transitionId !== transitionIdRef.current) return;
          commitTheme(nextTheme);
          clearTransition();
          return;
        }
      }

      if (transitionId !== transitionIdRef.current) return;

      roomAnimationRef.current = animation;
      setRoomAnimation(animation);

      // Non-home routes and mobile: drive the flare via wall-clock timer
      // (no video to sync against)
      if (!isHomeRoute || isMobile) {
        startRoomAnimation(animation.id);
        finishTimerRef.current = window.setTimeout(() => {
          finishTimerRef.current = null;
          finishRoomAnimation(animation.id);
        }, animation.durationMs);
      }
    },
    [clearTransition, commitTheme, finishRoomAnimation, pathname, startRoomAnimation],
  );

  const setThemeOverride = useCallback(
    (nextOverride: ThemeType | null) => {
      if (nextOverride !== null && !isThemeAvailable(nextOverride)) return;

      // Cancel any in-flight transition so the new one can start immediately
      if (transitionRunningRef.current) {
        transitionIdRef.current += 1;
        clearTransition();
      }

      setThemeOverrideState(nextOverride);
      const nextTheme = coerceAvailableTheme(nextOverride ?? getThemeFromHour());
      if (nextOverride === null) setClockTheme(nextTheme);
      void startThemeTransition(nextTheme);
    },
    [clearTransition, startThemeTransition],
  );

  // Eagerly preload both video directions on desktop home route
  useEffect(() => {
    const isMobile =
      typeof window !== "undefined" && window.innerWidth <= 800;
    if (pathname !== "/" || !supportsTransparentRoomVideo() || isMobile) return;

    const anims = [
      createRoomThemeAnimation(0, "morning", "afternoon"),
      createRoomThemeAnimation(0, "afternoon", "night"),
      createRoomThemeAnimation(0, "night", "morning"),
      createRoomThemeAnimation(0, "afternoon", "morning"),
    ];
    for (const anim of anims) {
      if (anim) preloadRoomThemeAnimation(anim).catch(() => {});
    }
  }, [pathname]);

  // Auto-update clock theme every minute
  useEffect(() => {
    const timer = window.setInterval(
      () => {
        if (themeOverride === null) {
          setClockTheme(coerceAvailableTheme(getThemeFromHour()));
        }
      },
      60000,
    );
    return () => {
      window.clearInterval(timer);
    };
  }, [themeOverride]);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    if (themeOverride !== null || transitionRunningRef.current) return;
    void startThemeTransition(clockTheme);
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
      if (paletteCommitTimerRef.current !== null) {
        window.clearTimeout(paletteCommitTimerRef.current);
      }
      if (finishTimerRef.current !== null) {
        window.clearTimeout(finishTimerRef.current);
      }
      roomAnimationRef.current = null;
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
      animationStartedAt,
      videoMediaTimeRef,
      reportVideoFrame,
      setThemeOverride,
      startRoomAnimation,
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
      animationStartedAt,
      reportVideoFrame,
      setThemeOverride,
      startRoomAnimation,
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
