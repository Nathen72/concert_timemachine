import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { concerts } from '../data/concerts';
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer';
import { useAudioEffects } from '../hooks/useAudioEffects';
import { SetlistDisplay } from './SetlistDisplay';
import { AudioControls } from './AudioControls';
import { VenueInfo } from './VenueInfo';

export const ConcertPlayer = ({ accessToken }: { accessToken: string }) => {
  const { concertId } = useParams();
  const concert = concerts.find(c => c.id === concertId);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const { play, pause, nextTrack, previousTrack, player, isReady } =
    useSpotifyPlayer(accessToken);
  const { playCrowdApplause } = useAudioEffects();

  if (!concert) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Concert Not Found</h1>
          <p className="text-gray-400">The concert you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const handlePlay = async () => {
    const uris = concert.setlist.map(song => song.spotifyUri);
    await play(uris);
    setIsPlaying(true);
  };

  const handlePause = () => {
    pause();
    setIsPlaying(false);
  };

  const handleNext = () => {
    nextTrack();
    playCrowdApplause();
    setCurrentSongIndex(prev => Math.min(prev + 1, concert.setlist.length - 1));
  };

  const handlePrevious = () => {
    previousTrack();
    setCurrentSongIndex(prev => Math.max(prev - 1, 0));
  };

  // Listen to Spotify player state changes
  useEffect(() => {
    if (!player) return;

    const stateChangeHandler = (state: Spotify.PlaybackState | null) => {
      if (!state) return;

      // Update playing state
      setIsPlaying(!state.paused);

      // Detect song changes
      const trackIndex = concert.setlist.findIndex(
        song => song.spotifyUri === state.track_window.current_track.uri
      );
      if (trackIndex !== -1 && trackIndex !== currentSongIndex) {
        setCurrentSongIndex(trackIndex);
        if (trackIndex > currentSongIndex) {
          // Moving forward - play applause
          playCrowdApplause();
        }
      }
    };

    player.addListener('player_state_changed', stateChangeHandler);

    return () => {
      player.removeListener('player_state_changed', stateChangeHandler);
    };
  }, [player, currentSongIndex, concert.setlist, playCrowdApplause]);

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: `url(${concert.venueImage})`,
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-80" />

      <div className="relative z-10 max-w-7xl mx-auto p-8">
        <VenueInfo concert={concert} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <AudioControls
              isPlaying={isPlaying}
              onPlay={handlePlay}
              onPause={handlePause}
              onNext={handleNext}
              onPrevious={handlePrevious}
              isReady={isReady}
              currentSong={concert.setlist[currentSongIndex]}
            />
          </div>

          <div>
            <SetlistDisplay
              setlist={concert.setlist}
              currentIndex={currentSongIndex}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
