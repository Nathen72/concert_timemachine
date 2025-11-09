import { useState } from 'react';
import { Link } from 'react-router-dom';
import { concerts } from '../data/concerts';
import { ConcertSearch } from './ConcertSearch';
import type { Concert } from '../types';

interface HomePageProps {
  accessToken: string;
  dynamicConcerts: Concert[];
  onConcertCreated: (concert: Concert) => void;
}

export const HomePage = ({ accessToken, dynamicConcerts, onConcertCreated }: HomePageProps) => {
  const [activeTab, setActiveTab] = useState<'curated' | 'search' | 'custom'>('curated');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">Concert Time Machine</h1>
        <p className="text-gray-400 mb-8">
          Experience legendary concerts as if you were there
        </p>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('curated')}
            className={`px-6 py-3 font-semibold transition-all duration-200 ${
              activeTab === 'curated'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Curated Concerts
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-3 font-semibold transition-all duration-200 ${
              activeTab === 'search'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Search Concerts
          </button>
          {dynamicConcerts.length > 0 && (
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-6 py-3 font-semibold transition-all duration-200 ${
                activeTab === 'custom'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              My Concerts ({dynamicConcerts.length})
            </button>
          )}
        </div>

        {/* Curated Concerts Tab */}
        {activeTab === 'curated' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {concerts.map((concert) => (
              <Link
                key={concert.id}
                to={`/concert/${concert.id}`}
                className="group relative overflow-hidden rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={concert.posterImage}
                    alt={concert.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold">{concert.artist}</h3>
                  <p className="text-gray-400">{concert.title}</p>
                  <p className="text-sm text-gray-500">{concert.date}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <ConcertSearch
            accessToken={accessToken}
            onConcertCreated={onConcertCreated}
          />
        )}

        {/* Custom Concerts Tab */}
        {activeTab === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dynamicConcerts.map((concert) => (
              <Link
                key={concert.id}
                to={`/concert/${concert.id}`}
                className="group relative overflow-hidden rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={concert.posterImage}
                    alt={concert.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold flex-1">{concert.artist}</h3>
                    <span className="px-2 py-1 bg-blue-600 text-xs rounded-full">Custom</span>
                  </div>
                  <p className="text-gray-400">{concert.title}</p>
                  <p className="text-sm text-gray-500">{concert.date}</p>
                  <p className="text-sm text-blue-400 mt-2">{concert.setlist.length} songs</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
