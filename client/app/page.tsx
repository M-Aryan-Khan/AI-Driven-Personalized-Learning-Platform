"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Star,
  Code,
  LogIn,
  Globe,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import TechCarousel from "@/components/tech-carousel";
import TestimonialCard from "@/components/testimonial-card";
import ExpertCard from "@/components/expert-card";
import HowItWorks from "@/components/how-it-works";
import heroImage from "./assets/hero-image.jpg";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const scrollRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    router.push("/auth/login");
  };
  const handleTeacherSignup = () => {
    setMobileMenuOpen(false);
    router.push("/teach");
  };

  const handleStudentSignup = () => {
    setMobileMenuOpen(false);
    router.push("/auth/signup/student");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <main className="min-h-screen bg-vanilla-cream overflow-x-hidden">
      {/* Navigation */}
      <motion.nav
        className="container mx-auto py-4 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 bg-vanilla-cream/95 backdrop-blur-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8">
              <motion.div
                className="absolute w-8 h-8 bg-warm-coral rounded-lg transform rotate-45"
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.3 }}
              ></motion.div>
              <motion.div
                className="absolute w-4 h-4 bg-soft-peach rounded-sm top-2 left-2"
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.3 }}
              ></motion.div>
            </div>
            <span className="text-deep-cocoa text-xl font-bold group-hover:text-warm-coral transition-colors">
              Synapse
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-3 lg:space-x-5 font-semibold">
          <Link
            href="#"
            className="text-deep-cocoa hover:text-warm-coral transition-colors relative group"
          >
            Find an Expert
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-warm-coral transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="#"
            className="text-deep-cocoa hover:text-warm-coral transition-colors relative group"
          >
            Group Classes
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-warm-coral transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="#"
            className="text-deep-cocoa hover:text-warm-coral transition-colors relative group"
          >
            Community
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-warm-coral transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/teach"
            className="text-deep-cocoa hover:text-warm-coral transition-colors relative group"
          >
            Become an Expert
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-warm-coral transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            className="hidden md:flex border-2 border-[#ffc6a8] hover:bg-[#fff2e7] font-semibold transition-all ease-in-out duration-200 hover:cursor-pointer text-deep-cocoa px-4 rounded-lg py-2 text-md items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogin}
          >
            <LogIn size={18} />
            Log In
          </motion.button>

          {/* Mobile menu button */}
          <motion.button
            className="md:hidden flex items-center justify-center p-2 rounded-md text-deep-cocoa hover:text-warm-coral focus:outline-none"
            onClick={toggleMobileMenu}
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-vanilla-cream pt-20 px-4"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col space-y-6 items-center">
              <Link
                href="#"
                className="text-deep-cocoa text-xl font-semibold hover:text-warm-coral transition-colors w-full text-center py-3 border-b border-rose-dust/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Find an Expert
              </Link>
              <Link
                href="#"
                className="text-deep-cocoa text-xl font-semibold hover:text-warm-coral transition-colors w-full text-center py-3 border-b border-rose-dust/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Group Classes
              </Link>
              <Link
                href="#"
                className="text-deep-cocoa text-xl font-semibold hover:text-warm-coral transition-colors w-full text-center py-3 border-b border-rose-dust/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Community
              </Link>
              <Link
                href="#"
                className="text-deep-cocoa text-xl font-semibold hover:text-warm-coral transition-colors w-full text-center py-3 border-b border-rose-dust/20"
                onClick={handleTeacherSignup}
              >
                Become an Expert
              </Link>
              <motion.button
                className="mt-4 border-2 border-[#ffc6a8] hover:bg-[#fff2e7] font-semibold transition-all ease-in-out duration-200 hover:cursor-pointer text-deep-cocoa px-6 rounded-lg py-3 text-lg flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn size={20} />
                Log In
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-6 py-8 md:py-16 lg:py-20 mt-4 md:mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div
            className="order-2 md:order-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-deep-cocoa leading-tight">
              Master any IT skill with AI-powered learning
            </h1>
            <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
              <motion.div
                className="flex items-start gap-3 font-semibold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <CheckCircle
                  className="text-warm-coral mt-[2px] flex-shrink-0"
                  size={20}
                />
                <p className="text-deep-cocoa text-sm sm:text-base">
                  Take personalized 1-on-1 lessons with AI-matched expert
                  mentors
                </p>
              </motion.div>
              <motion.div
                className="flex items-start gap-3 font-semibold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <CheckCircle
                  className="text-warm-coral mt-[2px] flex-shrink-0"
                  size={20}
                />
                <p className="text-deep-cocoa text-sm sm:text-base">
                  Learn from industry professionals that fit your budget and
                  schedule
                </p>
              </motion.div>
              <motion.div
                className="flex items-start gap-3 font-semibold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <CheckCircle
                  className="text-warm-coral mt-[2px] flex-shrink-0"
                  size={20}
                />
                <p className="text-deep-cocoa text-sm sm:text-base">
                  Connect with a global community of tech learners and
                  professionals
                </p>
              </motion.div>
            </div>
            <motion.div
              className="mt-6 md:mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <motion.button
                className="bg-[#ffc6a8] hover:bg-[#ffb289] font-semibold transition-all ease-in-out duration-200 hover:cursor-pointer text-deep-cocoa px-6 sm:px-10 rounded-xl py-3 sm:py-4 text-base sm:text-lg flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(255, 198, 168, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStudentSignup}
              >
                Start learning now
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                >
                  <ArrowRight size={18} />
                </motion.div>
              </motion.button>
            </motion.div>
          </motion.div>
          <motion.div
            className="relative order-1 md:order-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={heroImage || "/placeholder.svg"}
                alt="Student learning with an expert"
                width={600}
                height={500}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
            <motion.div
              className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 bg-warm-coral rounded-full p-3 sm:p-4 shadow-lg z-20"
              animate={{ rotate: 360 }}
              transition={{
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <div className="text-white font-bold text-center">
                <div className="text-xl sm:text-2xl">AI</div>
                <div className="text-xs sm:text-sm">Powered</div>
              </div>
            </motion.div>

            {/* Responsive adjustments for floating elements */}
            <motion.div
              className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 bg-white rounded-lg p-2 sm:p-3 shadow-lg z-20 flex items-center gap-1 sm:gap-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Code className="text-warm-coral w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-deep-cocoa font-medium text-sm sm:text-base">
                {"<Code />"}
              </span>
            </motion.div>

            {/* Hide some elements on very small screens */}
            <motion.div
              className="absolute top-1/4 -right-3 sm:-right-5 bg-white rounded-lg p-2 sm:p-3 shadow-lg z-20 hidden sm:block"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              whileHover={{
                x: -5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              }}
            >
              <span className="text-deep-cocoa font-medium text-sm sm:text-base">
                Web Dev
              </span>
            </motion.div>
            <motion.div
              className="absolute bottom-1/3 -left-3 sm:-left-5 bg-white rounded-lg p-2 sm:p-3 shadow-lg z-20 hidden sm:block"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              whileHover={{
                x: 5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              }}
            >
              <span className="text-deep-cocoa font-medium text-sm sm:text-base">
                DSA
              </span>
            </motion.div>
            <motion.div
              className="absolute top-1/3 -left-3 sm:-left-5 bg-white rounded-lg p-2 sm:p-3 shadow-lg z-20 hidden sm:block"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              whileHover={{
                x: 5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              }}
            >
              <span className="text-deep-cocoa font-medium text-sm sm:text-base">
                Ui/Ux
              </span>
            </motion.div>
            <motion.div
              className="absolute bottom-1/6 -right-3 sm:-right-5 bg-white rounded-lg p-2 sm:p-3 shadow-lg z-20 hidden sm:block"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              whileHover={{
                x: -5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              }}
            >
              <span className="text-deep-cocoa font-medium text-sm sm:text-base">
                DS
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Tech Categories */}
      <motion.section
        className="container mx-auto px-4 md:px-6 py-10 md:py-12 border-t border-rose-dust/20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-deep-cocoa text-center mb-6 md:mb-8">
          Choose from TOP in-demand Tech Skills
        </h2>
        <TechCarousel />

        <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-2 md:gap-3">
          {[
            "Web Development",
            "Data Structures",
            "Algorithms",
            "DevOps",
            "Cloud Computing",
            "Machine Learning",
            "View More...",
          ].map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Button
                variant="outline"
                className="border-rose-dust text-deep-cocoa hover:bg-[#D9A5A0] transition-all ease-in-out duration-200 text-xs sm:text-sm h-8 sm:h-10"
              >
                {category}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        className="bg-white py-10 md:py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-deep-cocoa text-center mb-8 md:mb-12">
            How Synapse Works
          </h2>
          <HowItWorks />
        </div>
      </motion.section>

      {/* Featured Experts */}
      <motion.section
        className="container mx-auto px-4 md:px-6 py-10 md:py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-deep-cocoa text-center mb-2 md:mb-4">
          Learn from top tech experts
        </h2>
        <p className="text-rose-dust text-center max-w-2xl mx-auto mb-8 md:mb-12 text-sm sm:text-base">
          Our experts are carefully vetted industry professionals with
          real-world experience and a passion for teaching
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className="h-full"
          >
            <ExpertCard
              name="Alex Chen"
              specialty="Full Stack Development"
              rating={4.9}
              reviews={127}
              hourlyRate={45}
              imageSrc="/placeholder.svg?height=300&width=300"
              tags={["React", "Node.js", "TypeScript"]}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className="h-full"
          >
            <ExpertCard
              name="Sarah Johnson"
              specialty="Data Structures & Algorithms"
              rating={4.8}
              reviews={93}
              hourlyRate={50}
              imageSrc="/placeholder.svg?height=300&width=300"
              tags={["Python", "Java", "LeetCode Pro"]}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            viewport={{ once: true }}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className="h-full sm:col-span-2 lg:col-span-1 sm:max-w-md sm:mx-auto lg:max-w-none lg:mx-0 w-full"
          >
            <ExpertCard
              name="Michael Rodriguez"
              specialty="DevOps & Cloud"
              rating={4.9}
              reviews={156}
              hourlyRate={55}
              imageSrc="/placeholder.svg?height=300&width=300"
              tags={["AWS", "Docker", "Kubernetes"]}
            />
          </motion.div>
        </div>

        <div className="mt-8 md:mt-10 text-center">
          <motion.button
            className="bg-[#ffc6a8] hover:bg-[#ffb289] font-semibold transition-all ease-in-out duration-200 hover:cursor-pointer text-deep-cocoa px-6 sm:px-8 rounded-xl py-3 sm:py-4 text-base sm:text-lg flex items-center gap-2 mx-auto"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px -5px rgba(255, 198, 168, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            Browse all experts
            <motion.div
              animate={{ rotate: [0, 20, 0, -20, 0] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 2,
                ease: "easeInOut",
                repeatDelay: 1,
              }}
            >
              <Globe size={20} className="sm:w-[22px] sm:h-[22px]" />
            </motion.div>
          </motion.button>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section
        className="bg-white py-10 md:py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-deep-cocoa text-center mb-4">
            What our students say
          </h2>

          <div className="flex items-center justify-center gap-2 mb-8 md:mb-12">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star, index) => (
                <motion.div
                  key={star}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  viewport={{ once: true }}
                >
                  <Star className="text-warm-coral fill-warm-coral w-4 h-4 sm:w-5 sm:h-5" />
                </motion.div>
              ))}
            </div>
            <span className="text-deep-cocoa font-medium text-sm sm:text-base">
              4.8 out of 5 based on 2,500+ reviews
            </span>
          </div>

          {/* Add items-stretch to force children to match height */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-stretch">
            <motion.div
              className="h-full"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <TestimonialCard
                quote="Synapse matched me with the perfect mentor for my learning style. I went from struggling with basic JavaScript to building full-stack applications in just 3 months!"
                author="Jamie L."
                role="Junior Developer"
                imageSrc="/placeholder.svg?height=100&width=100"
              />
            </motion.div>
            <motion.div
              className="h-full"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <TestimonialCard
                quote="The AI-powered learning path was a game-changer. It adapted to my progress and suggested exactly what I needed to focus on to ace my technical interviews."
                author="Raj P."
                role="Software Engineer"
                imageSrc="/placeholder.svg?height=100&width=100"
              />
            </motion.div>
            <motion.div
              className="h-full sm:col-span-2 lg:col-span-1 sm:max-w-md sm:mx-auto lg:max-w-none lg:mx-0"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <TestimonialCard
                quote="As someone switching careers, I was overwhelmed by all the tech skills to learn. My Synapse mentor created a personalized roadmap that made the journey manageable and enjoyable."
                author="Taylor K."
                role="Career Switcher"
                imageSrc="/placeholder.svg?height=100&width=100"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="container mx-auto px-4 md:px-6 py-10 md:py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div
          className="bg-soft-peach/30 rounded-2xl p-6 sm:p-8 md:p-12 text-center"
          whileHover={{
            boxShadow: "0 20px 40px -10px rgba(255, 198, 168, 0.3)",
          }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-deep-cocoa mb-3 md:mb-4">
            Ready to accelerate your tech career?
          </h2>
          <p className="text-deep-cocoa max-w-2xl mx-auto mb-6 md:mb-8 text-sm sm:text-base">
            Join thousands of learners who are mastering in-demand tech skills
            with personalized, AI-powered learning paths and expert guidance.
          </p>
          <motion.button
            className="bg-[#ff8474] hover:bg-[#FF7060] text-white mx-auto font-semibold transition-all ease-in-out duration-200 hover:cursor-pointer px-5 sm:px-6 rounded-lg py-2.5 sm:py-3 text-base sm:text-lg flex items-center gap-2 justify-center"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px -5px rgba(255, 132, 116, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStudentSignup}
          >
            Get started for free
          </motion.button>
          <motion.p
            className="mt-3 md:mt-4 text-rose-dust font-semibold text-sm sm:text-base"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            viewport={{ once: true }}
          >
            *No credit card required
          </motion.p>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-white border-t border-rose-dust/20 py-8 md:py-12 font-semibold">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4 group">
                <div className="relative w-8 h-8">
                  <motion.div
                    className="absolute w-8 h-8 bg-warm-coral rounded-lg transform rotate-45"
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  ></motion.div>
                  <motion.div
                    className="absolute w-4 h-4 bg-soft-peach rounded-sm top-2 left-2"
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.2 }}
                  ></motion.div>
                </div>
                <span className="text-deep-cocoa text-xl font-bold group-hover:text-warm-coral transition-colors">
                  Synapse
                </span>
              </Link>
              <p className="text-rose-dust text-sm sm:text-base">
                AI-powered learning platform for tech skills
              </p>
            </div>

            <div className="mt-6 sm:mt-0">
              <h3 className="font-semibold text-deep-cocoa mb-3 md:mb-4 text-lg">
                For Students
              </h3>
              <ul className="space-y-2">
                {[
                  "Find an Expert",
                  "Group Classes",
                  "Learning Paths",
                  "Community",
                ].map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      href="#"
                      className="text-rose-dust hover:text-warm-coral transition-colors flex items-center gap-1 text-sm sm:text-base"
                    >
                      <motion.span
                        whileHover={{ x: 2 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item}
                      </motion.span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="mt-6 sm:mt-0">
              <h3 className="font-semibold text-deep-cocoa mb-3 md:mb-4 text-lg">
                For Experts
              </h3>
              <ul className="space-y-2">
                {[
                  "Become an Expert",
                  "Teaching Resources",
                  "Success Stories",
                  "Expert Community",
                ].map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      href="/auth/signup/teach"
                      className="text-rose-dust hover:text-warm-coral transition-colors flex items-center gap-1 text-sm sm:text-base"
                    >
                      <motion.span
                        whileHover={{ x: 2 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item}
                      </motion.span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="mt-6 lg:mt-0">
              <h3 className="font-semibold text-deep-cocoa mb-3 md:mb-4 text-lg">
                Company
              </h3>
              <ul className="space-y-2">
                {["About Us", "Careers", "Blog", "Contact Us"].map(
                  (item, index) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.4, duration: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <Link
                        href="#"
                        className="text-rose-dust hover:text-warm-coral transition-colors flex items-center gap-1 text-sm sm:text-base"
                      >
                        <motion.span
                          whileHover={{ x: 2 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item}
                        </motion.span>
                      </Link>
                    </motion.li>
                  )
                )}
              </ul>
            </div>
          </div>

          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-rose-dust/20 flex flex-col md:flex-row justify-between items-center">
            <p className="text-rose-dust text-xs sm:text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Synapse. All rights reserved.
            </p>
            <div className="flex gap-4 md:gap-6">
              {["Terms", "Privacy", "Cookies"].map((item, index) => (
                <motion.div
                  key={item}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="#"
                    className="text-rose-dust hover:text-warm-coral text-xs sm:text-sm"
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
