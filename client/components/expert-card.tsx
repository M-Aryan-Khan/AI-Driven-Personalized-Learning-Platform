import Image from "next/image"
import { Star } from "lucide-react"

interface ExpertCardProps {
  name: string
  specialty: string
  rating: number
  reviews: number
  hourlyRate: number
  imageSrc: string
  tags: string[]
}

export default function ExpertCard({ name, specialty, rating, reviews, hourlyRate, imageSrc, tags }: ExpertCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-rose-dust/10 h-full flex flex-col">
      <div className="relative h-36 sm:h-48">
        <Image src={imageSrc || "/placeholder.svg"} alt={name} fill className="object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-deep-cocoa/70 to-transparent p-3 sm:p-4">
          <h3 className="text-white font-bold text-lg sm:text-xl">{name}</h3>
          <p className="text-white/90 text-sm sm:text-base">{specialty}</p>
        </div>
      </div>

      <div className="p-3 sm:p-4 flex-grow flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex">
            <Star className="text-warm-coral fill-warm-coral w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-deep-cocoa font-medium text-sm sm:text-base">{rating}</span>
          <span className="text-rose-dust text-xs sm:text-sm">({reviews} reviews)</span>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {tags.map((tag, index) => (
            <span key={index} className="bg-soft-peach/30 text-deep-cocoa text-xs px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-rose-dust text-xs sm:text-sm">Hourly rate from</p>
            <p className="text-deep-cocoa font-bold text-sm sm:text-base">${hourlyRate}/hour</p>
          </div>
          <button className="bg-[#ffc6a8] hover:bg-[#ffb289] font-semibold transition-all ease-in-out duration-200 hover:cursor-pointer text-deep-cocoa px-3 sm:px-5 rounded-lg py-1.5 sm:py-2 text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
            View profile
          </button>
        </div>
      </div>
    </div>
  )
}
