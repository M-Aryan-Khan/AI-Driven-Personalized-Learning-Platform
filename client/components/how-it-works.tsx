import { Search, Users, Calendar, Sparkles } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: <Search className="text-warm-coral" size={32} />,
      title: "Find your perfect expert",
      description:
        "Browse profiles of vetted tech experts or let our AI match you with the ideal mentor based on your goals and learning style.",
    },
    {
      icon: <Calendar className="text-warm-coral" size={32} />,
      title: "Schedule sessions",
      description:
        "Book 1-on-1 sessions that fit your schedule, with flexible time slots available 24/7 across all time zones.",
    },
    {
      icon: <Sparkles className="text-warm-coral" size={32} />,
      title: "Learn with AI assistance",
      description:
        "Our AI analyzes your progress, provides personalized resources, and helps your expert tailor lessons to your specific needs.",
    },
    {
      icon: <Users className="text-warm-coral" size={32} />,
      title: "Join the community",
      description:
        "Connect with fellow learners, participate in coding challenges, and attend workshops to accelerate your growth.",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {steps.map((step, index) => (
        <div key={index} className="text-center">
          <div className="bg-vanilla-cream w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8">{step.icon}</div>
          </div>
          <h3 className="text-deep-cocoa font-bold text-lg sm:text-xl mb-2">{step.title}</h3>
          <p className="text-rose-dust text-sm sm:text-base">{step.description}</p>
        </div>
      ))}
    </div>
  )
}
