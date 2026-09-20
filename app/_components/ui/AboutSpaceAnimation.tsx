"use client";

import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
import { useTheme } from "@/app/_components/system/ThemeProvider";
import type { ThemeType } from "@/lib/theme";

const TAU = Math.PI * 2;
const FONT_FAMILY = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
const GLYPH_RAMP = " .,:;-~=+*#%@";
const MOON_RAMP = " .:-=+*#%@";
const RING_GLYPHS = [".", "-", "·"] as const;
const RING_SCALES = [0.92, 1, 1.08] as const;

type RGB = readonly [number, number, number];

/** A colour at light factor 0 (`lo`, shadow) and 1 (`hi`, fully lit). */
type Shade = { lo: RGB; hi: RGB };

/**
 * Everything the scene draws, chosen per theme for contrast against that
 * theme's canvas. The dark themes shade "more light, more ink"; the light
 * theme inverts the glyph ramp so shadow is where the ink is.
 */
type ScenePalette = {
  invertRamp: boolean;
  /** Glyph ramp for shaded bodies, sparse to dense. Light themes omit the blank so the sphere stays drawn. */
  ramp: string;
  /** Multiplier on star and dust alpha. */
  inkBoost: number;
  planetWeight: number;
  /** Stars shallower than this fade out: a daylight sky shows only the brightest few. */
  starMinDepth: number;
  /** The sun is the hero of a morning sky, so it can outgrow its night-time footprint. */
  sunScale: number;
  /** A translucent wash inside the planet disc, so a sphere whose lit side is bare paper still reads as a disc. */
  discWash: RGB | null;
  discWashAlpha: number;
  stars: readonly RGB[];
  dust: readonly [RGB, RGB];
  ring: readonly [Shade, Shade, Shade];
  ringAlpha: { front: number; back: number };
  ocean: Shade;
  terrain: Shade;
  cloud: Shade;
  planetEdge: RGB;
  atmosphere: RGB | null;
  atmosphereAlpha: number;
  sunBody: Shade;
  sunRays: RGB;
  sunGlow: RGB;
  sunGlowAlpha: number;
  sunCoreAlpha: number;
  moonHalo: RGB;
  moonGlyph: Shade;
  satellite: Shade;
  cometTrail: RGB;
  cometHead: RGB;
  cometSpark: RGB;
};

const SCENE_PALETTES: Record<ThemeType, ScenePalette> = {
  // Cream canvas. Everything is ink: shadows dark, lit areas lighter but never near the paper.
  // Cream canvas, drawn like an etching: the highlight is the paper, the
  // shadow side is hatched in the page's own teal ink, the sun is the one
  // saturated element, and daylight thins the star field.
  morning: {
    invertRamp: true,
    ramp: " .:-=+*#%@",
    inkBoost: 1.1,
    planetWeight: 600,
    starMinDepth: 0.45,
    sunScale: 1.25,
    discWash: [134, 194, 174],
    discWashAlpha: 0.26,
    stars: [
      [36, 38, 41],
      [36, 77, 75],
      [168, 91, 18],
      [56, 62, 64],
    ],
    dust: [
      [36, 77, 75],
      [79, 96, 48],
    ],
    ring: [
      { lo: [64, 68, 74], hi: [150, 152, 156] },
      { lo: [150, 80, 16], hi: [214, 150, 80] },
      { lo: [80, 86, 94], hi: [166, 170, 176] },
    ],
    ringAlpha: { front: 0.92, back: 0.6 },
    ocean: { lo: [36, 77, 75], hi: [36, 77, 75] },
    terrain: { lo: [79, 96, 48], hi: [79, 96, 48] },
    cloud: { lo: [92, 126, 120], hi: [92, 126, 120] },
    planetEdge: [36, 77, 75],
    atmosphere: [134, 194, 174],
    atmosphereAlpha: 0.14,
    sunBody: { lo: [214, 150, 80], hi: [168, 91, 18] },
    sunRays: [168, 91, 18],
    sunGlow: [232, 168, 80],
    sunGlowAlpha: 0.42,
    sunCoreAlpha: 0.5,
    moonHalo: [120, 130, 150],
    moonGlyph: { lo: [96, 104, 120], hi: [40, 48, 60] },
    satellite: { lo: [36, 77, 75], hi: [150, 172, 168] },
    cometTrail: [56, 62, 64],
    cometHead: [168, 91, 18],
    cometSpark: [36, 38, 41],
  },
  // Dark olive canvas. These are the original values the scene was designed on.
  afternoon: {
    invertRamp: false,
    ramp: GLYPH_RAMP,
    inkBoost: 1,
    planetWeight: 600,
    starMinDepth: 0,
    sunScale: 1,
    discWash: null,
    discWashAlpha: 0,
    stars: [
      [172, 194, 255],
      [205, 221, 255],
      [255, 228, 184],
      [186, 236, 255],
    ],
    dust: [
      [62, 72, 128],
      [45, 98, 120],
    ],
    ring: [
      { lo: [42, 46, 52], hi: [140, 148, 166] },
      { lo: [60, 52, 44], hi: [235, 210, 158] },
      { lo: [42, 46, 52], hi: [168, 177, 198] },
    ],
    ringAlpha: { front: 0.98, back: 0.68 },
    ocean: { lo: [56, 96, 108], hi: [62, 168, 149] },
    terrain: { lo: [56, 102, 84], hi: [90, 204, 134] },
    cloud: { lo: [88, 150, 134], hi: [166, 232, 214] },
    planetEdge: [64, 174, 162],
    atmosphere: null,
    atmosphereAlpha: 0,
    sunBody: { lo: [230, 125, 50], hi: [255, 245, 165] },
    sunRays: [221, 147, 67],
    sunGlow: [255, 209, 112],
    sunGlowAlpha: 0.18,
    sunCoreAlpha: 0.16,
    moonHalo: [184, 207, 255],
    moonGlyph: { lo: [88, 93, 100], hi: [216, 228, 245] },
    satellite: { lo: [62, 64, 70], hi: [216, 225, 245] },
    cometTrail: [230, 240, 255],
    cometHead: [255, 244, 220],
    cometSpark: [255, 255, 255],
  },
  // Navy canvas. Floors are lifted so silhouettes never sink into the page.
  night: {
    invertRamp: false,
    ramp: GLYPH_RAMP,
    inkBoost: 1,
    planetWeight: 600,
    starMinDepth: 0,
    sunScale: 1,
    discWash: null,
    discWashAlpha: 0,
    stars: [
      [184, 207, 255],
      [222, 233, 255],
      [255, 231, 182],
      [167, 226, 244],
    ],
    dust: [
      [88, 108, 166],
      [78, 128, 160],
    ],
    ring: [
      { lo: [72, 84, 104], hi: [176, 186, 206] },
      { lo: [96, 84, 60], hi: [240, 214, 160] },
      { lo: [72, 84, 104], hi: [196, 206, 224] },
    ],
    ringAlpha: { front: 1, back: 0.72 },
    ocean: { lo: [58, 86, 112], hi: [140, 200, 230] },
    terrain: { lo: [70, 116, 104], hi: [150, 196, 150] },
    cloud: { lo: [140, 172, 196], hi: [222, 236, 248] },
    planetEdge: [138, 190, 226],
    atmosphere: [120, 160, 220],
    atmosphereAlpha: 0.08,
    sunBody: { lo: [230, 125, 50], hi: [255, 245, 165] },
    sunRays: [221, 147, 67],
    sunGlow: [255, 209, 112],
    sunGlowAlpha: 0.18,
    sunCoreAlpha: 0.16,
    moonHalo: [184, 207, 255],
    moonGlyph: { lo: [96, 104, 120], hi: [232, 238, 250] },
    satellite: { lo: [80, 96, 120], hi: [214, 224, 242] },
    cometTrail: [230, 240, 255],
    cometHead: [255, 244, 220],
    cometSpark: [255, 255, 255],
  },
};

const THEMES: readonly ThemeType[] = ["morning", "afternoon", "night"];

type Star = {
  x: number;
  y: number;
  depth: number;
  phase: number;
  speed: number;
  drift: number;
  glyph: string;
  colorIndex: number;
  font: string;
};

type Dust = {
  x: number;
  y: number;
  phase: number;
  speed: number;
  strength: number;
  glyph: string;
  colorIndex: number;
  font: string;
};

type ParticleGroup<T> = { font: string; colorIndex: number; items: T[] };

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
/** Ring points grouped by band and quantised light, so each theme bakes its own colours. */
type RingBatch = { band: number; light: number; points: RingPoint[] };
type SunCell = { px: number; py: number; edge: number; phase: number };
type MoonPoint = { nx: number; ny: number; glyph: string };
type MoonBatch = { level: number; points: MoonPoint[] };
type SatelliteCell = { px: number; py: number; nx: number; ny: number; nz: number };
type BakedLayer = { canvas: HTMLCanvasElement; originX: number; originY: number };
type ThemedLayers = Record<ThemeType, BakedLayer | null>;

type Geometry = {
  planetRadius: number;
  planetStep: number;
  planetCells: PlanetCell[];
  planetEdge: EdgePoint[];
  ringBackBatches: RingBatch[];
  ringFrontBatches: RingBatch[];
  ringBackLayers: ThemedLayers;
  ringFrontLayers: ThemedLayers;
  celestialRadius: number;
  moonRadius: number;
  sunCells: SunCell[];
  moonBatches: MoonBatch[];
  moonLayers: ThemedLayers;
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

function rgbaCss(color: RGB, alpha: number) {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
}

function mixRGB(a: RGB, b: RGB, amount: number): RGB {
  return [lerp(a[0], b[0], amount), lerp(a[1], b[1], amount), lerp(a[2], b[2], amount)];
}

function shadeRGB(shade: Shade, light: number): RGB {
  return mixRGB(shade.lo, shade.hi, clamp(light));
}

const emptyLayers = (): ThemedLayers => ({ morning: null, afternoon: null, night: null });

export default function AboutSpaceAnimation() {
  const { theme } = useTheme();
  const themeRef = useRef<ThemeType>(theme);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<{
    spawnComet: (origin?: { x: number; y: number; vx?: number; vy?: number }) => void;
    reset: () => void;
    togglePause: () => void;
    requestFrame: () => void;
  } | null>(null);

  // A theme change while paused must still repaint so the palette crossfade
  // runs; the frame loop stops itself again once the blend settles.
  useEffect(() => {
    themeRef.current = theme;
    controlRef.current?.requestFrame();
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
    let starGroups: ParticleGroup<Star>[] = [];
    let dustGroups: ParticleGroup<Dust>[] = [];
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

    // Palette crossfade: the previous theme's palette blends into the new
    // one over a few hundred milliseconds instead of snapping mid-mosaic.
    let paletteFrom: ThemeType = themeRef.current;
    let paletteTo: ThemeType = themeRef.current;
    let paletteMix = 1;

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

    const invalidateState = () => {
      activeFont = null;
      activeFill = null;
      activeAlpha = NaN;
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

    // Blended palette lookups. `mix` is the crossfade progress for this frame.
    const fromPalette = () => SCENE_PALETTES[paletteFrom];
    const toPalette = () => SCENE_PALETTES[paletteTo];
    const blendRGB = (pick: (palette: ScenePalette) => RGB) =>
      paletteMix >= 1 ? pick(toPalette()) : mixRGB(pick(fromPalette()), pick(toPalette()), paletteMix);
    const blendShade = (pick: (palette: ScenePalette) => Shade, light: number) =>
      paletteMix >= 1
        ? shadeRGB(pick(toPalette()), light)
        : mixRGB(shadeRGB(pick(fromPalette()), light), shadeRGB(pick(toPalette()), light), paletteMix);
    const blendNumber = (pick: (palette: ScenePalette) => number) =>
      paletteMix >= 1 ? pick(toPalette()) : lerp(pick(fromPalette()), pick(toPalette()), paletteMix);
    const css = (color: RGB) => quantizedRGB(color[0], color[1], color[2]);
    const dominantPalette = () => (paletteMix < 0.5 ? fromPalette() : toPalette());
    const rampGlyph = (ramp: string | null, light: number) => {
      const palette = dominantPalette();
      const chosen = ramp ?? palette.ramp;
      const t = palette.invertRamp ? 1 - light : light;
      return chosen[Math.floor(clamp(t) * (chosen.length - 1))];
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

    function bakeRingLayer(batches: RingBatch[], palette: ScenePalette): BakedLayer | null {
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
        layer.ctx.fillStyle = css(shadeRGB(palette.ring[batch.band], batch.light));
        for (const point of batch.points) {
          layer.ctx.fillText(point.glyph, Math.round(point.x - originX), Math.round(point.y - originY));
        }
      }

      return { canvas: layer.canvas, originX, originY };
    }

    function bakeMoonLayer(batches: MoonBatch[], radius: number, palette: ScenePalette): BakedLayer | null {
      const padding = 18;
      const originX = -radius - padding;
      const originY = -radius - padding;
      const layer = createBakeContext(radius * 2 + padding * 2, radius * 2 + padding * 2, getFont(10, 600));
      if (!layer) return null;

      for (const batch of batches) {
        layer.ctx.fillStyle = css(shadeRGB(palette.moonGlyph, batch.level));
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

    function bakeForEachTheme(bake: (palette: ScenePalette) => BakedLayer | null): ThemedLayers {
      const layers = emptyLayers();
      for (const key of THEMES) layers[key] = bake(SCENE_PALETTES[key]);
      return layers;
    }

    let geometry: Geometry = {
      planetRadius: 0,
      planetStep: 0,
      planetCells: [],
      planetEdge: [],
      ringBackBatches: [],
      ringFrontBatches: [],
      ringBackLayers: emptyLayers(),
      ringFrontLayers: emptyLayers(),
      celestialRadius: 0,
      moonRadius: 0,
      sunCells: [],
      moonBatches: [],
      moonLayers: emptyLayers(),
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

      const addRingPoint = (target: Map<string, RingBatch>, band: number, light: number, point: RingPoint) => {
        const key = `${band}:${light}`;
        let batch = target.get(key);
        if (!batch) {
          batch = { band, light, points: [] };
          target.set(key, batch);
        }
        batch.points.push(point);
      };

      RING_SCALES.forEach((scale, band) => {
        const rx = planetRadius * 1.75 * scale;
        const ry = planetRadius * 0.38 * scale;
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
          const quantizedLight = Math.round(light * 12) / 12;
          addRingPoint(front ? ringFront : ringBack, band, quantizedLight, {
            x: localX * cosTilt - localY * sinTilt,
            y: localX * sinTilt + localY * cosTilt,
            glyph: Math.abs(sinA) > 0.74 ? "'" : RING_GLYPHS[band],
          });
        }
      });

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

      // The moon is a third larger than the sun's footprint and sampled on a
      // finer grid, so it resolves into a shaded disc rather than a handful of
      // hash marks.
      const moonRadius = celestialRadius * 1.3;
      const moonMap = new Map<number, MoonBatch>();
      const moonStep = 8;
      for (let py = -moonRadius; py <= moonRadius; py += moonStep) {
        for (let px = -moonRadius; px <= moonRadius; px += moonStep) {
          const nx = px / moonRadius;
          const ny = py / moonRadius;
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
          const quantizedLevel = Math.round(level * 12) / 12;
          let batch = moonMap.get(quantizedLevel);
          if (!batch) {
            batch = { level: quantizedLevel, points: [] };
            moonMap.set(quantizedLevel, batch);
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
        ringBackLayers: bakeForEachTheme((palette) => bakeRingLayer(ringBackBatches, palette)),
        ringFrontLayers: bakeForEachTheme((palette) => bakeRingLayer(ringFrontBatches, palette)),
        celestialRadius,
        moonRadius,
        sunCells,
        moonBatches,
        moonLayers: bakeForEachTheme((palette) => bakeMoonLayer(moonBatches, moonRadius, palette)),
        satelliteRadius,
        satelliteCells,
      };
    }

    function groupParticles<T extends { colorIndex: number; font: string }>(items: T[]): ParticleGroup<T>[] {
      const groups = new Map<string, ParticleGroup<T>>();
      for (const item of items) {
        const key = `${item.colorIndex}|${item.font}`;
        let group = groups.get(key);
        if (!group) {
          group = { font: item.font, colorIndex: item.colorIndex, items: [] };
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
      const starColors = SCENE_PALETTES.afternoon.stars.length;
      for (let i = 0; i < starCount; i += 1) {
        const depth = rand(0.18, 1);
        const size = Math.round(8 + depth * 7);
        stars.push({
          x: rand(0, width),
          y: rand(0, height),
          depth,
          phase: rand(0, TAU),
          speed: rand(0.35, 1.75),
          drift: rand(-4, 4),
          glyph: depth > 0.8 ? choose(["·", "+", "*"]) : choose([".", "·"]),
          colorIndex: Math.floor(rand(0, starColors)),
          font: getFont(size, 500),
        });
      }

      const cloudCount = Math.floor((width * height) / 9000);
      const clouds = [
        { x: width * 0.43, y: height * 0.34, rx: width * 0.34, ry: height * 0.15, colorIndex: 0 },
        { x: width * 0.7, y: height * 0.62, rx: width * 0.25, ry: height * 0.12, colorIndex: 1 },
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
          colorIndex: cloud.colorIndex,
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

    function updatePaletteBlend(dt: number) {
      const target = themeRef.current;
      if (target !== paletteTo) {
        paletteFrom = paletteMix >= 1 ? paletteTo : paletteFrom;
        paletteTo = target;
        paletteMix = 0;
      }
      if (paletteMix < 1) {
        paletteMix = Math.min(1, paletteMix + dt / 0.45);
      }
    }

    function drawBackground(cameraX: number, cameraY: number) {
      setAlpha(1);
      ctx.clearRect(0, 0, width, height);
      const inkBoost = blendNumber((palette) => palette.inkBoost);
      const starMinDepth = blendNumber((palette) => palette.starMinDepth);

      for (const group of dustGroups) {
        setFont(group.font);
        setFill(css(blendRGB((palette) => palette.dust[group.colorIndex as 0 | 1])));
        for (const particle of group.items) {
          const wave = sceneTime * particle.speed + particle.phase;
          const pulse = 0.55 + Math.sin(wave) * 0.25;
          const x = (particle.x + cameraX * 0.08 + Math.sin(wave) * 6 + width) % width;
          const y = (particle.y + cameraY * 0.05 + Math.cos(wave * 0.8) * 4 + height) % height;
          const alpha = particle.strength * pulse * 0.45 * inkBoost;
          if (alpha <= 0.003) continue;
          setAlpha(alpha);
          ctx.fillText(particle.glyph, Math.round(x), Math.round(y));
        }
      }

      for (const group of starGroups) {
        setFont(group.font);
        setFill(css(blendRGB((palette) => palette.stars[group.colorIndex] ?? palette.stars[0])));
        for (const star of group.items) {
          const pulse = Math.sin(sceneTime * star.speed + star.phase) * 0.5 + 0.5;
          const x = (star.x + sceneTime * star.drift * star.depth + cameraX * star.depth + width) % width;
          const y = (star.y + Math.sin(sceneTime * 0.08 + star.phase) * 4 * star.depth + cameraY * star.depth + height) % height;
          const brightness = 0.35 + pulse * 0.65;
          const daylightFade = starMinDepth > 0 ? clamp((star.depth - starMinDepth) / 0.15) : 1;
          const alpha = brightness * (0.52 + star.depth * 0.48) * inkBoost * daylightFade;
          if (alpha <= 0.003) continue;
          setAlpha(alpha);
          ctx.fillText(pulse > 0.93 && star.depth > 0.76 ? "*" : star.glyph, Math.round(x), Math.round(y));
        }
      }
    }

    function drawThemedLayer(layers: ThemedLayers, x: number, y: number, alpha: number, scale = 1) {
      const draw = (layer: BakedLayer | null, layerAlpha: number) => {
        if (!layer || layerAlpha <= 0.003) return;
        setAlpha(layerAlpha);
        ctx.drawImage(
          layer.canvas,
          Math.round(x + layer.originX * scale),
          Math.round(y + layer.originY * scale),
          Math.round(layer.canvas.width * scale),
          Math.round(layer.canvas.height * scale),
        );
      };
      if (paletteMix >= 1) {
        draw(layers[paletteTo], alpha);
        return;
      }
      draw(layers[paletteFrom], alpha * (1 - paletteMix));
      draw(layers[paletteTo], alpha * paletteMix);
    }

    function drawCelestialBody(cameraX: number, cameraY: number) {
      const target = themeRef.current === "night" ? 1 : 0;
      celestialMix = lerp(celestialMix, target, 1 - Math.exp(-(1 / 60) * 2.8));
      const mix = smoothstep(celestialMix);
      const sunScale = blendNumber((palette) => palette.sunScale);
      const baseRadius = geometry.celestialRadius * sunScale;
      const fullGlowRadius = baseRadius * 2.6;
      // Anchor the sun no higher than its glow needs, so the halo fades out
      // inside the canvas instead of being clipped flat along the top edge.
      const x = width - Math.min(145, width * 0.15) + cameraX * 0.08;
      const y = Math.max(Math.min(185, height * 0.17), fullGlowRadius + 4) + cameraY * 0.05;
      const sunAlpha = 1 - mix;
      const moonAlpha = mix;

      if (sunAlpha > 0.003) {
        const glowColor = blendRGB((palette) => palette.sunGlow);
        const glowAlpha = blendNumber((palette) => palette.sunGlowAlpha);
        const coreAlpha = blendNumber((palette) => palette.sunCoreAlpha);
        const glowRadius = Math.min(fullGlowRadius, y - 2, width - x - 2);
        const glow = ctx.createRadialGradient(x, y, baseRadius * 0.18, x, y, glowRadius);
        glow.addColorStop(0, rgbaCss(glowColor, sunAlpha * glowAlpha));
        glow.addColorStop(0.46, rgbaCss(glowColor, sunAlpha * glowAlpha * 0.5));
        glow.addColorStop(1, rgbaCss(glowColor, 0));
        setAlpha(1);
        ctx.fillStyle = glow;
        activeFill = null;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, TAU);
        ctx.fill();

        const core = ctx.createRadialGradient(x, y, 0, x, y, baseRadius * 0.92);
        core.addColorStop(0, rgbaCss(glowColor, sunAlpha * coreAlpha));
        core.addColorStop(1, rgbaCss(glowColor, 0));
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(x, y, baseRadius * 0.92, 0, TAU);
        ctx.fill();

        setFont(getFont(13, 500));
        setFill(css(blendRGB((palette) => palette.sunRays)));
        setAlpha(sunAlpha * 0.92);
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

        // The sun keeps a dense centre in every theme: on paper that is a
        // solid amber disc, on a dark sky a bright one. Only the colour flips.
        setFont(getFont(14 * sunScale, 650));
        setAlpha(sunAlpha);
        for (const cell of geometry.sunCells) {
          const noise = 0.5 + 0.5 * Math.sin(cell.phase + sceneTime * 1.6);
          const light = clamp(cell.edge * 0.75 + noise * 0.32);
          const glyph = GLYPH_RAMP[Math.floor(light * (GLYPH_RAMP.length - 1))];
          setFill(css(blendShade((palette) => palette.sunBody, light)));
          ctx.fillText(glyph, Math.round(x + cell.px * sunScale), Math.round(y + cell.py * sunScale));
        }
      }

      if (moonAlpha > 0.003) {
        const drift = smoothstep(moonAlpha);
        const moonX = x + Math.sin(sceneTime * 0.12) * 2.5 * drift;
        const moonY = y + Math.cos(sceneTime * 0.1) * 1.8 * drift;
        // The moon keeps its own footprint; sunScale only applies to the sun.
        const moonScale = 0.76 + moonAlpha * 0.24 + Math.sin(moonAlpha * Math.PI) * 0.06;
        const radius = geometry.moonRadius * moonScale;
        const haloColor = css(blendRGB((palette) => palette.moonHalo));
        setFont(getFont(12, 600));
        setFill(haloColor);
        setAlpha(moonAlpha * 0.36);
        for (let i = 0; i < 24; i += 1) {
          const angle = (i / 24) * TAU + sceneTime * 0.08;
          const wobble = Math.sin(sceneTime * 1.15 + i * 1.47) * 5;
          const distance = radius * 1.18 + wobble;
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
          const distance = radius * (1.42 + Math.sin(sceneTime * 0.8 + i) * 0.05);
          ctx.fillText(
            i % 4 === 0 ? ":" : ".",
            Math.round(moonX + Math.cos(angle) * distance),
            Math.round(moonY + Math.sin(angle) * distance),
          );
        }
        drawThemedLayer(geometry.moonLayers, moonX, moonY, moonAlpha, moonScale);
      }

      return { x, y, mix, strength: lerp(1, 0.48, mix) };
    }

    function drawRing(planet: { x: number; y: number }, front: boolean) {
      const ringAlpha = blendNumber((palette) => (front ? palette.ringAlpha.front : palette.ringAlpha.back));
      drawThemedLayer(front ? geometry.ringFrontLayers : geometry.ringBackLayers, planet.x, planet.y, ringAlpha);
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
        setFill(css(blendShade((palette) => palette.satellite, shade)));
        ctx.fillText(rampGlyph(MOON_RAMP, shade), Math.round(moon.x + cell.px), Math.round(moon.y + cell.py));
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
      const rotation = sceneTime * 0.085;
      const cloudTime = sceneTime * 0.045;

      const atmosphereAlpha = blendNumber((palette) => palette.atmosphereAlpha);
      if (atmosphereAlpha > 0.003) {
        const atmosphereColor = blendRGB((palette) => palette.atmosphere ?? palette.planetEdge);
        const atmosphereRadius = geometry.planetRadius * 1.72;
        const atmosphere = ctx.createRadialGradient(
          planet.x,
          planet.y,
          geometry.planetRadius * 0.4,
          planet.x,
          planet.y,
          atmosphereRadius,
        );
        atmosphere.addColorStop(0, rgbaCss(atmosphereColor, atmosphereAlpha * 0.7));
        atmosphere.addColorStop(0.5, rgbaCss(atmosphereColor, atmosphereAlpha));
        atmosphere.addColorStop(1, rgbaCss(atmosphereColor, 0));
        setAlpha(1);
        ctx.fillStyle = atmosphere;
        activeFill = null;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, atmosphereRadius, 0, TAU);
        ctx.fill();
      }

      // On paper the lit side of the sphere is bare, so a translucent wash
      // keeps the disc legible where the hatching stops.
      const discWashAlpha = blendNumber((palette) => palette.discWashAlpha);
      if (discWashAlpha > 0.003) {
        const washColor = blendRGB((palette) => palette.discWash ?? palette.planetEdge);
        const wash = ctx.createRadialGradient(
          planet.x - geometry.planetRadius * 0.25,
          planet.y - geometry.planetRadius * 0.2,
          0,
          planet.x,
          planet.y,
          geometry.planetRadius + 2,
        );
        wash.addColorStop(0, rgbaCss(washColor, discWashAlpha));
        wash.addColorStop(0.78, rgbaCss(washColor, discWashAlpha * 0.55));
        wash.addColorStop(1, rgbaCss(washColor, 0));
        setAlpha(1);
        ctx.fillStyle = wash;
        activeFill = null;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, geometry.planetRadius + 2, 0, TAU);
        ctx.fill();
      }

      // Glyphs fit their cell: a character one pixel taller than the grid
      // step at weight 600 shades without neighbours merging into a block.
      setFont(getFont(geometry.planetStep + 1, dominantPalette().planetWeight));
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
        const glyph = rampGlyph(null, glyphLight);

        const ocean = blendShade((palette) => palette.ocean, glyphLight);
        const terrain = blendShade((palette) => palette.terrain, glyphLight);
        const cloudColor = blendShade((palette) => palette.cloud, glyphLight);
        let r = lerp(ocean[0], terrain[0], land * 0.48);
        let g = lerp(ocean[1], terrain[1], land * 0.58);
        let b = lerp(ocean[2], terrain[2], land * 0.34);
        r = lerp(r, cloudColor[0], cloud);
        g = lerp(g, cloudColor[1], cloud);
        b = lerp(b, cloudColor[2], cloud);

        setFill(quantizedRGB(r, g, b));
        ctx.fillText(glyph, Math.round(planet.x + cell.px), Math.round(planet.y + cell.py));
      }

      setFont(getFont(9, 500));
      setFill(css(blendRGB((palette) => palette.planetEdge)));
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

      const trail = css(blendRGB((palette) => palette.cometTrail));
      const head = css(blendRGB((palette) => palette.cometHead));
      const spark = css(blendRGB((palette) => palette.cometSpark));

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
            drawGlyph(slash, tx, ty, 15, spark, fade * 0.95, 700);
          } else {
            drawGlyph(i === 3 ? "." : "·", tx, ty, 13, trail, fade * 0.8, 650);
          }
        }

        const headGlow = 0.35 + lifeFade * 0.45;
        drawGlyph("✦", comet.x, comet.y, 16, head, headGlow * 0.75, 700);
        drawGlyph("*", comet.x, comet.y, 18, spark, lifeFade, 700);

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

    controlRef.current = { spawnComet, reset, togglePause, requestFrame };

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

      updatePaletteBlend(dt);

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
      const paletteMoving = paletteMix < 1 || themeRef.current !== paletteTo;
      if (!isPaused || pointerMoving || celestialMoving || paletteMoving) {
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
