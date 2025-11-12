import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { concerts } from '../data/concerts'
import { ConcertSearch } from './ConcertSearch'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Play, Calendar, MapPin, Music2, Sparkles } from 'lucide-react'
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

  // Filter concerts by decade and search
  const filteredConcerts = concerts.filter(concert => {
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

  const decades: { value: Decade; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: concerts.length },
    { value: '60s', label: '1960s', count: concerts.filter(c => getDecade(c.date) === '60s').length },
    { value: '70s', label: '1970s', count: concerts.filter(c => getDecade(c.date) === '70s').length },
    { value: '80s', label: '1980s', count: concerts.filter(c => getDecade(c.date) === '80s').length },
    { value: '90s', label: '1990s', count: concerts.filter(c => getDecade(c.date) === '90s').length },
    { value: '00s', label: '2000s', count: concerts.filter(c => getDecade(c.date) === '00s').length },
  ]

  return (
    <div className="min-h-screen bg-cream-base">
      {/* Whimsical Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-20 -left-20 w-96 h-96 bg-rose/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -50, 20, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-10 w-80 h-80 bg-lavender/10 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 40, -30, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-72 h-72 bg-sage/10 rounded-full blur-3xl"
          animate={{
            x: [0, 20, -30, 0],
            y: [0, -30, 40, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-light-gray mb-4">
            <Sparkles className="w-4 h-4 text-terracotta" />
            <span className="text-sm font-mono text-warm-gray">Step into music history</span>
          </div>

          <h1 className="text-hero text-charcoal">
            Pick a Concert from<br />Music History
          </h1>

          <p className="text-lg sm:text-xl text-warm-gray max-w-2xl mx-auto leading-relaxed">
            Experience legendary concerts exactly as they happened, with full setlists and immersive audio.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mt-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-warm-gray" />
              <Input
                placeholder="Search artists, venues, or concerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearch(true)}
                className="pl-12 h-12 text-base border-light-gray bg-white shadow-subtle rounded-lg focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Decade Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {decades.map((decade, index) => (
            <motion.button
              key={decade.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDecade(decade.value)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                selectedDecade === decade.value
                  ? 'bg-terracotta text-white shadow-card'
                  : 'bg-white text-charcoal border border-light-gray hover:border-terracotta hover:shadow-subtle'
              }`}
            >
              <span>{decade.label}</span>
              {decade.count > 0 && (
                <span className={`ml-2 text-sm ${
                  selectedDecade === decade.value ? 'text-white/80' : 'text-warm-gray'
                }`}>
                  ({decade.count})
                </span>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Search Tab (when search is active) */}
        {showSearch && searchQuery && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display text-charcoal">Search Results</h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowSearch(false)
                  setSearchQuery('')
                }}
                className="text-warm-gray hover:text-charcoal"
              >
                Clear search
              </Button>
            </div>
            {filteredConcerts.length === 0 ? (
              <Card className="p-12 text-center bg-white border-light-gray">
                <Music2 className="w-12 h-12 text-warm-gray mx-auto mb-4" />
                <p className="text-lg text-charcoal mb-2">No concerts found</p>
                <p className="text-warm-gray">Try a different search term or browse by decade</p>
              </Card>
            ) : null}
          </motion.div>
        )}

        {/* Featured Concert */}
        {!showSearch && featuredConcert && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-16"
          >
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl font-display text-charcoal">Featured Concert</h2>
              <Badge variant="secondary" className="bg-terracotta/10 text-terracotta border-0">
                Handpicked
              </Badge>
            </div>

            <Link to={`/concert/${featuredConcert.id}`} className="block group">
              <Card className="overflow-hidden border-light-gray bg-white shadow-card hover:shadow-modal transition-all duration-300">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image */}
                  <div className="relative aspect-[16/9] md:aspect-auto overflow-hidden bg-cream-tan">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                      src={featuredConcert.posterImage}
                      alt={`${featuredConcert.artist} - ${featuredConcert.title}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Play Button Overlay */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-modal">
                        <Play className="w-8 h-8 text-terracotta ml-1" fill="currentColor" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-8 lg:p-12 flex flex-col justify-center">
                    <h3 className="text-4xl lg:text-5xl font-display text-charcoal mb-4 group-hover:text-terracotta transition-colors">
                      {featuredConcert.artist}
                    </h3>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-warm-gray">
                        <MapPin className="w-5 h-5" />
                        <span className="font-medium">{featuredConcert.venue}</span>
                      </div>
                      <div className="flex items-center gap-3 text-warm-gray font-mono text-sm">
                        <Calendar className="w-5 h-5" />
                        <span>{featuredConcert.date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-warm-gray">
                        <Music2 className="w-5 h-5" />
                        <span>{featuredConcert.setlist.length} songs • {Math.floor(featuredConcert.setlist.reduce((acc, song) => acc + song.durationMs, 0) / 60000)} minutes</span>
                      </div>
                    </div>

                    <p className="text-warm-gray leading-relaxed mb-8">
                      {featuredConcert.description}
                    </p>

                    <Button className="w-fit bg-terracotta hover:bg-terracotta/90 text-white px-8 py-6 rounded-lg shadow-subtle hover:shadow-card transition-all">
                      <Play className="w-5 h-5 mr-2" fill="currentColor" />
                      Listen to Concert
                    </Button>
                  </CardContent>
                </div>
              </Card>
            </Link>
          </motion.div>
        )}

        {/* Recent Additions Grid */}
        {!showSearch && recentConcerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-display text-charcoal mb-6">
              {selectedDecade === 'all' ? 'More Concerts' : `From the ${decades.find(d => d.value === selectedDecade)?.label}`}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentConcerts.map((concert, index) => (
                <motion.div
                  key={concert.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.05 * index }}
                >
                  <Link to={`/concert/${concert.id}`} className="block group">
                    <Card className="overflow-hidden border-light-gray bg-white hover:shadow-card transition-all duration-200 card-hover">
                      {/* Image */}
                      <div className="relative aspect-[3/2] overflow-hidden bg-cream-tan">
                        <img
                          src={concert.posterImage}
                          alt={`${concert.artist} - ${concert.title}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                        {/* Decade Badge */}
                        <Badge className={`absolute top-3 right-3 bg-${getDecadeColor(getDecade(concert.date))}/90 text-white border-0 backdrop-blur-sm`}>
                          {getDecade(concert.date)}
                        </Badge>
                      </div>

                      {/* Content */}
                      <CardContent className="p-6">
                        <h3 className="text-xl font-display text-charcoal mb-2 group-hover:text-terracotta transition-colors truncate">
                          {concert.artist}
                        </h3>

                        <div className="space-y-2 text-sm text-warm-gray">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{concert.venue}</span>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-xs">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>{concert.date}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-light-gray flex items-center justify-between">
                          <span className="text-sm text-warm-gray">
                            {concert.setlist.length} songs
                          </span>
                          <div className="flex items-center gap-1 text-terracotta opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-sm font-medium">Play</span>
                            <Play className="w-4 h-4" fill="currentColor" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
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
          <Card className="max-w-2xl mx-auto p-12 bg-gradient-to-br from-white to-cream-tan/30 border-light-gray shadow-subtle">
            <Music2 className="w-12 h-12 text-terracotta mx-auto mb-4" />
            <h3 className="text-2xl font-display text-charcoal mb-4">
              Can't find what you're looking for?
            </h3>
            <p className="text-warm-gray mb-8">
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
