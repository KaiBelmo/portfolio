export type ThemeType = 'morning' | 'afternoon' | 'night';

export const THEME_OPTIONS: ThemeType[] = ['morning', 'afternoon', 'night'];

export interface ThemePalette {
  canvas: string;
  pixels: string[];
}

/** Room-sampled colors shared by the UI themes and mosaic transitions. */
export const THEME_PALETTES: Record<ThemeType, ThemePalette> = {
  morning: {
    canvas: '#e7ddcc',
    pixels: ['#e7ddcc', '#8ea6cf', '#4f6030', '#a85b12', '#244d4b', '#242629'],
  },
  afternoon: {
    canvas: '#232418',
    pixels: ['#232418', '#a64f34', '#594656', '#e16c42', '#9b3049', '#d79a79'],
  },
  night: {
    canvas: '#1d2733',
    pixels: ['#1d2733', '#344a61', '#6d8094', '#8fa0b1', '#d09d4e'],
  },
};

export const DEFAULT_THEME: ThemeType = 'morning';

export function getThemeFromHour(hour: number = new Date().getHours()): ThemeType {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'night';
}

export function isThemeType(value: unknown): value is ThemeType {
  return value === 'morning' || value === 'afternoon' || value === 'night';
}

export function resolveInitialTheme(): ThemeType {
  if (typeof document !== 'undefined') {
    const dataTheme = document.documentElement.dataset.theme;
    if (isThemeType(dataTheme)) return dataTheme;
  }

  return typeof window === 'undefined' ? DEFAULT_THEME : getThemeFromHour();
}

export function getGreeting(theme: ThemeType): string {
  return {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    night: 'Good evening',
  }[theme];
}
