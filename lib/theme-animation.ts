import { getImageProps } from "next/image";
import type { ThemeType } from "./theme";
import { THEME_OPTIONS } from "./theme";

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
  /** Playback speed applied to the clip. Morning <-> night plays the cycle at 1.5x. */
  playbackRate: number;
  /** Wall-clock length of the transition, already divided by playbackRate. */
  durationMs: number;
  label: string;
  flarePhases: ThemeFlarePhase[];
}

/**
 * Source clips: 41 frames at 24fps. Frame 0 is morning, frame 20 (0.833s) is
 * afternoon and frame 40 (1.667s) is night. The reverse clip holds the same
 * frames played backwards. Morning <-> night skips the afternoon stop by
 * playing the same clip at 1.5x instead of shipping a separate re-encode.
 */
export const DAY_CYCLE_LAST_FRAME_SECONDS = 40 / 24;
export const DAY_CYCLE_AFTERNOON_SECONDS = 20 / 24;
export const DAY_CYCLE_NIGHT_SECONDS = 40 / 24;
const DIRECT_PLAYBACK_RATE = 1.5;

/** Matches the `tablet` Tailwind screen. Below it the room scene is unmounted. */
export const MOBILE_MAX_WIDTH = 800;

export const ROOM_POSTER_WIDTH = 900;
export const ROOM_POSTER_QUALITY = 85;
/**
 * The scene is unmounted after hydration below the mobile breakpoint, so the
 * server-rendered poster only needs the smallest srcset candidate there.
 */
export const ROOM_POSTER_SIZES = `(max-width: ${MOBILE_MAX_WIDTH}px) 1px, ${ROOM_POSTER_WIDTH}px`;

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
const posterWarmCache = new Set<string>();

export function isThemeAvailable(_theme: ThemeType) {
  return true;
}

export function coerceAvailableTheme(theme: ThemeType): ThemeType {
  return theme;
}

export function staticRoomAsset(theme: ThemeType) {
  return `/assets/theme-video/${theme}-poster.webp`;
}

export function isMobileViewport() {
  return typeof window !== "undefined" && window.innerWidth <= MOBILE_MAX_WIDTH;
}

export function prefersReducedThemeMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
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

/** The clip only runs where the room scene is mounted and alpha decodes. */
export function canUseRoomVideo() {
  return typeof window !== "undefined" && !isMobileViewport() && supportsTransparentRoomVideo();
}

export function shouldSkipSpeculativePreload() {
  if (typeof navigator === "undefined") return true;
  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;
  return Boolean(connection?.saveData || connection?.effectiveType?.includes("2g"));
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

function videoSource(forward: boolean) {
  const direction = forward ? "forward" : "reverse";
  return `/assets/theme-video/day-cycle-${direction}-alpha-${chooseVideoResolution()}.webm`;
}

export function createRoomThemeAnimation(
  id: number,
  from: ThemeType,
  to: ThemeType,
): RoomThemeAnimation | null {
  if (from === to) return null;

  const forward = THEME_ORDER[to] > THEME_ORDER[from];
  const skipsAfternoon = Math.abs(THEME_ORDER[to] - THEME_ORDER[from]) > 1;
  const anchor = (theme: ThemeType) =>
    forward ? THEME_ANCHORS[theme] : DAY_CYCLE_LAST_FRAME_SECONDS - THEME_ANCHORS[theme];
  const startTime = anchor(from);
  const endTime = anchor(to);

  if (endTime <= startTime) return null;

  const playbackRate = skipsAfternoon ? DIRECT_PLAYBACK_RATE : 1;

  return {
    id,
    from,
    to,
    src: videoSource(forward),
    startTime,
    endTime,
    playbackRate,
    durationMs: Math.round(((endTime - startTime) / playbackRate) * 1000),
    label: `${from} to ${to}`,
    flarePhases: flarePhases(from, to),
  };
}

function isFullyBuffered(video: HTMLVideoElement) {
  const tolerance = 1 / 20;
  for (let index = 0; index < video.buffered.length; index += 1) {
    if (
      video.buffered.start(index) <= tolerance &&
      video.buffered.end(index) >= video.duration - tolerance
    ) {
      return true;
    }
  }
  return false;
}

/** Pulls a whole clip into the HTTP cache so the scene's own element plays from disk. */
export function preloadRoomVideo(src: string) {
  if (typeof window === "undefined") return Promise.resolve();

  const cached = videoPreloadCache.get(src);
  if (cached) return cached;

  const promise = new Promise<void>((resolve, reject) => {
    const video = document.createElement("video");
    let settled = false;
    let pollTimer = 0;
    let timeoutTimer = 0;

    const cleanup = () => {
      window.clearInterval(pollTimer);
      window.clearTimeout(timeoutTimer);
      video.removeEventListener("loadedmetadata", check);
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
      videoPreloadCache.delete(src);
      reject(new Error(`Unable to buffer room video: ${src}`));
    };

    function check() {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      if (isFullyBuffered(video)) finish();
    }

    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.addEventListener("loadedmetadata", check);
    video.addEventListener("progress", check);
    video.addEventListener("canplaythrough", check);
    video.addEventListener("suspend", check);
    video.addEventListener("error", fail, { once: true });
    video.src = src;
    video.load();

    pollTimer = window.setInterval(check, 100);
    timeoutTimer = window.setTimeout(fail, 15000);
  });

  videoPreloadCache.set(src, promise);
  return promise;
}

/**
 * The exact src, srcset and sizes the room's next/image element renders for a
 * poster. Works on the server too, so the layout can preload the poster that
 * matches the theme chosen before first paint.
 */
export function roomPosterImageProps(theme: ThemeType) {
  const { props } = getImageProps({
    alt: "",
    src: staticRoomAsset(theme),
    width: ROOM_POSTER_WIDTH,
    height: ROOM_POSTER_WIDTH,
    sizes: ROOM_POSTER_SIZES,
    quality: ROOM_POSTER_QUALITY,
  });
  return { src: props.src, srcSet: props.srcSet ?? "", sizes: props.sizes ?? ROOM_POSTER_SIZES };
}

/**
 * Warms the exact URL the room's next/image element will request, so the
 * destination poster is decoded before the clip hands off to it.
 */
export function warmRoomPoster(theme: ThemeType) {
  if (typeof window === "undefined") return;

  const src = staticRoomAsset(theme);
  if (posterWarmCache.has(src)) return;
  posterWarmCache.add(src);

  const props = roomPosterImageProps(theme);
  const image = new Image();
  image.sizes = props.sizes;
  image.srcset = props.srcSet;
  image.src = props.src;
  image.decode().catch(() => {});
}

/**
 * Fetches only what a switch away from `from` can reach: the forward clip
 * unless we are already at night, the reverse clip unless we are already at
 * morning, and the two other posters.
 */
export function warmRoomTransitionAssets(from: ThemeType) {
  if (!canUseRoomVideo()) return;

  if (THEME_ORDER[from] < THEME_ORDER.night) {
    preloadRoomVideo(videoSource(true)).catch(() => {});
  }
  if (THEME_ORDER[from] > THEME_ORDER.morning) {
    preloadRoomVideo(videoSource(false)).catch(() => {});
  }
  for (const theme of THEME_OPTIONS) {
    if (theme !== from) warmRoomPoster(theme);
  }
}
