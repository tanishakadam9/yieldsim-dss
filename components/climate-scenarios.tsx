'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Scenario {
  id: string
  icon: string
  title: string
  description: string
  impactLevel: 'critical' | 'high' | 'moderate'
}

const scenarios: Scenario[] = [
  {
    id: '1',
    icon: '🔥',
    title: 'Heatwave 2050',
    description: '+5°C global temperature with extended drought periods affecting major agricultural regions.',
    impactLevel: 'critical',
  },
  {
    id: '2',
    icon: '🌊',
    title: 'Flood Season',
    description: 'Extreme rainfall events (+50% precipitation) causing waterlogging and soil erosion.',
    impactLevel: 'critical',
  },
  {
    id: '3',
    icon: '🏜️',
    title: 'Drought Cycle',
    description: 'Prolonged dry conditions with soil moisture depletion affecting crop water availability.',
    impactLevel: 'high',
  },
  {
    id: '4',
    icon: '❄️',
    title: 'Late Frost',
    description: 'Unexpected cold fronts during spring growth causing crop damage and yield loss.',
    impactLevel: 'high',
  },
]

const ScenarioCard = ({ scenario, delay }: { scenario: Scenario; delay: number }) => {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const impactColors = {
    critical: 'from-red-500 to-orange-500',
    high: 'from-orange-500 to-yellow-500',
    moderate: 'from-yellow-500 to-amber-500',
  }

  return (
    <div
      className="glass rounded-2xl p-6 min-w-96 flex-shrink-0 transition-all duration-300 hover:shadow-xl"
      style={{
        animation: 'fadeInUp 0.6s ease-out',
        animationDelay: `${delay}s`,
        transform: isHovered ? 'rotateY(5deg) rotateX(-5deg)' : 'rotateY(0deg) rotateX(0deg)',
        transformStyle: 'preserve-3d',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon with rotation */}
      <div
        className="text-5xl mb-4 inline-block"
        style={{
          animation: 'rotate-icon 4s linear infinite',
        }}
      >
        {scenario.icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-playfair font-bold text-foreground mb-3">
        {scenario.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-6">
        {scenario.description}
      </p>

      {/* Impact level badge */}
      <div className="mb-6">
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${impactColors[scenario.impactLevel]}`}>
          {scenario.impactLevel === 'critical' ? '🔴 Critical Impact' : '🟠 High Impact'}
        </div>
      </div>

      {/* Button */}
      <Button
        onClick={() => router.push('/simulation')}
        className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full"
      >
        Run Scenario
      </Button>
    </div>
  )
}

export default function ClimateScenarios() {
  return (
    <section className="py-20 px-6 md:px-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-l from-orange-100/30 via-transparent to-transparent -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Section title */}
        <div className="mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-2">
            Climate Scenario Explorer
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Run pre-configured climate scenarios to understand potential impacts on global agriculture and prepare for future challenges.
          </p>
        </div>

        {/* Horizontal scrollable scenarios */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6 md:gap-8 min-w-max md:min-w-full md:grid md:grid-cols-2 lg:grid-cols-4">
            {scenarios.map((scenario, i) => (
              <ScenarioCard key={scenario.id} scenario={scenario} delay={i * 0.1} />
            ))}
          </div>
        </div>

        {/* Info box */}
        <div className="mt-12 glass p-6 rounded-2xl border-l-4 border-primary">
          <h4 className="font-bold text-foreground mb-2">💡 Scenario Insights</h4>
          <p className="text-sm text-muted-foreground">
            These pre-built scenarios are based on IPCC climate projections and historical agricultural data. Run simulations to see detailed crop-specific forecasts and mitigation strategies.
          </p>
        </div>
      </div>
    </section>
  )
}
