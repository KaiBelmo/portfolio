"use client";

import type { KeyboardEvent, PointerEvent } from "react";
import { useEffect, useRef } from "react";
import { useTheme } from "@/app/_components/system/ThemeProvider";
import type { ThemeType } from "@/lib/theme";

const TAU = Math.PI * 2;
const FONT_FAMILY = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
const GLYPH_RAMP = " .,:;-~=+*#%@";
const MOON_RAMP = " .:-=+*#%@";

type RGB = readonly [number, number, number];

const STAR_PALETTE: readonly RGB[] = [
  [172, 194, 255],
  [205, 221, 255],
  [255, 228, 184],
  [186, 236, 255],
];

const MORNING_STAR_PALETTE: readonly RGB[] = [
  [38, 43, 43],
  [68, 78, 54],
  [132, 77, 24],
  [47, 83, 78],
];

const NIGHT_STAR_PALETTE: readonly RGB[] = [
  [184, 207, 255],
  [222, 233, 255],
  [255, 231, 182],
  [167, 226, 244],
];

const RING_BANDS = [
  { scale: 0.92, glyph: ".", color: [140, 148, 166] as const },
  { scale: 1, glyph: "-", color: [235, 210, 158] as const },
  { scale: 1.08, glyph: "·", color: [168, 177, 198] as const },
];

type Star = {
  x: number;
  y: number;
  depth: number;
  phase: number;
  speed: number;
  drift: number;
  glyph: string;
  colorCss: string;
  morningCss: string;
  nightCss: string;
  font: string;
};

type Dust = {
  x: number;
  y: number;
  phase: number;
  speed: number;
  strength: number;
  glyph: string;
  colorCss: string;
  morningCss: string;
  nightCss: string;
  font: string;
};

type Comet = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  fromLeft: boolean;
};

type PlanetCell = {
  px: number;
  py: number;
  nx: number;
  ny: number;
  nz: number;
  longitude: number;
  rim: number;
  sinLat45: number;
  lat57: number;
  lat24: number;
  lat82: number;
  lat115: number;
};

type EdgePoint = {
  x: number;
  y: number;
  cos: number;
  sin: number;
  glyph: string;
  sparse: boolean;
};

type RingPoint = { x: number; y: number; glyph: string };
type RingBatch = { color: string; points: RingPoint[] };
type SunCell = { px: number; py: number; edge: number; phase: number };
type MoonPoint = { nx: number; ny: number; glyph: string };
type MoonBatch = { color: string; points: MoonPoint[] };
type SatelliteCell = { px: number; py: number; nx: number; ny: number; nz: number };
type BakedLayer = { canvas: HTMLCanvasElement; originX: number; originY: number };

type Geometry = {
  planetRadius: number;
  planetStep: number;
  planetCells: PlanetCell[];
  planetEdge: EdgePoint[];
  ringBackBatches: RingBatch[];
  ringFrontBatches: RingBatch[];
  ringBackLayer: BakedLayer | null;
  ringFrontLayer: BakedLayer | null;
  morningRingBackLayer: BakedLayer | null;
  morningRingFrontLayer: BakedLayer | null;
  celestialRadius: number;
  sunCells: SunCell[];
  moonBatches: MoonBatch[];
  moonLayer: BakedLayer | null;
  satelliteRadius: number;
  satelliteCells: SatelliteCell[];
};

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a: number, b: number, amount: number) {
  return a + (b - a) * amount;
}

function smoothstep(value: number) {
  const bounded = clamp(value);
  return bounded * bounded * (3 - 2 * bounded);
}

function hashString(text: string) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  return function next() {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function quantizedRGB(r: number, g: number, b: number) {
  r = clamp(Math.round(r / 8) * 8, 0, 255);
  g = clamp(Math.round(g / 8) * 8, 0, 255);
  b = clamp(Math.round(b / 8) * 8, 0, 255);
  return `rgb(${r},${g},${b})`;
}

function quantizedAlpha(alpha: number) {
  return Math.round(clamp(alpha) * 31) / 31;
}

function rgbCss(color: RGB) {
  return `rgb(${color[0]},${color[1]},${color[2]})`;
}

function scaleRGB(color: string, amount: number) {
  const match = color.match(/\d+/g);
  if (!match || match.length < 3) return color;
  return quantizedRGB(
    Number(match[0]) * amount,
    Number(match[1]) * amount,
    Number(match[2]) * amount,
  );
}

function floorRGB(color: string, floor: RGB) {
  const match = color.match(/\d+/g);
  if (!match || match.length < 3) return color;
  return quantizedRGB(
    Math.max(Number(match[0]), floor[0]),
    Math.max(Number(match[1]), floor[1]),
    Math.max(Number(match[2]), floor[2]),
  );
}

export default function AboutSpaceAnimation() {
  const { theme } = useTheme();
  const themeRef = useRef<ThemeType>(theme);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<{
    spawnComet: (origin?: { x: number; y: number; vx?: number; vy?: number }) => void;
    reset: () => void;
    togglePause: () => void;
  } | null>(null);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const initialBounds = container.getBoundingClientRect();
    const initialW = Math.max(1, Math.round(initialBounds.width || 300));
    const initialH = Math.max(1, Math.round(initialBounds.height || 250));

    const canvas = document.createElement("canvas");
    canvas.className = "absolute inset-0 z-[1] block h-full w-full select-none [filter:none] pointer-events-none";
    canvas.setAttribute("aria-hidden", "true");
    container.appendChild(canvas);

    const canvasCtx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!canvasCtx) {
      console.error("Canvas 2D context unavailable");
      canvas.remove();
      return;
    }
    const ctx = canvasCtx;

    let width = initialW;
    let height = initialH;
    let dpr = 1;
    let stars: Star[] = [];
    let dust: Dust[] = [];
    let comets: Comet[] = [];
    let starGroups: { font: string; color: string; morningColor: string; nightColor: string; items: Star[] }[] = [];
    let dustGroups: { font: string; color: string; morningColor: string; nightColor: string; items: Dust[] }[] = [];
    let sceneTime = 0;
    let orbitAngle = 0.55;
    let previousTime = performance.now();
    let lastRenderedAt = 0;
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let pointerX = 0;
    let pointerY = 0;
    let celestialMix = themeRef.current === "night" ? 1 : 0;
    let isPaused = false;
    let inView = true;
    let rafId = 0;
    let resizeRaf = 0;
    let random = mulberry32(hashString("about-space-canvas2d"));

    const fontCache = new Map<string, string>();
    const getFont = (size: number, weight = 500) => {
      const roundedSize = Math.max(7, Math.round(size));
      const key = `${weight}:${roundedSize}`;
      let font = fontCache.get(key);
      if (!font) {
        font = `${weight} ${roundedSize}px ${FONT_FAMILY}`;
        fontCache.set(key, font);
      }
      return font;
    };

    const rand = (min = 0, max = 1) => min + (max - min) * random();
    const choose = <T,>(values: readonly T[]) =>
      values[Math.floor(rand(0, values.length))] ?? values[0];

    let activeFont: string | null = null;
    let activeFill: string | null = null;
    let activeAlpha = NaN;
    let activeShadow = false;

    const invalidateState = () => {
      activeFont = null;
      activeFill = null;
      activeAlpha = NaN;
      activeShadow = false;
    };

    const setFont = (font: string) => {
      if (font !== activeFont) {
        ctx.font = font;
        activeFont = font;
      }
    };
    const setFill = (fill: string) => {
      if (fill !== activeFill) {
        ctx.fillStyle = fill;
        activeFill = fill;
      }
    };
    const setAlpha = (alpha: number) => {
      const quantized = quantizedAlpha(alpha);
      if (quantized !== activeAlpha) {
        ctx.globalAlpha = quantized;
        activeAlpha = quantized;
      }
    };
    const setShadow = (enabled: boolean) => {
      if (enabled === activeShadow) return;
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      activeShadow = enabled;
    };

    const drawGlyph = (
      text: string,
      x: number,
      y: number,
      size: number,
      color: string,
      alpha = 1,
      weight = 500,
    ) => {
      if (alpha <= 0.003) return;
      setFont(getFont(size, weight));
      setFill(color);
      setAlpha(alpha);
      ctx.fillText(text, Math.round(x), Math.round(y));
    };

    function createBakeContext(widthPx: number, heightPx: number, font: string) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.ceil(widthPx));
      canvas.height = Math.max(1, Math.ceil(heightPx));
      const bakeCtx = canvas.getContext("2d");
      if (!bakeCtx) return null;
      bakeCtx.textAlign = "center";
      bakeCtx.textBaseline = "middle";
      bakeCtx.imageSmoothingEnabled = false;
      bakeCtx.font = font;
      return { canvas, ctx: bakeCtx };
    }

    function bakeRingLayer(batches: RingBatch[], colorScale = 1, colorFloor?: RGB): BakedLayer | null {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const batch of batches) {
        for (const point of batch.points) {
          minX = Math.min(minX, point.x);
          minY = Math.min(minY, point.y);
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
        }
      }
      if (!Number.isFinite(minX)) return null;

      const padding = 16;
      const originX = minX - padding;
      const originY = minY - padding;
      const layer = createBakeContext(maxX - minX + padding * 2, maxY - minY + padding * 2, getFont(11, 500));
      if (!layer) return null;

      for (const batch of batches) {
        const color = colorScale === 1 ? batch.color : scaleRGB(batch.color, colorScale);
        layer.ctx.fillStyle = colorFloor ? floorRGB(color, colorFloor) : color;
        for (const point of batch.points) {
          layer.ctx.fillText(point.glyph, Math.round(point.x - originX), Math.round(point.y - originY));
        }
      }

      return { canvas: layer.canvas, originX, originY };
    }

    function bakeMoonLayer(batches: MoonBatch[], radius: number): BakedLayer | null {
      const padding = 18;
      const originX = -radius - padding;
      const originY = -radius - padding;
      const layer = createBakeContext(radius * 2 + padding * 2, radius * 2 + padding * 2, getFont(14, 650));
      if (!layer) return null;

      for (const batch of batches) {
        layer.ctx.fillStyle = batch.color;
        for (const point of batch.points) {
          layer.ctx.fillText(
            point.glyph,
            Math.round(point.nx * radius - originX),
            Math.round(point.ny * radius - originY),
          );
        }
      }

      return { canvas: layer.canvas, originX, originY };
    }

    let geometry: Geometry = {
      planetRadius: 0,
      planetStep: 0,
      planetCells: [],
      planetEdge: [],
      ringBackBatches: [],
      ringFrontBatches: [],
      ringBackLayer: null,
      ringFrontLayer: null,
      morningRingBackLayer: null,
      morningRingFrontLayer: null,
      celestialRadius: 0,
      sunCells: [],
      moonBatches: [],
      moonLayer: null,
      satelliteRadius: 0,
      satelliteCells: [],
    };

    function buildGeometry() {
      const planetRadius = clamp(Math.min(width, height) * 0.16, 40, 110);
      const planetStep = clamp(Math.round(planetRadius / 14), 9, 12);
      const planetCells: PlanetCell[] = [];

      for (let py = -planetRadius; py <= planetRadius; py += planetStep) {
        for (let px = -planetRadius; px <= planetRadius; px += planetStep) {
          const nx = px / planetRadius;
          const ny = py / planetRadius;
          const rr = nx * nx + ny * ny;
          if (rr > 1) continue;
          const nz = Math.sqrt(1 - rr);
          const latitude = Math.asin(clamp(ny, -1, 1));
          planetCells.push({
            px,
            py,
            nx,
            ny,
            nz,
            longitude: Math.atan2(nx, nz),
            rim: Math.pow(1 - nz, 2.1),
            sinLat45: Math.sin(latitude * 4.5),
            lat57: latitude * 5.7,
            lat24: latitude * 2.4,
            lat82: latitude * 8.2,
            lat115: latitude * 11.5,
          });
        }
      }

      const edgePoints = Math.max(90, Math.floor(planetRadius * 1.55));
      const planetEdge: EdgePoint[] = [];
      for (let i = 0; i < edgePoints; i += 1) {
        const angle = (i / edgePoints) * TAU;
        planetEdge.push({
          x: Math.cos(angle) * (planetRadius + 4),
          y: Math.sin(angle) * (planetRadius + 4),
          cos: Math.cos(angle),
          sin: Math.sin(angle),
          glyph: i % 5 ? "." : "·",
          sparse: i % 4 !== 0,
        });
      }

      const ringBack = new Map<string, RingBatch>();
      const ringFront = new Map<string, RingBatch>();
      const tilt = -0.1;
      const cosTilt = Math.cos(tilt);
      const sinTilt = Math.sin(tilt);

      const addRingPoint = (target: Map<string, RingBatch>, color: string, point: RingPoint) => {
        let batch = target.get(color);
        if (!batch) {
          batch = { color, points: [] };
          target.set(color, batch);
        }
        batch.points.push(point);
      };

      for (const band of RING_BANDS) {
        const rx = planetRadius * 1.75 * band.scale;
        const ry = planetRadius * 0.38 * band.scale;
        const points = Math.max(130, Math.floor(rx * 1.4));
        for (let i = 0; i < points; i += 1) {
          if ((i * 13) % 41 === 0) continue;
          const angle = (i / points) * TAU;
          const sinA = Math.sin(angle);
          const cosA = Math.cos(angle);
          const front = sinA > 0;
          const localX = cosA * rx;
          const localY = sinA * ry;
          const light = clamp(0.5 + Math.cos(angle - 0.45) * 0.34 + (front ? 0.15 : -0.08));
          const color = quantizedRGB(
            band.color[0] * light,
            band.color[1] * light,
            band.color[2] * light,
          );
          addRingPoint(front ? ringFront : ringBack, color, {
            x: localX * cosTilt - localY * sinTilt,
            y: localX * sinTilt + localY * cosTilt,
            glyph: Math.abs(sinA) > 0.74 ? "'" : band.glyph,
          });
        }
      }

      const celestialRadius = clamp(Math.min(width, height) * 0.07, 28, 52);
      const sunCells: SunCell[] = [];
      const sunStep = 12;
      for (let py = -celestialRadius; py <= celestialRadius; py += sunStep) {
        for (let px = -celestialRadius; px <= celestialRadius; px += sunStep) {
          const distance = Math.hypot(px, py);
          if (distance > celestialRadius) continue;
          sunCells.push({
            px,
            py,
            edge: 1 - distance / celestialRadius,
            phase: px * 0.11 + py * 0.16,
          });
        }
      }

      const moonMap = new Map<string, MoonBatch>();
      const moonStep = 10;
      for (let py = -celestialRadius; py <= celestialRadius; py += moonStep) {
        for (let px = -celestialRadius; px <= celestialRadius; px += moonStep) {
          const nx = px / celestialRadius;
          const ny = py / celestialRadius;
          const rr = nx * nx + ny * ny;
          if (rr > 1) continue;
          const nz = Math.sqrt(1 - rr);
          const sideLight = clamp(nx * -0.46 + ny * -0.24 + nz * 0.92);
          const rimGlow = Math.max(0, 1 - Math.abs(Math.sqrt(rr) - 0.86) / 0.12) * 0.12;
          const crater = Math.sin(px * 0.19 + py * 0.13) * Math.cos(px * 0.08 - py * 0.21) * 0.12;
          const craterA = Math.max(0, 1 - Math.hypot(nx + 0.32, ny - 0.2) / 0.19) * -0.22;
          const craterB = Math.max(0, 1 - Math.hypot(nx - 0.26, ny + 0.28) / 0.14) * -0.18;
          const craterC = Math.max(0, 1 - Math.hypot(nx + 0.04, ny + 0.06) / 0.27) * -0.15;
          const highland = Math.max(0, 1 - Math.hypot(nx - 0.16, ny - 0.2) / 0.18) * 0.13;
          const level = clamp(0.15 + sideLight * 0.76 + rimGlow + crater + craterA + craterB + craterC + highland);
          const mark =
            craterA < -0.12 || craterB < -0.1 || craterC < -0.1
              ? "o"
              : highland > 0.08
                ? "*"
                : MOON_RAMP[Math.floor(level * (MOON_RAMP.length - 1))];
          const glyph = rr > 0.76 && level > 0.62 ? "@" : mark;
          const value = 100 + level * 145;
          const color = quantizedRGB(value * 0.88, value * 0.93, value);
          let batch = moonMap.get(color);
          if (!batch) {
            batch = { color, points: [] };
            moonMap.set(color, batch);
          }
          batch.points.push({ nx, ny, glyph });
        }
      }

      const satelliteRadius = clamp(planetRadius * 0.1, 14, 22);
      const satelliteCells: SatelliteCell[] = [];
      const satelliteStep = 8;
      for (let py = -satelliteRadius; py <= satelliteRadius; py += satelliteStep) {
        for (let px = -satelliteRadius; px <= satelliteRadius; px += satelliteStep) {
          const nx = px / satelliteRadius;
          const ny = py / satelliteRadius;
          const rr = nx * nx + ny * ny;
          if (rr > 1) continue;
          satelliteCells.push({ px, py, nx, ny, nz: Math.sqrt(1 - rr) });
        }
      }

      const ringBackBatches = [...ringBack.values()];
      const ringFrontBatches = [...ringFront.values()];
      const moonBatches = [...moonMap.values()];

      geometry = {
        planetRadius,
        planetStep,
        planetCells,
        planetEdge,
        ringBackBatches,
        ringFrontBatches,
        ringBackLayer: bakeRingLayer(ringBackBatches, 1, [42, 46, 52]),
        ringFrontLayer: bakeRingLayer(ringFrontBatches, 1, [42, 46, 52]),
        morningRingBackLayer: bakeRingLayer(ringBackBatches, 0.52),
        morningRingFrontLayer: bakeRingLayer(ringFrontBatches, 0.52),
        celestialRadius,
        sunCells,
        moonBatches,
        moonLayer: bakeMoonLayer(moonBatches, celestialRadius),
        satelliteRadius,
        satelliteCells,
      };
    }

    function groupParticles<T extends { colorCss: string; morningCss: string; nightCss: string; font: string }>(
      items: T[],
    ): { font: string; color: string; morningColor: string; nightColor: string; items: T[] }[] {
      const groups = new Map<string, { font: string; color: string; morningColor: string; nightColor: string; items: T[] }>();
      for (const item of items) {
        const key = `${item.colorCss}|${item.morningCss}|${item.nightCss}|${item.font}`;
        let group = groups.get(key);
        if (!group) {
          group = {
            font: item.font,
            color: item.colorCss,
            morningColor: item.morningCss,
            nightColor: item.nightCss,
            items: [],
          };
          groups.set(key, group);
        }
        group.items.push(item);
      }
      return [...groups.values()];
    }

    function initializeParticles() {
      random = mulberry32(hashString(`about-space-${Math.round(width)}-${Math.round(height)}`));
      stars = [];
      dust = [];
      comets = [];

      const starCount = Math.floor((width * height) / (reducedMotion ? 6500 : 4300));
      for (let i = 0; i < starCount; i += 1) {
        const depth = rand(0.18, 1);
        const color = choose(STAR_PALETTE);
        const morningColor = choose(MORNING_STAR_PALETTE);
        const nightColor = choose(NIGHT_STAR_PALETTE);
        const size = Math.round(8 + depth * 7);
        stars.push({
          x: rand(0, width),
          y: rand(0, height),
          depth,
          phase: rand(0, TAU),
          speed: rand(0.35, 1.75),
          drift: rand(-4, 4),
          glyph: depth > 0.8 ? choose(["·", "+", "*"]) : choose([".", "·"]),
          colorCss: rgbCss(color),
          morningCss: rgbCss(morningColor),
          nightCss: rgbCss(nightColor),
          font: getFont(size, 500),
        });
      }

      const cloudCount = Math.floor((width * height) / 9000);
      const clouds = [
        { x: width * 0.43, y: height * 0.34, rx: width * 0.34, ry: height * 0.15, color: [62, 72, 128] as const, morning: [52, 78, 74] as const, night: [88, 108, 166] as const },
        { x: width * 0.7, y: height * 0.62, rx: width * 0.25, ry: height * 0.12, color: [45, 98, 120] as const, morning: [70, 82, 50] as const, night: [78, 128, 160] as const },
      ];

      for (let i = 0; i < cloudCount; i += 1) {
        const cloud = choose(clouds);
        const angle = rand(0, TAU);
        const distance = Math.pow(rand(), 0.62);
        dust.push({
          x: cloud.x + Math.cos(angle) * cloud.rx * distance,
          y: cloud.y + Math.sin(angle) * cloud.ry * distance,
          phase: rand(0, TAU),
          speed: rand(0.04, 0.14),
          strength: rand(0.15, 0.7),
          glyph: choose([".", ".", ":", "·"]),
          colorCss: rgbCss(cloud.color),
          morningCss: rgbCss(cloud.morning),
          nightCss: rgbCss(cloud.night),
          font: getFont(12, 500),
        });
      }

      starGroups = groupParticles(stars);
      dustGroups = groupParticles(dust);
    }

    function resize() {
      const bounds = container!.getBoundingClientRect();
      width = Math.max(1, Math.round(bounds.width));
      height = Math.max(1, Math.round(bounds.height));
      const maxDpr = width < 800 ? 1 : width < 1400 ? 1.25 : 1.5;
      dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.imageSmoothingEnabled = false;
      invalidateState();
      buildGeometry();
      initializeParticles();
      previousTime = performance.now();
      lastRenderedAt = 0;
      requestFrame();
    }

    function requestFrame() {
      if (!rafId && inView && !document.hidden) {
        rafId = window.requestAnimationFrame(frame);
      }
    }

    function drawBackground(cameraX: number, cameraY: number) {
      setAlpha(1);
      ctx.clearRect(0, 0, width, height);
      setShadow(themeRef.current === "morning");

      for (const group of dustGroups) {
        setFont(group.font);
        setFill(themeRef.current === "morning" ? group.morningColor : themeRef.current === "night" ? group.nightColor : group.color);
        for (const particle of group.items) {
          const wave = sceneTime * particle.speed + particle.phase;
          const pulse = 0.55 + Math.sin(wave) * 0.25;
          const x = (particle.x + cameraX * 0.08 + Math.sin(wave) * 6 + width) % width;
          const y = (particle.y + cameraY * 0.05 + Math.cos(wave * 0.8) * 4 + height) % height;
          const alpha = particle.strength * pulse * 0.45;
          if (alpha <= 0.003) continue;
          setAlpha(alpha);
          ctx.fillText(particle.glyph, Math.round(x), Math.round(y));
        }
      }

      const activeTheme = themeRef.current;
      for (const group of starGroups) {
        setFont(group.font);
        setFill(activeTheme === "morning" ? group.morningColor : activeTheme === "night" ? group.nightColor : group.color);
        for (const star of group.items) {
          const pulse = Math.sin(sceneTime * star.speed + star.phase) * 0.5 + 0.5;
          const x = (star.x + sceneTime * star.drift * star.depth + cameraX * star.depth + width) % width;
          const y = (star.y + Math.sin(sceneTime * 0.08 + star.phase) * 4 * star.depth + cameraY * star.depth + height) % height;
          const brightness = 0.35 + pulse * 0.65;
          const alpha = brightness * (0.52 + star.depth * 0.48);
          if (alpha <= 0.003) continue;
          setAlpha(alpha);
          ctx.fillText(pulse > 0.93 && star.depth > 0.76 ? "*" : star.glyph, Math.round(x), Math.round(y));
        }
      }
    }

    function drawCelestialBody(cameraX: number, cameraY: number) {
      const target = themeRef.current === "night" ? 1 : 0;
      celestialMix = lerp(celestialMix, target, 1 - Math.exp(-(1 / 60) * 2.8));
      const mix = smoothstep(celestialMix);
      const x = width - Math.min(145, width * 0.15) + cameraX * 0.08;
      const y = Math.min(185, height * 0.17) + cameraY * 0.05;
      const baseRadius = geometry.celestialRadius;
      const sunAlpha = 1 - mix;
      const moonAlpha = mix;

      if (sunAlpha > 0.003) {
        const glowRadius = baseRadius * (themeRef.current === "morning" ? 2.85 : 2.25);
        const glow = ctx.createRadialGradient(x, y, baseRadius * 0.18, x, y, glowRadius);
        glow.addColorStop(0, `rgba(255, 209, 112, ${sunAlpha * (themeRef.current === "morning" ? 0.28 : 0.18)})`);
        glow.addColorStop(0.46, `rgba(255, 183, 75, ${sunAlpha * (themeRef.current === "morning" ? 0.14 : 0.09)})`);
        glow.addColorStop(1, "rgba(255, 183, 75, 0)");
        setAlpha(1);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, TAU);
        ctx.fill();

        const core = ctx.createRadialGradient(x, y, 0, x, y, baseRadius * 0.92);
        core.addColorStop(0, `rgba(255, 227, 141, ${sunAlpha * (themeRef.current === "morning" ? 0.24 : 0.16)})`);
        core.addColorStop(1, "rgba(255, 178, 70, 0)");
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(x, y, baseRadius * 0.92, 0, TAU);
        ctx.fill();

        setFont(getFont(13, 500));
        setFill(themeRef.current === "morning" ? "rgb(191,122,46)" : "rgb(221,147,67)");
        setAlpha(sunAlpha * (themeRef.current === "morning" ? 0.95 : 0.88));
        for (let i = 0; i < 34; i += 1) {
          const angle = (i / 34) * TAU + sceneTime * 0.035;
          const wobble = Math.sin(sceneTime * 1.4 + i * 1.73) * 8;
          const distance = baseRadius * 1.32 + wobble;
          ctx.fillText(
            i % 4 === 0 ? "+" : i % 3 === 0 ? "*" : ".",
            Math.round(x + Math.cos(angle) * distance),
            Math.round(y + Math.sin(angle) * distance),
          );
        }

        setFont(getFont(14, 650));
        setAlpha(sunAlpha);
        for (const cell of geometry.sunCells) {
          const noise = 0.5 + 0.5 * Math.sin(cell.phase + sceneTime * 1.6);
          const light = clamp(cell.edge * 0.75 + noise * 0.32);
          const glyph = GLYPH_RAMP[Math.floor(light * (GLYPH_RAMP.length - 1))];
          setFill(quantizedRGB(230 + light * 25, 125 + light * 120, 50 + light * 115));
          ctx.fillText(glyph, Math.round(x + cell.px), Math.round(y + cell.py));
        }
      }

      if (moonAlpha > 0.003) {
        const drift = smoothstep(moonAlpha);
        const moonX = x + Math.sin(sceneTime * 0.12) * 2.5 * drift;
        const moonY = y + Math.cos(sceneTime * 0.1) * 1.8 * drift;
        const moonScale =
          0.76 +
          moonAlpha * 0.42 +
          Math.sin(moonAlpha * Math.PI) * 0.08;
        const radius = baseRadius * moonScale;
        setFont(getFont(12, 600));
        setFill("rgb(184,207,255)");
        setAlpha(moonAlpha * 0.36);
        for (let i = 0; i < 24; i += 1) {
          const angle = (i / 24) * TAU + sceneTime * 0.08;
          const wobble = Math.sin(sceneTime * 1.15 + i * 1.47) * 5;
          const distance = radius * 1.22 + wobble;
          const glyph = i % 8 === 0 ? "+" : i % 5 === 0 ? "*" : i % 3 === 0 ? "'" : ".";
          ctx.fillText(
            glyph,
            Math.round(moonX + Math.cos(angle) * distance),
            Math.round(moonY + Math.sin(angle) * distance),
          );
        }
        setFont(getFont(11, 500));
        setAlpha(moonAlpha * 0.22);
        for (let i = 0; i < 12; i += 1) {
          const angle = (i / 12) * TAU - sceneTime * 0.045;
          const distance = radius * (1.48 + Math.sin(sceneTime * 0.8 + i) * 0.05);
          ctx.fillText(
            i % 4 === 0 ? ":" : ".",
            Math.round(moonX + Math.cos(angle) * distance),
            Math.round(moonY + Math.sin(angle) * distance),
          );
        }
        setAlpha(moonAlpha);
        const layer = geometry.moonLayer;
        if (layer) {
          ctx.drawImage(
            layer.canvas,
            Math.round(moonX + layer.originX * moonScale),
            Math.round(moonY + layer.originY * moonScale),
            Math.round(layer.canvas.width * moonScale),
            Math.round(layer.canvas.height * moonScale),
          );
        } else {
          setFont(getFont(14, 650));
          for (const batch of geometry.moonBatches) {
            setFill(batch.color);
            for (const point of batch.points) {
              ctx.fillText(point.glyph, Math.round(moonX + point.nx * radius), Math.round(moonY + point.ny * radius));
            }
          }
        }
      }

      return { x, y, mix, strength: lerp(1, 0.48, mix) };
    }

    function drawRing(planet: { x: number; y: number }, front: boolean) {
      const batches = front ? geometry.ringFrontBatches : geometry.ringBackBatches;
      const theme = themeRef.current;
      const ringAlpha = theme === "morning" ? (front ? 1 : 0.86) : theme === "night" ? (front ? 1 : 0.72) : (front ? 0.98 : 0.68);
      setAlpha(ringAlpha);
      const layer =
        theme === "morning"
          ? front
            ? geometry.morningRingFrontLayer
            : geometry.morningRingBackLayer
          : front
            ? geometry.ringFrontLayer
            : geometry.ringBackLayer;
      if (layer) {
        ctx.drawImage(layer.canvas, Math.round(planet.x + layer.originX), Math.round(planet.y + layer.originY));
        return;
      }
      setFont(getFont(11, 500));
      for (const batch of batches) {
        setFill(theme === "morning" ? scaleRGB(batch.color, 0.52) : batch.color);
        for (const point of batch.points) {
          ctx.fillText(point.glyph, Math.round(planet.x + point.x), Math.round(planet.y + point.y));
        }
      }
    }

    function drawOrbitingMoon(
      planet: { x: number; y: number },
      light: { x: number; y: number },
      moon: { x: number; y: number; front: boolean },
      front: boolean,
    ) {
      if (moon.front !== front) return;
      const dx = light.x - moon.x;
      const dy = light.y - moon.y;
      const length = Math.hypot(dx, dy) || 1;
      const lx = dx / length;
      const ly = dy / length;
      setFont(getFont(11, 600));
      setAlpha(1);
      for (const cell of geometry.satelliteCells) {
        const shade = clamp(0.08 + Math.max(0, cell.nx * lx + cell.ny * ly + cell.nz * 0.42) * 0.9);
        const glyph = MOON_RAMP[Math.floor(shade * (MOON_RAMP.length - 1))];
        const value = 70 + shade * 175;
        setFill(quantizedRGB(value * 0.88, value * 0.92, value));
        ctx.fillText(glyph, Math.round(moon.x + cell.px), Math.round(moon.y + cell.py));
      }
    }

    function drawPlanet(
      planet: { x: number; y: number },
      light: { x: number; y: number; mix: number; strength: number },
    ) {
      const dx = light.x - planet.x;
      const dy = light.y - planet.y;
      const length = Math.hypot(dx, dy) || 1;
      const lx = dx / length;
      const ly = dy / length;
      const nightMix = smoothstep(light.mix);
      const rotation = sceneTime * 0.085;
      const cloudTime = sceneTime * 0.045;
      const theme = themeRef.current;
      if (theme === "morning") {
        const atmosphereRadius = geometry.planetRadius * 1.72;
        const atmosphere = ctx.createRadialGradient(
          planet.x,
          planet.y,
          geometry.planetRadius * 0.4,
          planet.x,
          planet.y,
          atmosphereRadius,
        );
        atmosphere.addColorStop(0, "rgba(134, 194, 174, 0.07)");
        atmosphere.addColorStop(0.5, "rgba(134, 194, 174, 0.1)");
        atmosphere.addColorStop(1, "rgba(91, 153, 134, 0)");
        setAlpha(1);
        ctx.fillStyle = atmosphere;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, atmosphereRadius, 0, TAU);
        ctx.fill();
      }

      setFont(getFont(geometry.planetStep + 3, 650));
      setAlpha(0.99);

      for (const cell of geometry.planetCells) {
        const longitude = cell.longitude + rotation;
        const diffuse = Math.max(0, cell.nx * lx + cell.ny * ly + cell.nz * 0.52);
        const softLight = clamp(0.11 + diffuse * 0.89 * light.strength);
        const broadNoise =
          Math.sin(longitude * 3.1 + cell.sinLat45) * 0.5 +
          Math.cos(cell.lat57 - longitude * 1.6) * 0.34 +
          Math.sin(longitude * 7.2 + cell.lat24) * 0.16;
        const land = smoothstep((broadNoise + 0.34) * 0.72);
        const cloud =
          smoothstep(
            (Math.sin(longitude * 5.4 - cell.lat82 + cloudTime) +
              Math.cos(longitude * 2.2 + cell.lat115)) *
              0.22 +
              0.42,
          ) * 0.32;
        const glyphLight = clamp(softLight + land * 0.11 + cloud * 0.12 + cell.rim * 0.025);
        const glyph = GLYPH_RAMP[Math.floor(glyphLight * (GLYPH_RAMP.length - 1))];

        const oceanR = 20 + glyphLight * 42;
        const oceanG = 74 + glyphLight * 94;
        const oceanB = 79 + glyphLight * 70;
        const terrainR = 38 + glyphLight * 52;
        const terrainG = 102 + glyphLight * 102;
        const terrainB = 72 + glyphLight * 62;
        const cloudR = 88 + glyphLight * 78;
        const cloudG = 150 + glyphLight * 82;
        const cloudB = 134 + glyphLight * 80;

        let r = lerp(oceanR, terrainR, land * 0.48);
        let g = lerp(oceanG, terrainG, land * 0.58);
        let b = lerp(oceanB, terrainB, land * 0.34);
        r = lerp(r, cloudR, cloud);
        g = lerp(g, cloudG, cloud);
        b = lerp(b, cloudB, cloud);

        if (themeRef.current === "morning") {
          r *= 0.68;
          g *= 0.72;
          b *= 0.68;
        }

        const nightR = 38 + glyphLight * 66;
        const nightG = 90 + glyphLight * 96;
        const nightB = 112 + glyphLight * 116;
        r = lerp(r, nightR, nightMix * 0.72);
        g = lerp(g, nightG, nightMix * 0.72);
        b = lerp(b, nightB, nightMix * 0.72);

        if (themeRef.current !== "morning") {
          r = Math.max(r, 56);
          g = Math.max(g, 96);
          b = Math.max(b, 108);
        }

        setFill(quantizedRGB(r, g, b));
        ctx.fillText(glyph, Math.round(planet.x + cell.px), Math.round(planet.y + cell.py));
      }

      setFont(getFont(9, 500));
      setFill(nightMix > 0.5 ? "rgb(138,190,226)" : themeRef.current === "morning" ? "rgb(39,91,82)" : "rgb(64,174,162)");
      for (const point of geometry.planetEdge) {
        const facing = clamp(0.22 + point.cos * lx + point.sin * ly);
        if (facing < 0.18 && point.sparse) continue;
        setAlpha(0.16 + facing * 0.34);
        ctx.fillText(point.glyph, Math.round(planet.x + point.x), Math.round(planet.y + point.y));
      }
    }

    function spawnComet(origin?: { x: number; y: number; vx?: number; vy?: number }) {
      const fromLeft = origin ? (origin.vx ?? 1) >= 0 : rand() > 0.5;
      const direction = fromLeft ? 1 : -1;
      comets.push({
        x: origin?.x ?? (fromLeft ? -60 : width + 60),
        y: origin?.y ?? rand(height * 0.05, height * 0.3),
        vx: origin?.vx ?? direction * rand(185, 300),
        vy: origin?.vy ?? rand(92, 145),
        life: 0,
        maxLife: rand(1.25, 1.95),
        fromLeft,
      });
      requestFrame();
    }

    function updateAndDrawComets(dt: number) {
      if (!isPaused && rand() < (reducedMotion ? 0.18 : 0.6) * dt && comets.length < 3) {
        spawnComet();
      }

      let writeIndex = 0;
      for (const comet of comets) {
        if (!isPaused) {
          comet.x += comet.vx * dt;
          comet.y += comet.vy * dt;
          comet.life += dt;
        }
        const lifeFade = clamp(1 - comet.life / comet.maxLife);
        const speed = Math.hypot(comet.vx, comet.vy) || 1;
        const nx = comet.vx / speed;
        const ny = comet.vy / speed;
        const slash = comet.fromLeft ? "/" : "\\";
        const segments = reducedMotion ? 4 : 6;
        const spacing = 12;

        for (let i = segments; i >= 1; i -= 1) {
          const tx = comet.x - nx * spacing * i;
          const ty = comet.y - ny * spacing * i;
          const fade = lifeFade * (1 - (i - 1) / (segments + 1));
          if (i <= 2) {
            drawGlyph(slash, tx, ty, 15, "rgb(255,255,255)", fade * 0.95, 700);
          } else {
            drawGlyph(i === 3 ? "." : "·", tx, ty, 13, "rgb(230,240,255)", fade * 0.8, 650);
          }
        }

        const headGlow = 0.35 + lifeFade * 0.45;
        drawGlyph("✦", comet.x, comet.y, 16, "rgb(255,244,220)", headGlow * 0.75, 700);
        drawGlyph("*", comet.x, comet.y, 18, "rgb(255,255,255)", lifeFade, 700);

        if (comet.life < comet.maxLife) {
          comets[writeIndex++] = comet;
        }
      }
      comets.length = writeIndex;
    }

    function reset() {
      sceneTime = 0;
      orbitAngle = 0.55;
      pointerTargetX = 0;
      pointerTargetY = 0;
      pointerX = 0;
      pointerY = 0;
      initializeParticles();
      requestFrame();
    }

    function togglePause() {
      isPaused = !isPaused;
      previousTime = performance.now();
    }

    controlRef.current = { spawnComet, reset, togglePause };

    function frame(now: number) {
      rafId = 0;
      if (!inView || document.hidden) return;

      const targetFrameMs = 1000 / (reducedMotion ? 30 : 60);
      if (lastRenderedAt && now - lastRenderedAt < targetFrameMs - 1) {
        requestFrame();
        return;
      }

      const rawDt = (now - previousTime) / 1000;
      const dt = clamp(rawDt || 1 / 60, 0, 0.05);
      previousTime = now;
      lastRenderedAt = now;

      if (!isPaused) {
        sceneTime += dt * (reducedMotion ? 0.25 : 1);
        orbitAngle += dt * (reducedMotion ? 0.12 : 0.3);
      }

      pointerX = lerp(pointerX, pointerTargetX, 1 - Math.exp(-dt * 4.5));
      pointerY = lerp(pointerY, pointerTargetY, 1 - Math.exp(-dt * 4.5));
      const cameraX = pointerX * Math.min(38, width * 0.035) + Math.sin(sceneTime * 0.09) * 3;
      const cameraY = pointerY * Math.min(24, height * 0.03) + Math.cos(sceneTime * 0.07) * 2;

      drawBackground(cameraX, cameraY);
      const light = drawCelestialBody(cameraX, cameraY);

      const planet = {
        x: width * 0.34 + cameraX * 0.34 + Math.sin(sceneTime * 0.16) * 4,
        y: height * 0.58 + cameraY * 0.28 + Math.cos(sceneTime * 0.12) * 3,
      };
      const orbitDepth = Math.sin(orbitAngle);
      const orbitDistance = geometry.planetRadius * 2.35;
      const satellite = {
        x: planet.x + Math.cos(orbitAngle) * orbitDistance,
        y: planet.y + orbitDepth * orbitDistance * 0.32,
        front: orbitDepth > 0,
      };

      drawRing(planet, false);
      drawOrbitingMoon(planet, light, satellite, false);
      drawPlanet(planet, light);
      drawOrbitingMoon(planet, light, satellite, true);
      drawRing(planet, true);
      updateAndDrawComets(dt);

      const pointerMoving =
        Math.abs(pointerX - pointerTargetX) > 0.0005 ||
        Math.abs(pointerY - pointerTargetY) > 0.0005;
      const celestialMoving = Math.abs(celestialMix - (themeRef.current === "night" ? 1 : 0)) > 0.0005;
      if (!isPaused || pointerMoving || celestialMoving) {
        requestFrame();
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      window.cancelAnimationFrame(resizeRaf);
      resizeRaf = window.requestAnimationFrame(resize);
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      previousTime = performance.now();
      if (inView) requestFrame();
    });
    intersectionObserver.observe(container);

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      pointerTargetX = clamp(event.clientX / window.innerWidth, 0, 1) * 2 - 1;
      pointerTargetY = clamp(event.clientY / window.innerHeight, 0, 1) * 2 - 1;
      requestFrame();
    };
    const handleWindowBlur = () => {
      pointerTargetX = 0;
      pointerTargetY = 0;
      requestFrame();
    };
    const handleVisibility = () => {
      previousTime = performance.now();
      if (!document.hidden) requestFrame();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibility);

    resize();
    requestFrame();

    return () => {
      controlRef.current = null;
      window.cancelAnimationFrame(rafId);
      window.cancelAnimationFrame(resizeRaf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibility);
      canvas.remove();
    };
  }, []);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const direction = x < bounds.width / 2 ? 1 : -1;
    controlRef.current?.spawnComet({
      x,
      y,
      vx: direction * (190 + Math.random() * 90),
      vy: -40 + Math.random() * 110,
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.code === "Space") {
      event.preventDefault();
      controlRef.current?.togglePause();
    } else if (event.key.toLowerCase() === "c") {
      controlRef.current?.spawnComet();
    } else if (event.key.toLowerCase() === "r") {
      controlRef.current?.reset();
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative mb-[clamp(10px,1.8vw,20px)] h-[clamp(190px,22vw,285px)] touch-manipulation overflow-hidden bg-transparent text-ink isolate cursor-crosshair focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent max-[640px]:mb-[clamp(8px,3vw,16px)] max-[640px]:h-[clamp(175px,44vw,235px)]"
      role="img"
      aria-label={`Animated ASCII deep-space scene with a ${theme === "night" ? "moon" : "sun"}`}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
    />
  );
}









