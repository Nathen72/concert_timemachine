import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { ConcertPlayer } from './components/ConcertPlayer';
import { Header, MobileNav } from './components/Layout';
import { ToastProvider } from './contexts/ToastContext';
import { PlayerProvider } from './contexts/PlayerContext';
import Button from './design-system/Button';
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto animate-fade-in">
          {/* Logo */}
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center shadow-glow-lg">
            <svg
              className="w-14 h-14 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Concert Time Machine
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Experience legendary concerts as if you were there
          </p>

          {isLoading && (
            <div className="mb-6 p-4 glass rounded-xl border-primary-500/30 animate-pulse">
              <div className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-primary-300 font-medium">Authenticating with Spotify...</p>
              </div>
            </div>
          )}

          {authError && !isLoading && (
            <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-xl backdrop-blur-sm animate-slide-down">
              <p className="text-error font-semibold mb-2">Authentication Error</p>
              <p className="text-error-light text-sm text-left">
                {authError === 'unsupported_response_type' && (
                  <>
                    Your Spotify app configuration doesn't support the authentication method.
                    <br /><br />
                    <strong>Try these steps:</strong><br />
                    1. Go to Spotify Developer Dashboard → Your App → Settings<br />
                    2. Check "User Management" - add your Spotify email if in development mode<br />
                    3. Verify the app type is set to "Web App" (not Desktop/Mobile)<br />
                    4. Make sure Redirect URI <code className="text-xs bg-black/30 px-1 py-0.5 rounded">http://127.0.0.1:5173/callback</code> is added exactly<br />
                    5. If you just created the app, wait a few minutes for settings to propagate<br /><br />
                    If this persists, you may need to create a new app or contact Spotify support.
                  </>
                )}
                {authError !== 'unsupported_response_type' && `Error: ${authError}`}
              </p>
            </div>
          )}

          <Button
            variant="spotify"
            size="lg"
            fullWidth
            onClick={handleLogin}
            disabled={isLoading}
            loading={isLoading}
            icon={
              !isLoading && (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              )
            }
          >
            {isLoading ? undefined : 'Connect with Spotify'}
          </Button>

          <p className="text-gray-500 text-sm mt-6">
            Spotify Premium required for playback
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ToastProvider>
        <PlayerProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route
                  path="/"
                  element={
                    <HomePage
                      accessToken={accessToken}
                      dynamicConcerts={dynamicConcerts}
                      onConcertCreated={handleConcertCreated}
                    />
                  }
                />
                <Route
                  path="/concert/:concertId"
                  element={
                    <ConcertPlayer
                      accessToken={accessToken}
                      dynamicConcerts={dynamicConcerts}
                    />
                  }
                />
                <Route path="/callback" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <MobileNav />
          </div>
        </PlayerProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
