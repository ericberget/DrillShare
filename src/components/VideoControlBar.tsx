import React from 'react';

interface VideoControlBarProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onScrubberInteract?: () => void;
}

function formatTime(time: number) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const VideoControlBar: React.FC<VideoControlBarProps> = ({
  videoRef,
  currentTime,
  duration,
  isPlaying,
  onPlayPause,
  onSeek,
  onScrubberInteract,
}) => {
  // Handle scrubber drag
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    onSeek(value);
  };

  return (
    <div className="w-full flex flex-col gap-2 px-2 py-3 bg-slate-900/80 rounded-b-xl">
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={onPlayPause}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 text-white focus:outline-none"
        >
          {isPlaying ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          )}
        </button>
        {/* Time */}
        <span className="text-xs text-slate-200 w-12 text-right">{formatTime(currentTime)}</span>
        {/* Scrubber */}
        <div className="relative flex-1">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.01}
            value={currentTime}
            onChange={handleChange}
            onMouseDown={e => {
              videoRef.current?.pause();
              onScrubberInteract && onScrubberInteract();
            }}
            onTouchStart={e => {
              videoRef.current?.pause();
              onScrubberInteract && onScrubberInteract();
            }}
            className="w-full accent-emerald-500 h-2 rounded-lg overflow-hidden bg-slate-700"
            style={{ accentColor: '#10b981' }}
          />
          {/* Large, 3D handle overlay */}
          <div
            className="pointer-events-none absolute top-1/2"
            style={{
              left: `calc(${(currentTime / (duration || 1)) * 100}% - 18px)`,
              transform: 'translateY(-50%)',
              zIndex: 10,
            }}
          >
            <div className="w-9 h-9 rounded-full border-4 border-white shadow-lg bg-gradient-to-b from-emerald-400 to-emerald-600 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white/80 shadow-inner" />
            </div>
          </div>
        </div>
        {/* Duration */}
        <span className="text-xs text-slate-200 w-12">{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default VideoControlBar; 