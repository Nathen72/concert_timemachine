import type { Song } from '../types';

export const SetlistDisplay = ({
  setlist,
  currentIndex
}: {
  setlist: Song[];
  currentIndex: number;
}) => {
  return (
    <div className="bg-gray-900 bg-opacity-90 rounded-lg p-6">
      <h3 className="text-2xl font-bold mb-4 text-white">Setlist</h3>
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {setlist.map((song, index) => (
          <div
            key={song.id}
            className={`p-3 rounded transition-all duration-300 ${
              index === currentIndex
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono w-6">{index + 1}</span>
              <span className="flex-1">{song.title}</span>
              {index === currentIndex && (
                <span className="text-xs animate-pulse">Now Playing</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
