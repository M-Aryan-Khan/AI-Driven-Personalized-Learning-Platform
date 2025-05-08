"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Search, Star, Clock, Filter, X, ChevronDown, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { debounce } from "lodash"

type Expert = {
  id: string
  first_name: string
  last_name: string
  profile_image?: string
  specialty: string
  hourly_rate: number
  rating: number
  tags: string[]
  bio: string
  languages: string[]
  experience_years: number
  completed_sessions: number
}

export default function FindTutors() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [nameSearch, setNameSearch] = useState("")
  const [priceRange, setPriceRange] = useState([0, 100])
  const [minRating, setMinRating] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("")
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("")
  const [bookmarkedExperts, setBookmarkedExperts] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([])
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([])
  const { toast } = useToast()
  const router = useRouter()

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      setNameSearch(searchValue)
    }, 300),
    [],
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    debouncedSearch(value)
  }

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/students/experts", {
          params: {
            specialty: selectedSpecialty || undefined,
            min_rate: priceRange[0] > 0 ? priceRange[0] : undefined,
            max_rate: priceRange[1] < 100 ? priceRange[1] : undefined,
            min_rating: minRating > 0 ? minRating : undefined,
            language: selectedLanguage || undefined,
          },
        })
        
        // Ensure all experts have the required fields
        const processedExperts = response.data.map((expert: any) => ({
          ...expert,
          specialty: expert.specialty || "General Tutoring",
          tags: expert.tags || [],
          bio: expert.bio || `Experienced tutor specializing in ${expert.specialty || 'various subjects'}.`,
          languages: expert.languages || ["English"],
          experience_years: expert.experience_years || 0,
          completed_sessions: expert.completed_sessions || 0,
        }))
        
        setExperts(processedExperts)

        // Extract unique languages and specialties
        const languages = Array.from(new Set(processedExperts.flatMap((expert: Expert) => expert.languages || [])))
        const specialties = Array.from(new Set(processedExperts.map((expert: Expert) => expert.specialty)))

        setAvailableLanguages(languages as string[])
        setAvailableSpecialties(specialties as string[])

        // Fetch bookmarked experts
        const bookmarksResponse = await axios.get("/api/students/bookmarks")
        setBookmarkedExperts(bookmarksResponse.data.map((expert: Expert) => expert.id))
      } catch (error) {
        console.error("Error fetching experts:", error)
        toast({
          title: "Error",
          description: "Failed to load tutors",
          variant: "destructive",
        })
        // Set empty arrays to prevent further errors
        setExperts([])
        setAvailableLanguages([])
        setAvailableSpecialties([])
      } finally {
        setLoading(false)
      }
    }

    fetchExperts()
  }, [toast, selectedSpecialty, priceRange, minRating, selectedLanguage])

  // Filter experts based on name search
  useEffect(() => {
    if (nameSearch) {
      const filtered = experts.filter((expert) =>
        `${expert.first_name} ${expert.last_name}`.toLowerCase().includes(nameSearch.toLowerCase()),
      )
      setFilteredExperts(filtered)
    } else {
      setFilteredExperts(experts)
    }
  }, [experts, nameSearch])

  const handleBookmark = async (expertId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      if (bookmarkedExperts.includes(expertId)) {
        await axios.delete(`/api/students/bookmark/${expertId}`)
        setBookmarkedExperts(bookmarkedExperts.filter((id) => id !== expertId))
        toast({
          title: "Success",
          description: "Tutor removed from bookmarks",
        })
      } else {
        await axios.post(`/api/students/bookmark/${expertId}`)
        setBookmarkedExperts([...bookmarkedExperts, expertId])
        toast({
          title: "Success",
          description: "Tutor added to bookmarks",
        })
      }
    } catch (error) {
      console.error("Error updating bookmark:", error)
      toast({
        title: "Error",
        description: "Failed to update bookmarks",
        variant: "destructive",
      })
    }
  }

  const handleExpertClick = (expertId: string) => {
    router.push(`/dashboard/student/experts/${expertId}`)
  }

  const resetFilters = () => {
    setPriceRange([0, 100])
    setMinRating(0)
    setSelectedLanguage("")
    setSelectedSpecialty("")
    setNameSearch("")
    setSearchTerm("")
  }

  const displayedExperts = filteredExperts

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="mb-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-deep-cocoa">Find Tutors</h1>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-[#ffc6a8] text-deep-cocoa hover:bg-[#fff2e7] hover:cursor-pointer"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>

            {(priceRange[0] > 0 || priceRange[1] < 100 || minRating > 0 || selectedLanguage || selectedSpecialty) && (
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-deep-cocoa hover:cursor-pointer" onClick={resetFilters}>
                <X className="mr-1 h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by name, specialty, or skill..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 overflow-hidden"
            >
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Price range</label>
                    <Slider
                      defaultValue={[0, 100]}
                      min={0}
                      max={100}
                      step={5}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="py-4"
                    />
                    <div className="flex justify-between text-sm">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Minimum rating</label>
                    <Slider
                      defaultValue={[0]}
                      min={0}
                      max={5}
                      step={0.5}
                      value={[minRating]}
                      onValueChange={(value) => setMinRating(value[0])}
                      className="py-4"
                    />
                    <div className="flex justify-between text-sm">
                      <span>{minRating}</span>
                      <span>5.0</span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Language</label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any language</SelectItem>
                        {availableLanguages.map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Specialty</label>
                    <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any specialty</SelectItem>
                        {availableSpecialties.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="animate-pulse">
                      <div className="h-48 bg-gray-200"></div>
                      <div className="p-4">
                        <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                        <div className="mb-4 h-3 w-1/2 rounded bg-gray-200"></div>
                        <div className="mb-3 flex gap-2">
                          <Skeleton className="h-6 w-16 rounded-full" />
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                        <div className="h-16 w-full rounded bg-gray-200"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : displayedExperts.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow">
            <h3 className="mb-2 text-xl font-semibold text-deep-cocoa">No tutors found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedExperts.map((expert) => (
              <motion.div key={expert.id} whileHover={{ y: -5 }} transition={{ duration: 0.2 }} className="h-full">
                <Card className="h-full overflow-hidden shadow-md transition-shadow hover:shadow-lg">
                  <div className="cursor-pointer" onClick={() => handleExpertClick(expert.id)}>
                    <div className="relative h-48 bg-gray-100">
                      {expert.profile_image ? (
                        <img
                          src={expert.profile_image || "/placeholder.svg"}
                          alt={`${expert.first_name} ${expert.last_name}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-[#ffc6a8] to-[#ffb289]">
                          <span className="text-4xl font-bold text-white">
                            {expert.first_name[0]}
                            {expert.last_name[0]}
                          </span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 rounded-full bg-white/80 p-1 hover:bg-white hover:cursor-pointer"
                        onClick={(e) => handleBookmark(expert.id, e)}
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            bookmarkedExperts.includes(expert.id) ? "fill-red-500 text-red-500" : "text-gray-500"
                          }`}
                        />
                      </Button>
                    </div>

                    <CardContent className="p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <h3 className="font-semibold text-deep-cocoa">
                          {expert.first_name} {expert.last_name}
                        </h3>
                        <div className="flex items-center text-sm text-amber-500">
                          <Star className="mr-1 h-4 w-4 fill-amber-500" />
                          {expert.rating.toFixed(1)}
                        </div>
                      </div>

                      <p className="mb-3 text-sm text-gray-500">{expert.specialty}</p>

                      <div className="mb-3 flex flex-wrap gap-2">
                        {expert.languages?.slice(0, 3).map((language) => (
                          <Badge key={language} variant="outline" className="bg-[#fff8f0] text-deep-cocoa">
                            {language}
                          </Badge>
                        ))}
                        {expert.languages?.length > 3 && (
                          <Badge variant="outline" className="bg-[#fff8f0] text-deep-cocoa">
                            +{expert.languages.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="mb-3 flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {expert.experience_years} years
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          {expert.completed_sessions || 0} sessions
                        </div>
                      </div>

                      <p className="line-clamp-2 text-sm text-gray-600">{expert.bio}</p>
                    </CardContent>
                  </div>

                  <CardFooter className="flex justify-between border-t bg-gray-50 p-4">
                    <div>
                      <p className="text-lg font-semibold text-deep-cocoa">${expert.hourly_rate.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">per hour</p>
                    </div>
                    <Button
                      className="bg-[#ff9b7b] text-white hover:bg-[#ff8a63] hover:cursor-pointer"
                      onClick={() => handleExpertClick(expert.id)}
                    >
                      View Profile
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
