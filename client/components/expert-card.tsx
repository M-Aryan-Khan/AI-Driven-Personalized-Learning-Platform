import Image from "next/image"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"

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
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-rose-dust/10">
      <div className="relative h-48">
        <Image src={imageSrc || "/placeholder.svg"} alt={name} fill className="object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-deep-cocoa/70 to-transparent p-4">
          <h3 className="text-white font-bold text-xl">{name}</h3>
          <p className="text-white/90">{specialty}</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex">
            <Star className="text-warm-coral fill-warm-coral" size={16} />
          </div>
          <span className="text-deep-cocoa font-medium">{rating}</span>
          <span className="text-rose-dust">({reviews} reviews)</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span key={index} className="bg-soft-peach/30 text-deep-cocoa text-xs px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-rose-dust text-sm">Hourly rate from</p>
            <p className="text-deep-cocoa font-bold">${hourlyRate}/hour</p>
          </div>
          <Button className="bg-soft-peach hover:bg-[#FFB28C] text-deep-cocoa">View profile</Button>
        </div>
      </div>
    </div>
  )
}
