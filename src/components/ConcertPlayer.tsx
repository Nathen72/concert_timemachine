import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ChevronLeft,
  Info,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  MapPin,
  Calendar,
  Users,
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
  const [showVenueDetails, setShowVenueDetails] = useState(false)
  const [volume, setVolume] = useState([80])
  const [isMuted, setIsMuted] = useState(false)
  const [albumArt, setAlbumArt] = useState<string | null>(null)
  const [albumArtLoading, setAlbumArtLoading] = useState(true)

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
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Music className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Concert Not Found</h1>
              <p className="text-muted-foreground">
                The concert you're looking for doesn't exist.
              </p>
            </div>
            <Link to="/">
              <Button>
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
    // TODO: Connect to Spotify player volume
  }

  // Listen to Spotify player state changes
  useEffect(() => {
    if (!player) return

    const stateChangeHandler = (state: Spotify.PlaybackState | null) => {
      if (!state) return

      // Update playing state
      setIsPlaying(!state.paused)

      // Detect song changes
      const trackIndex = concert.setlist.findIndex(
        (song) => song.spotifyUri === state.track_window.current_track.uri
      )
      if (trackIndex !== -1 && trackIndex !== currentSongIndex) {
        setCurrentSongIndex(trackIndex)
        if (trackIndex > currentSongIndex) {
          // Moving forward - play applause
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Main Player Area */}
      <div className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b">
          <div className="container flex items-center justify-between h-16 px-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVenueDetails(true)}
            >
              <Info className="h-4 w-4 mr-2" />
              Concert Info
            </Button>
          </div>
        </div>

        {/* Player Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 lg:p-12">
          <div className="w-full max-w-2xl space-y-8">
            {/* Album Art */}
            <div className="aspect-square w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-2xl">
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
            <div className="text-center space-y-2 px-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                {currentSong.title}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                {concert.artist}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground flex-wrap">
                <span>{concert.venue}</span>
                <span>•</span>
                <span>{concert.date}</span>
                <span>•</span>
                <span>
                  Track {currentSongIndex + 1} of {concert.setlist.length}
                </span>
              </div>
            </div>

            {/* Player Controls */}
            <Card>
              <CardContent className="pt-6 space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <Slider
                    value={[30]}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                    disabled
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0:00</span>
                    <span>
                      {Math.floor(currentSong.durationMs / 60000)}:
                      {String(
                        Math.floor((currentSong.durationMs % 60000) / 1000)
                      ).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevious}
                    disabled={!isReady || currentSongIndex === 0}
                    className="h-12 w-12"
                  >
                    <SkipBack className="h-6 w-6" />
                  </Button>

                  <Button
                    size="icon"
                    onClick={isPlaying ? handlePause : handlePlay}
                    disabled={!isReady}
                    className="h-16 w-16 rounded-full shadow-lg"
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8 ml-1" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    disabled={
                      !isReady || currentSongIndex === concert.setlist.length - 1
                    }
                    className="h-12 w-12"
                  >
                    <SkipForward className="h-6 w-6" />
                  </Button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="h-9 w-9"
                  >
                    {isMuted || volume[0] === 0 ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
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
                    className="flex-1"
                  />
                </div>

                {/* Status */}
                {!isReady && !error && (
                  <p className="text-sm text-center text-muted-foreground">
                    Loading player...
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Setlist Sidebar */}
      <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l bg-muted/30 flex flex-col max-h-[50vh] lg:max-h-screen">
        <div className="p-4 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Music className="h-5 w-5" />
            Setlist
          </h2>
          <p className="text-sm text-muted-foreground">
            {concert.setlist.length} songs
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {concert.setlist.map((song, index) => (
            <button
              key={song.id}
              onClick={() => handleSongClick(index)}
              className={`w-full text-left px-4 py-3 transition-all border-b hover:bg-muted/50 ${
                index === currentSongIndex
                  ? 'bg-primary/10 border-l-4 border-l-primary'
                  : 'border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-mono w-6 ${
                    index === currentSongIndex
                      ? 'text-primary font-bold'
                      : 'text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium truncate ${
                      index === currentSongIndex ? 'text-primary' : ''
                    }`}
                  >
                    {song.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {Math.floor(song.durationMs / 60000)}:
                    {String(
                      Math.floor((song.durationMs % 60000) / 1000)
                    ).padStart(2, '0')}
                  </p>
                </div>
                {index === currentSongIndex && isPlaying && (
                  <div className="flex gap-0.5 items-end h-4">
                    <div
                      className="w-0.5 bg-primary animate-pulse"
                      style={{ height: '40%' }}
                    />
                    <div
                      className="w-0.5 bg-primary animate-pulse"
                      style={{ height: '100%', animationDelay: '0.2s' }}
                    />
                    <div
                      className="w-0.5 bg-primary animate-pulse"
                      style={{ height: '60%', animationDelay: '0.4s' }}
                    />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Venue Details Dialog */}
      <Dialog open={showVenueDetails} onOpenChange={setShowVenueDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{concert.title}</DialogTitle>
            <DialogDescription>{concert.artist}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">Venue</span>
                </div>
                <p className="text-lg">{concert.venue}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Date</span>
                </div>
                <p className="text-lg">{concert.date}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">Location</span>
                </div>
                <p className="text-lg">{concert.location}</p>
              </div>

              {concert.attendance && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Attendance</span>
                  </div>
                  <p className="text-lg">{concert.attendance.toLocaleString()}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                About
              </h3>
              <p className="text-sm leading-relaxed">{concert.description}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
