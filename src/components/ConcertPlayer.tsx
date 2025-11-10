import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { concerts } from '../data/concerts';
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer';
import { useAudioEffects } from '../hooks/useAudioEffects';
import Button from '../design-system/Button';
import { useToast } from '../contexts/ToastContext';
import type { Concert } from '../types';

export const ConcertPlayer = ({
  accessToken,
  dynamicConcerts,
}: {
  accessToken: string;
  dynamicConcerts: Concert[];
}) => {
  const { concertId } = useParams();
  const toast = useToast();

  // Search in both dynamic concerts and curated concerts
  const allConcerts = [...dynamicConcerts, ...concerts];
  const concert = allConcerts.find(c => c.id === concertId);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVenueDetails, setShowVenueDetails] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  const { play, pause, nextTrack, previousTrack, player, isReady, error } =
    useSpotifyPlayer(accessToken);
  const { playCrowdApplause } = useAudioEffects();

  if (!concert) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-200">Concert Not Found</h1>
          <p className="text-gray-400 mb-6">The concert you're looking for doesn't exist.</p>
          <Link to="/">
            <Button variant="primary">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePlay = async () => {
    try {
      const uris = concert.setlist.map(song => song.spotifyUri);
      await play(uris);
      setIsPlaying(true);
      toast.success('Concert started!');
    } catch (err) {
      toast.error('Failed to start playback');
    }
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

  const handleSongClick = (index: number) => {
    const uris = concert.setlist.slice(index).map(song => song.spotifyUri);
    play(uris);
    setCurrentSongIndex(index);
    setIsPlaying(true);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // TODO: Connect to Spotify player volume
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

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error, toast]);

  const currentSong = concert.setlist[currentSongIndex];

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden pb-20 md:pb-0">
      {/* Main Player Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Blurred Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${concert.posterImage})`,
          }}
        >
          <div className="absolute inset-0 backdrop-blur-3xl bg-black/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col p-4 md:p-8">
          {/* Back Button & Actions */}
          <div className="flex items-center justify-between mb-6">
            <Link to="/">
              <Button
                variant="ghost"
                size="sm"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                }
              >
                Back
              </Button>
            </Link>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVenueDetails(!showVenueDetails)}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              >
                Info
              </Button>
            </div>
          </div>

          {/* Now Playing - Center */}
          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
            {/* Album Art */}
            <div className="w-full max-w-md aspect-square mb-8 rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
              <img
                src={concert.posterImage}
                alt={concert.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Song Info */}
            <div className="text-center mb-8 w-full px-4">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 animate-fade-in">
                {currentSong.title}
              </h1>
              <p className="text-xl text-gray-300 mb-4">{concert.artist}</p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                <span>{concert.venue}</span>
                <span>•</span>
                <span>{concert.date}</span>
                <span>•</span>
                <span>Track {currentSongIndex + 1} of {concert.setlist.length}</span>
              </div>
            </div>

            {/* Player Controls */}
            <div className="w-full max-w-2xl">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 transition-all duration-300"
                    style={{ width: '30%' }} // TODO: Connect to actual progress
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>0:00</span>
                  <span>{Math.floor(currentSong.durationMs / 60000)}:{String(Math.floor((currentSong.durationMs % 60000) / 1000)).padStart(2, '0')}</span>
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-center gap-4 mb-6">
                {/* Previous */}
                <button
                  onClick={handlePrevious}
                  disabled={!isReady || currentSongIndex === 0}
                  className="p-3 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous track"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                  </svg>
                </button>

                {/* Play/Pause */}
                <button
                  onClick={isPlaying ? handlePause : handlePlay}
                  disabled={!isReady}
                  className="p-5 rounded-full bg-spotify-green hover:bg-spotify-green-hover disabled:bg-gray-600 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-glow-lg"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                    </svg>
                  ) : (
                    <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                {/* Next */}
                <button
                  onClick={handleNext}
                  disabled={!isReady || currentSongIndex === concert.setlist.length - 1}
                  className="p-3 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next track"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 18h2V6h-2zM6 18l8.5-6L6 6z" />
                  </svg>
                </button>
              </div>

              {/* Secondary Controls */}
              <div className="flex items-center justify-between px-4">
                {/* Volume */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(Number(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-24 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    aria-label="Volume"
                  />
                </div>

                <div className="text-sm text-gray-400">
                  {!isReady && 'Loading player...'}
                  {error && <span className="text-error">{error}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Setlist Sidebar */}
      <div className="w-full md:w-96 bg-black/95 backdrop-blur-xl border-t md:border-t-0 md:border-l border-gray-800 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold mb-1">Setlist</h2>
          <p className="text-sm text-gray-400">{concert.setlist.length} songs</p>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {concert.setlist.map((song, index) => (
            <button
              key={song.id}
              onClick={() => handleSongClick(index)}
              className={`w-full text-left px-4 py-3 transition-colors border-b border-gray-800/50 hover:bg-white/5 ${
                index === currentSongIndex
                  ? 'bg-primary-500/20 border-l-4 border-l-primary-500'
                  : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-sm font-mono w-6">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${index === currentSongIndex ? 'text-primary-400' : 'text-gray-200'}`}>
                    {song.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {Math.floor(song.durationMs / 60000)}:{String(Math.floor((song.durationMs % 60000) / 1000)).padStart(2, '0')}
                  </p>
                </div>
                {index === currentSongIndex && isPlaying && (
                  <div className="flex gap-0.5 items-end h-4">
                    <div className="w-0.5 bg-primary-400 animate-pulse" style={{ height: '40%' }} />
                    <div className="w-0.5 bg-primary-400 animate-pulse" style={{ height: '100%', animationDelay: '0.2s' }} />
                    <div className="w-0.5 bg-primary-400 animate-pulse" style={{ height: '60%', animationDelay: '0.4s' }} />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Venue Details Modal */}
      {showVenueDetails && (
        <div
          className="fixed inset-0 z-modal bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowVenueDetails(false)}
        >
          <div
            className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-800 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold">{concert.title}</h2>
                <button
                  onClick={() => setShowVenueDetails(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">Artist</h3>
                  <p className="text-lg">{concert.artist}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">Venue</h3>
                  <p className="text-lg">{concert.venue}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-1">Date</h3>
                    <p>{concert.date}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-1">Location</h3>
                    <p>{concert.location}</p>
                  </div>
                </div>

                {concert.attendance && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-1">Attendance</h3>
                    <p>{concert.attendance.toLocaleString()} people</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">About</h3>
                  <p className="text-gray-300 leading-relaxed">{concert.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
