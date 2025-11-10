import { useState } from 'react'
import { concerts } from '../data/concerts'
import { ConcertSearch } from './ConcertSearch'
import { ConcertCard } from './ConcertCard'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, List, Star } from 'lucide-react'
import type { Concert } from '../types'

interface HomePageProps {
  accessToken: string
  dynamicConcerts: Concert[]
  onConcertCreated: (concert: Concert) => void
}

export const HomePage = ({ accessToken, dynamicConcerts, onConcertCreated }: HomePageProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('curated')

  // Filter concerts based on search query
  const filteredCurated = concerts.filter(concert =>
    concert.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    concert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    concert.venue.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCustom = dynamicConcerts.filter(concert =>
    concert.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    concert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    concert.venue.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen">
      <main className="container max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">
        {/* Clean, Minimal Hero Section */}
        <div className="text-center space-y-4 mb-16 sm:mb-20">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Concert Time Machine
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experience legendary concerts from history
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="curated" onValueChange={setActiveTab} className="space-y-10">
          <div className="flex flex-col gap-6">
            {/* Minimal Tab Pills and Search */}
            <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between">
              <TabsList className="inline-flex w-full lg:w-auto gap-1 bg-muted/50 p-1.5 rounded-lg border border-border/50">
                <TabsTrigger
                  value="curated"
                  className="flex items-center justify-center gap-2 text-sm px-5 py-2.5 rounded-md transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm hover:bg-background/60"
                >
                  <Star className="h-4 w-4" />
                  <span className="font-medium">Curated</span>
                </TabsTrigger>
                <TabsTrigger
                  value="search"
                  className="flex items-center justify-center gap-2 text-sm px-5 py-2.5 rounded-md transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm hover:bg-background/60"
                >
                  <Search className="h-4 w-4" />
                  <span className="font-medium">Search</span>
                </TabsTrigger>
                {dynamicConcerts.length > 0 && (
                  <TabsTrigger
                    value="custom"
                    className="flex items-center justify-center gap-2 text-sm px-5 py-2.5 rounded-md transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm hover:bg-background/60"
                  >
                    <List className="h-4 w-4" />
                    <span className="font-medium hidden sm:inline">My Concerts</span>
                    <span className="font-medium sm:hidden">Mine</span>
                    <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0.5 rounded-md">
                      {dynamicConcerts.length}
                    </Badge>
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Clean Search Input - only show on curated and custom tabs */}
              {(activeTab === 'curated' || activeTab === 'custom') && (
                <div className="relative w-full lg:w-80">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search concerts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-11 text-sm border-border/50 focus:border-primary"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Curated Concerts */}
          <TabsContent value="curated" className="mt-0">
            {filteredCurated.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-base font-medium text-foreground/80">No concerts found matching "{searchQuery}"</p>
                <p className="text-sm text-muted-foreground mt-2">Try a different search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
                {filteredCurated.map((concert) => (
                  <ConcertCard
                    key={concert.id}
                    concert={concert}
                    accessToken={accessToken}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="mt-0">
            <ConcertSearch
              accessToken={accessToken}
              onConcertCreated={onConcertCreated}
            />
          </TabsContent>

          {/* Custom Concerts */}
          <TabsContent value="custom" className="mt-0">
            {dynamicConcerts.length === 0 ? (
              <div className="text-center py-20 px-4">
                <p className="text-base font-medium text-foreground/80 mb-2">
                  You haven't created any custom concerts yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Use the Search tab to find and create concerts from setlist.fm
                </p>
              </div>
            ) : filteredCustom.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-base font-medium text-foreground/80">No concerts found matching "{searchQuery}"</p>
                <p className="text-sm text-muted-foreground mt-2">Try a different search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
                {filteredCustom.map((concert) => (
                  <ConcertCard
                    key={concert.id}
                    concert={concert}
                    accessToken={accessToken}
                    isCustom
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
