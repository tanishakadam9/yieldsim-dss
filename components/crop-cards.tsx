'use client'

import { Button } from '@/components/ui/button'
import { Leaf } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Crop {
  id: string
  emoji: string
  name: string
  sensitivity: string
  impact: string
  impactType: 'positive' | 'negative'
}

const crops: Crop[] = [
  {
    id: '1',
    emoji: '🌾',
    name: 'Wheat',
    sensitivity: 'High Heat Sensitivity',
    impact: '-18%',
    impactType: 'negative',
  },
  {
    id: '2',
    emoji: '🌽',
    name: 'Corn',
    sensitivity: 'Moderate Drought Risk',
    impact: '-8%',
    impactType: 'negative',
  },
  {
    id: '3',
    emoji: '🍅',
    name: 'Tomato',
    sensitivity: 'Low Climate Impact',
    impact: '+5%',
    impactType: 'positive',
  },
  {
    id: '4',
    emoji: '🌱',
    name: 'Soybean',
    sensitivity: 'High Heat Sensitivity',
    impact: '-14%',
    impactType: 'negative',
  },
  {
    id: '5',
    emoji: '🍚',
    name: 'Rice',
    sensitivity: 'Flood Dependent',
    impact: '-3%',
    impactType: 'negative',
  },
  {
    id: '6',
    emoji: '🥦',
    name: 'Broccoli',
    sensitivity: 'Low Climate Impact',
    impact: '+12%',
    impactType: 'positive',
  },
]

const CropCard = ({ crop, delay, router }: { crop: Crop; delay: number; router: ReturnType<typeof useRouter> }) => {
  return (
    <div
      className="glass p-8 rounded-2xl flex flex-col items-center text-center hover:shadow-xl transition-all hover:scale-105 duration-300 group"
      style={{
        animation: 'fadeInUp 0.6s ease-out',
        animationDelay: `${delay}s`,
      }}
    >
      {/* Floating emoji */}
      <div className="text-6xl mb-4 animate-float">{crop.emoji}</div>

      {/* Crop name */}
      <h3 className="text-xl font-playfair font-bold text-foreground mb-2">{crop.name}</h3>

      {/* Sensitivity badge */}
      <p className="text-sm text-muted-foreground mb-4">{crop.sensitivity}</p>

      {/* Impact badge */}
      <div
        className={`px-4 py-2 rounded-full font-space-mono font-bold text-sm mb-6 ${
          crop.impactType === 'positive'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}
      >
        {crop.impact}
      </div>

      {/* Simulate button */}
      <Button
        onClick={() => router.push('/simulation')}
        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full w-full"
      >
        Simulate
      </Button>

      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 pointer-events-none" 
        style={{
          background: 'radial-gradient(circle, rgba(82, 183, 136, 0.1) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}

export default function CropCards() {
  const router = useRouter()

  return (
    <section className="py-20 px-6 md:px-12 relative">
      {/* Subtle animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-accent/5 to-background -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Section title */}
        <div className="mb-16 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <Leaf className="text-primary" size={28} />
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground">
              Simulate by Crop Type
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Explore how different crops respond to climate variations and forecast their potential yield changes.
          </p>
        </div>

        {/* Crops grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          {crops.map((crop, i) => (
            <CropCard key={crop.id} crop={crop} delay={i * 0.1} router={router} />
          ))}
        </div>
      </div>
    </section>
  )
}
