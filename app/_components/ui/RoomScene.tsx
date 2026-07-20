"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ThemeType } from "@/lib/theme";
import type { RoomThemeAnimation } from "@/lib/theme-animation";
import { staticRoomAsset } from "@/lib/theme-animation";
import { rafCoordinator } from "@/lib/raf-coordinator";
import styles from "./RoomScene.module.css";

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

export default function RoomScene({
  theme,
  animation = null,
  compact = false,
  onAnimationStart,
  onAnimationComplete,
  onAnimationError,
  onFrame,
}: {
  theme: ThemeType;
  animation?: RoomThemeAnimation | null;
  compact?: boolean;
  onAnimationStart?: (id: number) => void;
  onAnimationComplete?: (id: number) => void;
  onAnimationError?: (id: number) => void;
  onFrame?: (mediaTime: number) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const visibleThemes = animation
    ? [...new Set([animation.from, animation.to])]
    : [theme];

  useEffect(() => {
    const video = videoRef.current as FrameVideo | null;
    if (!animation || !video) {
      setVideoReady(false);
      return;
    }

    let cancelled = false;
    let frameCallbackId: number | null = null;
    let rafId: number | null = null;
    let didStart = false;
    let didComplete = false;

    setVideoReady(false);
    video.pause();
    video.playbackRate = 1;

    const markStarted = () => {
      if (cancelled || didStart) return;
      didStart = true;
      setVideoReady(true);
      onAnimationStart?.(animation.id);
    };

    const finish = () => {
      if (cancelled || didComplete) return;
      didComplete = true;
      video.pause();
      onAnimationComplete?.(animation.id);
    };

    const checkFrame = (_now: number, metadata: VideoFrameMetadata) => {
      if (cancelled || didComplete) return;
      markStarted();
      onFrame?.(metadata.mediaTime);

      // Half a source frame of tolerance keeps the handoff on the intended
      // destination frame without displaying any trailing source frames.
      if (metadata.mediaTime >= animation.endTime - 1 / 48) {
        finish();
        return;
      }

      frameCallbackId = video.requestVideoFrameCallback?.(checkFrame) ?? null;
    };

    const checkWithRaf = () => {
      if (cancelled || didComplete) return;
      markStarted();
      onFrame?.(video.currentTime);
      if (video.currentTime >= animation.endTime - 1 / 48) {
        finish();
        return;
      }
      rafId = window.requestAnimationFrame(checkWithRaf);
    };

    const seekToStart = () =>
      new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          video.removeEventListener("seeked", handleSeeked);
          video.removeEventListener("error", handleError);
        };
        const handleSeeked = () => {
          cleanup();
          resolve();
        };
        const handleError = () => {
          cleanup();
          reject(new Error("Unable to seek theme video"));
        };

        if (Math.abs(video.currentTime - animation.startTime) < 0.01) {
          resolve();
          return;
        }

        video.addEventListener("seeked", handleSeeked, { once: true });
        video.addEventListener("error", handleError, { once: true });
        video.currentTime = animation.startTime;
      });

    const start = async () => {
      try {
        await seekToStart();
        if (cancelled) return;
        await video.play();
        if (cancelled) return;

        if (typeof video.requestVideoFrameCallback === "function") {
          frameCallbackId = video.requestVideoFrameCallback(checkFrame);
        } else {
          rafId = window.requestAnimationFrame(checkWithRaf);
        }
      } catch {
        if (!cancelled) onAnimationError?.(animation.id);
      }
    };

    const handleLoadedMetadata = () => void start();
    video.addEventListener("ended", finish, { once: true });

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      void start();
    } else {
      video.addEventListener("loadedmetadata", handleLoadedMetadata, { once: true });
      video.load();
    }

    return () => {
      cancelled = true;
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", finish);
      video.pause();
      if (frameCallbackId !== null) video.cancelVideoFrameCallback?.(frameCallbackId);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [animation, onAnimationComplete, onAnimationError, onAnimationStart, onFrame]);

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
    if (compact || animation || !stageRef.current) return;
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
  }, [compact]);

  return (
    <div
      ref={stageRef}
      data-room-scene
      data-theme-from={animation?.from}
      data-theme-to={animation?.to}
      className={`${styles.roomScene} ${compact ? styles.isCompact : ""} ${animation ? styles.isTimeTravelling : ""} ${videoReady ? styles.videoIsReady : ""}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      aria-busy={Boolean(animation)}
    >
      <div className={styles.imageWrap} data-room-image-wrap>
        {visibleThemes.map((visibleTheme) => {
          const isCurrentTheme = visibleTheme === theme;

          return (
            <Image
              key={visibleTheme}
              className={`${styles.staticLayer} ${styles[`${visibleTheme}Image`]}`}
              data-theme-from={animation?.from}
              data-theme-to={animation?.to}
              src={staticRoomAsset(visibleTheme)}
              alt={isCurrentTheme ? `Isometric bedroom scene in ${visibleTheme} light` : ""}
              aria-hidden={isCurrentTheme ? undefined : true}
              width={900}
              height={900}
              sizes="(max-width: 800px) 650px, 900px"
              quality={85}
              priority={!animation && isCurrentTheme && !compact}
              loading={compact ? "lazy" : undefined}
              decoding="async"
              fetchPriority={compact ? "auto" : "high"}
            />
          );
        })}

        {animation ? (
          <video
            key={animation.id}
            ref={videoRef}
            className={`${styles.videoLayer} ${videoReady ? styles.isReady : ""}`}
            src={animation.src}
            muted
            playsInline
            preload="metadata"
            disablePictureInPicture
            disableRemotePlayback
            aria-hidden="true"
            onError={() => onAnimationError?.(animation.id)}
          />
        ) : null}

        {!compact && (
          <div className={styles.sceneGlare} aria-hidden="true" />
        )}

        {!compact &&
          hotspots.map((hotspot) => (
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
