"use client"

import { useRef, useEffect } from "react"
import { Code, Database, Layout, Server, Cloud, Terminal, LineChart, Lock } from "lucide-react"

export default function TechCarousel() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let animationId: number
    let position = 0

    const animate = () => {
      position -= 0.5
      if (position <= -50) {
        position = 0
      }
      if (container) {
        container.style.transform = `translateX(${position}px)`
      }
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  const techCategories = [
    { name: "Web Development", icon: <Layout className="text-warm-coral" size={24} /> },
    { name: "Data Structures", icon: <Database className="text-warm-coral" size={24} /> },
    { name: "Algorithms", icon: <Code className="text-warm-coral" size={24} /> },
    { name: "DevOps", icon: <Server className="text-warm-coral" size={24} /> },
    { name: "Cloud Computing", icon: <Cloud className="text-warm-coral" size={24} /> },
    { name: "Command Line", icon: <Terminal className="text-warm-coral" size={24} /> },
    { name: "Data Science", icon: <LineChart className="text-warm-coral" size={24} /> },
    { name: "Cybersecurity", icon: <Lock className="text-warm-coral" size={24} /> },
    { name: "Web Development", icon: <Layout className="text-warm-coral" size={24} /> },
    { name: "Data Structures", icon: <Database className="text-warm-coral" size={24} /> },
    { name: "Algorithms", icon: <Code className="text-warm-coral" size={24} /> },
    { name: "DevOps", icon: <Server className="text-warm-coral" size={24} /> },
  ]

  return (
    <div className="overflow-hidden">
      <div ref={containerRef} className="flex gap-6 py-4" style={{ width: "fit-content" }}>
        {techCategories.map((category, index) => (
          <div
            key={index}
            className="flex items-center gap-3 bg-white px-6 py-4 rounded-lg shadow-sm border border-rose-dust/10"
          >
            {category.icon}
            <span className="text-deep-cocoa font-medium whitespace-nowrap">{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
