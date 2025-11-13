import { useState, useEffect } from 'react';
import type { Concert } from '../types';
import { enrichConcertWithSpotify } from '../utils/enrichConcerts';

const CACHE_KEY = 'enriched_concerts_v1';
const CACHE_EXPIRY_DAYS = 7;

/**
 * Hook that enriches concerts with Spotify track URIs on demand
 * Caches results in localStorage to avoid re-searching
 */
export function useEnrichedConcerts(
  concerts: Concert[],
  accessToken: string | null
) {
  const [enrichedConcerts, setEnrichedConcerts] = useState<Concert[]>(concerts);
  const [isEnriching, setIsEnriching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || concerts.length === 0) {
      setEnrichedConcerts(concerts);
      return;
    }

    async function enrichConcerts() {
      try {
        // Try to load from cache
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          const maxAge = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

          if (age < maxAge && data.length === concerts.length) {
            console.log('✅ Using cached enriched concerts');
            setEnrichedConcerts(data);
            return;
          }
        }

        // Enrich concerts
        console.log('🔄 Enriching concerts with Spotify search...');
        setIsEnriching(true);
        setError(null);

        const enriched: Concert[] = [];
        for (let i = 0; i < concerts.length; i++) {
          const enrichedConcert = await enrichConcertWithSpotify(
            concerts[i],
            accessToken
          );
          enriched.push(enrichedConcert);

          // Rate limiting between concerts
          if (i < concerts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }

        // Save to cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: enriched,
          timestamp: Date.now()
        }));

        console.log('✅ All concerts enriched and cached');
        setEnrichedConcerts(enriched);
      } catch (err) {
        console.error('Failed to enrich concerts:', err);
        setError(err instanceof Error ? err.message : 'Failed to enrich concerts');
        setEnrichedConcerts(concerts); // Fall back to original
      } finally {
        setIsEnriching(false);
      }
    }

    enrichConcerts();
  }, [accessToken]); // Only run when accessToken changes

  return {
    concerts: enrichedConcerts,
    isEnriching,
    error,
  };
}
