import type { Concert, Song } from '../types';
import type { SetlistFmSetlist } from './setlistFmApi';
import { searchSpotifyTracksForSetlist } from './spotifySearch';

export const buildConcertFromSetlist = async (
  setlist: SetlistFmSetlist,
  accessToken: string,
  onProgress?: (message: string, current: number, total: number) => void
): Promise<Concert | null> => {
  try {
    // Extract all songs from all sets
    const allSongs = setlist.sets.set.flatMap(set =>
      set.song.map(song => ({
        name: song.name,
        artistName: setlist.artist.name,
      }))
    );

    if (allSongs.length === 0) {
      console.error('No songs found in setlist');
      return null;
    }

    // Search for Spotify URIs
    if (onProgress) onProgress('Finding songs on Spotify...', 0, allSongs.length);

    const spotifyTracks = await searchSpotifyTracksForSetlist(
      allSongs,
      accessToken,
      (current, total) => {
        if (onProgress) onProgress(`Finding songs on Spotify... (${current}/${total})`, current, total);
      }
    );

    // Build song list
    const songs: Song[] = spotifyTracks
      .filter(track => track.uri) // Only include songs we found on Spotify
      .map((track, index) => ({
        id: `${index + 1}`,
        title: track.name,
        spotifyUri: track.uri!,
        durationMs: track.duration_ms,
      }));

    if (songs.length === 0) {
      console.error('No songs found on Spotify');
      return null;
    }

    // Format date
    const eventDate = new Date(
      setlist.eventDate.split('-').reverse().join('-')
    );
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Build location string
    const venue = setlist.venue;
    const location = venue.city.state
      ? `${venue.city.name}, ${venue.city.stateCode || venue.city.state}`
      : `${venue.city.name}, ${venue.city.country.name}`;

    // Build description
    const description = setlist.info
      ? setlist.info
      : `${setlist.artist.name} performed at ${venue.name} on ${formattedDate}. ${songs.length} songs were played during this concert.`;

    // Generate concert ID
    const concertId = `${setlist.artist.sortName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${venue.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${setlist.eventDate}`;

    // Use placeholder images (in a real implementation, you might fetch from MusicBrainz or similar)
    const concert: Concert = {
      id: concertId,
      title: setlist.tour?.name || `Live at ${venue.name}`,
      artist: setlist.artist.name,
      venue: venue.name,
      date: formattedDate,
      location,
      description,
      posterImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
      venueImage: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1600&q=80',
      setlist: songs,
    };

    return concert;
  } catch (error) {
    console.error('Error building concert from setlist:', error);
    return null;
  }
};
