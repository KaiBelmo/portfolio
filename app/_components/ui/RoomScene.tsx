"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { THEME_OPTIONS, type ThemeType } from "@/lib/theme";
import type { RoomThemeAnimation } from "@/lib/theme-animation";
import { MOBILE_MAX_WIDTH, ROOM_POSTER_WIDTH, roomPosterImageProps } from "@/lib/theme-animation";
import { rafCoordinator } from "@/lib/raf-coordinator";
import styles from "./RoomScene.module.css";

/**
 * Runs at parse time, right after the poster elements. The server rendered
 * them without a source because it cannot know the visitor's theme, but the
 * head bootstrap has already chosen one, so the matching poster gets its
 * source here and loads eagerly with the page. The other two never do.
 */
const POSTER_BOOT_SCRIPT = `(function(){var s=document.currentScript;if(!s||window.innerWidth<=${MOBILE_MAX_WIDTH})return;var t=document.documentElement.dataset.theme;var i=s.parentElement.querySelector('img[data-room-poster="'+t+'"]');if(!i||i.getAttribute("src"))return;i.setAttribute("srcset",i.dataset.srcset);i.setAttribute("src",i.dataset.src);})();`;

const subscribeToNothing = () => () => {};
function useIsHydrated() {
  return useSyncExternalStore(subscribeToNothing, () => true, () => false);
}

const POSTERS = Object.fromEntries(
  THEME_OPTIONS.map((theme) => [theme, roomPosterImageProps(theme)]),
) as Record<ThemeType, ReturnType<typeof roomPosterImageProps>>;

const hotspots = [
  { href: "/about", label: "About", detail: "me", className: styles.hotspotAbout },
  { href: "/projects", label: "Projects", detail: "the laptop", className: styles.hotspotProjects },
  { href: "/blog", label: "Blog", detail: "the bookshelf", className: styles.hotspotBlog },
  { href: "/contact", label: "Contact", detail: "the coffee", className: styles.hotspotContact },
];

type VideoFrameMetadata = {
  mediaTime: number;
  expectedDisplayTime?: number;
};

type FrameVideo = HTMLVideoElement & {
  requestVideoFrameCallback?: (
    callback: (now: number, metadata: VideoFrameMetadata) => void,
  ) => number;
  cancelVideoFrameCallback?: (id: number) => void;
};

/** Half a source frame of tolerance keeps the handoff on the intended destination frame. */
const END_TOLERANCE_SECONDS = 1 / 48;

export default function RoomScene({
  theme,
  animation = null,
  onAnimationComplete,
  onAnimationError,
  onFrame,
}: {
  theme: ThemeType;
  animation?: RoomThemeAnimation | null;
  onAnimationComplete?: (id: number) => void;
  onAnimationError?: (id: number) => void;
  onFrame?: (mediaTime: number) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Readiness is keyed by animation id so it resets by derivation, not by a
  // state write inside the effect, when a new transition starts.
  const [readyAnimationId, setReadyAnimationId] = useState<number | null>(null);
  const videoReady = animation !== null && readyAnimationId === animation.id;
  const isHydrated = useIsHydrated();

  // One persistent <video>. Its source only changes when the direction or the
  // chosen resolution does, so repeat transitions replay from the same buffer.
  useEffect(() => {
    const video = videoRef.current as FrameVideo | null;
    if (!video) return;
    if (!animation) {
      video.pause();
      return;
    }

    let cancelled = false;
    let didComplete = false;
    let frameCallbackId: number | null = null;
    let rafId: number | null = null;

    video.pause();

    const finish = () => {
      if (cancelled || didComplete) return;
      didComplete = true;
      video.pause();
      onAnimationComplete?.(animation.id);
    };

    const fail = () => {
      if (cancelled || didComplete) return;
      didComplete = true;
      video.pause();
      onAnimationError?.(animation.id);
    };

    const reachedEnd = (time: number) => time >= animation.endTime - END_TOLERANCE_SECONDS;

    const checkFrame = (_now: number, metadata: VideoFrameMetadata) => {
      if (cancelled || didComplete) return;
      onFrame?.(metadata.mediaTime);
      if (reachedEnd(metadata.mediaTime)) {
        finish();
        return;
      }
      frameCallbackId = video.requestVideoFrameCallback?.(checkFrame) ?? null;
    };

    const checkWithRaf = () => {
      if (cancelled || didComplete) return;
      onFrame?.(video.currentTime);
      if (reachedEnd(video.currentTime)) {
        finish();
        return;
      }
      rafId = window.requestAnimationFrame(checkWithRaf);
    };

    const seekToStart = () =>
      new Promise<void>((resolve, reject) => {
        if (Math.abs(video.currentTime - animation.startTime) < 0.01) {
          resolve();
          return;
        }
        const cleanup = () => {
          video.removeEventListener("seeked", handleSeeked);
          video.removeEventListener("error", handleSeekError);
        };
        const handleSeeked = () => {
          cleanup();
          resolve();
        };
        const handleSeekError = () => {
          cleanup();
          reject(new Error("Unable to seek theme video"));
        };
        video.addEventListener("seeked", handleSeeked, { once: true });
        video.addEventListener("error", handleSeekError, { once: true });
        video.currentTime = animation.startTime;
      });

    const start = async () => {
      try {
        await seekToStart();
        if (cancelled) return;
        // load() resets the rate to defaultPlaybackRate, so it must be applied
        // here, after the clip is loaded and right before play.
        video.defaultPlaybackRate = animation.playbackRate;
        video.playbackRate = animation.playbackRate;
        await video.play();
        if (cancelled) return;

        if (typeof video.requestVideoFrameCallback === "function") {
          frameCallbackId = video.requestVideoFrameCallback(checkFrame);
        } else {
          rafId = window.requestAnimationFrame(checkWithRaf);
        }
      } catch {
        fail();
      }
    };

    // Reveal on `playing` rather than on the first presented frame, so a
    // throttled compositor cannot keep the clip invisible while it runs.
    const handlePlaying = () => {
      if (!cancelled) setReadyAnimationId(animation.id);
    };
    const handleLoadedMetadata = () => void start();

    video.addEventListener("playing", handlePlaying);
    video.addEventListener("ended", finish);
    video.addEventListener("error", fail);

    const sameClip = video.getAttribute("src") === animation.src;
    if (sameClip && video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      void start();
    } else {
      video.addEventListener("loadedmetadata", handleLoadedMetadata, { once: true });
      if (!sameClip) video.setAttribute("src", animation.src);
      video.load();
    }

    return () => {
      cancelled = true;
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("ended", finish);
      video.removeEventListener("error", fail);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.pause();
      if (frameCallbackId !== null) video.cancelVideoFrameCallback?.(frameCallbackId);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [animation, onAnimationComplete, onAnimationError, onFrame]);

  const targetX = useRef(0);
  const targetY = useRef(0);
  const wakeUpRef = useRef<(() => void) | null>(null);
  const cachedRectRef = useRef<DOMRect | null>(null);
  const rafPendingRef = useRef(false);
  const lastEventRef = useRef<{ clientX: number; clientY: number } | null>(null);

  // Cache rect on mount and window resize/scroll
  useEffect(() => {
    const updateCachedRect = () => {
      if (stageRef.current) {
        cachedRectRef.current = stageRef.current.getBoundingClientRect();
      }
    };

    updateCachedRect();
    window.addEventListener("resize", updateCachedRect);
    window.addEventListener("scroll", updateCachedRect, { passive: true });

    return () => {
      window.removeEventListener("resize", updateCachedRect);
      window.removeEventListener("scroll", updateCachedRect);
    };
  }, []);

  function updateTargets(clientX: number, clientY: number) {
    // Use cached rect instead of recalculating
    const rect = cachedRectRef.current || stageRef.current?.getBoundingClientRect();
    if (!rect) return;

    targetX.current = (clientX - rect.left) / rect.width - 0.5;
    targetY.current = (clientY - rect.top) / rect.height - 0.5;
    wakeUpRef.current?.();
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (animation || !stageRef.current) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targetX.current = 0;
      targetY.current = 0;
      return;
    }

    // RAF-based throttling - only schedule one update per frame
    lastEventRef.current = { clientX: event.clientX, clientY: event.clientY };
    if (rafPendingRef.current) return;

    rafPendingRef.current = true;
    requestAnimationFrame(() => {
      if (lastEventRef.current) {
        updateTargets(lastEventRef.current.clientX, lastEventRef.current.clientY);
        lastEventRef.current = null;
      }
      rafPendingRef.current = false;
    });
  }

  function resetPointer() {
    targetX.current = 0;
    targetY.current = 0;
    wakeUpRef.current?.();
  }

  useEffect(() => {
    let currentX = 0;
    let currentY = 0;
    let isRunning = false;

    function loop() {
      const dx = targetX.current - currentX;
      const dy = targetY.current - currentY;

      // If close enough to target, snap to target and stop running
      if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) {
        currentX = targetX.current;
        currentY = targetY.current;
        if (stageRef.current) {
          stageRef.current.style.setProperty("--room-x", `${currentX * -9}px`);
          stageRef.current.style.setProperty("--room-y", `${currentY * -7}px`);
        }
        isRunning = false;
        return true; // Signal to stop
      }

      currentX += dx * 0.10;
      currentY += dy * 0.10;
      if (stageRef.current) {
        stageRef.current.style.setProperty("--room-x", `${currentX * -9}px`);
        stageRef.current.style.setProperty("--room-y", `${currentY * -7}px`);
      }
      return false; // Continue running
    }

    let unregister: (() => void) | null = null;

    function wakeUp() {
      if (!isRunning) {
        isRunning = true;
        // Register with RAF coordinator instead of creating own RAF loop
        unregister = rafCoordinator.register(() => {
          const shouldStop = loop();
          if (shouldStop && unregister) {
            unregister();
            unregister = null;
          }
        });
      }
    }

    wakeUpRef.current = wakeUp;
    wakeUp();

    return () => {
      wakeUpRef.current = null;
      if (unregister) {
        unregister();
        unregister = null;
      }
    };
  }, []);

  return (
    <div
      ref={stageRef}
      data-room-scene
      data-theme-from={animation?.from}
      data-theme-to={animation?.to}
      className={`${styles.roomScene} ${animation ? styles.isTimeTravelling : ""} ${videoReady ? styles.videoIsReady : ""}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      aria-busy={Boolean(animation)}
    >
      <div className={styles.imageWrap} data-room-image-wrap>
        {/*
          All three posters are server-rendered without a source, since the
          server cannot know the visitor's theme. The inline script below
          fills in the one matching the theme chosen before first paint, and
          after hydration React keeps a source only on the posters in use:
          the current theme, plus both ends of a running transition. CSS
          keyed on html[data-theme] displays the matching one.
        */}
        {THEME_OPTIONS.map((posterTheme) => {
          const isCurrentTheme = posterTheme === theme;
          const inUse =
            isHydrated &&
            (isCurrentTheme || posterTheme === animation?.from || posterTheme === animation?.to);
          const poster = POSTERS[posterTheme];

          return (
            // eslint-disable-next-line @next/next/no-img-element -- next/image cannot render a source-less poster; the URLs still come from its loader.
            <img
              key={posterTheme}
              className={`${styles.staticLayer} ${styles[`${posterTheme}Image`]}`}
              data-room-poster={posterTheme}
              data-srcset={poster.srcSet}
              data-src={poster.src}
              srcSet={inUse ? poster.srcSet : undefined}
              src={inUse ? poster.src : undefined}
              sizes={poster.sizes}
              alt={isCurrentTheme ? `Isometric bedroom scene in ${posterTheme} light` : ""}
              aria-hidden={isCurrentTheme ? undefined : true}
              width={ROOM_POSTER_WIDTH}
              height={ROOM_POSTER_WIDTH}
              decoding="async"
              fetchPriority={isCurrentTheme ? "high" : "auto"}
              suppressHydrationWarning
            />
          );
        })}
        {/* Server-only: it has run by the time React hydrates, and rendering a
            script during a client navigation would only trigger React's
            "scripts are never executed on the client" warning. */}
        {!isHydrated && <script dangerouslySetInnerHTML={{ __html: POSTER_BOOT_SCRIPT }} />}

        <video
          ref={videoRef}
          className={`${styles.videoLayer} ${videoReady ? styles.isReady : ""}`}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          aria-hidden="true"
        />

        <div className={styles.sceneGlare} aria-hidden="true" />

        {hotspots.map((hotspot) => (
          <Link
            key={hotspot.href}
            href={hotspot.href}
            className={`${styles.hotspot} ${hotspot.className}`}
            data-room-hotspot
            aria-label={`${hotspot.label}, open from ${hotspot.detail}`}
            tabIndex={animation ? -1 : undefined}
          >
            <span className={styles.hotspotDot} aria-hidden="true" />
            <span className={styles.hotspotCard}>
              <strong>{hotspot.label}</strong>
              <small>{hotspot.detail}</small>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
