'use client'

import { useEffect, useState } from 'react'
import { Cloud, Droplets, Leaf, Globe } from 'lucide-react'

interface Stat {
  icon: React.ReactNode
  label: string
  value: string
  final: string
}

const StatCard = ({ icon, label, value, final }: Stat & { isInView?: boolean }) => {
  const [displayValue, setDisplayValue] = useState('0')
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
      }
    })

    const element = document.getElementById(`stat-${label}`)
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [label])

  useEffect(() => {
    if (!isInView) return

    const extractNumber = (str: string) => parseFloat(str.match(/[\d.]+/)?.[0] || '0')
    const targetNum = extractNumber(final)
    let current = 0

    const increment = targetNum / 30
    const interval = setInterval(() => {
      current += increment
      if (current >= targetNum) {
        setDisplayValue(final)
        clearInterval(interval)
      } else {
        if (final.includes('%')) {
          setDisplayValue(`${current.toFixed(1)}%`)
        } else if (final.includes('°C')) {
          setDisplayValue(`${current.toFixed(1)}°C`)
        } else {
          setDisplayValue(current.toFixed(1))
        }
      }
    }, 30)

    return () => clearInterval(interval)
  }, [isInView, final])

  return (
    <div
      id={`stat-${label}`}
      className="glass p-6 rounded-2xl text-center hover:shadow-lg transition-all hover:scale-105 hover:animate-glow"
    >
      <div className="text-4xl mb-3 flex justify-center">{icon}</div>
      <div className="text-3xl font-space-mono font-bold text-primary mb-2">
        {displayValue}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export default function ClimateMetrics() {
  const stats: Stat[] = [
    {
      icon: '🌡️',
      label: 'Avg Temp Rise',
      value: '+0°C',
      final: '+1.8°C',
    },
    {
      icon: '🌧️',
      label: 'Rainfall Variance',
      value: '0%',
      final: '±23%',
    },
    {
      icon: '🌾',
      label: 'Yield Impact',
      value: '0%',
      final: '-12%',
    },
    {
      icon: '🌍',
      label: 'Regions Simulated',
      value: '0+',
      final: '140+',
    },
  ]

  return (
    <section className="py-16 px-6 md:px-12 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
          {stats.map((stat, i) => (
            <div key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <StatCard {...stat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
