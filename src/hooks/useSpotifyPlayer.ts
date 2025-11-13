import { useState, useEffect, useRef } from 'react';

export const useSpotifyPlayer = (accessToken: string | null) => {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to ensure play function always has current accessToken
  const accessTokenRef = useRef<string | null>(accessToken);
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    console.log('🔄 useSpotifyPlayer effect running:', {
      hasAccessToken: !!accessToken,
      accessTokenLength: accessToken?.length || 0,
      currentDeviceId: deviceId,
      currentIsReady: isReady
    });

    if (!accessToken) {
      console.warn('⚠️ useSpotifyPlayer: No accessToken provided, skipping initialization');
      return;
    }

    let script: HTMLScriptElement | null = null;
    let currentPlayer: Spotify.Player | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let checkIntervalId: NodeJS.Timeout | null = null;

    const initializePlayer = () => {
      if (!window.Spotify) {
        console.error('❌ Spotify SDK not loaded');
        return;
      }

      console.log('🎵 Initializing Spotify Player...', {
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length || 0,
        spotifySDKAvailable: !!window.Spotify
      });

      try {
        // Use ref to ensure we always use current accessToken
        const currentToken = accessTokenRef.current;
        if (!currentToken) {
          console.error('❌ Cannot initialize player: no access token');
          setError('No access token available. Please log in again.');
          return;
        }

        const player = new window.Spotify.Player({
          name: 'Concert Time Machine',
          getOAuthToken: (cb: (token: string) => void) => {
            const token = accessTokenRef.current;
            console.log('🔑 getOAuthToken called, providing token:', {
              hasToken: !!token,
              tokenLength: token?.length || 0
            });
            if (token) {
              cb(token);
            } else {
              console.error('❌ getOAuthToken: No token available');
              setError('Access token expired. Please log in again.');
            }
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
          console.error('❌ Error details:', {
            message,
            hasAccessToken: !!accessTokenRef.current,
            accessTokenLength: accessTokenRef.current?.length || 0,
            userAgent: navigator.userAgent,
            browserInfo: {
              isChrome: /Chrome/.test(navigator.userAgent),
              isFirefox: /Firefox/.test(navigator.userAgent),
              isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
              isEdge: /Edge/.test(navigator.userAgent)
            }
          });
          
          let errorMessage = `Initialization Error: ${message}`;
          
          // Provide helpful message for common EME/DRM errors
          if (message.toLowerCase().includes('failed to initialize') || 
              message.toLowerCase().includes('keysystem') || 
              message.toLowerCase().includes('eme') ||
              message.toLowerCase().includes('drm') ||
              message.toLowerCase().includes('widevine')) {
            errorMessage = `DRM/EME support issue detected. This is usually caused by browser settings or extensions blocking DRM content.\n\nTry these steps:\n1. Disable browser extensions that block DRM (ad blockers, privacy extensions)\n2. Ensure you're not in incognito/private mode\n3. Check browser settings for "Protected content" and enable it\n4. Try a different browser (Chrome usually works best)\n5. Make sure you have Spotify Premium`;
          } else if (message.toLowerCase().includes('authentication') || message.toLowerCase().includes('token')) {
            errorMessage = `Authentication issue: ${message}. Please try logging out and logging back in.`;
          } else if (message.toLowerCase().includes('premium')) {
            errorMessage = `Spotify Premium is required for playback. Please upgrade your account.`;
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
          setError(`Playback Error: ${message}. Make sure Spotify Premium is active and no other device is playing.`);
        });

        console.log('Connecting to Spotify player...');
        player.connect().then((success: boolean) => {
          if (success) {
            console.log('✅ Successfully connected to Spotify!');
          } else {
            console.error('❌ Failed to connect to Spotify player');
            setError('Failed to connect to Spotify. Please ensure you have Spotify Premium and try refreshing the page.');
          }
        });
        currentPlayer = player;
        setPlayer(player);
      } catch (error) {
        console.error('Error creating Spotify player:', error);
      }
    };

    // Check if SDK is already loaded
    if (window.Spotify) {
      console.log('✅ Spotify SDK already loaded, initializing player...');
      // Small delay to ensure SDK is fully ready
      setTimeout(() => {
        initializePlayer();
      }, 100);
    } else {
      console.log('📥 Loading Spotify Web Playback SDK...');
      // Load the SDK script
      script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      
      script.onerror = () => {
        const errorMsg = 'Failed to load Spotify Web Playback SDK. Check your internet connection and try again.';
        console.error('❌', errorMsg);
        setError(errorMsg);
      };

      script.onload = () => {
        console.log('✅ Spotify SDK script loaded');
      };

      // Set up the ready callback
      window.onSpotifyWebPlaybackSDKReady = () => {
        console.log('✅ Spotify SDK ready callback fired');
        initializePlayer();
      };

      document.body.appendChild(script);
      
      // Fallback timeout in case the ready callback doesn't fire
      timeoutId = setTimeout(() => {
        if (!window.Spotify) {
          const errorMsg = 'Spotify SDK failed to load. Please refresh the page.';
          console.error('❌', errorMsg);
          setError(errorMsg);
        }
      }, 10000); // 10 second timeout

      // Clear timeout if SDK loads
      checkIntervalId = setInterval(() => {
        if (window.Spotify) {
          if (timeoutId) clearTimeout(timeoutId);
          if (checkIntervalId) clearInterval(checkIntervalId);
        }
      }, 100);
    }

    return () => {
      if (currentPlayer) {
        console.log('Disconnecting Spotify player');
        currentPlayer.disconnect();
      }
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (checkIntervalId) {
        clearInterval(checkIntervalId);
      }
    };
  }, [accessToken]);

  const play = async (uris: string[]) => {
    // Use ref to get current accessToken value
    const currentAccessToken = accessTokenRef.current;
    
    // Debug logging to see what's missing
    console.log('🔍 play() called with state:', {
      hasDeviceId: !!deviceId,
      deviceId,
      hasAccessToken: !!currentAccessToken,
      accessTokenLength: currentAccessToken?.length || 0,
      isReady,
      urisCount: uris.length
    });

    if (!deviceId || !currentAccessToken) {
      const missing = [];
      if (!deviceId) missing.push('deviceId');
      if (!currentAccessToken) missing.push('accessToken');
      const errorMsg = `Cannot play: missing ${missing.join(' and ')}. ${!deviceId ? 'Player may not be ready yet.' : ''}`;
      console.error('❌', errorMsg, {
        deviceId: deviceId || 'NULL',
        accessToken: currentAccessToken ? `${currentAccessToken.substring(0, 20)}...` : 'NULL',
        isReady
      });
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    if (!isReady) {
      const errorMsg = 'Spotify player is not ready yet. Please wait a moment and try again.';
      console.error(errorMsg);
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    // Filter out any null or invalid URIs
    const validUris = uris.filter(uri => uri && typeof uri === 'string' && uri.startsWith('spotify:track:'));
    
    if (validUris.length === 0) {
      const errorMsg = 'No valid Spotify track URIs found to play';
      console.error(errorMsg, { uris });
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    console.log('🎵 Attempting to play tracks:', { 
      totalUris: uris.length, 
      validUris: validUris.length,
      deviceId,
      firstFewUris: validUris.slice(0, 3)
    });

    try {
      // First, try to transfer playback to this device (in case another device is active)
      const currentAccessToken = accessTokenRef.current;
      if (!currentAccessToken) {
        throw new Error('Access token lost during playback');
      }

      try {
        const transferResponse = await fetch(`https://api.spotify.com/v1/me/player`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentAccessToken}`
          },
          body: JSON.stringify({ device_ids: [deviceId], play: false })
        });
        // Don't fail if transfer fails - the play endpoint might still work
        if (transferResponse.ok) {
          console.log('✅ Transferred playback to this device');
        }
      } catch (transferError) {
        console.log('⚠️ Transfer playback failed (may not be needed):', transferError);
      }

      // Now try to play
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentAccessToken}`
        },
        body: JSON.stringify({ uris: validUris })
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: { message: `HTTP ${response.status}: ${response.statusText}` } };
        }
        
        const errorMessage = errorData.error?.message || `Failed to start playback: ${response.status}`;
        console.error('❌ Spotify API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        // Provide helpful error messages for common issues
        let userFriendlyMessage = errorMessage;
        if (response.status === 403) {
          userFriendlyMessage = 'Playback failed. Make sure Spotify Premium is active and no other device is currently playing.';
        } else if (response.status === 404) {
          userFriendlyMessage = 'Device not found. Please refresh the page and try again.';
        } else if (response.status === 401) {
          userFriendlyMessage = 'Authentication expired. Please log in again.';
        }
        
        setError(userFriendlyMessage);
        throw new Error(userFriendlyMessage);
      }
      
      console.log('✅ Successfully started playback');
      setError(null); // Clear any previous errors on success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error playing track';
      console.error('❌ Error playing track:', error);
      setError(errorMessage);
      throw error;
    }
  };

  const pause = () => player?.pause();
  const resume = () => player?.resume();
  const nextTrack = () => player?.nextTrack();
  const previousTrack = () => player?.previousTrack();

  return { player, deviceId, isReady, error, play, pause, resume, nextTrack, previousTrack };
};
