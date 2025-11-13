import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { HomePage } from './components/HomePage';
import { ConcertPlayer } from './components/ConcertPlayer';
import { Header } from './components/Header';
import { ToastProvider } from './contexts/ToastContext';
import { PlayerProvider } from './contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientText } from '@/components/ui/gradient-text';
import { AnimatedBackground } from './components/ui/animated-background';
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

  // Listen for Spotify auth errors from API calls
  useEffect(() => {
    const handleAuthError = () => {
      setAccessToken(null);
      setAuthError('Your Spotify session has expired. Please log in again.');
      localStorage.removeItem('spotify_access_token');
    };

    window.addEventListener('spotify-auth-error', handleAuthError);
    return () => {
      window.removeEventListener('spotify-auth-error', handleAuthError);
    };
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
        <AnimatedBackground variant="blobs" />
        <div className="absolute inset-0 bg-gradient-animated opacity-40 pointer-events-none" />

        {/* Login Card - Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-lg px-4"
        >
          <GlassCard className="border-2 border-white/40 shadow-glow-lg">
            <div className="p-8 sm:p-10 md:p-14 text-center space-y-8 sm:space-y-10">
              {/* Logo with Gradient */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4"
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mx-auto">
                  <motion.div
                    className="absolute inset-0 bg-gradient-primary rounded-3xl rotate-6 shadow-glow-primary"
                    animate={{ rotate: [6, -6, 6] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="relative w-full h-full bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow-lg">
                    <Music className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" />
                  </div>
                </div>
              </motion.div>

              {/* Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold">
                  <GradientText variant="primary" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                    Concert Time Machine
                  </GradientText>
                </h1>
                <p className="text-warm-gray text-lg sm:text-xl md:text-2xl px-2 font-light">
                  Travel back in time and experience legendary concerts
                </p>
              </div>

              {/* Feature Pills - Glassmorphism */}
              <div className="flex flex-wrap gap-3 justify-center">
                <GlassCard className="px-5 py-2.5 border-white/30">
                  <span className="text-sm sm:text-base font-semibold text-gradient-primary">400,000+ Concerts</span>
                </GlassCard>
                <GlassCard className="px-5 py-2.5 border-white/30">
                  <span className="text-sm sm:text-base font-semibold text-gradient-primary">Full Setlists</span>
                </GlassCard>
                <GlassCard className="px-5 py-2.5 border-white/30">
                  <span className="text-sm sm:text-base font-semibold text-gradient-primary">HD Audio</span>
                </GlassCard>
              </div>

              {/* Loading State */}
              {isLoading && (
                <GlassCard className="p-6 border-white/30">
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-gradient-primary" />
                    <p className="text-base font-semibold text-charcoal">Connecting to Spotify...</p>
                  </div>
                </GlassCard>
              )}

              {/* Error State */}
              {authError && !isLoading && (
                <GlassCard className="p-6 border-red-200/50 bg-red-50/50">
                  <p className="font-bold text-red-700 mb-2 text-lg">Authentication Error</p>
                  <p className="text-sm text-left text-warm-gray">
                    {authError === 'unsupported_response_type' && (
                      <>
                        Your Spotify app configuration doesn't support the authentication method.
                        <br /><br />
                        <strong>Try these steps:</strong><br />
                        1. Go to Spotify Developer Dashboard → Your App → Settings<br />
                        2. Check "User Management" - add your Spotify email if in development mode<br />
                        3. Verify the app type is set to "Web App" (not Desktop/Mobile)<br />
                        4. Make sure Redirect URI <code className="text-xs bg-light-gray px-1 py-0.5 rounded">http://localhost:5173/callback</code> is added exactly<br />
                        5. If you just created the app, wait a few minutes for settings to propagate<br /><br />
                        If this persists, you may need to create a new app or contact Spotify support.
                      </>
                    )}
                    {authError !== 'unsupported_response_type' && `Error: ${authError}`}
                  </p>
                </GlassCard>
              )}

              {/* Spotify Login Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  className="w-full h-14 sm:h-16 text-base sm:text-lg md:text-xl font-bold bg-[#1DB954] hover:bg-[#1ed760] active:bg-[#1aa34a] text-white rounded-2xl shadow-glow-lg hover:shadow-glow-lg transition-all duration-300 touch-target"
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 animate-spin mr-3" />
                  ) : (
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 mr-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  )}
                  {isLoading ? 'Connecting...' : 'Connect with Spotify'}
                </Button>
              </motion.div>

              {/* Footer Text */}
              <p className="text-warm-gray text-sm sm:text-base">
                Spotify Premium required for playback
              </p>
            </div>
          </GlassCard>

          {/* Additional Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6 sm:mt-8 text-white/90 text-sm sm:text-base px-4 glass-dark rounded-xl py-3 inline-block mx-auto"
          >
            No account needed. Just connect with Spotify to start listening.
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Protected route wrapper
  const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    if (!accessToken) {
      return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
          <AnimatedBackground variant="blobs" />
          <div className="absolute inset-0 bg-gradient-animated opacity-40 pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 w-full max-w-lg px-4"
          >
            <GlassCard className="border-2 border-white/40 shadow-glow-lg">
              <div className="p-8 sm:p-10 md:p-14 text-center space-y-8 sm:space-y-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-4"
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mx-auto">
                    <motion.div
                      className="absolute inset-0 bg-gradient-primary rounded-3xl rotate-6 shadow-glow-primary"
                      animate={{ rotate: [6, -6, 6] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <div className="relative w-full h-full bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow-lg">
                      <Music className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" />
                    </div>
                  </div>
                </motion.div>
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold">
                    <GradientText variant="primary" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                      Concert Time Machine
                    </GradientText>
                  </h1>
                  <p className="text-warm-gray text-lg sm:text-xl md:text-2xl px-2 font-light">
                    Travel back in time and experience legendary concerts
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  <GlassCard className="px-5 py-2.5 border-white/30">
                    <span className="text-sm sm:text-base font-semibold text-gradient-primary">400,000+ Concerts</span>
                  </GlassCard>
                  <GlassCard className="px-5 py-2.5 border-white/30">
                    <span className="text-sm sm:text-base font-semibold text-gradient-primary">Full Setlists</span>
                  </GlassCard>
                  <GlassCard className="px-5 py-2.5 border-white/30">
                    <span className="text-sm sm:text-base font-semibold text-gradient-primary">HD Audio</span>
                  </GlassCard>
                </div>
                {isLoading && (
                  <GlassCard className="p-6 border-white/30">
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-gradient-primary" />
                      <p className="text-base font-semibold text-charcoal">Connecting to Spotify...</p>
                    </div>
                  </GlassCard>
                )}
                {authError && !isLoading && (
                  <GlassCard className="p-6 border-red-200/50 bg-red-50/50">
                    <p className="font-bold text-red-700 mb-2 text-lg">Authentication Error</p>
                    <p className="text-sm text-left text-warm-gray">
                      {authError === 'unsupported_response_type' && (
                        <>
                          Your Spotify app configuration doesn't support the authentication method.
                          <br /><br />
                          <strong>Try these steps:</strong><br />
                          1. Go to Spotify Developer Dashboard → Your App → Settings<br />
                          2. Check "User Management" - add your Spotify email if in development mode<br />
                          3. Verify the app type is set to "Web App" (not Desktop/Mobile)<br />
                          4. Make sure Redirect URI <code className="text-xs bg-light-gray px-1 py-0.5 rounded">http://localhost:5173/callback</code> is added exactly<br />
                          5. If you just created the app, wait a few minutes for settings to propagate<br /><br />
                          If this persists, you may need to create a new app or contact Spotify support.
                        </>
                      )}
                      {authError !== 'unsupported_response_type' && `Error: ${authError}`}
                    </p>
                  </GlassCard>
                )}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="w-full h-14 sm:h-16 text-base sm:text-lg md:text-xl font-bold bg-[#1DB954] hover:bg-[#1ed760] active:bg-[#1aa34a] text-white rounded-2xl shadow-glow-lg hover:shadow-glow-lg transition-all duration-300 touch-target"
                    onClick={handleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 animate-spin mr-3" />
                    ) : (
                      <svg className="w-6 h-6 sm:w-7 sm:w-7 mr-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                    )}
                    {isLoading ? 'Connecting...' : 'Connect with Spotify'}
                  </Button>
                </motion.div>
                <p className="text-warm-gray text-sm sm:text-base">
                  Spotify Premium required for playback
                </p>
              </div>
            </GlassCard>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-6 sm:mt-8 text-white/90 text-sm sm:text-base px-4 glass-dark rounded-xl py-3 inline-block mx-auto"
            >
              No account needed. Just connect with Spotify to start listening.
            </motion.p>
          </motion.div>
        </div>
      );
    }
    return <>{children}</>;
  };

  return (
    <BrowserRouter>
      <ToastProvider>
        <PlayerProvider>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Header />
                  <HomePage
                    accessToken={accessToken!}
                    dynamicConcerts={dynamicConcerts}
                    onConcertCreated={handleConcertCreated}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/concert/:concertId"
              element={
                <ProtectedRoute>
                  <Header />
                  <ConcertPlayer
                    accessToken={accessToken!}
                    dynamicConcerts={dynamicConcerts}
                  />
                </ProtectedRoute>
              }
            />
            <Route path="/callback" element={<Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </PlayerProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
