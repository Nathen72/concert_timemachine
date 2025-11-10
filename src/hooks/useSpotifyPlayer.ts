import { useState, useEffect } from 'react';

export const useSpotifyPlayer = (accessToken: string | null) => {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    let script: HTMLScriptElement | null = null;
    let currentPlayer: Spotify.Player | null = null;

    const initializePlayer = () => {
      if (!window.Spotify) {
        console.error('Spotify SDK not loaded');
        return;
      }

      try {
        const player = new window.Spotify.Player({
          name: 'Concert Time Machine',
          getOAuthToken: (cb: (token: string) => void) => {
            console.log('Getting OAuth token');
            cb(accessToken);
          },
          volume: 0.8
        });

        player.addListener('ready', ({ device_id }: { device_id: string }) => {
          console.log('✅ Spotify Player Ready with Device ID:', device_id);
          setDeviceId(device_id);
          setIsReady(true);
        });

        player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
          console.log('⚠️ Device ID has gone offline:', device_id);
          setIsReady(false);
        });

        player.addListener('initialization_error', ({ message }: { message: string }) => {
          console.error('❌ Initialization Error:', message);
          let errorMessage = `Initialization Error: ${message}`;
          
          // Provide helpful message for common EME/DRM errors
          if (message.includes('failed to initialize') || message.toLowerCase().includes('keysystem') || message.toLowerCase().includes('eme')) {
            errorMessage = `DRM/EME support issue detected. Try: 1) Disable browser extensions that block DRM, 2) Ensure you're not in incognito mode, 3) Check Chrome settings for "Protected content" and enable it, 4) Try a different browser.`;
          }
          
          setError(errorMessage);
          setIsReady(false);
        });

        player.addListener('authentication_error', ({ message }: { message: string }) => {
          console.error('❌ Authentication Error:', message);
          setError(`Authentication Error: ${message}. Please try logging in again.`);
          setIsReady(false);
        });

        player.addListener('account_error', ({ message }: { message: string }) => {
          console.error('❌ Account Error:', message);
          setError(`Account Error: ${message}. Make sure you have Spotify Premium.`);
          setIsReady(false);
        });

        player.addListener('playback_error', ({ message }: { message: string }) => {
          console.error('❌ Playback Error:', message);
        });

        console.log('Connecting to Spotify player...');
        player.connect();
        currentPlayer = player;
        setPlayer(player);
      } catch (error) {
        console.error('Error creating Spotify player:', error);
      }
    };

    // Check if SDK is already loaded
    if (window.Spotify) {
      initializePlayer();
    } else {
      // Load the SDK script
      script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      
      script.onerror = () => {
        console.error('Failed to load Spotify Web Playback SDK');
      };

      window.onSpotifyWebPlaybackSDKReady = initializePlayer;
      document.body.appendChild(script);
    }

    return () => {
      if (currentPlayer) {
        console.log('Disconnecting Spotify player');
        currentPlayer.disconnect();
      }
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
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

  return { player, deviceId, isReady, error, play, pause, resume, nextTrack, previousTrack };
};
