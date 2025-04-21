"use client";

import type React from "react";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  DollarSign,
  Clock,
  Users,
  BadgeCheck,
  Calendar,
  BarChart,
  Globe,
  Laptop,
  Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import FloatingElement from "@/components/floating-element";
import teacher from "@/app/assets/teacher-teaching.jpg";
import CountUp from "react-countup";
import image1 from "@/app/assets/mockImages/image1.png";
import image2 from "@/app/assets/mockImages/image2.png";
import image3 from "@/app/assets/mockImages/image3.png";
import AuthNavButton from "@/components/auth-nav-button";
import { useAuth } from "@/contexts/auth-context";

export default function TeachPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const howItWorksRef = useRef<HTMLElement | null>(null);
  const isHowItWorksInView = useInView(howItWorksRef, {
    once: true,
    margin: "-100px",
  });
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Redirect to signup page
    window.location.href = `/auth/signup/teach?email=${encodeURIComponent(
      email
    )}`;
  };

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth" });
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

        <div className="hidden md:flex items-center space-x-3 lg:space-x-5 font-semibold">
          <button
            onClick={scrollToHowItWorks}
            className="text-deep-cocoa hover:text-warm-coral transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <Link
            href="#benefits"
            className="text-deep-cocoa hover:text-warm-coral transition-colors"
          >
            Benefits
          </Link>
          <Link
            href="#faq"
            className="text-deep-cocoa hover:text-warm-coral transition-colors"
          >
            FAQ
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <AuthNavButton />
          {!user && (
            <Link href="/auth/signup/teach">
              <motion.button
                className="bg-[#ff8474] hover:bg-[#FF7060] text-white mx-auto font-semibold transition-all ease-in-out duration-200 hover:cursor-pointer px-4 rounded-lg py-2 flex items-center"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(255, 132, 116, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Become an Expert
              </motion.button>
            </Link>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={teacher.src || "/placeholder.svg"}
                alt="Tech expert teaching online"
                width={400}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
            <FloatingElement
              className="absolute -bottom-4 -left-4 bg-white rounded-lg p-4 shadow-lg z-20"
              amplitude={15}
            >
              <div className="flex items-center gap-3">
                <div className="bg-soft-peach/50 p-2 rounded-full">
                  <DollarSign className="text-warm-coral" size={24} />
                </div>
                <div>
                  <p className="text-deep-cocoa font-bold text-xl">$45/hr</p>
                  <p className="text-rose-dust text-sm">Average rate</p>
                </div>
              </div>
            </FloatingElement>
            <FloatingElement
              className="absolute top-1/4 -right-5 bg-white rounded-lg p-3 shadow-lg z-20"
              delay={0.5}
              amplitude={10}
            >
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="text-warm-coral fill-warm-coral"
                      size={16}
                    />
                  ))}
                </div>
                <span className="text-deep-cocoa font-medium">4.9/5</span>
              </div>
            </FloatingElement>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-deep-cocoa leading-tight">
              Share your tech expertise and earn teaching online
            </h1>
            <p className="mt-6 text-lg text-rose-dust">
              Join thousands of tech professionals teaching on Synapse. Set your
              own rates, create your schedule, and connect with motivated
              learners from around the world.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-grow">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base"
                />
              </div>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer bg-[#ffc6a8] hover:bg-[#ffb289] font-semibold transition-all ease-in-out duration-200 px-6 rounded-lg py-3 text-base flex items-center justify-center gap-2 h-12 min-w-[150px]"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(255, 198, 168, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center justify-center gap-2">
                  <div
                    className={`${
                      isSubmitting ? "opacity-0" : "opacity-100"
                    } flex items-center gap-2 transition-opacity duration-200`}
                  >
                    Get Started
                    <ArrowRight size={18} />
                  </div>
                  {isSubmitting && (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin absolute"></div>
                  )}
                </div>
              </motion.button>
            </form>

            <div className="mt-8 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="bg-soft-peach/50 p-2 rounded-full">
                  <DollarSign className="text-warm-coral" size={20} />
                </div>
                <span className="text-deep-cocoa font-medium">
                  Set your own rates
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-soft-peach/50 p-2 rounded-full">
                  <Clock className="text-warm-coral" size={20} />
                </div>
                <span className="text-deep-cocoa font-medium">
                  Flexible schedule
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-soft-peach/50 p-2 rounded-full">
                  <Users className="text-warm-coral" size={20} />
                </div>
                <span className="text-deep-cocoa font-medium">
                  Global student base
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-soft-peach/30 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-4xl md:text-5xl font-bold text-warm-coral">
                <CountUp end={10000} duration={2.5} separator="," />+
              </p>
              <p className="text-deep-cocoa font-medium mt-2">
                Active tech experts
              </p>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="text-4xl md:text-5xl font-bold text-warm-coral">
                <CountUp end={50000} duration={2.5} separator="," />+
              </p>
              <p className="text-deep-cocoa font-medium mt-2">
                Students worldwide
              </p>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p className="text-4xl md:text-5xl font-bold text-warm-coral">
                <CountUp end={500000} duration={2.5} separator="," />+
              </p>
              <p className="text-deep-cocoa font-medium mt-2">
                Lessons completed
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        ref={howItWorksRef}
        className="container mx-auto px-4 md:px-6 py-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-deep-cocoa">
            How Synapse Works for Experts
          </h2>
          <p className="text-rose-dust mt-4 max-w-2xl mx-auto">
            Our platform makes it easy to start teaching tech skills online and
            connect with students who match your expertise
          </p>
        </div>

        <div className="relative mb-16 hidden md:flex justify-between items-center px-4 md:px-10">
          {[1, 2, 3].map((number, idx) => (
            <div key={number} className="relative flex-1 flex justify-center">
              {idx > 0 && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1/2 h-[2px] bg-[#ff9359] z-0 "></div>
              )}
              <div className="z-10 w-12 h-12 flex items-center justify-center bg-[#ff9359] text-white font-bold text-lg rounded-full shadow-md">
                {number}
              </div>
              {idx < 2 && (
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1/2 h-[2px] bg-[#ff9359] z-0"></div>
              )}
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {howItWorksSteps.map((step, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-rose-dust/10"
              initial={{ opacity: 0, y: 30 }}
              animate={isHowItWorksInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="bg-soft-peach/50 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <div className="text-warm-coral">{step.icon}</div>
              </div>
              <h3 className="text-xl font-bold text-deep-cocoa mb-2">
                {step.title}
              </h3>
              <p className="text-rose-dust">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/auth/signup/teach">
            <motion.button
              className="bg-[#ff8474] hover:bg-[#FF7060] text-white mx-auto font-semibold transition-all text-lg ease-in-out duration-200 cursor-pointer px-8 rounded-xl py-4 flex items-center"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(255, 132, 116, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Become an Expert
              <ArrowRight size={20} />
            </motion.button>
          </Link>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="bg-white py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-deep-cocoa">
              Why Teach on Synapse?
            </h2>
            <p className="text-rose-dust mt-4 max-w-2xl mx-auto">
              Join our community of tech experts and enjoy these exclusive
              benefits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-[#fef9f5] rounded-xl p-6 h-full hover:shadow-xl hover:shadow-[#ffdec4] transition-all ease-in-out-100"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="bg-soft-peach/50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <div className="text-warm-coral">{benefit.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-deep-cocoa mb-2">
                  {benefit.title}
                </h3>
                <p className="text-rose-dust">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 md:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-deep-cocoa">
            What Our Experts Say
          </h2>
          <p className="text-rose-dust mt-4 max-w-2xl mx-auto">
            Hear from tech professionals who are already teaching on Synapse
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-rose-dust/10 h-full flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="text-warm-coral fill-warm-coral"
                    size={18}
                  />
                ))}
              </div>
              <p className="text-deep-cocoa italic flex-grow">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-4 mt-6">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={testimonial.imageSrc || "/placeholder.svg"}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-deep-cocoa">
                    {testimonial.name}
                  </p>
                  <p className="text-rose-dust text-sm">
                    {testimonial.specialty}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="bg-soft-peach/30 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-deep-cocoa">
              Calculate Your Potential Earnings
            </h2>
            <p className="text-rose-dust mt-4 max-w-2xl mx-auto">
              See how much you could earn teaching tech skills on Synapse
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg max-w-4xl mx-auto">
            <EarningsCalculator />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="container mx-auto px-4 md:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-deep-cocoa">
            Frequently Asked Questions
          </h2>
          <p className="text-rose-dust mt-4 max-w-2xl mx-auto">
            Get answers to common questions about teaching on Synapse
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4 ">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-rose-dust/10 rounded-lg"
              >
                <AccordionTrigger className="px-6 py-4 text-deep-cocoa font-semibold hover:text-warm-coral cursor-pointer">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-rose-dust">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 md:px-6 py-16">
        <motion.div
          className="bg-soft-peach/30 rounded-2xl p-8 md:p-12 text-center"
          whileHover={{
            boxShadow: "0 20px 40px -10px rgba(255, 198, 168, 0.3)",
          }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-deep-cocoa mb-4">
            Ready to share your tech expertise?
          </h2>
          <p className="text-deep-cocoa max-w-2xl mx-auto mb-8">
            Join thousands of tech professionals teaching on Synapse and start
            earning while making a difference in students' lives.
          </p>
          <Link href="/auth/signup/teach">
            <motion.button
              className="bg-warm-coral hover:bg-[#ff8c61] text-white font-semibold transition-all ease-in-out duration-200 px-8 rounded-xl py-4 text-lg flex items-center gap-2 mx-auto"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(255, 198, 168, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Become an Expert Today
              <ArrowRight size={20} />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-rose-dust/20 py-12 font-semibold">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4 group">
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
              <p className="text-rose-dust">
                AI-powered learning platform for tech skills
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-deep-cocoa mb-4">
                For Experts
              </h3>
              <ul className="space-y-2">
                {[
                  "How It Works",
                  "Benefits",
                  "Success Stories",
                  "Expert Community",
                ].map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      href="#"
                      className="text-rose-dust hover:text-warm-coral transition-colors flex items-center gap-1"
                    >
                      <motion.span
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item}
                      </motion.span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-deep-cocoa mb-4">
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
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      href="#"
                      className="text-rose-dust hover:text-warm-coral transition-colors flex items-center gap-1"
                    >
                      <motion.span
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item}
                      </motion.span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-deep-cocoa mb-4">Company</h3>
              <ul className="space-y-2">
                {["About Us", "Careers", "Blog", "Contact Us"].map(
                  (item, index) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.4, duration: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <Link
                        href="#"
                        className="text-rose-dust hover:text-warm-coral transition-colors flex items-center gap-1"
                      >
                        <motion.span
                          whileHover={{ x: 5 }}
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

          <div className="mt-12 pt-8 border-t border-rose-dust/20 flex flex-col md:flex-row justify-between items-center">
            <p className="text-rose-dust text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Synapse. All rights reserved.
            </p>
            <div className="flex gap-6">
              {["Terms", "Privacy", "Cookies"].map((item, index) => (
                <motion.div
                  key={item}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href="#"
                    className="text-rose-dust hover:text-warm-coral"
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

// How It Works Steps
const howItWorksSteps = [
  {
    icon: <Calendar size={28} />,
    title: "Create your profile",
    description:
      "Set up your expert profile with your tech specialties, experience, and teaching style",
  },
  {
    icon: <BadgeCheck size={28} />,
    title: "Get approved",
    description: "Get approved by our AI or by our team in 5 business days",
  },
  {
    icon: <Laptop size={28} />,
    title: "Teach and earn",
    description:
      "Conduct lessons via our platform and get paid directly to your account",
  },
];

// Benefits
const benefits = [
  {
    icon: <DollarSign size={24} />,
    title: "Set your own rates",
    description:
      "You decide how much to charge for your expertise, with complete control over your pricing",
  },
  {
    icon: <Clock size={24} />,
    title: "Flexible schedule",
    description:
      "Teach whenever works for you - mornings, evenings, or weekends",
  },
  {
    icon: <Globe size={24} />,
    title: "Global reach",
    description:
      "Connect with students from around the world interested in your tech specialty",
  },
  {
    icon: <BarChart size={24} />,
    title: "Growth analytics",
    description:
      "Track your performance and earnings with detailed analytics and insights",
  },
  {
    icon: <Users size={24} />,
    title: "Expert community",
    description:
      "Join our community of tech experts to share resources and best practices",
  },
  {
    icon: <Laptop size={24} />,
    title: "Teaching tools",
    description:
      "Access our AI-powered teaching tools and resources to enhance your lessons",
  },
];

// Testimonials
const testimonials = [
  {
    quote:
      "Teaching on Synapse has been incredibly rewarding. I've connected with students worldwide and grown my income while doing what I love.",
    name: "Alex Chen",
    specialty: "Full Stack Developer",
    imageSrc: image1.src,
  },
  {
    quote:
      "The AI matching system is brilliant. It connects me with students who truly benefit from my teaching style and expertise in cloud computing.",
    name: "Sarah Johnson",
    specialty: "DevOps Engineer",
    imageSrc: image2.src,
  },
  {
    quote:
      "I started teaching part-time and now it's my full-time career. The flexibility and income potential on Synapse are unmatched.",
    name: "Michael Rodriguez",
    specialty: "Data Scientist",
    imageSrc: image3.src,
  },
];

// FAQs
const faqs = [
  {
    question: "How much can I earn teaching on Synapse?",
    answer:
      "Earnings vary based on your expertise, experience, and how many hours you teach. Tech experts on Synapse typically charge between $5-$100 per hour, with the average being around $45 per hour.",
  },
  {
    question: "What qualifications do I need to become an expert?",
    answer:
      "We look for tech professionals with real-world experience and a passion for teaching. While formal qualifications are valuable, practical experience in your field is most important. All experts go through a verification process to ensure quality.",
  },
  {
    question: "How does the payment system work?",
    answer:
      "Students pay for lessons through our secure platform. After you complete a lesson, the payment is held for 24 hours and then released to your account. You can withdraw your earnings to your bank account at any time after that.",
  },
  {
    question: "Do I need to prepare lesson materials?",
    answer:
      "While you can use your own materials, Synapse provides access to a library of resources and our AI assistant can help generate customized lesson plans based on student needs and your teaching style.",
  },
  {
    question: "How does Synapse match me with students?",
    answer:
      "Our AI-powered matching system connects you with students based on your expertise, teaching style, availability, and the student's learning goals and preferences. This ensures a good fit for both parties and leads to higher satisfaction and better learning outcomes.",
  },
  {
    question: "What technology do I need to teach on Synapse?",
    answer:
      "You'll need a reliable internet connection, a computer with a webcam, and a microphone. Our platform works in your browser, so no special software installation is required. We also offer a mobile app for on-the-go management of your teaching schedule.",
  },
  {
    question: "How much time do I need to commit?",
    answer:
      "There's no minimum time commitment. You can teach as little as a few hours per week or make it your full-time career. You set your own availability and can adjust it at any time.",
  },
];

// Earnings Calculator Component
function EarningsCalculator() {
  const [hourlyRate, setHourlyRate] = useState(45);
  const [hoursPerWeek, setHoursPerWeek] = useState(10);

  const weeklyEarnings = hourlyRate * hoursPerWeek;
  const monthlyEarnings = weeklyEarnings * 4;
  const yearlyEarnings = monthlyEarnings * 12;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-deep-cocoa font-semibold mb-2">
              Your hourly rate ($)
            </label>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-full h-2 bg-soft-peach rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between mt-2">
              <span className="text-rose-dust">$5</span>
              <span className="text-warm-coral font-bold">${hourlyRate}</span>
              <span className="text-rose-dust">$100</span>
            </div>
          </div>

          <div>
            <label className="block text-deep-cocoa font-semibold mb-2">
              Hours you'll teach per week
            </label>
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="w-full h-2 bg-soft-peach rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between mt-2">
              <span className="text-rose-dust">1</span>
              <span className="text-warm-coral font-bold">{hoursPerWeek}</span>
              <span className="text-rose-dust">40</span>
            </div>
          </div>
        </div>

        <div className="bg-vanilla-cream rounded-xl p-6">
          <h3 className="text-xl font-bold text-deep-cocoa mb-4">
            Your potential earnings
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-rose-dust">Weekly</span>
              <span className="text-deep-cocoa font-bold text-xl">
                ${weeklyEarnings}
              </span>
            </div>
            <div className="border-t border-rose-dust/20 pt-4 flex justify-between items-center">
              <span className="text-rose-dust">Monthly</span>
              <span className="text-deep-cocoa font-bold text-xl">
                ${monthlyEarnings}
              </span>
            </div>
            <div className="border-t border-rose-dust/20 pt-4 flex justify-between items-center">
              <span className="text-rose-dust">Yearly</span>
              <span className="text-deep-cocoa font-bold text-2xl text-warm-coral">
                ${yearlyEarnings}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link href="/auth/signup/teach">
              <motion.button
                className="w-full bg-[#ff8474] hover:bg-[#FF7060] cursor-pointer text-white font-semibold transition-all ease-in-out duration-200 px-6 rounded-lg py-3 text-base flex items-center justify-center gap-2"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 25px -5px rgba(255, 132, 116, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Start Earning Now
                <ArrowRight size={18} />
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
