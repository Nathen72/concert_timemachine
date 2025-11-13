// Check if token is valid
const isTokenValid = (accessToken: string | null): boolean => {
  if (!accessToken) return false;
  // Basic validation - token should be a non-empty string
  return accessToken.trim().length > 0;
};

// Handle 401 errors by clearing invalid token
const handleAuthError = () => {
  localStorage.removeItem('spotify_access_token');
  // Trigger a custom event that App.tsx can listen to
  window.dispatchEvent(new CustomEvent('spotify-auth-error'));
};

// Fetch artist image from Spotify
export const fetchArtistImage = async (
  artistName: string,
  accessToken: string
): Promise<string | null> => {
  if (!isTokenValid(accessToken)) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?${new URLSearchParams({
        q: artistName,
        type: 'artist',
        limit: '1',
      })}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 401) {
      handleAuthError();
      return null;
    }

    if (!response.ok) return null;

    const data = await response.json();
    const artist = data.artists?.items[0];

    if (artist?.images?.length > 0) {
      // Return the largest image
      return artist.images[0].url;
    }

    return null;
  } catch (error) {
    console.error('Error fetching artist image:', error);
    return null;
  }
};

// Fetch album art from Spotify for a specific track
export const fetchAlbumArt = async (
  trackUri: string,
  accessToken: string
): Promise<string | null> => {
  if (!isTokenValid(accessToken)) {
    return null;
  }

  try {
    const trackId = trackUri.split(':')[2];
    if (!trackId) return null;

    const response = await fetch(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    ).catch(() => {
      // Catch network errors silently
      return null;
    });

    if (!response) return null;

    if (response.status === 401) {
      handleAuthError();
      return null;
    }

    // Silently handle 404s and other errors - some tracks may not exist
    if (!response.ok) {
      // Don't log 404s as they're expected for some tracks
      if (response.status !== 404) {
        console.warn(`Failed to fetch album art for track ${trackId}: ${response.status}`);
      }
      return null;
    }

    const data = await response.json();

    if (data.album?.images?.length > 0) {
      // Return medium-sized image
      return data.album.images[1]?.url || data.album.images[0].url;
    }

    return null;
  } catch (error) {
    console.error('Error fetching album art:', error);
    return null;
  }
};

// Fetch multiple images for a concert (artist + first track album art)
export const fetchConcertImages = async (
  artistName: string,
  firstTrackUri: string,
  accessToken: string
): Promise<{ artistImage: string | null; albumArt: string | null }> => {
  const [artistImage, albumArt] = await Promise.all([
    fetchArtistImage(artistName, accessToken),
    fetchAlbumArt(firstTrackUri, accessToken),
  ]);

  return { artistImage, albumArt };
};

// Cache for album art URLs to reduce API calls
const albumArtCache = new Map<string, string | null>();

// Fetch album art with caching
export const fetchAlbumArtCached = async (
  trackUri: string,
  accessToken: string
): Promise<string | null> => {
  if (albumArtCache.has(trackUri)) {
    return albumArtCache.get(trackUri) || null;
  }

  const art = await fetchAlbumArt(trackUri, accessToken);
  albumArtCache.set(trackUri, art);
  return art;
};

// Batch fetch album art for multiple tracks
export const fetchBatchAlbumArt = async (
  trackUris: string[],
  accessToken: string
): Promise<Map<string, string | null>> => {
  const results = new Map<string, string | null>();
  
  // Fetch in parallel with a limit to avoid rate limiting
  const batchSize = 10;
  for (let i = 0; i < trackUris.length; i += batchSize) {
    const batch = trackUris.slice(i, i + batchSize);
    const promises = batch.map(async (uri) => {
      const art = await fetchAlbumArtCached(uri, accessToken);
      return { uri, art };
    });
    
    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ uri, art }) => {
      results.set(uri, art);
    });
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < trackUris.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
};
