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
    <Link to={`/concert/${concert.id}`} className="block h-full group">
      <Card className="overflow-hidden border border-border/50 hover:border-border transition-all duration-300 h-full flex flex-col hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          {imageLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <img
              src={imageUrl || concert.posterImage}
              alt={`${concert.artist} - ${concert.title}`}
              className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
              onError={() => setImageUrl(concert.posterImage)}
            />
          )}
          {isCustom && (
            <Badge className="absolute top-3 right-3 bg-foreground/90 text-background border-0 text-[10px] px-2 py-1 backdrop-blur-sm">
              Custom
            </Badge>
          )}

          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Info on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex items-center gap-2 text-white text-xs font-medium">
              <Music className="h-3.5 w-3.5" />
              <span>{concert.setlist.length} songs</span>
            </div>
          </div>
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-sm sm:text-base mb-1 truncate text-foreground group-hover:text-primary transition-colors">
            {concert.artist}
          </h3>
          <p className="text-xs text-muted-foreground mb-4 truncate">
            {concert.title}
          </p>

          <div className="space-y-2 text-xs text-muted-foreground mt-auto">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
              <span className="truncate">{concert.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
              <span className="truncate">{concert.venue}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
