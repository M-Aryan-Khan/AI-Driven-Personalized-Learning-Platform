"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Heart, Search, Star } from "lucide-react"
import { motion } from "framer-motion"

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
}

export default function FindTutors() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState([0, 100])
  const [minRating, setMinRating] = useState(0)
  const [bookmarkedExperts, setBookmarkedExperts] = useState<string[]>([])
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/students/experts", {
          params: {
            specialty: searchTerm || undefined,
            min_rate: priceRange[0] > 0 ? priceRange[0] : undefined,
            max_rate: priceRange[1] < 100 ? priceRange[1] : undefined,
            min_rating: minRating > 0 ? minRating : undefined,
          },
        })
        setExperts(response.data)

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
      } finally {
        setLoading(false)
      }
    }

    fetchExperts()
  }, [toast, searchTerm, priceRange, minRating])

  const handleBookmark = async (expertId: string) => {
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

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-deep-cocoa">Find Tutors</h1>

        <div className="mb-6 flex flex-col gap-4 md:flex-row items-center">
          <div className="flex-1">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by specialty, language, or skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row">
            <div className="rounded-md border border-gray-200 bg-white p-2 md:w-48">
              <p className="mb-1 text-xs text-gray-500">Price range</p>
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

            <div className="rounded-md border border-gray-200 bg-white p-2 md:w-48">
              <p className="mb-1 text-xs text-gray-500">Minimum rating</p>
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
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="animate-pulse">
                      <div className="h-40 bg-gray-200"></div>
                      <div className="p-4">
                        <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                        <div className="mb-4 h-3 w-1/2 rounded bg-gray-200"></div>
                        <div className="h-8 w-full rounded bg-gray-200"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : experts.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <h3 className="mb-2 text-xl font-semibold text-deep-cocoa">No tutors found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {experts.map((expert) => (
              <motion.div key={expert.id} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <Card className="overflow-hidden">
                  <div className="cursor-pointer" onClick={() => handleExpertClick(expert.id)}>
                    <div className="relative h-40 bg-gray-100">
                      {expert.profile_image ? (
                        <img
                          src={expert.profile_image || "/placeholder.svg"}
                          alt={`${expert.first_name} ${expert.last_name}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#ffc6a8]">
                          <span className="text-2xl font-bold text-deep-cocoa">
                            {expert.first_name[0]}
                            {expert.last_name[0]}
                          </span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 rounded-full bg-white/80 p-1 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBookmark(expert.id)
                        }}
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            bookmarkedExperts.includes(expert.id) ? "fill-red-500 text-red-500" : "text-gray-500"
                          }`}
                        />
                      </Button>
                    </div>

                    <CardContent className="p-4">
                      <div className="mb-1 flex items-center">
                        <h3 className="mr-2 font-semibold text-deep-cocoa">
                          {expert.first_name} {expert.last_name}
                        </h3>
                        <div className="flex items-center text-sm text-amber-500">
                          <Star className="mr-1 h-4 w-4 fill-amber-500" />
                          {expert.rating.toFixed(1)}
                        </div>
                      </div>
                      <p className="mb-2 text-sm text-gray-500">{expert.specialty}</p>
                      <p className="line-clamp-2 text-sm text-gray-600">{expert.bio}</p>
                    </CardContent>
                  </div>

                  <CardFooter className="flex justify-between border-t bg-gray-50 p-4">
                    <div>
                      <p className="text-sm font-semibold text-deep-cocoa">${expert.hourly_rate.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">per hour</p>
                    </div>
                    <Button
                      className="bg-[#ffc6a8] text-deep-cocoa hover:bg-[#ffb289]"
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
