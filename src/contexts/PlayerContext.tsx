import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Concert } from '../types';

interface PlayerContextType {
  currentConcert: Concert | null;
  isPlaying: boolean;
  currentSongIndex: number;
  volume: number;
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  setCurrentConcert: (concert: Concert | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentSongIndex: (index: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  playNext: () => void;
  playPrevious: () => void;
  playSongAtIndex: (index: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentConcert, setCurrentConcert] = useState<Concert | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [previousVolume, setPreviousVolume] = useState(80);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, newVolume));
    setVolumeState(clampedVolume);
    if (clampedVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setVolumeState(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolumeState(0);
      setIsMuted(true);
    }
  }, [isMuted, volume, previousVolume]);

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => !prev);
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const playNext = useCallback(() => {
    if (!currentConcert) return;

    const totalSongs = currentConcert.setlist.length;

    if (repeatMode === 'one') {
      // Stay on current song
      return;
    }

    if (currentSongIndex < totalSongs - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
    } else if (repeatMode === 'all') {
      setCurrentSongIndex(0);
    } else {
      // End of setlist, stop playing
      setIsPlaying(false);
    }
  }, [currentConcert, currentSongIndex, repeatMode]);

  const playPrevious = useCallback(() => {
    if (!currentConcert) return;

    if (currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1);
    } else if (repeatMode === 'all') {
      setCurrentSongIndex(currentConcert.setlist.length - 1);
    }
  }, [currentConcert, currentSongIndex, repeatMode]);

  const playSongAtIndex = useCallback((index: number) => {
    if (!currentConcert) return;

    const totalSongs = currentConcert.setlist.length;
    if (index >= 0 && index < totalSongs) {
      setCurrentSongIndex(index);
      setIsPlaying(true);
    }
  }, [currentConcert]);

  return (
    <PlayerContext.Provider
      value={{
        currentConcert,
        isPlaying,
        currentSongIndex,
        volume,
        isMuted,
        isShuffled,
        repeatMode,
        setCurrentConcert,
        setIsPlaying,
        setCurrentSongIndex,
        setVolume,
        toggleMute,
        toggleShuffle,
        cycleRepeatMode,
        playNext,
        playPrevious,
        playSongAtIndex,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
}
