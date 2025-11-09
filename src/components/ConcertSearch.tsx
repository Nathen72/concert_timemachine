import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SetlistFmSetlist } from '../utils/setlistFmApi';
import { searchSetlists } from '../utils/setlistFmApi';
import { buildConcertFromSetlist } from '../utils/concertBuilder';
import type { Concert } from '../types';

interface ConcertSearchProps {
  accessToken: string;
  onConcertCreated: (concert: Concert) => void;
}

export const ConcertSearch = ({ accessToken, onConcertCreated }: ConcertSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SetlistFmSetlist[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState({ message: '', current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const results = await searchSetlists({ artistName: searchQuery });
      setSearchResults(results.setlist || []);

      if (results.setlist.length === 0) {
        setError('No concerts found. Try a different artist name.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search concerts. Make sure you have a setlist.fm API key configured.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSetlist = async (setlist: SetlistFmSetlist) => {
    setIsBuilding(true);
    setError(null);

    try {
      const concert = await buildConcertFromSetlist(
        setlist,
        accessToken,
        (message, current, total) => {
          setBuildProgress({ message, current, total });
        }
      );

      if (concert) {
        onConcertCreated(concert);
        navigate(`/concert/${concert.id}`);
      } else {
        setError('Failed to build concert. No songs found on Spotify.');
      }
    } catch (err) {
      console.error('Build error:', err);
      setError('Failed to build concert from setlist.');
    } finally {
      setIsBuilding(false);
      setBuildProgress({ message: '', current: 0, total: 0 });
    }
  };

  const formatDate = (dateString: string) => {
    const parts = dateString.split('-');
    const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-900 bg-opacity-90 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-white mb-4">Search for Any Concert</h2>
        <p className="text-gray-400 mb-6">
          Search setlist.fm for any concert and we'll find the songs on Spotify for you
        </p>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter artist name (e.g., Pink Floyd, Radiohead)"
              className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={isSearching || isBuilding}
            />
            <button
              type="submit"
              disabled={isSearching || isBuilding || !searchQuery.trim()}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-900 bg-opacity-50 border border-red-600 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {isBuilding && (
          <div className="mb-6 p-6 bg-blue-900 bg-opacity-50 border border-blue-600 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <div className="flex-1">
                <p className="text-blue-200 font-semibold">{buildProgress.message}</p>
                {buildProgress.total > 0 && (
                  <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(buildProgress.current / buildProgress.total) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {searchResults.length > 0 && !isBuilding && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">
              Found {searchResults.length} concerts
            </h3>
            <div className="max-h-[600px] overflow-y-auto space-y-3">
              {searchResults.map((setlist) => (
                <button
                  key={setlist.id}
                  onClick={() => handleSelectSetlist(setlist)}
                  className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-200 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                        {setlist.artist.name}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {setlist.venue.name} • {setlist.venue.city.name}, {setlist.venue.city.country.name}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {formatDate(setlist.eventDate)}
                        {setlist.tour?.name && ` • ${setlist.tour.name}`}
                      </p>
                      {setlist.sets.set.length > 0 && (
                        <p className="text-blue-400 text-sm mt-2">
                          {setlist.sets.set.reduce((sum, set) => sum + set.song.length, 0)} songs
                        </p>
                      )}
                    </div>
                    <svg
                      className="w-6 h-6 text-gray-500 group-hover:text-blue-400 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
