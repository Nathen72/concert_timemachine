// Spotify Search API types
export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
    total: number;
  };
}

export const searchSpotifyTrack = async (
  query: string,
  accessToken: string
): Promise<SpotifyTrack | null> => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?${new URLSearchParams({
        q: query,
        type: 'track',
        limit: '1',
      })}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Spotify search error:', response.status);
      return null;
    }

    const data: SpotifySearchResponse = await response.json();
    return data.tracks.items[0] || null;
  } catch (error) {
    console.error('Error searching Spotify:', error);
    return null;
  }
};

export const searchSpotifyTracksForSetlist = async (
  songs: Array<{ name: string; artistName: string }>,
  accessToken: string,
  onProgress?: (current: number, total: number) => void
): Promise<Array<{ name: string; uri: string | null; duration_ms: number }>> => {
  const results = [];

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    if (onProgress) onProgress(i + 1, songs.length);

    // Try multiple search strategies for better accuracy
    let track = null;

    // Strategy 1: Use track: and artist: field filters (most specific)
    const query1 = `track:${song.name} artist:${song.artistName}`;
    track = await searchSpotifyTrack(query1, accessToken);

    // Strategy 2: If no results, try without field filters but quoted
    if (!track) {
      const query2 = `"${song.name}" "${song.artistName}"`;
      track = await searchSpotifyTrack(query2, accessToken);
    }

    // Strategy 3: If still no results, try just artist and track name unquoted
    if (!track) {
      const query3 = `${song.name} ${song.artistName}`;
      track = await searchSpotifyTrack(query3, accessToken);
    }

    // Strategy 4: Last resort - just the track name
    if (!track) {
      const query4 = song.name;
      track = await searchSpotifyTrack(query4, accessToken);

      // Verify the artist matches if we got a result
      if (track) {
        const artistMatch = track.artists.some(artist =>
          artist.name.toLowerCase().includes(song.artistName.toLowerCase()) ||
          song.artistName.toLowerCase().includes(artist.name.toLowerCase())
        );

        if (!artistMatch) {
          console.warn(`Track found for "${song.name}" but artist doesn't match. Expected: ${song.artistName}, Got: ${track.artists.map(a => a.name).join(', ')}`);
        }
      }
    }

    if (!track) {
      console.warn(`Could not find Spotify track for: "${song.name}" by ${song.artistName}`);
    }

    results.push({
      name: song.name,
      uri: track?.uri || null,
      duration_ms: track?.duration_ms || 180000, // default 3 minutes if not found
    });

    // Rate limiting - wait 100ms between requests
    if (i < songs.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
};
