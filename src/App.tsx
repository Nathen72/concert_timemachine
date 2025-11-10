import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { ConcertPlayer } from './components/ConcertPlayer';
import { Header } from './components/Header';
import { ToastProvider } from './contexts/ToastContext';
import { PlayerProvider } from './contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Music, Loader2 } from 'lucide-react';
import { getAuthUrl, getAuthorizationCodeFromUrl, getAuthErrorFromUrl, exchangeCodeForToken } from './utils/spotifyAuth';
import type { Concert } from './types';

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [dynamicConcerts, setDynamicConcerts] = useState<Concert[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for stored token first
    const storedToken = localStorage.getItem('spotify_access_token');
    if (storedToken) {
      setAccessToken(storedToken);
      // Clear URL params if we have a stored token
      if (window.location.search.includes('code=') || window.location.search.includes('error=')) {
        window.history.replaceState({}, '', '/');
      }
      return;
    }

    // Otherwise check for authorization code
    const code = getAuthorizationCodeFromUrl();
    const error = getAuthErrorFromUrl();
    
    if (error) {
      setAuthError(error);
      window.history.replaceState({}, '', '/');
      return;
    }
    
    if (code) {
      // Check if we've already processed this code (prevent double processing)
      const processedCode = sessionStorage.getItem('processed_auth_code');
      if (processedCode === code) {
        console.log('Code already processed, skipping');
        window.history.replaceState({}, '', '/');
        return;
      }
      
      // Mark this code as being processed
      sessionStorage.setItem('processed_auth_code', code);
      
      // Exchange authorization code for access token
      setIsLoading(true);
      exchangeCodeForToken(code)
        .then((token) => {
          if (token) {
            // Store token in localStorage for persistence
            localStorage.setItem('spotify_access_token', token);
            setAccessToken(token);
            setAuthError(null);
            // Clear the processed code marker
            sessionStorage.removeItem('processed_auth_code');
          } else {
            setAuthError('Failed to exchange authorization code for token. The code may have expired. Please try logging in again.');
            // Clear any stored code verifier and processed code
            sessionStorage.removeItem('spotify_code_verifier');
            sessionStorage.removeItem('processed_auth_code');
          }
          setIsLoading(false);
          window.history.replaceState({}, '', '/');
        })
        .catch((err) => {
          console.error('Error exchanging code:', err);
          setAuthError('Failed to authenticate with Spotify. Please try logging in again.');
          setIsLoading(false);
          sessionStorage.removeItem('processed_auth_code');
          window.history.replaceState({}, '', '/');
        });
    }
  }, []);

  const handleConcertCreated = (concert: Concert) => {
    setDynamicConcerts(prev => {
      // Check if concert already exists, if so replace it
      const existingIndex = prev.findIndex(c => c.id === concert.id);
      if (existingIndex >= 0) {
        const newConcerts = [...prev];
        newConcerts[existingIndex] = concert;
        return newConcerts;
      }
      // Otherwise add it to the beginning
      return [concert, ...prev];
    });
  };

  const handleLogin = async () => {
    try {
      const authUrl = await getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error generating auth URL:', error);
      setAuthError('Failed to start authentication');
    }
  };

  if (!accessToken) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 dark:from-violet-950 dark:via-purple-950 dark:to-indigo-950">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6TTAgNDRjMC02LjYyNyA1LjM3My0xMiAxMi0xMnMxMiA1LjM3MyAxMiAxMi01LjM3MyAxMi0xMiAxMlMwIDUwLjYyNyAwIDQ0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

          {/* Animated Orbs */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-md animate-slide-up">
          <Card className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-white/20 shadow-2xl">
            <CardContent className="p-8 sm:p-12 text-center space-y-8">
              {/* Logo with Gradient */}
              <div className="space-y-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl rotate-6 animate-pulse"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-glow-lg">
                    <Music className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                </div>
              </div>

              {/* Heading */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Concert Time Machine
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
                  Travel back in time and experience legendary concerts
                </p>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-2 justify-center">
                <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">
                  400,000+ Concerts
                </div>
                <div className="px-4 py-2 bg-pink-100 dark:bg-pink-900/30 rounded-full text-xs sm:text-sm font-medium text-pink-700 dark:text-pink-300">
                  Full Setlists
                </div>
                <div className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-xs sm:text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  HD Audio
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/30">
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-600 dark:text-purple-400" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Connecting to Spotify...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {authError && !isLoading && (
                <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                  <p className="font-semibold text-red-700 dark:text-red-400 mb-2">Authentication Error</p>
                  <p className="text-xs sm:text-sm text-left text-gray-600 dark:text-gray-400">
                    {authError === 'unsupported_response_type' && (
                      <>
                        Your Spotify app configuration doesn't support the authentication method.
                        <br /><br />
                        <strong>Try these steps:</strong><br />
                        1. Go to Spotify Developer Dashboard → Your App → Settings<br />
                        2. Check "User Management" - add your Spotify email if in development mode<br />
                        3. Verify the app type is set to "Web App" (not Desktop/Mobile)<br />
                        4. Make sure Redirect URI <code className="text-xs bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded">http://localhost:5173/callback</code> is added exactly<br />
                        5. If you just created the app, wait a few minutes for settings to propagate<br /><br />
                        If this persists, you may need to create a new app or contact Spotify support.
                      </>
                    )}
                    {authError !== 'unsupported_response_type' && `Error: ${authError}`}
                  </p>
                </div>
              )}

              {/* Spotify Login Button */}
              <Button
                className="w-full h-14 text-base sm:text-lg font-semibold bg-[#1DB954] hover:bg-[#1ed760] active:bg-[#1aa34a] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin mr-3" />
                ) : (
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                )}
                {isLoading ? 'Connecting...' : 'Connect with Spotify'}
              </Button>

              {/* Footer Text */}
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                Spotify Premium required for playback
              </p>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <p className="text-center mt-6 text-white/90 text-sm">
            No account needed. Just connect with Spotify to start listening.
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ToastProvider>
        <PlayerProvider>
          <div className="min-h-screen flex flex-col bg-background">
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Header />
                    <HomePage
                      accessToken={accessToken}
                      dynamicConcerts={dynamicConcerts}
                      onConcertCreated={handleConcertCreated}
                    />
                  </>
                }
              />
              <Route
                path="/concert/:concertId"
                element={
                  <>
                    <Header />
                    <ConcertPlayer
                      accessToken={accessToken}
                      dynamicConcerts={dynamicConcerts}
                    />
                  </>
                }
              />
              <Route path="/callback" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </PlayerProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
