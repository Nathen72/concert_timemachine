// Fetch artist image from Spotify
export const fetchArtistImage = async (
  artistName: string,
  accessToken: string
): Promise<string | null> => {
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
  try {
    const trackId = trackUri.split(':')[2];
    const response = await fetch(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) return null;

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
