"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { motion, useAnimation, useInView } from "framer-motion"

interface ScrollRevealProps {
  children: ReactNode
  direction?: "up" | "down" | "left" | "right"
  delay?: number
  duration?: number
  once?: boolean
  className?: string
}

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  once = true,
  className = "",
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: "-100px" })
  const controls = useAnimation()

  // Set initial and animate values based on direction
  const getDirectionValues = () => {
    switch (direction) {
      case "up":
        return { initial: { y: 50, opacity: 0 }, animate: { y: 0, opacity: 1 } }
      case "down":
        return { initial: { y: -50, opacity: 0 }, animate: { y: 0, opacity: 1 } }
      case "left":
        return { initial: { x: 50, opacity: 0 }, animate: { x: 0, opacity: 1 } }
      case "right":
        return { initial: { x: -50, opacity: 0 }, animate: { x: 0, opacity: 1 } }
      default:
        return { initial: { y: 50, opacity: 0 }, animate: { y: 0, opacity: 1 } }
    }
  }

  useEffect(() => {
    if (isInView) {
      controls.start("animate")
    }
  }, [isInView, controls])

  const { initial, animate } = getDirectionValues()

  return (
    <motion.div ref={ref} initial={initial} animate={controls} transition={{ duration, delay }} className={className}>
      {children}
    </motion.div>
  )
}
