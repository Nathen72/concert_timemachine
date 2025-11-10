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
    if (!searchQuery.trim()) return

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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search setlist.fm
          </CardTitle>
          <CardDescription>
            Search from 400,000+ concerts and we'll find the songs on Spotify for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter artist name (e.g., Pink Floyd, Radiohead)"
              disabled={isSearching || isBuilding}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isSearching || isBuilding || !searchQuery.trim()}
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 text-destructive">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Building Progress */}
      {isBuilding && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{buildProgress.message}</p>
                  {buildProgress.total > 0 && (
                    <div className="mt-2 w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(buildProgress.current / buildProgress.total) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && !isBuilding && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Found {searchResults.length} concert{searchResults.length !== 1 && 's'}
            </h3>
          </div>

          <div className="space-y-3">
            {searchResults.map((setlist) => {
              const songCount = setlist.sets.set.reduce((sum, set) => sum + set.song.length, 0)

              return (
                <Card
                  key={setlist.id}
                  className="group hover:border-primary transition-all cursor-pointer"
                  onClick={() => handleSelectSetlist(setlist)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <h4 className="font-bold text-lg group-hover:text-primary transition-colors">
                          {setlist.artist.name}
                        </h4>

                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>
                              {setlist.venue.name} • {setlist.venue.city.name}, {setlist.venue.city.country.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(setlist.eventDate)}</span>
                          </div>
                          {songCount > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Music className="h-3.5 w-3.5" />
                              <span>{songCount} songs</span>
                            </div>
                          )}
                        </div>

                        {setlist.tour?.name && (
                          <Badge variant="secondary">{setlist.tour.name}</Badge>
                        )}
                      </div>

                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
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
