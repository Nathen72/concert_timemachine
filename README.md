# Concert Time Machine

Experience legendary concerts from history as if you were there. Concert Time Machine lets you relive iconic performances with full setlists, venue information, and immersive audio effects.

## Features

- **🎸 Search ANY Concert**: Search setlist.fm's database of 400,000+ concerts and play them instantly!
- **5 Legendary Curated Concerts**: Nirvana MTV Unplugged, Queen at Live Aid, Johnny Cash at Folsom Prison, Talking Heads' Stop Making Sense, and The Band's Last Waltz
- **Automatic Spotify Matching**: Songs are automatically matched and loaded from Spotify
- **Spotify Integration**: Stream authentic recordings via Spotify Web Playback SDK
- **Interactive Setlists**: Follow along as songs progress through the concert
- **Venue Atmosphere**: Background images and crowd applause effects between songs
- **Responsive Design**: Works on desktop, tablet, and mobile

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **Spotify Premium account** (required for playback)
- **Spotify Developer account** (free to create)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd concert-time-machine
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Spotify API

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **"Create an App"**
4. Fill in:
   - App name: `Concert Time Machine`
   - App description: `Experience legendary concerts`
5. After creating, copy the **Client ID**
6. Click **"Edit Settings"**
7. Add these Redirect URIs:
   - `http://localhost:5173/callback`
   - (For production) `https://your-app.vercel.app/callback`
8. Click **Save**

### 4. (Optional) Set Up setlist.fm API for Concert Search

**This step is optional but highly recommended!** With a setlist.fm API key, you can search and play ANY of 400,000+ concerts. Without it, you can only use the 5 curated concerts.

1. Go to [setlist.fm API settings](https://www.setlist.fm/settings/api)
2. Log in or create a free account
3. Click **"Apply for an API key"**
4. Fill out the application (free for non-commercial use)
5. Wait for approval (usually within 24 hours)
6. Once approved, copy your API key

### 5. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your credentials
```

Your `.env` file should look like this:

```bash
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
VITE_REDIRECT_URI=http://127.0.0.1:5173/callback

# Optional - enables concert search feature
VITE_SETLISTFM_API_KEY=your_setlistfm_api_key_here
```

### 6. Run the Development Server

```bash
npm run dev
```

Visit `http://127.0.0.1:5173` in your browser (use 127.0.0.1, not localhost!).

### 7. (Optional) Add Crowd Audio Effect

To enable crowd applause between songs:

1. Download a free crowd applause sound from [Freesound.org](https://freesound.org/)
2. Save it as `crowd-applause.mp3`
3. Place it in `public/audio/crowd-applause.mp3`

The app will work without this file, but crowd effects will be disabled.

## Usage

### Basic Usage

1. Click **"Connect with Spotify"** on the homepage
2. Log in to your Spotify Premium account
3. Authorize the app
4. Browse the curated concert collection
5. Click on a concert to start playing
6. Use the player controls to navigate through the setlist

### Search for Concerts (Requires setlist.fm API Key)

1. Click on the **"Search Concerts"** tab
2. Enter an artist name (e.g., "Pink Floyd", "Radiohead", "Bruce Springsteen")
3. Click **Search**
4. Browse through the search results
5. Click on any concert to load it
6. The app will automatically:
   - Find all songs on Spotify
   - Match them to the correct recordings
   - Build a playable concert
7. Your custom concerts are saved in the **"My Concerts"** tab for easy access

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Audio**: Spotify Web Playback SDK + Web Audio API
- **Routing**: React Router v6
- **Deployment**: Vercel (recommended)

## Project Structure

```
concert-time-machine/
├── src/
│   ├── components/
│   │   ├── HomePage.tsx          # Concert selection grid
│   │   ├── ConcertPlayer.tsx     # Main player component
│   │   ├── SetlistDisplay.tsx    # Shows songs with progress
│   │   ├── AudioControls.tsx     # Play/pause/skip controls
│   │   └── VenueInfo.tsx         # Concert metadata display
│   ├── data/
│   │   └── concerts.ts           # Concert data with Spotify URIs
│   ├── hooks/
│   │   ├── useSpotifyPlayer.ts   # Spotify SDK integration
│   │   └── useAudioEffects.ts    # Web Audio API effects
│   ├── utils/
│   │   └── spotifyAuth.ts        # OAuth flow helpers
│   ├── types/
│   │   └── index.ts              # TypeScript definitions
│   ├── App.tsx                   # Main app with routing
│   └── main.tsx                  # Entry point
├── public/
│   └── audio/
│       └── crowd-applause.mp3    # (Optional) Sound effect
└── package.json
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click **"New Project"**
4. Import your repository
5. Add environment variables:
   - `VITE_SPOTIFY_CLIENT_ID`: Your Spotify Client ID
   - `VITE_REDIRECT_URI`: `https://your-app.vercel.app/callback`
6. Deploy
7. Update Spotify App Settings to include your production URL in Redirect URIs

## Known Limitations

- **Spotify Premium required**: Free accounts cannot use the Web Playback SDK
- **Browser compatibility**: Requires modern browsers with Web Audio API support
- **Spotify rate limits**: May encounter API rate limiting with heavy use
- **Track availability**: Some concert recordings may not be available in all regions

## Adding More Concerts

To add new concerts, edit `src/data/concerts.ts`:

1. Find the concert's live album on Spotify
2. For each song, right-click → Share → Copy Spotify URI
3. Add a new concert object following the existing format
4. Find appropriate images (recommend Unsplash for free, high-quality photos)

## Troubleshooting

### "Player not ready" error
- Ensure you have Spotify Premium
- Check that Spotify app isn't already playing on another device
- Try refreshing the page

### "Authentication failed" error
- Verify your Client ID is correct in `.env`
- Check that redirect URI matches exactly in Spotify app settings
- Make sure you're using a Spotify Premium account

### Songs won't play
- Confirm the Spotify URIs are correct in `concerts.ts`
- Some tracks may not be available in your region
- Check browser console for detailed error messages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning or personal use.

## Credits

Built with:
- [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vite.dev/)

Concert data is sourced from publicly available information about historical performances.
