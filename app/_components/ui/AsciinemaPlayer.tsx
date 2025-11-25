'use client';

import { useEffect, useRef, useState } from 'react';

interface AsciinemaPlayerProps {
  src: string;
  className?: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
  coverSeconds?: number; // Seconds to show as cover frame
}
export default function AsciinemaPlayer({
  src,
  className = '',
  onReady,
  onError,
  coverSeconds = 10, // Default to 10 seconds if not provided
}: AsciinemaPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstance = useRef<any>(null);
  const styleRef = useRef<HTMLLinkElement | null>(null);
  const isPlayerReady = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstPlay, setIsFirstPlay] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setIsFirstPlay(true);
    setIsPlaying(false);
    setIsLoading(true);
    setError(null);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/styles/asciinema-player.css'; // Ensure this file exists in public/styles/

    document.head.appendChild(link);
    styleRef.current = link;

    const customStyle = document.createElement("style");
    customStyle.textContent = `
      /* Main player container */
      .asciinema-player *,
      .ap-player *,
      .ap-play-button,
      .ap-control-bar {
        cursor: pointer !important; /* Changed to pointer for better UX */
      }
      .ap-player {
        background-color: #ffffff !important;
        border: none !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        border-radius: 8px !important;
      }

      /* Terminal area */
      .ap-terminal {
        background-color: #ffffff !important;
        border: none !important;
        padding: 12px 16px !important;
        /* REMOVED fixed font-size here to allow responsive scaling */
      }

      /* Mobile Padding Adjustment */
      @media (max-width: 640px) {
        .ap-terminal {
            padding: 8px 8px !important;
        }
      }

      /* Let terminal text use original colors */
      .ap-terminal span {
        background-color: transparent !important;
        color: #333333 !important;
        
      }

      /* Control bar styling */
      .ap-control-bar {
        opacity: 0 !important;
        transition: opacity 0.3s ease !important;
        background-color: transparent !important;
        color: #000000 !important;
        border: none !important;
        font-size: 14px !important;
      }

      /* Remove any borders from asciinema player wrapper */
      .asciinema-player-wrapper {
        border: none !important;
      }

      /* Hide play button overlay */
      .ap-overlay-start {
        display: none !important;
      }

      /* Minimal control bar - hide unnecessary elements */
      .ap-control-bar .ap-fullscreen-button,
      .ap-control-bar .ap-popout-button,
      .ap-control-bar .ap-speed-button,
      .ap-control-bar .ap-loop-button {
        display: none !important;
      }

      /* Make progress bar more subtle */
      .ap-control-bar .ap-progress-bar {
        height: 4px !important; /* Slightly thicker for touch */
        background-color: rgba(0, 0, 0, 0.1) !important;
      }

      .ap-control-bar .ap-progress-bar .ap-progress-elapsed {
        background-color: #000000 !important;
        height: 4px !important;
      }

      .ap-control-bar .ap-progress-bar .ap-progress-cursor {
        background-color: #000000 !important;
        border: 2px solid #ffffff !important;
        width: 14px !important;
        height: 14px !important;
        border-radius: 50% !important;
        margin-top: -5px !important;
      }

      /* Style the play button to be visible and minimal */
      .ap-control-bar .ap-play-button {
        background-color: rgba(255, 255, 255, 0.9) !important;
        border: 1px solid rgba(0, 0, 0, 0.1) !important;
        color: #000000 !important;
        padding: 8px 12px !important;
        margin: 0 4px !important;
        border-radius: 4px !important;
        opacity: 1 !important;
        font-size: 14px !important;
      }

      .ap-control-bar .ap-play-button svg {
        width: 16px !important;
        height: 16px !important;
      }

      /* Hide control bar by default, show only on hover */
      .ap-control-bar {
        opacity: 0 !important;
        transition: opacity 0.3s ease !important;
      }

      /* Show control bar on hover OR when touched (active) */
      .ap-player:hover .ap-control-bar,
      .ap-player:active .ap-control-bar {
        opacity: 1 !important;
      }
      
      /* Keep progress bar slightly visible even when controls are hidden */
      .ap-control-bar .ap-progress-bar {
        position: absolute !important;
        bottom: 0 !important;
        left: 0 !important;
        padding: 0 !important;
      }

      .ap-player,
      .asciinema-player,
      .ap-terminal {
        user-select: none !important;
        /* Fix for mobile tap highlight */
        -webkit-tap-highlight-color: transparent;
      }

      /* Ensure no keyboard focus on player elements */
      .ap-player:focus,
      .asciinema-player:focus,
      .ap-terminal:focus {
        outline: none !important;
      }

      /* Set fill color for control bar icons */
      .ap-control-bar svg.ap-icon path {
        fill: #000000 !important;
      }
    `;
    document.head.appendChild(customStyle);

    const loadPlayer = async () => {
      try {
        const AsciinemaPlayerModule = await import('asciinema-player');

        const AsciinemaPlayer = AsciinemaPlayerModule.default || AsciinemaPlayerModule;

        if (!playerRef.current) {
          setError('Player container not found');
          return;
        }

        playerRef.current.innerHTML = '';

        const playerContainer = document.createElement('div');
        playerContainer.style.width = '100%';
        playerContainer.style.height = '100%';
        playerRef.current.innerHTML = '';
        playerRef.current.appendChild(playerContainer);

        const options = {
          autoPlay: false,
          preload: true,
          loop: false,
          startAt: coverSeconds,
          speed: 1,
          idleTimeLimit: 1,
          fit: false,         
          controls: true,
          terminalFontSize: '12px', 
          terminalFontFamily: '"Fira Code", "DejaVu Sans Mono", "Lucida Console", monospace',
        } as const;

        playerInstance.current = AsciinemaPlayer.create(
          src,
          playerContainer,
          options
        );

        isPlayerReady.current = true;
        onReady?.();

        setTimeout(() => {
          if (playerInstance.current && typeof playerInstance.current.seek === 'function') {
            try {
              playerInstance.current.seek(coverSeconds);
            } catch (error) {
              // Ignore seek errors
            }
          }

          const terminal = document.querySelector(".ap-terminal") as HTMLElement;
          if (terminal) {
            terminal.style.backgroundColor = "#ffffff";

            const style = document.createElement("style");
            style.textContent = `
              .ap-terminal span {
                background-color: #ffffff !important;
              }
              /* Basic color mapping for light mode */
              .ap-terminal .fg-0 { color: #333333 !important; }
              .ap-terminal .fg-1 { color: #cc4444 !important; }
              .ap-terminal .fg-2 { color: #44cc44 !important; }
              .ap-terminal .fg-3 { color: #cccc44 !important; }
              .ap-terminal .fg-4 { color: #4444cc !important; }
              .ap-terminal .fg-5 { color: #cc44cc !important; }
              .ap-terminal .fg-6 { color: #44cccc !important; }
              .ap-terminal .fg-7 { color: #cccccc !important; }
              .ap-terminal .fg-8 { color: #666666 !important; }
            `;
            document.head.appendChild(style);
          }
        }, 100);

        setError(null);
      } catch (error: unknown) {
        console.error('Error loading asciinema player:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(`Failed to load player: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayer();

    // Cleanup function
    return () => {
      isPlayerReady.current = false;
      setIsPlaying(false);
      setIsLoading(true);
      setIsFirstPlay(true);

      if (styleRef.current && document.head.contains(styleRef.current)) {
        document.head.removeChild(styleRef.current);
        styleRef.current = null;
      }

      if (playerRef.current) {
        const container = playerRef.current;
        requestAnimationFrame(() => {
          if (playerInstance.current && typeof playerInstance.current.dispose === 'function') {
            playerInstance.current.dispose();
            if (container) container.innerHTML = '';
          }
          playerInstance.current = null;
        });
      }
    };
  }, [src, coverSeconds]);

  const handlePlayerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isPlayerReady.current || !playerInstance.current) return;

    const togglePlayback = async () => {
      try {
        if (isPlaying) {
          if (typeof playerInstance.current?.pause === 'function') {
            await playerInstance.current.pause();
          }
        } else {
          if (isFirstPlay && typeof playerInstance.current?.seek === 'function') {
            playerInstance.current.seek(0);
            setTimeout(async () => {
              if (typeof playerInstance.current?.play === 'function') {
                await playerInstance.current.play();
              }
            }, 50);
            setIsFirstPlay(false);
          } else {
            if (typeof playerInstance.current?.play === 'function') {
              await playerInstance.current.play();
            }
          }
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error('Error toggling playback:', error);
      }
    };

    togglePlayback();
    return false;
  };

  return (
    <div
      className={`relative w-full rounded-md ${className}`}
      style={{ display: 'flex', flexDirection: 'column', margin: '0 auto' }}
    >
      <div
        ref={playerRef}
        className="w-full"
        onClick={handlePlayerClick}
        style={{
          position: 'relative',
          width: '100%',
          height: '300px', // Set fixed height to keep container size consistent; adjust to match your current typical size
          overflow: 'auto', // Changed to 'auto' for scrollbars (use 'hidden' if you prefer clipping)
          cursor: 'pointer',
          display: 'block'
        }}
      >
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 border rounded-md">
          {/* Added a simple loading spinner */}
          <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-500 p-4 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

