import { searchSpotifyTrack } from './spotifySearch';
import type { Concert } from '../types';

/**
 * Enriches a concert's setlist with Spotify track URIs by searching for each track
 */
export async function enrichConcertWithSpotify(
  concert: Concert,
  accessToken: string
): Promise<Concert> {
  // Check if all tracks already have valid URIs
  const needsEnrichment = concert.setlist.some(
    song => !song.spotifyUri || song.spotifyUri === ''
  );

  if (!needsEnrichment) {
    console.log(`✅ Concert already enriched: ${concert.artist} - ${concert.title}`);
    return concert;
  }

  console.log(`🔍 Enriching concert: ${concert.artist} - ${concert.title}`);

  const enrichedSetlist = await Promise.all(
    concert.setlist.map(async (song) => {
      // Skip if already has a valid URI
      if (song.spotifyUri && song.spotifyUri.startsWith('spotify:track:')) {
        return song;
      }

      // Try multiple search strategies
      let track = null;

      // Strategy 1: Search with track and artist filters
      const query1 = `track:"${song.title}" artist:"${concert.artist}"`;
      track = await searchSpotifyTrack(query1, accessToken);

      // Strategy 2: Try without quotes
      if (!track) {
        const query2 = `track:${song.title} artist:${concert.artist}`;
        track = await searchSpotifyTrack(query2, accessToken);
      }

      // Strategy 3: Simple combined search
      if (!track) {
        const query3 = `${song.title} ${concert.artist}`;
        track = await searchSpotifyTrack(query3, accessToken);
      }

      if (track) {
        console.log(`  ✅ Found: "${song.title}" -> ${track.uri}`);
        return {
          ...song,
          spotifyUri: track.uri,
          durationMs: track.duration_ms,
        };
      } else {
        console.warn(`  ❌ Could not find: "${song.title}" by ${concert.artist}`);
        return song; // Return original without URI
      }
    })
  );

  return {
    ...concert,
    setlist: enrichedSetlist,
  };
}
