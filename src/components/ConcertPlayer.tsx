import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { concerts } from '../data/concerts'
import { useEnrichedConcerts } from '../hooks/useEnrichedConcerts'
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer'
import { useAudioEffects } from '../hooks/useAudioEffects'
import { useToast } from '../contexts/ToastContext'
import { fetchAlbumArt } from '../utils/spotifyImages'
import type { Concert } from '../types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientText } from '@/components/ui/gradient-text'
import {
  ChevronLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music2,
  MapPin,
  Calendar,
  Users,
  Share2,
  Sparkles,
  Clock,
  Shuffle,
  Repeat,
  Repeat1,
} from 'lucide-react'

export const ConcertPlayer = ({
  accessToken,
  dynamicConcerts,
}: {
  accessToken: string
  dynamicConcerts: Concert[]
}) => {
  const { concertId } = useParams()
  const toast = useToast()

  // Enrich curated concerts with Spotify searches
  const { concerts: enrichedConcerts } = useEnrichedConcerts(concerts, accessToken)

  // Search in both dynamic concerts and enriched curated concerts
  const allConcerts = [...dynamicConcerts, ...enrichedConcerts]
  const concert = allConcerts.find((c) => c.id === concertId)


  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState([80])
  const [isMuted, setIsMuted] = useState(false)
  const [albumArt, setAlbumArt] = useState<string | null>(null)
  const [albumArtLoading, setAlbumArtLoading] = useState(true)
  const [heroImage, setHeroImage] = useState<string | null>(null)
  const [heroImageLoading, setHeroImageLoading] = useState(true)
  const [immersiveMode, setImmersiveMode] = useState(false)
  const [playbackPosition, setPlaybackPosition] = useState(0)
  const [currentTrackDuration, setCurrentTrackDuration] = useState(0)
  const [songAlbumArts, setSongAlbumArts] = useState<Map<string, string>>(new Map())
  const [isShuffled, setIsShuffled] = useState(false)
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off')

  // Use ref to track current song index for player state handler
  const currentSongIndexRef = useRef(0)
  useEffect(() => {
    currentSongIndexRef.current = currentSongIndex
  }, [currentSongIndex])

  const { play, pause, nextTrack, previousTrack, player, isReady, error } =
    useSpotifyPlayer(accessToken)
  const { playCrowdApplause } = useAudioEffects()

  // Debug logging for player state
  useEffect(() => {
    console.log('🎵 ConcertPlayer player state:', {
      hasAccessToken: !!accessToken,
      accessTokenLength: accessToken?.length || 0,
      isReady,
      hasPlayer: !!player,
      error
    });
  }, [accessToken, isReady, player, error])

  // Fetch hero image (album art from first track) when concert loads
  useEffect(() => {
    if (!concert || !accessToken) return

    const firstTrackUri = concert.setlist[0]?.spotifyUri
    if (!firstTrackUri) {
      setHeroImage(concert.posterImage)
      setHeroImageLoading(false)
      return
    }

    setHeroImageLoading(true)
    fetchAlbumArt(firstTrackUri, accessToken).then((url) => {
      if (url) {
        setHeroImage(url)
      } else {
        setHeroImage(concert.posterImage)
      }
      setHeroImageLoading(false)
    })
  }, [concert, accessToken])

  // Fetch album art for all songs in setlist
  useEffect(() => {
    if (!concert || !accessToken) return

    concert.setlist.forEach((song) => {
      // Check if we already have this album art
      setSongAlbumArts(prev => {
        if (prev.has(song.spotifyUri)) return prev
        // Fetch in background, silently handle errors (404s are expected for some tracks)
        fetchAlbumArt(song.spotifyUri, accessToken)
          .then((url) => {
            if (url) {
              setSongAlbumArts(current => {
                const next = new Map(current)
                next.set(song.spotifyUri, url)
                return next
              })
            }
          })
          .catch(() => {
            // Silently handle errors - some tracks may not exist
          })
        return prev
      })
    })
  }, [concert, accessToken])

  // Fetch album art when concert or current song changes
  useEffect(() => {
    if (!concert || !accessToken) return

    const currentTrackUri = concert.setlist[currentSongIndex]?.spotifyUri
    if (!currentTrackUri) return

    setAlbumArtLoading(true)
    fetchAlbumArt(currentTrackUri, accessToken).then((url) => {
      if (url) {
        setAlbumArt(url)
      }
      setAlbumArtLoading(false)
    })
  }, [concert, currentSongIndex, accessToken])

  if (!concert) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-cream-base">
        <Card className="max-w-md w-full border-light-gray bg-white shadow-card">
          <CardContent className="pt-8 pb-6 text-center space-y-5">
            <div className="w-16 h-16 mx-auto bg-cream-tan rounded-2xl flex items-center justify-center">
              <Music2 className="h-7 w-7 text-warm-gray" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-display text-charcoal">Concert not found</h1>
              <p className="text-warm-gray text-sm">
                The concert you're looking for doesn't exist
              </p>
            </div>
            <Link to="/">
              <Button className="mt-2 bg-terracotta hover:bg-terracotta/90 text-white">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handlePlay = async () => {
    if (!accessToken) {
      const errorMsg = 'No access token available. Please log in again.';
      console.error('❌', errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!isReady) {
      const errorMsg = 'Player is not ready yet. Please wait a moment.';
      console.warn('⚠️', errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      // Filter out any invalid URIs
      const uris = concert.setlist
        .map((song) => song.spotifyUri)
        .filter((uri) => uri && typeof uri === 'string' && uri.startsWith('spotify:track:'))
      
      if (uris.length === 0) {
        const errorMsg = 'No valid Spotify track URIs found in setlist';
        console.error('❌', errorMsg);
        toast.error(errorMsg);
        return;
      }

      console.log('🎵 handlePlay called with', uris.length, 'tracks out of', concert.setlist.length, 'songs', {
        hasAccessToken: !!accessToken,
        isReady,
        firstFewUris: uris.slice(0, 3)
      })
      
      await play(uris)
      setIsPlaying(true)
      setCurrentSongIndex(0) // Reset to first song
      
      // Immediately check player state to sync current track
      setTimeout(async () => {
        if (player) {
          try {
            const state = await player.getCurrentState()
            if (state && state.track_window.current_track) {
              const currentUri = state.track_window.current_track.uri;
              const trackIndex = concert.setlist.findIndex(
                (song) => {
                  const songUri = song.spotifyUri?.toLowerCase().trim();
                  const stateUri = currentUri?.toLowerCase().trim();
                  return songUri === stateUri;
                }
              )
              if (trackIndex !== -1) {
                setCurrentSongIndex(trackIndex)
              }
            }
          } catch (error) {
            console.warn('⚠️ Error checking initial player state:', error)
          }
        }
      }, 500) // Small delay to let Spotify start playback
      
      toast.success(`Concert started! Playing ${uris.length} songs`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start playback'
      console.error('❌ handlePlay error:', err)
      toast.error(errorMessage)
      setIsPlaying(false)
    }
  }

  const handlePause = () => {
    pause()
    setIsPlaying(false)
  }

  const handleNext = () => {
    nextTrack()
    playCrowdApplause()
    setCurrentSongIndex((prev) =>
      Math.min(prev + 1, concert.setlist.length - 1)
    )
  }

  const handlePrevious = () => {
    previousTrack()
    setCurrentSongIndex((prev) => Math.max(prev - 1, 0))
  }

  const handleSongClick = async (index: number) => {
    if (!accessToken) {
      const errorMsg = 'No access token available. Please log in again.';
      console.error('❌', errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!isReady) {
      const errorMsg = 'Player is not ready yet. Please wait a moment.';
      console.warn('⚠️', errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      // Filter out any invalid URIs and get remaining songs from this index
      const uris = concert.setlist
        .slice(index)
        .map((song) => song.spotifyUri)
        .filter((uri) => uri && typeof uri === 'string' && uri.startsWith('spotify:track:'))
      
      if (uris.length === 0) {
        const errorMsg = 'No valid Spotify track URIs found from this song onwards';
        console.error('❌', errorMsg);
        toast.error(errorMsg);
        return;
      }

      console.log('🎵 handleSongClick called for index', index, 'with', uris.length, 'tracks', {
        hasAccessToken: !!accessToken,
        isReady,
        firstFewUris: uris.slice(0, 3)
      })
      await play(uris)
      setCurrentSongIndex(index)
      setIsPlaying(true)
      
      // Immediately check player state to sync current track
      setTimeout(async () => {
        if (player) {
          try {
            const state = await player.getCurrentState()
            if (state && state.track_window.current_track) {
              const currentUri = state.track_window.current_track.uri;
              const trackIndex = concert.setlist.findIndex(
                (song) => {
                  const songUri = song.spotifyUri?.toLowerCase().trim();
                  const stateUri = currentUri?.toLowerCase().trim();
                  return songUri === stateUri;
                }
              )
              if (trackIndex !== -1) {
                setCurrentSongIndex(trackIndex)
              }
            }
          } catch (error) {
            console.warn('⚠️ Error checking initial player state:', error)
          }
        }
      }, 500) // Small delay to let Spotify start playback
      
      toast.success(`Playing from song ${index + 1}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start playback'
      console.error('❌ handleSongClick error:', err)
      toast.error(errorMessage)
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled)
  }

  const toggleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all')
    else if (repeatMode === 'all') setRepeatMode('one')
    else setRepeatMode('off')
  }

  const nextSong = concert.setlist[currentSongIndex + 1]

  // Listen to Spotify player state changes
  useEffect(() => {
    if (!player || !concert) return

    const stateChangeHandler = (state: Spotify.PlaybackState | null) => {
      if (!state) {
        console.log('🎵 Player state is null');
        return;
      }

      console.log('🎵 Player state changed:', {
        paused: state.paused,
        currentTrackUri: state.track_window.current_track.uri,
        currentTrackName: state.track_window.current_track.name,
        position: state.position,
        duration: state.duration
      });

      setIsPlaying(!state.paused)
      setPlaybackPosition(state.position)
      setCurrentTrackDuration(state.duration)

      // Try to match the current track URI with our setlist
      const currentUri = state.track_window.current_track.uri;
      const trackIndex = concert.setlist.findIndex(
        (song) => {
          // Normalize URIs for comparison (case-insensitive, trim whitespace)
          const songUri = song.spotifyUri?.toLowerCase().trim();
          const stateUri = currentUri?.toLowerCase().trim();
          return songUri === stateUri;
        }
      )
      
      const prevIndex = currentSongIndexRef.current
      
      console.log('🎵 Track matching:', {
        currentUri,
        trackIndex,
        prevIndex,
        setlistUris: concert.setlist.map(s => s.spotifyUri)
      });

      if (trackIndex !== -1 && trackIndex !== prevIndex) {
        console.log(`🎵 Track changed from index ${prevIndex} to ${trackIndex}`);
        setCurrentSongIndex(trackIndex)
        if (trackIndex > prevIndex) {
          playCrowdApplause()
        }
      } else if (trackIndex === -1) {
        // Track not found in setlist - might be a different version or wrong track
        console.warn('⚠️ Current track URI not found in setlist:', currentUri);
      }
    }

    player.addListener('player_state_changed', stateChangeHandler)

    // Poll for position updates and track changes
    const interval = setInterval(async () => {
      try {
        const state = await player.getCurrentState()
        if (state) {
          setPlaybackPosition(state.position)
          setCurrentTrackDuration(state.duration)
          setIsPlaying(!state.paused)
          
          // Also check for track changes in polling
          const currentUri = state.track_window.current_track.uri;
          const trackIndex = concert.setlist.findIndex(
            (song) => {
              const songUri = song.spotifyUri?.toLowerCase().trim();
              const stateUri = currentUri?.toLowerCase().trim();
              return songUri === stateUri;
            }
          )
          
          if (trackIndex !== -1 && trackIndex !== currentSongIndexRef.current) {
            console.log(`🎵 Poll detected track change: ${currentSongIndexRef.current} -> ${trackIndex}`);
            setCurrentSongIndex(trackIndex)
            if (trackIndex > currentSongIndexRef.current) {
              playCrowdApplause()
            }
          }
        }
      } catch (error) {
        // Ignore errors
        console.warn('⚠️ Error polling player state:', error);
      }
    }, 1000)

    return () => {
      player.removeListener('player_state_changed', stateChangeHandler)
      clearInterval(interval)
    }
  }, [player, concert, playCrowdApplause])

  // Show error toast (only once per error message)
  const lastErrorRef = useRef<string | null>(null)
  useEffect(() => {
    if (error && error !== lastErrorRef.current) {
      lastErrorRef.current = error
      toast.error(error)
    }
  }, [error, toast])

  const currentSong = concert.setlist[currentSongIndex]
  const totalDuration = concert.setlist.reduce((acc, song) => acc + song.durationMs, 0)
  
  // Calculate overall concert progress
  const songsCompletedDuration = concert.setlist
    .slice(0, currentSongIndex)
    .reduce((acc, song) => acc + song.durationMs, 0)
  const overallProgress = songsCompletedDuration + playbackPosition
  const overallProgressPercent = totalDuration > 0 ? (overallProgress / totalDuration) * 100 : 0
  const currentSongProgressPercent = currentTrackDuration > 0 ? (playbackPosition / currentTrackDuration) * 100 : 0

  // Format time helper
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }

  // Handle seek
  const handleSeek = async (newPosition: number) => {
    if (!player) return
    try {
      await player.seek(newPosition)
      setPlaybackPosition(newPosition)
    } catch (error) {
      console.error('Error seeking:', error)
    }
  }

  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 300], [0, -150])
  const heroOpacity = useTransform(scrollY, [0, 200], [1, 0])

  return (
    <div className={`min-h-screen bg-cream-base transition-all duration-500 ${immersiveMode ? 'bg-black' : ''}`}>
      {/* Hero Section - Parallax */}
      <motion.div 
        className="relative h-[50vh] md:h-[55vh] overflow-hidden"
        style={{ y: heroY }}
      >
        {heroImageLoading ? (
          <div className="w-full h-full bg-cream-tan animate-pulse" />
        ) : (
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2 }}
            src={heroImage || concert.posterImage}
          alt={`${concert.artist} - ${concert.title}`}
          className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = concert.posterImage
            }}
        />
        )}

        {/* Dynamic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-cream-base" />
        <div className="absolute inset-0 bg-gradient-primary opacity-20 mix-blend-overlay" />

        {/* Header Controls - Glassmorphism */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  className="glass-dark text-white hover:bg-white/30 touch-target min-h-[44px] rounded-xl px-4"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  <span className="text-base font-medium">Back</span>
                </Button>
              </motion.div>
            </Link>

            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setImmersiveMode(!immersiveMode)}
                  className={`glass-dark text-white hover:bg-white/30 touch-target min-h-[44px] min-w-[44px] rounded-xl ${immersiveMode ? 'bg-white/40' : ''}`}
                  title="Time Travel Mode"
                >
                  <Sparkles className="h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="glass-dark text-white hover:bg-white/30 touch-target min-h-[44px] min-w-[44px] rounded-xl"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Hero Content - Floating */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12"
          style={{ opacity: heroOpacity }}
        >
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-6"
              >
                <Badge className="glass-dark text-white border-white/30 shadow-glow px-5 py-2 text-base font-semibold">
                  Historic Concert
                </Badge>
              </motion.div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-display font-bold text-white mb-6 leading-[1.1] tracking-tight">
                {concert.artist}
              </h1>
              
              {/* Floating Metadata Badges */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                <GlassCard className="px-4 py-2 border-white/30">
                  <div className="flex items-center gap-3 text-white">
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span className="font-semibold text-base sm:text-lg truncate max-w-[200px] sm:max-w-none">
                      {concert.venue}
                    </span>
                  </div>
                </GlassCard>
                
                <GlassCard className="px-4 py-2 border-white/30">
                  <div className="flex items-center gap-3 text-white font-mono">
                    <Calendar className="w-5 h-5 flex-shrink-0" />
                    <span className="font-semibold text-base">{concert.date}</span>
                  </div>
                </GlassCard>
                
                <GlassCard className="px-4 py-2 border-white/30">
                  <div className="flex items-center gap-3 text-white">
                    <Clock className="w-5 h-5 flex-shrink-0" />
                    <span className="font-semibold text-base sm:text-lg">
                      {Math.floor(totalDuration / 60000)} minutes
                    </span>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Concert Stats - Horizontal Layout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <GlassCard className="border-2 border-white/30 shadow-glow">
            <div className="p-8">
              <div className="flex flex-wrap items-center justify-around gap-6 lg:gap-8">
                {/* Songs */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0">
                    <Music2 className="w-5 h-5 sm:w-6 sm:h-6 text-terracotta" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-charcoal">
                      {concert.setlist.length}
                    </p>
                    <p className="text-sm sm:text-base text-warm-gray font-medium">Songs</p>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-lavender/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-lavender" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-charcoal">
                      {Math.floor(totalDuration / 60000)}m
                    </p>
                    <p className="text-sm sm:text-base text-warm-gray font-medium">Duration</p>
                  </div>
                </div>

                {/* Attendance */}
          {concert.attendance && (
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-sage" />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-charcoal">
                        {concert.attendance.toLocaleString()}
                      </p>
                      <p className="text-sm sm:text-base text-warm-gray font-medium">Attendance</p>
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-rose" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base sm:text-lg md:text-xl font-semibold text-charcoal truncate max-w-[150px] sm:max-w-none">
                      {concert.location}
                    </p>
                    <p className="text-sm sm:text-base text-warm-gray font-medium">Location</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-gradient-primary mb-8">About This Concert</h2>
          <p className="text-warm-gray leading-relaxed text-lg sm:text-xl md:text-2xl max-w-3xl">
            {concert.description}
          </p>
        </motion.div>

        {/* Setlist */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-gradient-primary">Set List</h2>
            <Badge className="glass-strong text-gradient-primary border-white/30 text-base font-semibold px-4 py-2 shadow-glow">
              {concert.setlist.length} songs
            </Badge>
          </div>

          <div className="space-y-4">
            {concert.setlist.map((song, index) => {
              const isActive = index === currentSongIndex
              const albumArt = songAlbumArts.get(song.spotifyUri)
              
              return (
                <motion.button
                  key={song.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * index }}
                  onClick={() => handleSongClick(index)}
                  disabled={!isReady}
                  whileHover={isReady ? { scale: 1.02, y: -2 } : {}}
                  className={`w-full text-left group touch-target ${
                    isActive ? 'ring-4 ring-terracotta ring-offset-2 shadow-glow-primary' : ''
                  } ${!isReady ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <GlassCard className={cn(
                    "overflow-hidden border-2 transition-all duration-300",
                    isActive
                      ? "border-terracotta/50 shadow-glow-lg"
                      : "border-white/30 hover:border-white/50 hover:shadow-glow"
                  )}>
                    <div className="p-5 sm:p-6">
                      <div className="flex items-center gap-5 sm:gap-6">
                        {/* Album Art Thumbnail - Larger */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-glow bg-cream-tan ring-2 ring-white/20">
                          {albumArt ? (
                            <img
                              src={albumArt}
                              alt={song.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-cream-tan">
                              <Music2 className="w-5 h-5 sm:w-6 sm:h-6 text-warm-gray" />
                            </div>
                          )}
                        </div>

                        {/* Song Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 sm:gap-4 mb-2">
                            <span
                              className={cn(
                                "text-sm sm:text-base font-mono font-bold flex-shrink-0",
                                isActive ? 'text-gradient-primary' : 'text-warm-gray'
                              )}
                            >
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <p
                              className={cn(
                                "text-lg sm:text-xl md:text-2xl font-bold truncate",
                                isActive
                                  ? 'text-gradient-primary'
                                  : 'text-charcoal group-hover:text-gradient-primary'
                              )}
                            >
                              {song.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-warm-gray">
                            <span className="font-mono font-semibold">
                              {Math.floor(song.durationMs / 60000)}:
                              {String(Math.floor((song.durationMs % 60000) / 1000)).padStart(2, '0')}
                            </span>
                            {isActive && isPlaying && (
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-2 text-gradient-primary font-semibold"
                              >
                                <span className="text-xs">●</span>
                                <span className="text-xs">Now Playing</span>
                              </motion.span>
                            )}
                          </div>
                        </div>

                        {/* Play Indicator */}
                        <div className="flex-shrink-0">
                          {isActive && isPlaying ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex gap-1.5 items-center h-8"
                            >
                              <motion.div
                                animate={{ height: ['40%', '100%', '40%'] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                                className="w-1.5 bg-gradient-primary rounded-full"
                              />
                              <motion.div
                                animate={{ height: ['100%', '40%', '100%'] }}
                                transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                                className="w-1.5 bg-gradient-primary rounded-full"
                              />
                              <motion.div
                                animate={{ height: ['60%', '100%', '60%'] }}
                                transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                                className="w-1.5 bg-gradient-primary rounded-full"
                              />
                            </motion.div>
                          ) : (
                            <motion.div 
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              whileHover={{ scale: 1.2 }}
                            >
                              <Play className="w-7 h-7 sm:w-8 sm:h-8 text-gradient-primary" fill="currentColor" />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Enhanced Sticky Audio Player - Glassmorphism */}
      <AnimatePresence>
        {isReady && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t-2 border-white/30 shadow-glow-lg"
          >
            {/* Progress Bar - Overall Concert - Gradient */}
            <div className="h-2 bg-white/20 relative overflow-hidden">
              <motion.div
                className="h-full bg-gradient-primary"
                style={{ width: `${overallProgressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Player Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
              <div className="flex flex-col gap-4">
                {/* Main Player Row */}
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Album Art - Larger with Glow */}
                  <div className="hidden sm:block w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-glow ring-2 ring-white/20">
                    {albumArtLoading ? (
                      <Skeleton className="w-full h-full" />
                    ) : (
                      <img
                        src={albumArt || concert.posterImage}
                        alt={currentSong.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Song Info - Enhanced */}
                  <div className="flex-1 min-w-0">
                    <p className="text-lg sm:text-xl font-bold text-charcoal truncate mb-1">{currentSong.title}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm sm:text-base text-warm-gray truncate font-medium">{concert.artist}</p>
                      {nextSong && (
                        <>
                          <span className="text-warm-gray/50">•</span>
                          <p className="text-sm text-warm-gray/70 truncate hidden md:block">Next: {nextSong.title}</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Controls - Enhanced */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    {/* Shuffle */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleShuffle}
                      className={cn(
                        "h-9 w-9 sm:h-10 sm:w-10 touch-target transition-all",
                        isShuffled
                          ? "text-terracotta bg-terracotta/10"
                          : "text-warm-gray hover:text-terracotta hover:bg-terracotta/10"
                      )}
                      title="Shuffle"
                    >
                      <Shuffle className={cn("h-4 w-4 sm:h-5 sm:w-5", isShuffled && "fill-current")} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePrevious}
                      disabled={currentSongIndex === 0}
                      className="h-10 w-10 sm:h-12 sm:w-12 text-charcoal hover:text-terracotta hover:bg-terracotta/10 touch-target disabled:opacity-30"
                      title="Previous"
                    >
                      <SkipBack className="h-5 w-5 sm:h-6 sm:w-6" />
                    </Button>

                    <motion.div whileHover={isReady ? { scale: 1.1 } : {}} whileTap={isReady ? { scale: 0.9 } : {}}>
                      <Button
                        size="icon"
                        onClick={isPlaying ? handlePause : handlePlay}
                        disabled={!isReady}
                        className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-primary hover:shadow-glow-lg text-white shadow-glow-primary touch-target transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!isReady ? "Player is initializing..." : isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? (
                          <Pause className="h-7 w-7 sm:h-8 sm:w-8" />
                        ) : (
                          <Play className="h-7 w-7 sm:h-8 sm:w-8 ml-0.5" fill="currentColor" />
                        )}
                      </Button>
                    </motion.div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleNext}
                      disabled={currentSongIndex === concert.setlist.length - 1}
                      className="h-10 w-10 sm:h-12 sm:w-12 text-charcoal hover:text-terracotta hover:bg-terracotta/10 touch-target disabled:opacity-30"
                      title="Next"
                    >
                      <SkipForward className="h-5 w-5 sm:h-6 sm:w-6" />
                    </Button>

                    {/* Repeat */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleRepeat}
                      className={cn(
                        "h-9 w-9 sm:h-10 sm:w-10 touch-target transition-all",
                        repeatMode !== 'off'
                          ? "text-terracotta bg-terracotta/10"
                          : "text-warm-gray hover:text-terracotta hover:bg-terracotta/10"
                      )}
                      title={repeatMode === 'one' ? 'Repeat One' : repeatMode === 'all' ? 'Repeat All' : 'Repeat Off'}
                    >
                      {repeatMode === 'one' ? (
                        <Repeat1 className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                      ) : (
                        <Repeat className={cn("h-4 w-4 sm:h-5 sm:w-5", repeatMode === 'all' && "fill-current")} />
                      )}
                    </Button>

                    {/* Volume */}
                    <div className="hidden lg:flex items-center gap-2 ml-2 border-l border-light-gray pl-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMute}
                        className="h-10 w-10 text-charcoal hover:text-terracotta hover:bg-terracotta/10 touch-target"
                        title={isMuted || volume[0] === 0 ? "Unmute" : "Mute"}
                      >
                        {isMuted || volume[0] === 0 ? (
                          <VolumeX className="h-5 w-5" />
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </Button>
                      <Slider
                        value={isMuted ? [0] : volume}
                        max={100}
                        step={1}
                        onValueChange={(value) => {
                          setVolume(value)
                          setIsMuted(false)
                        }}
                        className="w-24 xl:w-32"
                      />
                    </div>
                  </div>
                </div>

                {/* Progress Bar - Current Song */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-xs sm:text-sm font-mono font-semibold text-warm-gray w-12 sm:w-16 text-right">
                    {formatTime(playbackPosition)}
                  </span>
                  <div className="flex-1 relative group">
                    <Slider
                      value={[currentSongProgressPercent]}
                      max={100}
                      step={0.1}
                      onValueChange={(value) => {
                        const newPosition = (value[0] / 100) * currentTrackDuration
                        handleSeek(newPosition)
                      }}
                      className="w-full cursor-pointer"
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-mono font-semibold text-warm-gray w-12 sm:w-16">
                    {formatTime(currentTrackDuration || currentSong.durationMs)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {!isReady && !error && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="bg-white border-light-gray shadow-modal">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-2 h-2 bg-terracotta rounded-full animate-pulse" />
              <p className="text-sm text-charcoal">Loading player...</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md">
          <Card className="bg-red-50 border-red-200 shadow-modal">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-800 mb-1">Player Error</p>
                  <p className="text-xs text-red-700 whitespace-pre-line">{error}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="mt-3 text-xs"
                  >
                    Reload Page
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
