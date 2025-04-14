// components/TestimonialCard.jsx
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
    <div className="bg-vanilla-cream rounded-xl p-6 shadow-sm border border-rose-dust/10 h-full flex flex-col">
      <div className="flex mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className="text-warm-coral fill-warm-coral" size={16} />
        ))}
      </div>
      <p className="text-deep-cocoa mb-6 flex-grow">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-full overflow-hidden">
          <Image
            src={imageSrc || "/placeholder.svg"}
            alt={author}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <p className="font-medium text-deep-cocoa">{author}</p>
          <p className="text-sm text-rose-dust">{role}</p>
        </div>
      </div>
    </div>
  )
}
