import type { ThemeType } from "./theme";

export interface ThemeFlarePhase {
  theme: ThemeType;
  startMs: number;
  durationMs: number;
}

export interface RoomThemeAnimation {
  id: number;
  from: ThemeType;
  to: ThemeType;
  src: string;
  startTime: number;
  endTime: number;
  durationMs: number;
  label: string;
  flarePhases: ThemeFlarePhase[];
}

/**
 * New transparent source: 41 frames at 24fps.
 * Frame 0 is morning, frame 20 (0.833s) is afternoon, and frame 40
 * (1.667s, displayed by the editor as roughly 1.70s) is night.
 */
export const DAY_CYCLE_SOURCE_DURATION_SECONDS = 41 / 24;
export const DAY_CYCLE_LAST_FRAME_SECONDS = 40 / 24;
export const DAY_CYCLE_AFTERNOON_SECONDS = 20 / 24;
export const DAY_CYCLE_NIGHT_SECONDS = 40 / 24;
const DIRECT_DAY_CYCLE_NIGHT_SECONDS = 40 / 36;

const THEME_ANCHORS: Record<ThemeType, number> = {
  morning: 0,
  afternoon: DAY_CYCLE_AFTERNOON_SECONDS,
  night: DAY_CYCLE_NIGHT_SECONDS,
};

const THEME_ORDER: Record<ThemeType, number> = {
  morning: 0,
  afternoon: 1,
  night: 2,
};

const videoPreloadCache = new Map<string, Promise<void>>();

export function isThemeAvailable(_theme: ThemeType) {
  return true;
}

export function coerceAvailableTheme(theme: ThemeType): ThemeType {
  return theme;
}

export function staticRoomAsset(theme: ThemeType) {
  return `/assets/theme-video/${theme}-poster.webp`;
}

/**
 * Background phases finish shortly before their matching video anchor. This
 * lets the target canvas settle before the static poster replaces the video.
 */
function flarePhases(from: ThemeType, to: ThemeType): ThemeFlarePhase[] {
  const key = `${from}:${to}` as const;

  switch (key) {
    case "morning:afternoon":
      return [{ theme: "afternoon", startMs: 150, durationMs: 730 }];
    case "afternoon:night":
      return [{ theme: "night", startMs: 150, durationMs: 760 }];
    case "morning:night":
      return [{ theme: "night", startMs: 150, durationMs: 980 }];
    case "night:afternoon":
      return [{ theme: "afternoon", startMs: 150, durationMs: 760 }];
    case "afternoon:morning":
      return [{ theme: "morning", startMs: 150, durationMs: 730 }];
    case "night:morning":
      return [{ theme: "morning", startMs: 150, durationMs: 980 }];
    default:
      return [];
  }
}

function chooseVideoResolution() {
  if (typeof window === "undefined") return 640;

  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;
  const logicalHeroWidth = Math.min(window.innerWidth * 0.5, 720);
  const requiredPixels = logicalHeroWidth * Math.min(window.devicePixelRatio || 1, 2);
  const constrainedDevice =
    connection?.saveData ||
    connection?.effectiveType?.includes("2g") ||
    (navigator.hardwareConcurrency ?? 8) <= 4;

  return constrainedDevice || requiredPixels <= 720 ? 640 : 1024;
}

function videoSource(forward: boolean, direct = false) {
  const direction = forward ? "forward" : "reverse";
  const resolution = chooseVideoResolution();
  const variant = direct ? "day-cycle-direct" : "day-cycle";
  return `/assets/theme-video/${variant}-${direction}-alpha-${resolution}.webm`;
}

export function createRoomThemeAnimation(
  id: number,
  from: ThemeType,
  to: ThemeType,
): RoomThemeAnimation | null {
  if (from === to) return null;

  const forward = THEME_ORDER[to] > THEME_ORDER[from];
  const isDirectMorningNight = Math.abs(THEME_ORDER[to] - THEME_ORDER[from]) > 1;
  const sourceStart = forward
    ? isDirectMorningNight ? 0 : THEME_ANCHORS[from]
    : isDirectMorningNight ? 0 : DAY_CYCLE_LAST_FRAME_SECONDS - THEME_ANCHORS[from];
  const sourceEnd = forward
    ? isDirectMorningNight ? DIRECT_DAY_CYCLE_NIGHT_SECONDS : THEME_ANCHORS[to]
    : isDirectMorningNight ? DIRECT_DAY_CYCLE_NIGHT_SECONDS : DAY_CYCLE_LAST_FRAME_SECONDS - THEME_ANCHORS[to];

  if (sourceEnd <= sourceStart) return null;

  return {
    id,
    from,
    to,
    src: videoSource(forward, isDirectMorningNight),
    startTime: sourceStart,
    endTime: sourceEnd,
    durationMs: Math.round((sourceEnd - sourceStart) * 1000),
    label: `${from} to ${to}`,
    flarePhases: flarePhases(from, to),
  };
}

/** Safari currently does not preserve VP9 alpha reliably. */
export function supportsTransparentRoomVideo() {
  if (typeof window === "undefined") return false;

  const video = document.createElement("video");
  const canPlayVp9 = video.canPlayType('video/webm; codecs="vp9"') !== "";
  const userAgent = navigator.userAgent;
  const isSafari =
    /Safari/i.test(userAgent) &&
    !/Chrome|Chromium|CriOS|Edg|OPR|Android/i.test(userAgent);

  return canPlayVp9 && !isSafari;
}

export function prefersReducedThemeMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function isRangeBuffered(video: HTMLVideoElement, start: number, end: number) {
  const tolerance = 1 / 20;

  for (let index = 0; index < video.buffered.length; index += 1) {
    if (
      video.buffered.start(index) <= start + tolerance &&
      video.buffered.end(index) >= end - tolerance
    ) {
      return true;
    }
  }

  return false;
}

export function preloadRoomThemeAnimation(animation: RoomThemeAnimation) {
  if (typeof window === "undefined") return Promise.resolve();

  const cacheKey = `${animation.src}:${animation.startTime}:${animation.endTime}`;
  const cached = videoPreloadCache.get(cacheKey);
  if (cached) return cached;

  const promise = new Promise<void>((resolve, reject) => {
    const video = document.createElement("video");
    let settled = false;
    let didPrimeSegment = false;
    let pollTimer = 0;
    let timeoutTimer = 0;

    const cleanup = () => {
      window.clearInterval(pollTimer);
      window.clearTimeout(timeoutTimer);
      video.removeEventListener("loadedmetadata", check);
      video.removeEventListener("loadeddata", check);
      video.removeEventListener("progress", check);
      video.removeEventListener("canplaythrough", check);
      video.removeEventListener("suspend", check);
      video.removeEventListener("error", fail);
      video.src = "";
      video.load();
    };

    const finish = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };

    const fail = () => {
      if (settled) return;
      settled = true;
      cleanup();
      videoPreloadCache.delete(cacheKey);
      reject(new Error(`Unable to buffer room video: ${animation.src}`));
    };

    function check() {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;

      const requestedEnd = Math.min(animation.endTime, video.duration);
      const requestedStart = Math.min(animation.startTime, requestedEnd);

      if (!didPrimeSegment) {
        didPrimeSegment = true;
        video.currentTime = Math.min(requestedStart, Math.max(0, video.duration - 0.05));
      }

      if (isRangeBuffered(video, requestedStart, requestedEnd)) finish();
    }

    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.addEventListener("loadedmetadata", check);
    video.addEventListener("loadeddata", check);
    video.addEventListener("progress", check);
    video.addEventListener("canplaythrough", check);
    video.addEventListener("suspend", check);
    video.addEventListener("error", fail, { once: true });
    video.src = animation.src;
    video.load();

    pollTimer = window.setInterval(check, 100);
    timeoutTimer = window.setTimeout(fail, 7000);
  });

  videoPreloadCache.set(cacheKey, promise);
  return promise;
}
