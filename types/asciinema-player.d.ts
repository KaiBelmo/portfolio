// Type definitions for asciinema-player

declare module 'asciinema-player' {
  interface AsciinemaPlayerOptions {
    cols?: number;
    rows?: number;
    autoPlay?: boolean;
    preload?: boolean;
    loop?: boolean | number;
    startAt?: number | string;
    speed?: number;
    idleTimeLimit?: number;
    theme?: string;
    fit?: string | boolean;
    terminalFontSize?: string;
    terminalFontFamily?: string;
    controls?: boolean | 'auto';
  }

  interface AsciinemaPlayerInstance {
    play: () => void;
    pause: () => void;
    seek: (time: number) => void;
    dispose: () => void;
  }

  function create(
    src: string,
    container: HTMLElement,
    options?: AsciinemaPlayerOptions
  ): AsciinemaPlayerInstance;

  const AsciinemaPlayer: {
    create: typeof create;
  };

  export default AsciinemaPlayer;
  export type { AsciinemaPlayerInstance };
}
