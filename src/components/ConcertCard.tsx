import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Music, Calendar, MapPin } from 'lucide-react'
import { fetchArtistImage } from '@/utils/spotifyImages'
import type { Concert } from '@/types'

interface ConcertCardProps {
  concert: Concert
  accessToken?: string
  isCustom?: boolean
}

export function ConcertCard({ concert, accessToken, isCustom }: ConcertCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(concert.posterImage)
  const [imageLoading, setImageLoading] = useState(true)

  useEffect(() => {
    if (accessToken && concert.artist) {
      setImageLoading(true)
      fetchArtistImage(concert.artist, accessToken).then((url) => {
        if (url) setImageUrl(url)
        setImageLoading(false)
      })
    } else {
      setImageLoading(false)
    }
  }, [concert.artist, accessToken])

  return (
    <Link to={`/concert/${concert.id}`}>
      <Card className="group overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {imageLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <img
              src={imageUrl || concert.posterImage}
              alt={`${concert.artist} - ${concert.title}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={() => setImageUrl(concert.posterImage)}
            />
          )}
          {isCustom && (
            <Badge className="absolute top-2 right-2 bg-primary">
              Custom
            </Badge>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-1 truncate group-hover:text-primary transition-colors">
            {concert.artist}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 truncate">
            {concert.title}
          </p>

          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{concert.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{concert.venue}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Music className="h-3.5 w-3.5" />
              <span>{concert.setlist.length} songs</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
