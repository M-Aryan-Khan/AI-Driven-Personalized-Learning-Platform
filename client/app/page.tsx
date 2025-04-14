import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CheckCircle, Star, Code, LogIn, Globe} from "lucide-react"
import { Button } from "@/components/ui/button"
import TechCarousel from "@/components/tech-carousel"
import TestimonialCard from "@/components/testimonial-card"
import ExpertCard from "@/components/expert-card"
import HowItWorks from "@/components/how-it-works"
import heroImage from "./assets/hero-image.jpg"

export default function Home() {
  return (
    <main className="min-h-screen bg-vanilla-cream">
      {/* Navigation */}
      <nav className="container mx-auto py-4 px-4 md:px-0 lg:px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <div className="absolute w-8 h-8 bg-warm-coral rounded-lg transform rotate-45"></div>
              <div className="absolute w-4 h-4 bg-soft-peach rounded-sm top-2 left-2"></div>
            </div>
            <span className="text-deep-cocoa text-xl font-bold">Synapse</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-3 lg:space-x-5 font-semibold ">
          <Link href="#" className="text-deep-cocoa hover:text-warm-coral transition-colors">
            Find an Expert
          </Link>
          <Link href="#" className="text-deep-cocoa hover:text-warm-coral transition-colors">
            Group Classes
          </Link>
          <Link href="#" className="text-deep-cocoa hover:text-warm-coral transition-colors">
            Community
          </Link>
          <Link href="#" className="text-deep-cocoa hover:text-warm-coral transition-colors">
            Become an Expert
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <button className="border-2 border-[#ffc6a8] hover:bg-[#fff2e7]  font-semibold transition-all ease-in-out duration-200 hover:cursor-pointer text-deep-cocoa px-4 rounded-lg py-2 text-md flex items-center gap-2"><LogIn size={18} />Log In</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-20 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-deep-cocoa leading-tight">
              Master any IT skill with AI-powered learning
            </h1>
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3  font-semibold">
                <CheckCircle className="text-warm-coral mt-[2px] flex-shrink-0" size={20} />
                <p className="text-deep-cocoa">Take personalized 1-on-1 lessons with AI-matched expert mentors</p>
              </div>
              <div className="flex items-start gap-3 font-semibold">
                <CheckCircle className="text-warm-coral mt-[2px] flex-shrink-0" size={20} />
                <p className="text-deep-cocoa">Learn from industry professionals that fit your budget and schedule</p>
              </div>
              <div className="flex items-start gap-3 font-semibold">
                <CheckCircle className="text-warm-coral mt-[2px] flex-shrink-0" size={20} />
                <p className="text-deep-cocoa">Connect with a global community of tech learners and professionals</p>
              </div>
            </div>
            <div className="mt-8">
              <button className="bg-[#ffc6a8] hover:bg-[#ffb289] font-semibold transition-all ease-in-out duration-200 hover:cursor-pointer text-deep-cocoa px-10 rounded-xl py-4 text-lg flex items-center gap-2">
                Start learning now
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={heroImage}
                alt="Student learning with an expert"
                width={600}
                height={500}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -top-6 -right-6 bg-warm-coral rounded-full p-4 shadow-lg z-20">
              <div className="text-white font-bold text-center">
                <div className="text-2xl">AI</div>
                <div className="text-sm">Powered</div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-lg p-3 shadow-lg z-20 flex items-center gap-2">
              <Code className="text-warm-coral" />
              <span className="text-deep-cocoa font-medium">{"<Code />"}</span>
            </div>
            <div className="absolute top-1/4 -right-5 bg-white rounded-lg p-3 shadow-lg z-20">
              <span className="text-deep-cocoa font-medium">Web Dev</span>
            </div>
            <div className="absolute bottom-1/3 -left-5 bg-white rounded-lg p-3 shadow-lg z-20">
              <span className="text-deep-cocoa font-medium">DSA</span>
            </div>
            <div className="absolute top-1/3 -left-5 bg-white rounded-lg p-3 shadow-lg z-20">
              <span className="text-deep-cocoa font-medium">Ui/Ux</span>
            </div>
            <div className="absolute bottom-1/6 -right-5 bg-white rounded-lg p-3 shadow-lg z-20">
              <span className="text-deep-cocoa font-medium">DS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Categories */}
      <section className="container mx-auto px-4 md:px-6 py-12 border-t border-rose-dust/20">
        <h2 className="text-2xl md:text-3xl font-bold text-deep-cocoa text-center mb-8">
          Choose from TOP in-demand Tech Skills
        </h2>
        <TechCarousel />

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="outline" className="border-rose-dust text-deep-cocoa hover:bg-[#D9A5A0] transition-all ease-in-out duration-200">
            Web Development
          </Button>
          <Button variant="outline" className="border-rose-dust text-deep-cocoa hover:bg-[#D9A5A0] transition-all ease-in-out duration-200">
            Data Structures
          </Button>
          <Button variant="outline" className="border-rose-dust text-deep-cocoa hover:bg-[#D9A5A0] transition-all ease-in-out duration-200">
            Algorithms
          </Button>
          <Button variant="outline" className="border-rose-dust text-deep-cocoa hover:bg-[#D9A5A0] transition-all ease-in-out duration-200">
            DevOps
          </Button>
          <Button variant="outline" className="border-rose-dust text-deep-cocoa hover:bg-[#D9A5A0] transition-all ease-in-out duration-200">
            Cloud Computing
          </Button>
          <Button variant="outline" className="border-rose-dust text-deep-cocoa hover:bg-[#D9A5A0] transition-all ease-in-out duration-200">
            Machine Learning
          </Button>
          <Button variant="outline" className="border-rose-dust text-deep-cocoa hover:bg-[#D9A5A0] transition-all ease-in-out duration-200">
            View More...
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-deep-cocoa text-center mb-12">How Synapse Works</h2>
          <HowItWorks />
        </div>
      </section>

      {/* Featured Experts */}
      <section className="container mx-auto px-4 md:px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-deep-cocoa text-center mb-4">Learn from top tech experts</h2>
        <p className="text-rose-dust text-center max-w-2xl mx-auto mb-12">
          Our experts are carefully vetted industry professionals with real-world experience and a passion for teaching
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ExpertCard
            name="Alex Chen"
            specialty="Full Stack Development"
            rating={4.9}
            reviews={127}
            hourlyRate={45}
            imageSrc="/placeholder.svg?height=300&width=300"
            tags={["React", "Node.js", "TypeScript"]}
          />
          <ExpertCard
            name="Sarah Johnson"
            specialty="Data Structures & Algorithms"
            rating={4.8}
            reviews={93}
            hourlyRate={50}
            imageSrc="/placeholder.svg?height=300&width=300"
            tags={["Python", "Java", "LeetCode Pro"]}
          />
          <ExpertCard
            name="Michael Rodriguez"
            specialty="DevOps & Cloud"
            rating={4.9}
            reviews={156}
            hourlyRate={55}
            imageSrc="/placeholder.svg?height=300&width=300"
            tags={["AWS", "Docker", "Kubernetes"]}
          />
        </div>

        <div className="mt-10 text-center">
          <button className="bg-[#ffc6a8] hover:bg-[#ffb289] font-semibold transition-all ease-in-out duration-200 hover:cursor-pointer text-deep-cocoa px-8 rounded-xl py-4 text-lg flex items-center gap-2 mx-auto">Browse all experts<Globe size={22}/></button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-deep-cocoa text-center mb-4">What our students say</h2>

          <div className="flex items-center justify-center gap-2 mb-12">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="text-warm-coral fill-warm-coral" size={20} />
              ))}
            </div>
            <span className="text-deep-cocoa font-medium">4.8 out of 5 based on 2,500+ reviews</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TestimonialCard
              quote="Synapse matched me with the perfect mentor for my learning style. I went from struggling with basic JavaScript to building full-stack applications in just 3 months!"
              author="Jamie L."
              role="Junior Developer"
              imageSrc="/placeholder.svg?height=100&width=100"
            />
            <TestimonialCard
              quote="The AI-powered learning path was a game-changer. It adapted to my progress and suggested exactly what I needed to focus on to ace my technical interviews."
              author="Raj P."
              role="Software Engineer"
              imageSrc="/placeholder.svg?height=100&width=100"
            />
            <TestimonialCard
              quote="As someone switching careers, I was overwhelmed by all the tech skills to learn. My Synapse mentor created a personalized roadmap that made the journey manageable and enjoyable."
              author="Taylor K."
              role="Career Switcher"
              imageSrc="/placeholder.svg?height=100&width=100"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 md:px-6 py-16">
        <div className="bg-soft-peach/30 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-deep-cocoa mb-4">Ready to accelerate your tech career?</h2>
          <p className="text-deep-cocoa max-w-2xl mx-auto mb-8">
            Join thousands of learners who are mastering in-demand tech skills with personalized, AI-powered learning
            paths and expert guidance.
          </p>
          <button className="bg-[#ff8474] hover:bg-[#FF7060] text-white mx-auto font-semibold transition-all ease-in-out duration-200 hover:cursor-pointer text-deep-cocoa px-6 rounded-lg  py-3 text-lg flex items-center gap-2">
            Get started for free
          </button>
          <p className="mt-4 text-rose-dust font-semibold">*No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-rose-dust/20 py-12 font-semibold">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="relative w-8 h-8">
                  <div className="absolute w-8 h-8 bg-warm-coral rounded-lg transform rotate-45"></div>
                  <div className="absolute w-4 h-4 bg-soft-peach rounded-sm top-2 left-2"></div>
                </div>
                <span className="text-deep-cocoa text-xl font-bold">Synapse</span>
              </Link>
              <p className="text-rose-dust">AI-powered learning platform for tech skills</p>
            </div>

            <div>
              <h3 className="font-semibold text-deep-cocoa mb-4">For Students</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-rose-dust hover:text-warm-coral">
                    Find an Expert
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-rose-dust hover:text-warm-coral">
                    Group Classes
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-rose-dust hover:text-warm-coral">
                    Learning Paths
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-rose-dust hover:text-warm-coral">
                    Community
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-deep-cocoa mb-4">For Experts</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-rose-dust hover:text-warm-coral">
                    Become an Expert
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-rose-dust hover:text-warm-coral">
                    Teaching Resources
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-rose-dust hover:text-warm-coral">
                    Success Stories
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-rose-dust hover:text-warm-coral">
                    Expert Community
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-deep-cocoa mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-rose-dust hover:text-warm-coral">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-rose-dust hover:text-warm-coral">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-rose-dust hover:text-warm-coral">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-rose-dust hover:text-warm-coral">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-rose-dust/20 flex flex-col md:flex-row justify-between items-center">
            <p className="text-rose-dust text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Synapse. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-rose-dust hover:text-warm-coral">
                Terms
              </Link>
              <Link href="#" className="text-rose-dust hover:text-warm-coral">
                Privacy
              </Link>
              <Link href="#" className="text-rose-dust hover:text-warm-coral">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
