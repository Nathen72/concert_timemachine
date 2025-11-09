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

    // Search for the track with artist name for better accuracy
    const query = `track:${song.name} artist:${song.artistName}`;
    const track = await searchSpotifyTrack(query, accessToken);

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
