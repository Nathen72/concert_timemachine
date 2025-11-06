import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { ConcertPlayer } from './components/ConcertPlayer';
import { getAuthUrl, getAccessTokenFromUrl } from './utils/spotifyAuth';

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessTokenFromUrl();
    if (token) {
      setAccessToken(token);
      window.history.pushState({}, '', '/');
    }
  }, []);

  const handleLogin = () => {
    window.location.href = getAuthUrl();
  };

  if (!accessToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Concert Time Machine
          </h1>
          <p className="text-gray-400 mb-8">
            Experience legendary concerts from the past
          </p>
          <button
            onClick={handleLogin}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full text-lg transition-all duration-200 hover:scale-105 shadow-lg"
          >
            Connect with Spotify
          </button>
          <p className="text-gray-500 text-sm mt-4">
            Note: Spotify Premium required for playback
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/concert/:concertId"
          element={<ConcertPlayer accessToken={accessToken} />}
        />
        <Route path="/callback" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
