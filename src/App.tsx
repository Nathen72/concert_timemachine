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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-6">
            {/* Logo */}
            <div className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center shadow-lg">
              <Music className="w-10 h-10 text-primary-foreground" />
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold">
                Concert Time Machine
              </h1>
              <p className="text-muted-foreground text-lg">
                Experience legendary concerts as if you were there
              </p>
            </div>

            {isLoading && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-sm font-medium">Authenticating with Spotify...</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {authError && !isLoading && (
              <Card className="border-destructive">
                <CardContent className="pt-6 space-y-2">
                  <p className="font-semibold text-destructive">Authentication Error</p>
                  <p className="text-sm text-left text-muted-foreground">
                    {authError === 'unsupported_response_type' && (
                      <>
                        Your Spotify app configuration doesn't support the authentication method.
                        <br /><br />
                        <strong>Try these steps:</strong><br />
                        1. Go to Spotify Developer Dashboard → Your App → Settings<br />
                        2. Check "User Management" - add your Spotify email if in development mode<br />
                        3. Verify the app type is set to "Web App" (not Desktop/Mobile)<br />
                        4. Make sure Redirect URI <code className="text-xs bg-muted px-1 py-0.5 rounded">http://localhost:5173/callback</code> is added exactly<br />
                        5. If you just created the app, wait a few minutes for settings to propagate<br /><br />
                        If this persists, you may need to create a new app or contact Spotify support.
                      </>
                    )}
                    {authError !== 'unsupported_response_type' && `Error: ${authError}`}
                  </p>
                </CardContent>
              </Card>
            )}

            <Button
              className="w-full h-12 text-base bg-[#1DB954] hover:bg-[#1ed760] text-white"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              )}
              {isLoading ? 'Connecting...' : 'Connect with Spotify'}
            </Button>

            <p className="text-muted-foreground text-sm">
              Spotify Premium required for playback
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ToastProvider>
        <PlayerProvider>
          <div className="min-h-screen flex flex-col bg-background">
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
          </div>
        </PlayerProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
