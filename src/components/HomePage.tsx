import { useState } from 'react'
import { concerts } from '../data/concerts'
import { ConcertSearch } from './ConcertSearch'
import { ConcertCard } from './ConcertCard'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, List, Music2, Calendar, Star, Globe, Mic2 } from 'lucide-react'
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
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Compact Hero Section */}
        <div className="text-center space-y-6 mb-8 sm:mb-10">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
              Concert Time Machine
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experience legendary concerts from history. Search 400,000+ concerts or explore our curated collection.
            </p>
          </div>

          {/* Compact Stats Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 py-4">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <Music2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">400K+</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Concerts</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <Mic2 className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">50K+</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Artists</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <Globe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">100+</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Countries</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <Calendar className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">70+</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Years</span>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="curated" onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col gap-4">
            {/* Tab Pills and Search */}
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <TabsList className="grid w-full lg:w-auto grid-cols-3 gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg">
                <TabsTrigger
                  value="curated"
                  className="flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-md transition-all data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                >
                  <Star className="h-4 w-4" />
                  <span className="font-medium">Curated</span>
                </TabsTrigger>
                <TabsTrigger
                  value="search"
                  className="flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-md transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                >
                  <Search className="h-4 w-4" />
                  <span className="font-medium">Search</span>
                </TabsTrigger>
                {dynamicConcerts.length > 0 && (
                  <TabsTrigger
                    value="custom"
                    className="flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-md transition-all data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                  >
                    <List className="h-4 w-4" />
                    <span className="font-medium hidden sm:inline">My Concerts</span>
                    <span className="font-medium sm:hidden">Mine</span>
                    <Badge variant="secondary" className="ml-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                      {dynamicConcerts.length}
                    </Badge>
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Search Input - only show on curated and custom tabs */}
              {(activeTab === 'curated' || activeTab === 'custom') && (
                <div className="relative w-full lg:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    placeholder="Search concerts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Curated Concerts */}
          <TabsContent value="curated">
            {filteredCurated.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-base font-medium text-gray-700 dark:text-gray-300">No concerts found matching "{searchQuery}"</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Try a different search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
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
          <TabsContent value="search">
            <ConcertSearch
              accessToken={accessToken}
              onConcertCreated={onConcertCreated}
            />
          </TabsContent>

          {/* Custom Concerts */}
          <TabsContent value="custom">
            {dynamicConcerts.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  You haven't created any custom concerts yet.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Use the Search tab to find and create concerts from setlist.fm!
                </p>
              </div>
            ) : filteredCustom.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-base font-medium text-gray-700 dark:text-gray-300">No concerts found matching "{searchQuery}"</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Try a different search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
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
