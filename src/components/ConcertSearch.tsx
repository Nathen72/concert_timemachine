import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { SetlistFmSetlist } from '../utils/setlistFmApi'
import { searchSetlists } from '../utils/setlistFmApi'
import { buildConcertFromSetlist } from '../utils/concertBuilder'
import type { Concert } from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Search, Loader2, Music, MapPin, Calendar, ArrowRight, AlertCircle } from 'lucide-react'

interface ConcertSearchProps {
  accessToken: string
  onConcertCreated: (concert: Concert) => void
}

export const ConcertSearch = ({ accessToken, onConcertCreated }: ConcertSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SetlistFmSetlist[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isBuilding, setIsBuilding] = useState(false)
  const [buildProgress, setBuildProgress] = useState({ message: '', current: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      setError('Please enter an artist name to search.')
      return
    }

    setIsSearching(true)
    setError(null)
    setSearchResults([])

    try {
      const results = await searchSetlists({ artistName: searchQuery })
      setSearchResults(results.setlist || [])

      if (results.setlist.length === 0) {
        setError('No concerts found. Try a different artist name.')
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to search concerts. Make sure you have a setlist.fm API key configured.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectSetlist = async (setlist: SetlistFmSetlist) => {
    setIsBuilding(true)
    setError(null)

    try {
      const concert = await buildConcertFromSetlist(
        setlist,
        accessToken,
        (message, current, total) => {
          setBuildProgress({ message, current, total })
        }
      )

      if (concert) {
        onConcertCreated(concert)
        navigate(`/concert/${concert.id}`)
      } else {
        setError('Failed to build concert. No songs found on Spotify.')
      }
    } catch (err) {
      console.error('Build error:', err)
      setError('Failed to build concert from setlist.')
    } finally {
      setIsBuilding(false)
      setBuildProgress({ message: '', current: 0, total: 0 })
    }
  }

  const formatDate = (dateString: string) => {
    const parts = dateString.split('-')
    const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 px-2 sm:px-0">
      {/* Search Header */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            Search setlist.fm
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Search from 400,000+ concerts and we'll find the songs on Spotify for you
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter artist name (e.g., Pink Floyd)"
              disabled={isSearching || isBuilding}
              className="flex-1 h-10 text-sm"
            />
            <Button
              type="submit"
              disabled={isSearching || isBuilding}
              className="h-10 w-full sm:w-auto px-6"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Searching...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  <span className="text-sm">Search</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Building Progress */}
      {isBuilding && (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs sm:text-sm">{buildProgress.message}</p>
                  {buildProgress.total > 0 && (
                    <Progress
                      value={(buildProgress.current / buildProgress.total) * 100}
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && !isBuilding && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold">
              Found {searchResults.length} concert{searchResults.length !== 1 && 's'}
            </h3>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {searchResults.map((setlist) => {
              const songCount = setlist.sets.set.reduce((sum, set) => sum + set.song.length, 0)

              return (
                <Card
                  key={setlist.id}
                  className="group hover:border-primary transition-all cursor-pointer"
                  onClick={() => handleSelectSetlist(setlist)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                        <h4 className="font-bold text-sm sm:text-base md:text-lg group-hover:text-primary transition-colors truncate">
                          {setlist.artist.name}
                        </h4>

                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-y-1 sm:gap-x-3 sm:gap-y-1.5 text-xs sm:text-sm text-muted-foreground">
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                            <span className="truncate">
                              {setlist.venue.name} • {setlist.venue.city.name}, {setlist.venue.city.country.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                            <span>{formatDate(setlist.eventDate)}</span>
                          </div>
                          {songCount > 0 && (
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <Music className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                              <span>{songCount} songs</span>
                            </div>
                          )}
                        </div>

                        {setlist.tour?.name && (
                          <Badge variant="secondary" className="text-[10px] sm:text-xs">{setlist.tour.name}</Badge>
                        )}
                      </div>

                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
