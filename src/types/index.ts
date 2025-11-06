export interface Song {
  id: string;
  title: string;
  spotifyUri: string;
  durationMs: number;
}

export interface Concert {
  id: string;
  title: string;
  artist: string;
  venue: string;
  date: string;
  location: string;
  attendance?: number;
  description: string;
  posterImage: string;
  venueImage: string;
  setlist: Song[];
}

export interface PlayerState {
  currentSongIndex: number;
  isPlaying: boolean;
  progress: number;
}
