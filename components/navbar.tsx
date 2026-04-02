'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const otherNavLinks = ['Crops', 'Climate', 'Analytics', 'About']

  return (
    <>
      {/* Animated leaf particles background */}
      <div className="fixed top-0 left-0 w-full h-20 pointer-events-none overflow-hidden z-40">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-drift text-3xl opacity-20"
            style={{
              animationDelay: `${i * 2}s`,
              left: `${i * 33}%`,
            }}
          >
            🍃
          </div>
        ))}
      </div>

      <nav className="fixed top-0 left-0 right-0 h-20 glass z-50 border-b border-white/30 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-2">
          <span className="text-4xl">🌾</span>
          <span className="text-xl md:text-2xl font-playfair font-bold text-primary">YieldSim</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => router.push('/simulation')}
            className="text-foreground hover:text-primary transition-colors font-medium"
          >
            Simulate
          </button>
          {otherNavLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {link}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <Button
            onClick={() => router.push('/simulation')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
          >
            Run Simulation
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="absolute top-20 left-0 right-0 bg-white/30 backdrop-blur-md border-b border-white/30 md:hidden">
            <div className="flex flex-col p-4 gap-4">
              <button
                onClick={() => { router.push('/simulation'); setIsOpen(false) }}
                className="text-foreground hover:text-primary transition-colors font-medium text-left"
              >
                Simulate
              </button>
              {otherNavLinks.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="text-foreground hover:text-primary transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link}
                </a>
              ))}
              <Button
                onClick={() => { router.push('/simulation'); setIsOpen(false) }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-full"
              >
                Run Simulation
              </Button>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
