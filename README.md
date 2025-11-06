# Concert Time Machine

Experience legendary concerts from history as if you were there. Concert Time Machine lets you relive iconic performances with full setlists, venue information, and immersive audio effects.

## Features

- **5 Legendary Concerts**: Nirvana MTV Unplugged, Queen at Live Aid, Johnny Cash at Folsom Prison, Talking Heads' Stop Making Sense, and The Band's Last Waltz
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

### 4. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Spotify Client ID
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_REDIRECT_URI=http://localhost:5173/callback
```

### 5. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 6. (Optional) Add Crowd Audio Effect

To enable crowd applause between songs:

1. Download a free crowd applause sound from [Freesound.org](https://freesound.org/)
2. Save it as `crowd-applause.mp3`
3. Place it in `public/audio/crowd-applause.mp3`

The app will work without this file, but crowd effects will be disabled.

## Usage

1. Click **"Connect with Spotify"** on the homepage
2. Log in to your Spotify Premium account
3. Authorize the app
4. Browse the concert collection
5. Click on a concert to start playing
6. Use the player controls to navigate through the setlist

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
