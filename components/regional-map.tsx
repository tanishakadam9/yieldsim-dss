'use client'

import { useState } from 'react'
import { Globe } from 'lucide-react'

interface Region {
  id: string
  name: string
  emoji: string
  yieldChange: string
  position: { x: string; y: string }
}

const regions: Region[] = [
  {
    id: '1',
    name: 'India',
    emoji: '🇮🇳',
    yieldChange: '-15%',
    position: { x: '65%', y: '60%' },
  },
  {
    id: '2',
    name: 'USA',
    emoji: '🇺🇸',
    yieldChange: '-8%',
    position: { x: '25%', y: '45%' },
  },
  {
    id: '3',
    name: 'Brazil',
    emoji: '🇧🇷',
    yieldChange: '+5%',
    position: { x: '30%', y: '70%' },
  },
  {
    id: '4',
    name: 'China',
    emoji: '🇨🇳',
    yieldChange: '-12%',
    position: { x: '75%', y: '45%' },
  },
  {
    id: '5',
    name: 'EU',
    emoji: '🇪🇺',
    yieldChange: '-3%',
    position: { x: '45%', y: '35%' },
  },
]

const RegionTooltip = ({ region }: { region: Region }) => {
  return (
    <div className="glass p-4 rounded-xl shadow-lg">
      <div className="text-center">
        <div className="text-2xl mb-2">{region.emoji}</div>
        <h4 className="font-bold text-foreground">{region.name}</h4>
        <p className="text-sm text-muted-foreground mt-1">Yield Change</p>
        <p className={`font-space-mono font-bold text-lg ${region.yieldChange.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
          {region.yieldChange}
        </p>
      </div>
    </div>
  )
}

export default function RegionalMap() {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)

  return (
    <section className="py-20 px-6 md:px-12 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-12 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="text-primary" size={32} />
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground">
              Global Crop Yield Forecast
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Interactive visualization of predicted crop yield changes across major agricultural regions worldwide.
          </p>
        </div>

        {/* Map container */}
        <div className="glass p-8 md:p-12 rounded-3xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative w-full aspect-video bg-gradient-to-b from-blue-100/50 to-green-100/50 rounded-2xl overflow-hidden">
            {/* World map background (simplified) */}
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 1000 600" className="w-full h-full">
                <path
                  d="M 50 200 L 150 150 L 200 180 L 250 160 L 280 200 L 300 180 L 350 200"
                  stroke="#2D6A4F"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>

            {/* Region markers */}
            {regions.map((region) => (
              <div
                key={region.id}
                className="absolute group cursor-pointer"
                style={{
                  left: region.position.x,
                  top: region.position.y,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseEnter={() => setHoveredRegion(region.id)}
                onMouseLeave={() => setHoveredRegion(null)}
              >
                {/* Animated ripple */}
                <div
                  className="absolute w-8 h-8 rounded-full border-2 border-primary animate-pulse-ring"
                  style={{
                    left: '-16px',
                    top: '-16px',
                  }}
                />

                {/* Central dot */}
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg animate-pulse" />

                {/* Label badge */}
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  {hoveredRegion === region.id ? (
                    <RegionTooltip region={region} />
                  ) : (
                    <div className="glass px-2 py-1 rounded-lg text-xs font-medium text-foreground backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                      {region.name}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 glass p-4 rounded-xl">
              <p className="text-xs font-bold text-foreground mb-3">Yield Impact</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs text-muted-foreground">Negative Impact</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">Positive Impact</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
