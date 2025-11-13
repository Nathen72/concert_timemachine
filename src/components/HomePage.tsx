import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { concerts } from '../data/concerts'
import { useEnrichedConcerts } from '../hooks/useEnrichedConcerts'
import { ConcertSearch } from './ConcertSearch'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientText } from '@/components/ui/gradient-text'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { Search, Play, Calendar, MapPin, Music2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchAlbumArtCached, fetchArtistImage } from '../utils/spotifyImages'
import type { Concert } from '../types'

interface HomePageProps {
  accessToken: string
  dynamicConcerts: Concert[]
  onConcertCreated: (concert: Concert) => void
}

// Decade filter type
type Decade = 'all' | '60s' | '70s' | '80s' | '90s' | '00s' | '10s'

// Helper function to get decade from date
function getDecade(dateString: string): string {
  const year = new Date(dateString).getFullYear()
  if (year >= 1960 && year < 1970) return '60s'
  if (year >= 1970 && year < 1980) return '70s'
  if (year >= 1980 && year < 1990) return '80s'
  if (year >= 1990 && year < 2000) return '90s'
  if (year >= 2000 && year < 2010) return '00s'
  if (year >= 2010 && year < 2020) return '10s'
  return 'all'
}

// Helper function to get accent color based on decade
function getDecadeColor(decade: string): string {
  const colors: Record<string, string> = {
    '60s': 'rose',      // Dusty Rose
    '70s': 'terracotta', // Terracotta
    '80s': 'lavender',   // Soft Lavender
    '90s': 'teal',       // Muted Teal
    '00s': 'sage',       // Sage Green
    '10s': 'terracotta'  // Terracotta
  }
  return colors[decade] || 'terracotta'
}

export const HomePage = ({ accessToken, onConcertCreated }: HomePageProps) => {
  const [selectedDecade, setSelectedDecade] = useState<Decade>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [concertImages, setConcertImages] = useState<Map<string, string>>(new Map())
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set())

  // Enrich concerts with Spotify track searches
  const { concerts: enrichedConcerts, isEnriching } = useEnrichedConcerts(concerts, accessToken)

  // Filter concerts by decade and search
  const filteredConcerts = enrichedConcerts.filter(concert => {
    const matchesDecade = selectedDecade === 'all' || getDecade(concert.date) === selectedDecade
    const matchesSearch = !searchQuery ||
      concert.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      concert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      concert.venue.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDecade && matchesSearch
  })

  // Featured concert (first concert in the list)
  const featuredConcert = filteredConcerts[0]
  const recentConcerts = filteredConcerts.slice(1, 7)

  // Fetch album art for concerts when they're displayed (album art is better for concert thumbnails)
  useEffect(() => {
    if (!accessToken) return

    const concertsToLoad = showSearch && searchQuery 
      ? filteredConcerts 
      : [featuredConcert, ...recentConcerts].filter(Boolean)

    concertsToLoad.forEach((concert) => {
      if (!concert || concertImages.has(concert.id) || imageLoading.has(concert.id)) return

      setImageLoading(prev => new Set(prev).add(concert.id))
      
      // Prioritize album art (first track) as it's more representative of the concert
      const firstTrackUri = concert.setlist[0]?.spotifyUri
      if (firstTrackUri) {
        fetchAlbumArtCached(firstTrackUri, accessToken).then((albumArt) => {
          if (albumArt) {
            setConcertImages(prev => new Map(prev).set(concert.id, albumArt))
            setImageLoading(prev => {
              const next = new Set(prev)
              next.delete(concert.id)
              return next
            })
          } else {
            // Fallback to artist image if album art not available
            fetchArtistImage(concert.artist, accessToken).then((artistImage) => {
              if (artistImage) {
                setConcertImages(prev => new Map(prev).set(concert.id, artistImage))
              }
              setImageLoading(prev => {
                const next = new Set(prev)
                next.delete(concert.id)
                return next
              })
            }).catch(() => {
              setImageLoading(prev => {
                const next = new Set(prev)
                next.delete(concert.id)
                return next
              })
            })
          }
        }).catch(() => {
          // If album art fetch fails, try artist image
          fetchArtistImage(concert.artist, accessToken).then((artistImage) => {
            if (artistImage) {
              setConcertImages(prev => new Map(prev).set(concert.id, artistImage))
            }
            setImageLoading(prev => {
              const next = new Set(prev)
              next.delete(concert.id)
              return next
            })
          }).catch(() => {
            setImageLoading(prev => {
              const next = new Set(prev)
              next.delete(concert.id)
              return next
            })
          })
        })
      } else {
        // No track URI, try artist image
        fetchArtistImage(concert.artist, accessToken).then((artistImage) => {
          if (artistImage) {
            setConcertImages(prev => new Map(prev).set(concert.id, artistImage))
          }
          setImageLoading(prev => {
            const next = new Set(prev)
            next.delete(concert.id)
            return next
          })
        }).catch(() => {
          setImageLoading(prev => {
            const next = new Set(prev)
            next.delete(concert.id)
            return next
          })
        })
      }
    })
  }, [accessToken, filteredConcerts, showSearch, searchQuery, featuredConcert, recentConcerts])

  // Helper to get image for a concert
  const getConcertImage = (concert: Concert) => {
    // Use Spotify image if available, otherwise fallback to posterImage
    const spotifyImage = concertImages.get(concert.id)
    if (spotifyImage) return spotifyImage
    // Only use posterImage if we're not loading and don't have a Spotify image
    if (!imageLoading.has(concert.id)) {
      return concert.posterImage
    }
    // Return a placeholder while loading to prevent flashing
    return concert.posterImage
  }

  const isImageLoading = (concertId: string) => {
    return imageLoading.has(concertId)
  }

  const decades: { value: Decade; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: concerts.length },
    { value: '60s', label: '1960s', count: concerts.filter(c => getDecade(c.date) === '60s').length },
    { value: '70s', label: '1970s', count: concerts.filter(c => getDecade(c.date) === '70s').length },
    { value: '80s', label: '1980s', count: concerts.filter(c => getDecade(c.date) === '80s').length },
    { value: '90s', label: '1990s', count: concerts.filter(c => getDecade(c.date) === '90s').length },
    { value: '00s', label: '2000s', count: concerts.filter(c => getDecade(c.date) === '00s').length },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <AnimatedBackground variant="blobs" />
      
      {/* Additional animated gradient overlay */}
      <div className="fixed inset-0 bg-gradient-animated opacity-30 pointer-events-none" />

      {/* Main Content */}
      <main className="relative z-10 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-12 mb-24"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-6 py-3 glass-strong rounded-full border border-white/30 shadow-glow-primary mb-4"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-terracotta" />
            </motion.div>
            <span className="text-sm font-semibold font-mono text-gradient-primary tracking-wide">
              Step into music history
            </span>
          </motion.div>

          {/* Hero Heading - Massive */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-hero font-display font-bold mb-6 leading-[1.1] tracking-tight"
          >
            Pick a Concert from<br />
            <GradientText variant="primary" className="text-hero">
              Music History
            </GradientText>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl sm:text-3xl md:text-4xl text-warm-gray max-w-4xl mx-auto leading-relaxed font-light mb-12"
          >
            Experience legendary concerts exactly as they happened, with full setlists and immersive audio.
          </motion.p>

          {/* Floating Glassmorphism Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-3xl mx-auto px-4"
          >
            <GlassCard className="p-6 sm:p-8 shadow-modal hover:shadow-glow-lg transition-all duration-500">
              <div className="relative">
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10">
                  <Search className="h-6 w-6 sm:h-7 sm:w-7 text-terracotta" />
                </div>
                <Input
                  placeholder="Search by artist, venue, or concert name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    if (e.target.value) setShowSearch(true)
                  }}
                  onFocus={() => setShowSearch(true)}
                  className="pl-16 sm:pl-20 pr-16 sm:pr-20 h-16 sm:h-20 text-lg sm:text-xl border-2 border-white/30 bg-white/50 rounded-2xl focus:ring-4 focus:ring-terracotta/30 focus:border-terracotta transition-all touch-target shadow-subtle focus:bg-white/70"
                />
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => {
                      setSearchQuery('')
                      setShowSearch(false)
                    }}
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 text-warm-gray hover:text-charcoal transition-colors text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/50"
                  >
                    ×
                  </motion.button>
                )}
              </div>
              {!searchQuery && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 flex flex-wrap gap-3 justify-center"
                >
                  <span className="text-sm sm:text-base text-warm-gray font-medium">Try searching for:</span>
                  <Badge 
                    variant="outline" 
                    className="text-sm cursor-pointer hover:bg-gradient-primary hover:text-white hover:border-transparent transition-all px-4 py-1.5" 
                    onClick={() => setSearchQuery('Nirvana')}
                  >
                    Nirvana
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="text-sm cursor-pointer hover:bg-gradient-primary hover:text-white hover:border-transparent transition-all px-4 py-1.5" 
                    onClick={() => setSearchQuery('Queen')}
                  >
                    Queen
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="text-sm cursor-pointer hover:bg-gradient-primary hover:text-white hover:border-transparent transition-all px-4 py-1.5" 
                    onClick={() => setSearchQuery('The Beatles')}
                  >
                    The Beatles
                  </Badge>
                </motion.div>
              )}
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* Decade Filters - Large Interactive Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-24"
        >
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-10 px-4">
            {decades.map((decade, index) => {
              const isSelected = selectedDecade === decade.value
              const decadeGradient = decade.value === 'all' 
                ? 'bg-gradient-primary' 
                : `bg-gradient-${decade.value}` as 'bg-gradient-60s' | 'bg-gradient-70s' | 'bg-gradient-80s' | 'bg-gradient-90s' | 'bg-gradient-00s'
              
              const glowClass = decade.value === 'all'
                ? 'shadow-glow-primary'
                : decade.value === '60s' ? 'shadow-glow-rose'
                : decade.value === '70s' ? 'shadow-glow-primary'
                : decade.value === '80s' ? 'shadow-glow-lavender'
                : decade.value === '90s' ? 'shadow-glow-teal'
                : 'shadow-glow-sage'
              
              return (
                <motion.button
                  key={decade.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  onClick={() => setSelectedDecade(decade.value)}
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative group min-w-[200px] sm:min-w-[220px] md:min-w-[240px]",
                    "rounded-2xl overflow-hidden transition-all duration-500",
                    "touch-target min-h-[200px] sm:min-h-[220px]",
                    isSelected && glowClass
                  )}
                >
                  <GlassCard 
                    variant={isSelected ? "strong" : "default"}
                    className={cn(
                      "h-full relative overflow-hidden border-2 transition-all duration-500",
                      isSelected 
                        ? "border-white/50 shadow-glow-lg" 
                        : "border-white/20 hover:border-white/40"
                    )}
                  >
                    {/* Gradient Background */}
                    <div className={cn(
                      "absolute inset-0 opacity-20 transition-opacity duration-500",
                      isSelected ? "opacity-40" : "group-hover:opacity-30",
                      decadeGradient
                    )} />
                    
                    {/* Animated gradient overlay on hover */}
                    {!isSelected && (
                      <motion.div
                        className={cn("absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500", decadeGradient)}
                        initial={false}
                      />
                    )}
                    
                    <div className="relative z-10 p-8 flex flex-col items-center justify-center h-full text-center space-y-4">
                      <motion.h3
                        className={cn(
                          "text-2xl sm:text-3xl md:text-4xl font-display font-bold transition-all duration-300",
                          isSelected 
                            ? decade.value === 'all' ? "text-gradient-primary" : `text-gradient-${decade.value}`
                            : "text-charcoal group-hover:text-terracotta"
                        )}
                        animate={isSelected ? { scale: 1.1 } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {decade.label}
                      </motion.h3>
                      
                      <motion.div
                        className={cn(
                          "text-5xl sm:text-6xl md:text-7xl font-bold transition-all duration-300",
                          isSelected 
                            ? decade.value === 'all' ? "text-gradient-primary" : `text-gradient-${decade.value}`
                            : "text-warm-gray group-hover:text-terracotta/80"
                        )}
                        animate={isSelected ? { scale: 1.15 } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {decade.count}
                      </motion.div>
                      
                      <p className="text-sm sm:text-base text-warm-gray font-medium">
                        {decade.count === 1 ? 'concert' : 'concerts'}
                      </p>
                    </div>
                    
                    {/* Selected Badge */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        className="absolute top-4 right-4 z-20"
                      >
                        <Badge className="bg-white/90 text-terracotta border-0 shadow-glow px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
                          ✓ Selected
                        </Badge>
                      </motion.div>
                    )}
                  </GlassCard>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Search Tab (when search is active) */}
        {showSearch && searchQuery && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-charcoal">Search Results</h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowSearch(false)
                  setSearchQuery('')
                }}
                className="text-warm-gray hover:text-terracotta font-medium"
              >
                Clear search
              </Button>
            </div>
            {filteredConcerts.length === 0 ? (
              <Card className="p-8 sm:p-12 text-center bg-white border-light-gray">
                <Music2 className="w-10 h-10 sm:w-12 sm:h-12 text-warm-gray mx-auto mb-4" />
                <p className="text-base sm:text-lg text-charcoal mb-2">No concerts found</p>
                <p className="text-sm sm:text-base text-warm-gray">Try a different search term or browse by decade</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {filteredConcerts.map((concert, index) => {
                  const totalDuration = concert.setlist.reduce((acc, song) => acc + song.durationMs, 0)
                  const durationMinutes = Math.floor(totalDuration / 60000)
                  const decade = getDecade(concert.date)
                  
                  return (
                  <motion.div
                    key={concert.id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.05 * index }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group"
                  >
                    <Link to={`/concert/${concert.id}`} className="block h-full">
                      <GlassCard className="overflow-hidden h-full flex flex-col border-2 border-white/30 hover:border-white/50 hover:shadow-glow-lg transition-all duration-500">
                        {/* Image Section - Larger with Parallax Effect */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-cream-tan">
                          {isImageLoading(concert.id) && !concertImages.has(concert.id) ? (
                            <Skeleton className="w-full h-full" />
                          ) : (
                            <motion.img
                              src={getConcertImage(concert)}
                              alt={`${concert.artist} - ${concert.title}`}
                              className="w-full h-full object-cover"
                              whileHover={{ scale: 1.15 }}
                              transition={{ duration: 0.7, ease: "easeOut" }}
                              onLoad={() => {
                                // Image loaded successfully, remove from loading set if still there
                                setImageLoading(prev => {
                                  const next = new Set(prev)
                                  next.delete(concert.id)
                                  return next
                                })
                              }}
                              onError={(e) => {
                                // If Spotify image fails, try posterImage
                                if (e.currentTarget.src !== concert.posterImage) {
                                  e.currentTarget.src = concert.posterImage
                                }
                                setImageLoading(prev => {
                                  const next = new Set(prev)
                                  next.delete(concert.id)
                                  return next
                                })
                              }}
                            />
                          )}
                          
                          {/* Enhanced Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          
                          {/* Decade Badge - Glassmorphism */}
                          <Badge className={cn(
                            "absolute top-4 right-4 text-white border-0 glass-dark shadow-glow px-4 py-2 text-xs font-semibold",
                            {
                              'shadow-glow-rose': decade === '60s',
                              'shadow-glow-primary': decade === '70s' || decade === '10s',
                              'shadow-glow-lavender': decade === '80s',
                              'shadow-glow-teal': decade === '90s',
                              'shadow-glow-sage': decade === '00s',
                            }
                          )}>
                            {decade}
                          </Badge>

                          {/* Floating Play Button - Always Visible */}
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            initial={false}
                            whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                            transition={{ duration: 0.3 }}
                          >
                            <motion.div
                              className="w-20 h-20 rounded-full glass-strong flex items-center justify-center shadow-glow-lg"
                              initial={{ scale: 0.9, opacity: 0.9 }}
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Play className="w-10 h-10 text-terracotta ml-1" fill="currentColor" />
                            </motion.div>
                          </motion.div>

                          {/* Bottom Info Overlay - Enhanced */}
                          <div className="absolute bottom-0 left-0 right-0 p-5 glass-dark">
                            <div className="flex items-center gap-4 text-white">
                              <div className="flex items-center gap-2">
                                <Music2 className="w-5 h-5" />
                                <span className="text-base font-semibold">{concert.setlist.length}</span>
                              </div>
                              <span className="text-sm opacity-60">•</span>
                              <span className="text-sm font-mono font-medium">{durationMinutes}m</span>
                            </div>
                          </div>
                        </div>

                        {/* Content Section - Glassmorphism */}
                        <div className="p-6 sm:p-8 flex-1 flex flex-col bg-white/50 backdrop-blur-sm">
                          {/* Artist Name - Gradient on Hover */}
                          <h3 className="text-2xl sm:text-3xl font-display font-bold text-charcoal mb-4 group-hover:text-gradient-primary transition-all duration-300 line-clamp-2 min-h-[3.5rem]">
                            {concert.artist}
                          </h3>
                          
                          {/* Venue & Date */}
                          <div className="space-y-3 mb-6 flex-1">
                            <div className="flex items-start gap-3 text-base text-warm-gray">
                              <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-terracotta" />
                              <span className="line-clamp-2 font-medium">{concert.venue}</span>
                            </div>
                            <div className="flex items-center gap-3 font-mono text-sm text-warm-gray">
                              <Calendar className="w-5 h-5 flex-shrink-0 text-terracotta" />
                              <span className="font-semibold">{concert.date}</span>
                            </div>
                          </div>

                          {/* CTA Button - Gradient */}
                          <div className="pt-6 border-t border-white/30">
                            <motion.div
                              className="flex items-center justify-between"
                              whileHover={{ x: 4 }}
                            >
                              <span className="text-xs font-semibold text-warm-gray uppercase tracking-wider">
                                Listen Now
                              </span>
                              <div className="flex items-center gap-2 text-gradient-primary font-semibold text-base">
                                <span>Play</span>
                                <Play className="w-5 h-5" fill="currentColor" />
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </GlassCard>
                    </Link>
                  </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Featured Concert - Full Bleed Hero */}
        {!showSearch && featuredConcert && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-24"
          >
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-4xl sm:text-5xl font-display font-bold text-gradient-primary">
                Featured Concert
              </h2>
              <Badge className="glass-strong text-gradient-primary border-white/30 px-4 py-2 text-sm font-semibold shadow-glow-primary">
                Handpicked
              </Badge>
            </div>

            <Link to={`/concert/${featuredConcert.id}`} className="block group">
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className="overflow-hidden border-2 border-white/40 hover:border-white/60 hover:shadow-glow-lg transition-all duration-500">
                  <div className="flex flex-col lg:flex-row">
                    {/* Image - Hero Size with Parallax */}
                    <div className="lg:w-2/5 relative aspect-[16/9] lg:aspect-auto lg:h-[500px] overflow-hidden bg-cream-tan">
                      {isImageLoading(featuredConcert.id) && !concertImages.has(featuredConcert.id) ? (
                        <Skeleton className="w-full h-full" />
                      ) : (
                        <motion.img
                          src={getConcertImage(featuredConcert)}
                          alt={`${featuredConcert.artist} - ${featuredConcert.title}`}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                          onLoad={() => {
                            setImageLoading(prev => {
                              const next = new Set(prev)
                              next.delete(featuredConcert.id)
                              return next
                            })
                          }}
                          onError={(e) => {
                            if (e.currentTarget.src !== featuredConcert.posterImage) {
                              e.currentTarget.src = featuredConcert.posterImage
                            }
                            setImageLoading(prev => {
                              const next = new Set(prev)
                              next.delete(featuredConcert.id)
                              return next
                            })
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent lg:bg-gradient-to-l" />

                      {/* Decade Badge */}
                      <Badge className={cn(
                        "absolute top-6 right-6 text-white border-0 glass-dark shadow-glow px-5 py-2.5 text-sm font-semibold",
                        {
                          'shadow-glow-rose': getDecade(featuredConcert.date) === '60s',
                          'shadow-glow-primary': getDecade(featuredConcert.date) === '70s' || getDecade(featuredConcert.date) === '10s',
                          'shadow-glow-lavender': getDecade(featuredConcert.date) === '80s',
                          'shadow-glow-teal': getDecade(featuredConcert.date) === '90s',
                          'shadow-glow-sage': getDecade(featuredConcert.date) === '00s',
                        }
                      )}>
                        {getDecade(featuredConcert.date)}
                      </Badge>

                      {/* Floating Play Button */}
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          className="w-28 h-28 rounded-full glass-strong flex items-center justify-center shadow-glow-lg"
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Play className="w-14 h-14 text-terracotta ml-1" fill="currentColor" />
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Content - Glassmorphism */}
                    <div className="lg:w-3/5 p-10 lg:p-14 flex flex-col justify-center glass-strong">
                      <div className="mb-6">
                        <Badge className="glass-dark text-white border-white/20 px-4 py-2 mb-6 shadow-glow">
                          Featured Concert
                        </Badge>
                      </div>
                      
                      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-8 group-hover:text-gradient-primary transition-all duration-300 leading-tight">
                        {featuredConcert.artist}
                      </h2>

                      <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-4 text-warm-gray">
                          <MapPin className="w-6 h-6 flex-shrink-0 text-terracotta" />
                          <span className="font-semibold text-lg sm:text-xl">{featuredConcert.venue}</span>
                        </div>
                        <div className="flex items-center gap-4 text-warm-gray font-mono text-base">
                          <Calendar className="w-6 h-6 flex-shrink-0 text-terracotta" />
                          <span className="font-semibold">{featuredConcert.date}</span>
                        </div>
                        <div className="flex items-center gap-5 text-warm-gray">
                          <div className="flex items-center gap-3">
                            <Music2 className="w-6 h-6 text-terracotta" />
                            <span className="font-bold text-lg">{featuredConcert.setlist.length} songs</span>
                          </div>
                          <span className="text-warm-gray">•</span>
                          <span className="font-mono font-semibold text-base">
                            {Math.floor(featuredConcert.setlist.reduce((acc, song) => acc + song.durationMs, 0) / 60000)} minutes
                          </span>
                        </div>
                      </div>

                      <p className="text-warm-gray leading-relaxed mb-10 text-lg sm:text-xl line-clamp-3">
                        {featuredConcert.description}
                      </p>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button className="w-full sm:w-auto bg-gradient-primary hover:shadow-glow-lg text-white px-10 py-5 rounded-2xl shadow-glow-primary hover:shadow-glow-lg transition-all duration-300 touch-target text-lg font-bold">
                          <Play className="w-6 h-6 mr-3" fill="currentColor" />
                          Listen to Concert
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </Link>
          </motion.div>
        )}

        {/* Recent Additions Grid */}
        {!showSearch && recentConcerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-gradient-primary mb-12">
              {selectedDecade === 'all' ? 'More Concerts' : `From the ${decades.find(d => d.value === selectedDecade)?.label}`}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {recentConcerts.map((concert, index) => {
                const totalDuration = concert.setlist.reduce((acc, song) => acc + song.durationMs, 0)
                const durationMinutes = Math.floor(totalDuration / 60000)
                const decade = getDecade(concert.date)
                
                return (
                <motion.div
                  key={concert.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.05 * index }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <Link to={`/concert/${concert.id}`} className="block h-full">
                    <GlassCard className="overflow-hidden h-full flex flex-col border-2 border-white/30 hover:border-white/50 hover:shadow-glow-lg transition-all duration-500">
                      {/* Image Section */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-cream-tan">
                        {isImageLoading(concert.id) && !concertImages.has(concert.id) ? (
                          <Skeleton className="w-full h-full" />
                        ) : (
                          <motion.img
                            src={getConcertImage(concert)}
                            alt={`${concert.artist} - ${concert.title}`}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.15 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            onLoad={() => {
                              setImageLoading(prev => {
                                const next = new Set(prev)
                                next.delete(concert.id)
                                return next
                              })
                            }}
                            onError={(e) => {
                              if (e.currentTarget.src !== concert.posterImage) {
                                e.currentTarget.src = concert.posterImage
                              }
                              setImageLoading(prev => {
                                const next = new Set(prev)
                                next.delete(concert.id)
                                return next
                              })
                            }}
                          />
                        )}
                        
                        {/* Enhanced Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        
                        {/* Decade Badge - Glassmorphism */}
                        <Badge className={cn(
                          "absolute top-4 right-4 text-white border-0 glass-dark shadow-glow px-4 py-2 text-xs font-semibold",
                          {
                            'shadow-glow-rose': decade === '60s',
                            'shadow-glow-primary': decade === '70s' || decade === '10s',
                            'shadow-glow-lavender': decade === '80s',
                            'shadow-glow-teal': decade === '90s',
                            'shadow-glow-sage': decade === '00s',
                          }
                        )}>
                          {decade}
                        </Badge>

                        {/* Floating Play Button - Always Visible */}
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          initial={false}
                          whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            className="w-20 h-20 rounded-full glass-strong flex items-center justify-center shadow-glow-lg"
                            initial={{ scale: 0.9, opacity: 0.9 }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Play className="w-10 h-10 text-terracotta ml-1" fill="currentColor" />
                          </motion.div>
                        </motion.div>

                        {/* Bottom Info Overlay - Enhanced */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 glass-dark">
                          <div className="flex items-center gap-4 text-white">
                            <div className="flex items-center gap-2">
                              <Music2 className="w-5 h-5" />
                              <span className="text-base font-semibold">{concert.setlist.length}</span>
                            </div>
                            <span className="text-sm opacity-60">•</span>
                            <span className="text-sm font-mono font-medium">{durationMinutes}m</span>
                          </div>
                        </div>
                      </div>

                      {/* Content Section - Glassmorphism */}
                      <div className="p-6 sm:p-8 flex-1 flex flex-col bg-white/50 backdrop-blur-sm">
                        {/* Artist Name - Gradient on Hover */}
                        <h3 className="text-2xl sm:text-3xl font-display font-bold text-charcoal mb-4 group-hover:text-gradient-primary transition-all duration-300 line-clamp-2 min-h-[3.5rem]">
                          {concert.artist}
                        </h3>
                        
                        {/* Venue & Date */}
                        <div className="space-y-3 mb-6 flex-1">
                          <div className="flex items-start gap-3 text-base text-warm-gray">
                            <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-terracotta" />
                            <span className="line-clamp-2 font-medium">{concert.venue}</span>
                          </div>
                          <div className="flex items-center gap-3 font-mono text-sm text-warm-gray">
                            <Calendar className="w-5 h-5 flex-shrink-0 text-terracotta" />
                            <span className="font-semibold">{concert.date}</span>
                          </div>
                        </div>

                        {/* CTA Button - Gradient */}
                        <div className="pt-6 border-t border-white/30">
                          <motion.div
                            className="flex items-center justify-between"
                            whileHover={{ x: 4 }}
                          >
                            <span className="text-xs font-semibold text-warm-gray uppercase tracking-wider">
                              Listen Now
                            </span>
                            <div className="flex items-center gap-2 text-gradient-primary font-semibold text-base">
                              <span>Play</span>
                              <Play className="w-5 h-5" fill="currentColor" />
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Search for more concerts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-24 text-center"
        >
          <Card className="max-w-2xl mx-auto p-6 sm:p-8 md:p-12 bg-gradient-to-br from-white to-cream-tan/30 border-light-gray shadow-subtle">
            <Music2 className="w-10 h-10 sm:w-12 sm:h-12 text-terracotta mx-auto mb-4" />
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-charcoal mb-4">
              Can't find what you're looking for?
            </h3>
            <p className="text-base sm:text-lg text-warm-gray mb-8 leading-relaxed">
              Search our database of 400,000+ concerts from setlist.fm
            </p>
            <ConcertSearch
              accessToken={accessToken}
              onConcertCreated={onConcertCreated}
            />
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
