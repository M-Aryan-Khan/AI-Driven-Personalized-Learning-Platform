import Image from "next/image"
import { Star } from "lucide-react"

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  imageSrc: string
}

export default function TestimonialCard({ quote, author, role, imageSrc }: TestimonialCardProps) {
  return (
    <div className="bg-vanilla-cream rounded-xl p-4 sm:p-6 shadow-sm border border-rose-dust/10 h-full flex flex-col">
      <div className="flex mb-3 sm:mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className="text-warm-coral fill-warm-coral w-3 h-3 sm:w-4 sm:h-4" />
        ))}
      </div>
      <p className="text-deep-cocoa mb-4 sm:mb-6 flex-grow text-sm sm:text-base">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden">
          <Image src={imageSrc || "/placeholder.svg"} alt={author} fill className="object-cover" />
        </div>
        <div>
          <p className="font-medium text-deep-cocoa text-sm sm:text-base">{author}</p>
          <p className="text-xs sm:text-sm text-rose-dust">{role}</p>
        </div>
      </div>
    </div>
  )
}
