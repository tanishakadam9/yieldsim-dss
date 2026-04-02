'use client'

import { Button } from '@/components/ui/button'
import { Cloud, Sun, Droplets, Wind } from 'lucide-react'

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 md:px-12 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 via-transparent to-[#52B788]/20 -z-10" />
      
      {/* Floating grain texture overlay */}
      <div className="absolute inset-0 opacity-10 -z-10" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, #D4A017 0.5px, transparent 0.5px)',
        backgroundSize: '20px 20px',
      }} />

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left content */}
        <div className="space-y-6 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-foreground leading-tight">
            Predict Crop Yields Under Any Climate Condition
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-lg">
            Simulate temperature, rainfall, CO₂, and soil conditions to forecast agricultural outcomes with AI precision.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8"
            >
              Start Simulation
            </Button>
          </div>
        </div>

        {/* Right side - 3D floating crop bowl */}
        <div className="relative h-96 flex items-center justify-center">
          {/* Central floating bowl with crops */}
          <div className="relative w-64 h-64">
            {/* Bowl container with 3D effect */}
            <div className="absolute inset-0 animate-float" style={{
              perspective: '1000px',
            }}>
              {/* Bowl */}
              <div className="w-full h-full relative" style={{
                transform: 'rotateX(15deg)',
              }}>
                <div className="absolute inset-0 glass rounded-full flex items-center justify-center shadow-2xl">
                  <div className="text-7xl flex gap-2">
                    <span className="animate-float" style={{ animationDelay: '0s' }}>🌾</span>
                    <span className="animate-float" style={{ animationDelay: '0.2s' }}>🌽</span>
                    <span className="animate-float" style={{ animationDelay: '0.4s' }}>🍅</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Orbiting weather icons */}
            <div className="absolute inset-0">
              {/* Sun rays */}
              <div
                className="absolute w-32 h-32 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl"
                style={{
                  animation: 'rotate-icon 20s linear infinite',
                  transformOrigin: 'center',
                }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">☀️</div>
              </div>

              {/* Raindrops */}
              <div
                className="absolute w-36 h-36 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl"
                style={{
                  animation: 'rotate-icon 25s linear infinite reverse',
                  transformOrigin: 'center',
                }}
              >
                <div className="absolute bottom-0 right-0 translate-y-2">🌧️</div>
              </div>

              {/* Thermometer */}
              <div
                className="absolute w-40 h-40 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl"
                style={{
                  animation: 'rotate-icon 30s linear infinite',
                  transformOrigin: 'center',
                }}
              >
                <div className="absolute left-0 bottom-1/2 translate-y-1/2">🌡️</div>
              </div>

              {/* Wind */}
              <div
                className="absolute w-44 h-44 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl"
                style={{
                  animation: 'rotate-icon 28s linear infinite reverse',
                  transformOrigin: 'center',
                }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2">💨</div>
              </div>
            </div>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl animate-drift opacity-60"
                style={{
                  animationDelay: `${i * 1.5}s`,
                  left: `${20 + i * 15}%`,
                  top: `${30 + i * 10}%`,
                }}
              >
                🍃
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
