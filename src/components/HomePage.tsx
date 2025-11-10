import { useState } from 'react'
import { concerts } from '../data/concerts'
import { ConcertSearch } from './ConcertSearch'
import { ConcertCard } from './ConcertCard'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search, Sparkles, List } from 'lucide-react'
import type { Concert } from '../types'

interface HomePageProps {
  accessToken: string
  dynamicConcerts: Concert[]
  onConcertCreated: (concert: Concert) => void
}

export const HomePage = ({ accessToken, dynamicConcerts, onConcertCreated }: HomePageProps) => {
  const [activeTab, setActiveTab] = useState<'curated' | 'search' | 'custom'>('curated')
  const [searchQuery, setSearchQuery] = useState('')

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
    <div className="min-h-screen bg-background">
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Hero Section */}
        <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Concert Time Machine
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Experience legendary concerts from history as if you were there.
            Search from 400,000+ concerts or explore our curated collection.
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs className="space-y-6 sm:space-y-8">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
              <TabsList className="grid w-full sm:w-auto grid-cols-3 gap-1">
                <TabsTrigger
                  active={activeTab === 'curated'}
                  onClick={() => setActiveTab('curated')}
                  className="flex items-center justify-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-2"
                >
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Curated</span>
                  <span className="sm:hidden">Picks</span>
                </TabsTrigger>
                <TabsTrigger
                  active={activeTab === 'search'}
                  onClick={() => setActiveTab('search')}
                  className="flex items-center justify-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-2"
                >
                  <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Search</span>
                </TabsTrigger>
                {dynamicConcerts.length > 0 && (
                  <TabsTrigger
                    active={activeTab === 'custom'}
                    onClick={() => setActiveTab('custom')}
                    className="flex items-center justify-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-2"
                  >
                    <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">My Concerts</span>
                    <span className="sm:hidden">Mine</span>
                    <span className="ml-1 text-[10px] sm:text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                      {dynamicConcerts.length}
                    </span>
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Search Input (only show on curated and custom tabs) */}
              {(activeTab === 'curated' || activeTab === 'custom') && (
                <div className="relative w-full sm:w-64 md:w-72">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search concerts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Curated Concerts */}
          <TabsContent className={activeTab === 'curated' ? '' : 'hidden'}>
            {filteredCurated.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <p className="text-sm sm:text-base text-muted-foreground">No concerts found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
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
          <TabsContent className={activeTab === 'search' ? '' : 'hidden'}>
            <ConcertSearch
              accessToken={accessToken}
              onConcertCreated={onConcertCreated}
            />
          </TabsContent>

          {/* Custom Concerts */}
          <TabsContent className={activeTab === 'custom' ? '' : 'hidden'}>
            {dynamicConcerts.length === 0 ? (
              <div className="text-center py-12 sm:py-16 px-4">
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                  You haven't created any custom concerts yet.
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Use the Search tab to find and create concerts from setlist.fm!
                </p>
              </div>
            ) : filteredCustom.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <p className="text-sm sm:text-base text-muted-foreground">No concerts found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
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
