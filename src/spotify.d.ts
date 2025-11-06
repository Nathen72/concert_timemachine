/// <reference types="@types/spotify-web-playback-sdk" />

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: typeof Spotify;
  }
}

export {};
