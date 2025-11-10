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
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] h-full flex flex-col bg-white dark:bg-gray-900 rounded-2xl">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
          {imageLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <img
              src={imageUrl || concert.posterImage}
              alt={`${concert.artist} - ${concert.title}`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImageUrl(concert.posterImage)}
            />
          )}
          {isCustom && (
            <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-[10px] px-2 py-1 shadow-lg">
              Custom
            </Badge>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-all duration-300" />

          {/* Hover Overlay with Info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex items-center gap-1.5 text-white text-xs">
              <Music className="h-3.5 w-3.5" />
              <span className="font-medium">{concert.setlist.length} songs</span>
            </div>
          </div>
        </div>

        <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-sm sm:text-base mb-1 truncate bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent group-hover:from-violet-700 group-hover:to-purple-700 dark:group-hover:from-violet-300 dark:group-hover:to-purple-300 transition-all">
            {concert.artist}
          </h3>
          <p className="text-xs text-muted-foreground mb-3 truncate font-medium">
            {concert.title}
          </p>

          <div className="space-y-1.5 text-xs text-muted-foreground mt-auto">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-purple-500 dark:text-purple-400" />
              <span className="truncate">{concert.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-pink-500 dark:text-pink-400" />
              <span className="truncate">{concert.venue}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
