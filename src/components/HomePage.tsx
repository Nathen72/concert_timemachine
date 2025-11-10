import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { concerts } from '../data/concerts';
import { ConcertSearch } from './ConcertSearch';
import Card from '../design-system/Card';
import Badge from '../design-system/Badge';
import Button from '../design-system/Button';
import type { Concert } from '../types';

interface HomePageProps {
  accessToken: string;
  dynamicConcerts: Concert[];
  onConcertCreated: (concert: Concert) => void;
}

type SortOption = 'date-desc' | 'date-asc' | 'artist' | 'venue';

export const HomePage = ({ accessToken, dynamicConcerts, onConcertCreated }: HomePageProps) => {
  const [activeTab, setActiveTab] = useState<'curated' | 'search' | 'custom'>('curated');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [searchQuery, setSearchQuery] = useState('');

  // Get concerts based on active tab
  const activeConcerts = activeTab === 'custom' ? dynamicConcerts : concerts;

  // Filter and sort concerts
  const filteredConcerts = useMemo(() => {
    let filtered = activeConcerts;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (concert) =>
          concert.artist.toLowerCase().includes(query) ||
          concert.title.toLowerCase().includes(query) ||
          concert.venue.toLowerCase().includes(query) ||
          concert.location.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'artist':
          return a.artist.localeCompare(b.artist);
        case 'venue':
          return a.venue.localeCompare(b.venue);
        default:
          return 0;
      }
    });

    return sorted;
  }, [activeConcerts, searchQuery, sortBy]);

  // Featured concert (first curated concert)
  const featuredConcert = concerts[0];

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Featured Concert */}
        {activeTab === 'curated' && !searchQuery && (
          <div className="mb-12 animate-fade-in">
            <Link
              to={`/concert/${featuredConcert.id}`}
              className="group relative block rounded-2xl overflow-hidden h-[400px] md:h-[500px]"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={featuredConcert.posterImage}
                  alt={featuredConcert.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-6 md:p-8 lg:p-12">
                <Badge variant="primary" className="mb-4 w-fit">
                  Featured Concert
                </Badge>
                <h2 className="text-4xl md:text-6xl font-bold mb-2 group-hover:text-primary-400 transition-colors">
                  {featuredConcert.artist}
                </h2>
                <p className="text-xl md:text-2xl text-gray-300 mb-2">
                  {featuredConcert.title}
                </p>
                <p className="text-gray-400 mb-6">
                  {featuredConcert.venue} • {featuredConcert.date}
                </p>
                <Button
                  variant="spotify"
                  size="lg"
                  className="w-fit"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                >
                  Play Now
                </Button>
              </div>
            </Link>
          </div>
        )}

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">
            {activeTab === 'search' ? 'Find Your Concert' : 'Browse Concerts'}
          </h1>
          <p className="text-gray-400 text-lg">
            {activeTab === 'curated' && 'Curated legendary performances from music history'}
            {activeTab === 'search' && 'Search for any concert from setlist.fm'}
            {activeTab === 'custom' && 'Your custom concert collection'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'curated'}
            onClick={() => setActiveTab('curated')}
            className={`px-6 py-3 font-semibold rounded-lg whitespace-nowrap transition-all duration-200 ${
              activeTab === 'curated'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Curated Concerts
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'search'}
            onClick={() => setActiveTab('search')}
            className={`px-6 py-3 font-semibold rounded-lg whitespace-nowrap transition-all duration-200 ${
              activeTab === 'search'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Search Concerts
          </button>
          {dynamicConcerts.length > 0 && (
            <button
              role="tab"
              aria-selected={activeTab === 'custom'}
              onClick={() => setActiveTab('custom')}
              className={`px-6 py-3 font-semibold rounded-lg whitespace-nowrap transition-all duration-200 ${
                activeTab === 'custom'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2">
                My Concerts
                <Badge variant="primary" size="sm">
                  {dynamicConcerts.length}
                </Badge>
              </span>
            </button>
          )}
        </div>

        {/* Search Tab */}
        {activeTab === 'search' ? (
          <div className="animate-fade-in">
            <ConcertSearch
              accessToken={accessToken}
              onConcertCreated={onConcertCreated}
            />
          </div>
        ) : (
          <>
            {/* Filter and Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {/* Search Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by artist, venue, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  aria-label="Search concerts"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer transition-all"
                aria-label="Sort concerts"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="artist">Artist A-Z</option>
                <option value="venue">Venue A-Z</option>
              </select>
            </div>

            {/* Concert Grid */}
            {filteredConcerts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                {filteredConcerts.map((concert) => (
                  <ConcertCard
                    key={concert.id}
                    concert={concert}
                    showCustomBadge={activeTab === 'custom'}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery('')}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Concert Card Component
function ConcertCard({ concert, showCustomBadge }: { concert: Concert; showCustomBadge?: boolean }) {
  return (
    <Link to={`/concert/${concert.id}`}>
      <Card
        variant="elevated"
        padding="none"
        hoverable
        className="group overflow-hidden h-full"
      >
        {/* Image */}
        <div className="aspect-square overflow-hidden relative">
          <img
            src={concert.posterImage}
            alt={`${concert.artist} - ${concert.title}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          {/* Play overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-spotify-green flex items-center justify-center shadow-glow-lg">
              <svg
                className="w-8 h-8 text-white ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          {/* Custom Badge */}
          {showCustomBadge && (
            <div className="absolute top-3 right-3">
              <Badge variant="primary" size="sm">
                Custom
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-bold mb-1 truncate group-hover:text-primary-400 transition-colors">
            {concert.artist}
          </h3>
          <p className="text-gray-400 text-sm mb-1 truncate">{concert.title}</p>
          <p className="text-gray-500 text-xs mb-2">{concert.date}</p>

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {concert.location}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              {concert.setlist.length}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// Empty State Component
function EmptyState({ searchQuery, onClearSearch }: { searchQuery: string; onClearSearch: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-300 mb-2">
        {searchQuery ? 'No concerts found' : 'No concerts yet'}
      </h3>
      <p className="text-gray-500 mb-6 max-w-md">
        {searchQuery
          ? `We couldn't find any concerts matching "${searchQuery}"`
          : 'Start by searching for concerts or browse our curated collection'}
      </p>
      {searchQuery && (
        <Button variant="secondary" onClick={onClearSearch}>
          Clear Search
        </Button>
      )}
    </div>
  );
}
