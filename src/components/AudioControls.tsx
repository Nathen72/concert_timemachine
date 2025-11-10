import type { Song } from '../types';

export const AudioControls = ({
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  isReady,
  currentSong,
  error
}: {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isReady: boolean;
  currentSong: Song;
  error?: string | null;
}) => {
  return (
    <div className="bg-gray-900 bg-opacity-90 rounded-lg p-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">
          {currentSong.title}
        </h2>
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
        {!isReady && !error && (
          <div className="space-y-2">
            <p className="text-sm text-yellow-400">Connecting to Spotify player...</p>
            <p className="text-xs text-gray-400">
              Make sure you have Spotify Premium and that no other device is playing music.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center items-center gap-4">
        <button
          onClick={onPrevious}
          disabled={!isReady}
          className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
          title="Previous Track"
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </button>

        {!isPlaying ? (
          <button
            onClick={onPlay}
            disabled={!isReady}
            className="p-6 bg-blue-600 hover:bg-blue-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 shadow-lg"
            title="Play"
          >
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        ) : (
          <button
            onClick={onPause}
            className="p-6 bg-blue-600 hover:bg-blue-700 rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
            title="Pause"
          >
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
            </svg>
          </button>
        )}

        <button
          onClick={onNext}
          disabled={!isReady}
          className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
          title="Next Track"
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 18h2V6h-2zM6 18l8.5-6L6 6z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};
