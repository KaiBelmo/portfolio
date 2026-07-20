"use client";

import { useEffect, useRef } from "react";
import { THEME_PALETTES } from "@/lib/theme";
import type { ThemeFlarePhase } from "@/lib/theme-animation";
import { useTheme } from "../system/ThemeProvider";
import { rafCoordinator } from "@/lib/raf-coordinator";
import styles from "./ThemeBackgroundFlare.module.css";

const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
const SUBDIVISIONS = 4;
const POP_STEPS = 5;

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function noise(x: number, y: number, seed: number) {
  const value = Math.sin(x * 12.9898 + y * 78.233 + seed * 45.164) * 43758.5453;
  return value - Math.floor(value);
}

interface NoiseCache {
  irregularity: Float32Array;
  cellNoise: Float32Array;
  colorNoise: Float32Array;
  shardNoise: Float32Array;
}

function generateNoiseCache(
  columns: number,
  rows: number,
  phaseIndex: number,
): NoiseCache {
  const irregularity = new Float32Array(rows * columns);
  const subCols = columns * SUBDIVISIONS;
  const subRows = rows * SUBDIVISIONS;
  const cellNoise = new Float32Array(subRows * subCols);
  const colorNoise = new Float32Array(subRows * subCols);
  const shardNoise = new Float32Array(rows * columns);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const idx = row * columns + col;
      irregularity[idx] = noise(col, row, phaseIndex + 1);
      shardNoise[idx] = noise(col + 13, row + 7, phaseIndex + 61);
    }
  }

  for (let subRow = 0; subRow < subRows; subRow++) {
    const row = Math.floor(subRow / SUBDIVISIONS);
    const subRowOffset = subRow % SUBDIVISIONS;
    for (let subCol = 0; subCol < subCols; subCol++) {
      const idx = subRow * subCols + subCol;
      cellNoise[idx] = noise(subCol, subRow, phaseIndex + 17);

      const col = Math.floor(subCol / SUBDIVISIONS);
      const subColumn = subCol % SUBDIVISIONS;
      colorNoise[idx] = noise(col + subColumn, row + subRowOffset, phaseIndex + 31);
    }
  }

  return { irregularity, cellNoise, colorNoise, shardNoise };
}

function drawMosaicPhase(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  phase: ThemeFlarePhase,
  phaseIndex: number,
  elapsedMs: number,
  noiseCache: NoiseCache,
) {
  const palette = THEME_PALETTES[phase.theme];
  const phaseElapsed = elapsedMs - phase.startMs;

  if (phaseElapsed <= 0) return;

  if (phaseElapsed >= phase.durationMs) {
    context.fillStyle = palette.canvas;
    context.fillRect(0, 0, width, height);
    return;
  }

  const progress = clamp(phaseElapsed / phase.durationMs);
  // Keep the reveal border compact at larger viewport sizes. The extra
  // coverage on each cell also prevents one-pixel seams between blocks.
  const tileSize = width <= 680 ? 48 : width <= 1200 ? 56 : 60;
  const columns = Math.ceil(width / tileSize) + 1;
  const rows = Math.ceil(height / tileSize) + 1;
  const subSize = Math.ceil(tileSize / SUBDIVISIONS);
  const waveWidth = 0.22;
  const subCols = columns * SUBDIVISIONS;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const cellIndex = row * columns + column;

      // A diagonal top-left wave, softened by deterministic block noise.
      const horizontal = columns <= 1 ? 0 : column / (columns - 1);
      const vertical = rows <= 1 ? 0 : row / (rows - 1);
      const wavePosition = horizontal * 0.58 + vertical * 0.3;

      // Scale irregularity by progress to make it more organic (small start/end, large mid-transition)
      const noiseVal = noiseCache.irregularity[cellIndex];
      const irregularityFactor = progress * (1 - progress) * 4;
      const irregularity = (noiseVal - 0.5) * 0.18 * irregularityFactor;
      const localProgress = clamp((progress - wavePosition - irregularity) / waveWidth);

      if (localProgress <= 0) continue;

      const x = Math.round(column * tileSize);
      const y = Math.round(row * tileSize);

      if (localProgress >= 0.96) {
        context.fillStyle = palette.canvas;
        context.fillRect(x, y, tileSize + 2, tileSize + 2);
        continue;
      }

      // The frontier is made from target-theme colors only. Sub-tiles make the
      // block feel like it is assembling rather than simply scaling up.
      // Ease-out quad: tiles decelerate into their final position (follow-through)
      const eased = 1 - Math.pow(1 - localProgress, 2);
      const stepped = Math.ceil(eased * POP_STEPS) / POP_STEPS;
      const fillThreshold = clamp(stepped * 1.08);

      for (let subRow = 0; subRow < SUBDIVISIONS; subRow += 1) {
        const globalSubRow = row * SUBDIVISIONS + subRow;
        for (let subColumn = 0; subColumn < SUBDIVISIONS; subColumn += 1) {
          const globalSubCol = column * SUBDIVISIONS + subColumn;
          const subCellIndex = globalSubRow * subCols + globalSubCol;

          const cellNoise = noiseCache.cellNoise[subCellIndex];
          if (cellNoise > fillThreshold) continue;

          const colorNoise = noiseCache.colorNoise[subCellIndex];
          const colorIndex =
            localProgress > 0.72
              ? 0
              : 1 + Math.floor(colorNoise * Math.max(1, palette.pixels.length - 1));

          context.fillStyle = palette.pixels[colorIndex] ?? palette.canvas;
          context.fillRect(
            x + subColumn * subSize,
            y + subRow * subSize,
            subSize + 2,
            subSize + 2,
          );
        }
      }

      // Tiny square fragments at the leading edge; no particle objects or DOM
      // nodes are allocated, so this stays inexpensive.
      const shardNoise = noiseCache.shardNoise[cellIndex];
      if (shardNoise > 0.78 && localProgress > 0.18 && localProgress < 0.76) {
        const shard = Math.max(3, Math.round(tileSize * 0.075));
        const drift = Math.round((1 - localProgress) * tileSize * 0.32);
        context.fillStyle = palette.pixels[2] ?? palette.pixels[1] ?? palette.canvas;
        context.fillRect(x + tileSize - drift, y + Math.round(tileSize * 0.18), shard, shard);
        if (shardNoise > 0.9) {
          context.fillStyle = palette.pixels[3] ?? palette.canvas;
          context.fillRect(
            x + tileSize - Math.round(drift * 1.45),
            y + Math.round(tileSize * 0.68),
            shard,
            shard,
          );
        }
      }
    }
  }
}

export default function ThemeBackgroundFlare() {
  const { roomAnimation, isRoomAnimationPlaying, animationStartedAt, videoMediaTimeRef } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Stable ref so paint() can read the latest value without re-running the effect.
  const animationStartedAtRef = useRef(animationStartedAt);
  useEffect(() => { animationStartedAtRef.current = animationStartedAt; }, [animationStartedAt]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !roomAnimation || !isRoomAnimationPlaying) return;

    const context = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });
    if (!context) return;

    let cancelled = false;
    let unregisterRAF: (() => void) | null = null;
    let lastDrawAt = 0;

    let currentColumns = 0;
    let currentRows = 0;
    let noiseCaches: NoiseCache[] = [];

    function resize() {
      if (!canvas || !context) return;
      const width = Math.max(1, window.innerWidth);
      const height = Math.max(1, window.innerHeight);

      // One logical pixel per CSS pixel is enough for hard-edged blocks and
      // avoids an expensive DPR-sized full-screen backing surface.
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.imageSmoothingEnabled = false;

      const tileSize = width <= 680 ? 48 : width <= 1200 ? 56 : 60;
      const cols = Math.ceil(width / tileSize) + 1;
      const rws = Math.ceil(height / tileSize) + 1;

      if (cols !== currentColumns || rws !== currentRows) {
        currentColumns = cols;
        currentRows = rws;
        if (roomAnimation) {
          noiseCaches = roomAnimation.flarePhases.map((_, idx) =>
            generateNoiseCache(cols, rws, idx),
          );
        }
      }
    }

    let resizeScheduled = false;
    function onResize() {
      if (resizeScheduled) return;
      resizeScheduled = true;
      window.requestAnimationFrame(() => {
        resize();
        resizeScheduled = false;
      });
    }



    function paint(now: number) {
      if (cancelled || !canvas || !context || !roomAnimation) {
        // Stop the RAF loop if conditions are no longer met
        if (unregisterRAF) {
          unregisterRAF();
          unregisterRAF = null;
        }
        return;
      }

      if (now - lastDrawAt < FRAME_INTERVAL) {
        // Skip frame to maintain 30fps target
        return;
      }

      lastDrawAt = now;
      const width = canvas.width;
      const height = canvas.height;

      // video-based elapsed (accurate while playing, freezes when video pauses)
      const mediaTime = videoMediaTimeRef.current;
      const videoElapsedMs = Math.max(0, (mediaTime - roomAnimation.startTime) * 1000);

      // wall-clock elapsed (always advances, catches up when video ends early)
      const wallElapsedMs =
        animationStartedAtRef.current > 0
          ? performance.now() - animationStartedAtRef.current
          : videoElapsedMs;

      // Use whichever is further along so the animation never stalls mid-mosaic
      // when the video segment is shorter than the flare phase duration.
      const elapsedMs = Math.max(videoElapsedMs, wallElapsedMs);

      // All phases complete → solid fill state reached. Clear canvas immediately
      // and stop the loop. The room underneath already shows the destination theme.
      const allPhasesComplete = roomAnimation.flarePhases.every(
        (phase) => elapsedMs - phase.startMs >= phase.durationMs,
      );

      if (allPhasesComplete) {
        context.clearRect(0, 0, width, height);
        // Unregister from RAF coordinator when animation completes
        if (unregisterRAF) {
          unregisterRAF();
          unregisterRAF = null;
        }
        return;
      }

      context.clearRect(0, 0, width, height);

      // Paint defensive solid backdrop from the 'from' theme
      context.fillStyle = THEME_PALETTES[roomAnimation.from].canvas;
      context.fillRect(0, 0, width, height);

      roomAnimation.flarePhases.forEach((phase, phaseIndex) => {
        const noiseCache = noiseCaches[phaseIndex];
        if (noiseCache) {
          drawMosaicPhase(
            context,
            width,
            height,
            phase,
            phaseIndex,
            elapsedMs,
            noiseCache,
          );
        }
      });
    }

    resize();
    window.addEventListener("resize", onResize, { passive: true });

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (unregisterRAF) {
          unregisterRAF();
          unregisterRAF = null;
        }
      } else if (!unregisterRAF && !cancelled) {
        unregisterRAF = rafCoordinator.register(paint);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Register with RAF coordinator instead of creating own RAF loop
    unregisterRAF = rafCoordinator.register(paint);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (unregisterRAF) {
        unregisterRAF();
        unregisterRAF = null;
      }
      canvas.style.opacity = "";
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [isRoomAnimationPlaying, roomAnimation, videoMediaTimeRef]);

  if (!roomAnimation || !isRoomAnimationPlaying) return null;

  return (
    <div className={styles.flare} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
