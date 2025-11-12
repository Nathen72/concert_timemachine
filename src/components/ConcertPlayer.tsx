import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { concerts } from '../data/concerts'
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer'
import { useAudioEffects } from '../hooks/useAudioEffects'
import { useToast } from '../contexts/ToastContext'
import { fetchAlbumArt } from '../utils/spotifyImages'
import type { Concert } from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
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

  // Search in both dynamic concerts and curated concerts
  const allConcerts = [...dynamicConcerts, ...concerts]
  const concert = allConcerts.find((c) => c.id === concertId)

  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState([80])
  const [isMuted, setIsMuted] = useState(false)
  const [albumArt, setAlbumArt] = useState<string | null>(null)
  const [albumArtLoading, setAlbumArtLoading] = useState(true)
  const [immersiveMode, setImmersiveMode] = useState(false)

  const { play, pause, nextTrack, previousTrack, player, isReady, error } =
    useSpotifyPlayer(accessToken)
  const { playCrowdApplause } = useAudioEffects()

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
    try {
      const uris = concert.setlist.map((song) => song.spotifyUri)
      await play(uris)
      setIsPlaying(true)
      toast.success('Concert started!')
    } catch (err) {
      toast.error('Failed to start playback')
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

  const handleSongClick = (index: number) => {
    const uris = concert.setlist.slice(index).map((song) => song.spotifyUri)
    play(uris)
    setCurrentSongIndex(index)
    setIsPlaying(true)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  // Listen to Spotify player state changes
  useEffect(() => {
    if (!player) return

    const stateChangeHandler = (state: Spotify.PlaybackState | null) => {
      if (!state) return

      setIsPlaying(!state.paused)

      const trackIndex = concert.setlist.findIndex(
        (song) => song.spotifyUri === state.track_window.current_track.uri
      )
      if (trackIndex !== -1 && trackIndex !== currentSongIndex) {
        setCurrentSongIndex(trackIndex)
        if (trackIndex > currentSongIndex) {
          playCrowdApplause()
        }
      }
    }

    player.addListener('player_state_changed', stateChangeHandler)

    return () => {
      player.removeListener('player_state_changed', stateChangeHandler)
    }
  }, [player, currentSongIndex, concert.setlist, playCrowdApplause])

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error, toast])

  const currentSong = concert.setlist[currentSongIndex]
  const totalDuration = concert.setlist.reduce((acc, song) => acc + song.durationMs, 0)

  return (
    <div className={`min-h-screen bg-cream-base transition-all duration-500 ${immersiveMode ? 'bg-black' : ''}`}>
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2 }}
          src={concert.posterImage}
          alt={`${concert.artist} - ${concert.title}`}
          className="w-full h-full object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-cream-base" />

        {/* Header Controls */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
            </Link>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setImmersiveMode(!immersiveMode)}
                className="text-white hover:bg-white/20 backdrop-blur-sm"
                title="Time Travel Mode"
              >
                <Sparkles className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Badge className="mb-4 bg-white/90 text-charcoal border-0 backdrop-blur-sm">
                Historic Concert
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-white mb-4">
                {concert.artist}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">{concert.venue}</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-2 font-mono">
                  <Calendar className="w-5 h-5" />
                  <span>{concert.date}</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{Math.floor(totalDuration / 60000)} minutes</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Quick Facts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12"
        >
          <Card className="bg-white border-light-gray shadow-subtle">
            <CardContent className="p-6 text-center">
              <Music2 className="w-8 h-8 text-terracotta mx-auto mb-2" />
              <p className="text-2xl font-display text-charcoal">{concert.setlist.length}</p>
              <p className="text-sm text-warm-gray">Songs</p>
            </CardContent>
          </Card>

          {concert.attendance && (
            <Card className="bg-white border-light-gray shadow-subtle">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-sage mx-auto mb-2" />
                <p className="text-2xl font-display text-charcoal">
                  {concert.attendance.toLocaleString()}
                </p>
                <p className="text-sm text-warm-gray">Attendance</p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white border-light-gray shadow-subtle">
            <CardContent className="p-6 text-center">
              <MapPin className="w-8 h-8 text-rose mx-auto mb-2" />
              <p className="text-sm font-medium text-charcoal truncate">{concert.location}</p>
              <p className="text-sm text-warm-gray">Location</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-light-gray shadow-subtle">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-lavender mx-auto mb-2" />
              <p className="text-2xl font-display text-charcoal">
                {Math.floor(totalDuration / 60000)}m
              </p>
              <p className="text-sm text-warm-gray">Duration</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-display text-charcoal mb-4">About This Concert</h2>
          <p className="text-warm-gray leading-relaxed text-lg">
            {concert.description}
          </p>
        </motion.div>

        {/* Setlist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display text-charcoal">Set List</h2>
            <Badge variant="secondary" className="bg-cream-tan text-charcoal border-0">
              {concert.setlist.length} songs
            </Badge>
          </div>

          <Card className="bg-white border-light-gray shadow-card">
            <CardContent className="p-0">
              <div className="divide-y divide-light-gray">
                {concert.setlist.map((song, index) => (
                  <motion.button
                    key={song.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * index }}
                    onClick={() => handleSongClick(index)}
                    className={`w-full text-left px-6 py-4 transition-all hover:bg-cream-tan/30 group ${
                      index === currentSongIndex ? 'bg-terracotta/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`text-sm font-mono w-8 text-center ${
                          index === currentSongIndex
                            ? 'text-terracotta font-semibold'
                            : 'text-warm-gray'
                        }`}
                      >
                        {index + 1}
                      </span>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium truncate ${
                            index === currentSongIndex
                              ? 'text-terracotta'
                              : 'text-charcoal group-hover:text-terracotta'
                          } transition-colors`}
                        >
                          {song.title}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm font-mono text-warm-gray">
                          {Math.floor(song.durationMs / 60000)}:
                          {String(Math.floor((song.durationMs % 60000) / 1000)).padStart(2, '0')}
                        </span>

                        {index === currentSongIndex && isPlaying && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex gap-1 items-end h-4"
                          >
                            <motion.div
                              animate={{ height: ['40%', '100%', '40%'] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                              className="w-1 bg-terracotta rounded-full"
                            />
                            <motion.div
                              animate={{ height: ['100%', '40%', '100%'] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                              className="w-1 bg-terracotta rounded-full"
                            />
                            <motion.div
                              animate={{ height: ['60%', '100%', '60%'] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                              className="w-1 bg-terracotta rounded-full"
                            />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Sticky Audio Player */}
      <AnimatePresence>
        {isReady && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-light-gray backdrop-blur-xl"
            style={{
              backgroundImage: albumArt ? `url(${albumArt})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Blur overlay */}
            <div className="absolute inset-0 bg-white/95 backdrop-blur-2xl" />

            {/* Player Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center gap-4">
                {/* Album Art */}
                <div className="hidden sm:block w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-card">
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

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal truncate">{currentSong.title}</p>
                  <p className="text-sm text-warm-gray truncate">{concert.artist}</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevious}
                    disabled={currentSongIndex === 0}
                    className="hidden sm:flex h-10 w-10 text-charcoal hover:text-terracotta hover:bg-terracotta/10"
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>

                  <Button
                    size="icon"
                    onClick={isPlaying ? handlePause : handlePlay}
                    className="h-12 w-12 rounded-full bg-terracotta hover:bg-terracotta/90 text-white shadow-card"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6 ml-0.5" fill="currentColor" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    disabled={currentSongIndex === concert.setlist.length - 1}
                    className="hidden sm:flex h-10 w-10 text-charcoal hover:text-terracotta hover:bg-terracotta/10"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>

                  {/* Volume */}
                  <div className="hidden md:flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className="h-10 w-10 text-charcoal hover:text-terracotta hover:bg-terracotta/10"
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
                      className="w-24"
                    />
                  </div>
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
    </div>
  )
}
