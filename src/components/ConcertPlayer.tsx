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
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-border/50">
          <CardContent className="pt-8 pb-6 text-center space-y-5">
            <div className="w-16 h-16 mx-auto bg-muted/50 rounded-2xl flex items-center justify-center">
              <Music className="h-7 w-7 text-muted-foreground/70" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Concert not found</h1>
              <p className="text-muted-foreground/80 text-sm">
                The concert you're looking for doesn't exist
              </p>
            </div>
            <Link to="/">
              <Button className="mt-2">
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
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Main Player Area */}
      <div className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Minimal Header */}
        <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-xl border-b border-border/40">
          <div className="container max-w-5xl flex items-center justify-between h-16 px-6">
            <Link to="/">
              <Button variant="ghost" size="sm" className="hover:bg-muted/50">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVenueDetails(true)}
              className="hover:bg-muted/50"
            >
              <Info className="h-4 w-4 mr-2" />
              Info
            </Button>
          </div>
        </div>

        {/* Clean Player Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 lg:p-16">
          <div className="w-full max-w-lg space-y-10">
            {/* Album Art */}
            <div className="aspect-square w-full rounded-2xl overflow-hidden shadow-xl border border-border/50">
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
            <div className="text-center space-y-3 px-4">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
                {currentSong.title}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                {concert.artist}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/80 flex-wrap">
                <span>{concert.venue}</span>
                <span>·</span>
                <span>{concert.date}</span>
                <span>·</span>
                <span>
                  {currentSongIndex + 1} of {concert.setlist.length}
                </span>
              </div>
            </div>

            {/* Refined Player Controls */}
            <Card className="border-border/50">
              <CardContent className="pt-6 space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2.5">
                  <Slider
                    value={[30]}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                    disabled
                  />
                  <div className="flex justify-between text-xs text-muted-foreground/70">
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
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevious}
                    disabled={!isReady || currentSongIndex === 0}
                    className="h-11 w-11 hover:bg-muted/50"
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>

                  <Button
                    size="icon"
                    onClick={isPlaying ? handlePause : handlePlay}
                    disabled={!isReady}
                    className="h-14 w-14 rounded-full"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6 ml-0.5" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    disabled={
                      !isReady || currentSongIndex === concert.setlist.length - 1
                    }
                    className="h-11 w-11 hover:bg-muted/50"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="h-9 w-9 hover:bg-muted/50"
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
                  <p className="text-sm text-center text-muted-foreground/70">
                    Loading player...
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Clean Setlist Sidebar */}
      <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-border/40 bg-muted/20 flex flex-col max-h-[50vh] lg:max-h-screen">
        <div className="p-5 border-b border-border/40 bg-background/60 backdrop-blur-sm sticky top-0 z-10">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Music className="h-4 w-4" />
            Setlist
          </h2>
          <p className="text-sm text-muted-foreground/70 mt-0.5">
            {concert.setlist.length} songs
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {concert.setlist.map((song, index) => (
            <button
              key={song.id}
              onClick={() => handleSongClick(index)}
              className={`w-full text-left px-5 py-3.5 transition-all border-b border-border/30 hover:bg-muted/40 ${
                index === currentSongIndex
                  ? 'bg-muted/50 border-l-2 border-l-primary'
                  : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-mono w-6 ${
                    index === currentSongIndex
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground/60'
                  }`}
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium truncate text-sm ${
                      index === currentSongIndex ? 'text-primary' : ''
                    }`}
                  >
                    {song.title}
                  </p>
                  <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                    {Math.floor(song.durationMs / 60000)}:
                    {String(
                      Math.floor((song.durationMs % 60000) / 1000)
                    ).padStart(2, '0')}
                  </p>
                </div>
                {index === currentSongIndex && isPlaying && (
                  <div className="flex gap-0.5 items-end h-4">
                    <div
                      className="w-0.5 bg-primary animate-pulse rounded-full"
                      style={{ height: '40%' }}
                    />
                    <div
                      className="w-0.5 bg-primary animate-pulse rounded-full"
                      style={{ height: '100%', animationDelay: '0.2s' }}
                    />
                    <div
                      className="w-0.5 bg-primary animate-pulse rounded-full"
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
