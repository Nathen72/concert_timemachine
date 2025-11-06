import { useState, useEffect } from 'react';

export const useSpotifyPlayer = (accessToken: string | null) => {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!accessToken) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Concert Time Machine',
        getOAuthToken: (cb: (token: string) => void) => cb(accessToken),
        volume: 0.8
      });

      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        setIsReady(true);
      });

      player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Device ID has gone offline', device_id);
        setIsReady(false);
      });

      player.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('Initialization Error:', message);
      });

      player.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('Authentication Error:', message);
      });

      player.addListener('account_error', ({ message }: { message: string }) => {
        console.error('Account Error:', message);
      });

      player.connect();
      setPlayer(player);
    };

    return () => {
      player?.disconnect();
    };
  }, [accessToken]);

  const play = async (uris: string[]) => {
    if (!deviceId || !accessToken) {
      console.error('Cannot play: missing deviceId or accessToken');
      return;
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ uris })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Spotify API error:', error);
      }
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const pause = () => player?.pause();
  const resume = () => player?.resume();
  const nextTrack = () => player?.nextTrack();
  const previousTrack = () => player?.previousTrack();

  return { player, deviceId, isReady, play, pause, resume, nextTrack, previousTrack };
};
