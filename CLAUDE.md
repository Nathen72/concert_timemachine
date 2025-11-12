# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server (runs on http://127.0.0.1:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

**Important:** Always use `127.0.0.1` instead of `localhost` for Spotify OAuth redirect URIs.

## Architecture Overview

Concert Time Machine is a React + TypeScript application that allows users to experience legendary concerts by playing full setlists through Spotify. Users can browse curated concerts or search setlist.fm's database to create custom concerts.

### Core Data Flow

1. **Authentication:** OAuth 2.0 with PKCE flow (`src/utils/spotifyAuth.ts`)
   - Code verifier/challenge generated on auth start
   - Code verifier stored in sessionStorage for token exchange
   - Access token persisted in localStorage for session continuity
   - Auth state managed in `App.tsx` (lines 14-82)

2. **Concert Discovery → Playback:**
   ```
   HomePage (browse/search)
     ↓
   ConcertSearch (setlist.fm API)
     ↓
   buildConcertFromSetlist() enriches with Spotify track URIs
     ↓
   onConcertCreated() updates App.dynamicConcerts state
     ↓
   Navigate to /concert/:concertId
     ↓
   ConcertPlayer loads concert and initializes Spotify player
     ↓
   useSpotifyPlayer hook manages playback
   ```

3. **State Management Architecture:**
   - **Global:** `PlayerContext` (`src/contexts/PlayerContext.tsx`) - intended for app-wide player state (currentConcert, isPlaying, volume, etc.)
   - **Local:** `ConcertPlayer.tsx` currently manages its own state independently
   - **Note:** PlayerContext exists but is NOT currently used by ConcertPlayer (potential refactoring opportunity)

### Key Integration Points

**Spotify Web Playback SDK** (`src/hooks/useSpotifyPlayer.ts`):
- Dynamically loads SDK script
- Creates player instance with device ID
- `play()` method uses Spotify Web API REST endpoint (required to play specific track URIs)
- `pause()/resume()` use SDK methods directly
- Listens to `player_state_changed` events to sync UI with playback state

**setlist.fm API** (`src/utils/setlistFmApi.ts`):
- Search endpoint: `GET /rest/1.0/search/setlists`
- Detail endpoint: `GET /rest/1.0/setlist/{id}`
- Requires `VITE_SETLISTFM_API_KEY` header (optional but enables search feature)

**Spotify Track Matching** (`src/utils/spotifyApi.ts`):
- `searchSpotifyTracksForSetlist()` enriches setlist.fm songs with Spotify URIs
- Includes 100ms delay between requests to avoid rate limiting
- Searches by artist + track name, falls back to track name only

### Audio Features

**Crowd Effects** (`src/hooks/useAudioEffects.ts`):
- Loads `/public/audio/crowd-applause.mp3` (optional file)
- Triggered when advancing to next track in concert
- Gracefully handles missing audio file

**Web Audio API:**
- AudioContext and ConvolverNode created for reverb effect
- Reverb currently generated but not connected to Spotify player

### Data Structures

**Concert Object:**
- `id`, `title`, `artist`, `venue`, `date`, `location`
- `description`, `posterImage`, `venueImage`
- `setlist: Song[]` - array of playable tracks

**Song Object:**
- `id` (string), `title`, `spotifyUri` (format: `spotify:track:...`), `durationMs`

**Dynamic vs Curated Concerts:**
- Curated: Hardcoded in `src/data/concerts.ts` with pre-matched Spotify URIs
- Dynamic: Created from setlist.fm API, stored in App state, persisted in localStorage

### Environment Variables

Required:
- `VITE_SPOTIFY_CLIENT_ID` - Spotify app client ID
- `VITE_REDIRECT_URI` - OAuth callback (use `http://127.0.0.1:5173/callback`)

Optional:
- `VITE_SETLISTFM_API_KEY` - Enables concert search feature (app works without it using only curated concerts)

### Spotify API Requirements

- **Premium account required** for Web Playback SDK
- OAuth scopes: `streaming`, `user-read-email`, `user-read-private`, `user-read-playback-state`, `user-modify-playback-state`
- Redirect URI must match exactly in Spotify Developer Dashboard settings

### Important Implementation Details

**Auth Code Double-Processing Prevention:**
- `sessionStorage['processed_auth_code']` marker prevents re-processing same code on page reload
- Code verifier cleared after token exchange or on error

**Track Index Synchronization:**
- ConcertPlayer listens to Spotify's `player_state_changed` event
- Extracts `track_window.current_track.uri` to find current song index
- Updates local `currentSongIndex` state to keep UI in sync

**Playback Control Flow:**
- User clicks play → `handlePlay()` → `play(allTrackUris)` → Spotify starts playback
- User clicks next/prev → `handleNextSong()/handlePreviousSong()` → `nextTrack()/previousTrack()` → triggers crowd applause
- Spotify state changes → listener updates `currentSongIndex` and `albumArt`

### Known Architectural Issues

1. **Duplicate State Management:** ConcertPlayer maintains local state instead of using PlayerContext
2. **Reverb Not Connected:** Web Audio reverb effect created but not wired to Spotify player
3. **Incomplete Features:** Shuffle and repeat UI controls not implemented (state exists in PlayerContext)
4. **Progress Bar Disabled:** Would require real-time position tracking from Spotify SDK

### Browser Requirements

- Modern browser with Web Audio API support
- DRM/EME support for Spotify playback
- Helpful error messages provided by `useSpotifyPlayer` for initialization issues

### Testing Notes

- Spotify Premium account required for testing playback features
- setlist.fm API key approval usually takes 24 hours
- Use `127.0.0.1` (not `localhost`) to avoid redirect URI mismatch errors
- Check browser console for detailed Spotify/API error messages
