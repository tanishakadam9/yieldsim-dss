'use client'

import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function ClimateSelector() {
  const router = useRouter()
  const [temperature, setTemperature] = useState(0)
  const [rainfall, setRainfall] = useState(1500)
  const [sunlight, setSunlight] = useState(10)
  const [co2, setCo2] = useState(420)

  const parameters = [
    {
      emoji: '🌡️',
      label: 'Temperature',
      value: temperature,
      onChange: setTemperature,
      min: -5,
      max: 10,
      unit: '°C',
    },
    {
      emoji: '🌧️',
      label: 'Rainfall',
      value: rainfall,
      onChange: setRainfall,
      min: 0,
      max: 3000,
      unit: 'mm',
    },
    {
      emoji: '☀️',
      label: 'Sunlight Hours',
      value: sunlight,
      onChange: setSunlight,
      min: 4,
      max: 16,
      unit: 'hrs/day',
    },
    {
      emoji: '💨',
      label: 'CO₂ Level',
      value: co2,
      onChange: setCo2,
      min: 280,
      max: 800,
      unit: 'ppm',
    },
  ]

  return (
    <section className="py-20 px-6 md:px-12 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left - Climate Parameters */}
          <div className="glass p-8 md:p-12 rounded-3xl animate-fade-in-up">
            <h2 className="text-3xl font-playfair font-bold text-foreground mb-8">
              Set Climate Parameters
            </h2>

            <div className="space-y-8">
              {parameters.map((param) => (
                <div key={param.label} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 font-medium text-foreground">
                      <span className="text-2xl">{param.emoji}</span>
                      {param.label}
                    </label>
                    <span className="font-space-mono text-xl font-bold text-primary">
                      {param.value.toFixed(param.min >= 0 && param.max <= 100 ? 0 : 0)}
                      {param.unit}
                    </span>
                  </div>

                  <Slider
                    value={[param.value]}
                    onValueChange={(val) => param.onChange(val[0])}
                    min={param.min}
                    max={param.max}
                    step={1}
                    className="w-full"
                  />

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{param.min}{param.unit}</span>
                    <span>{param.max}{param.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 text-base font-semibold"
            >
              Proceed to Dashboard →
            </Button>
          </div>

          {/* Right - Yield Impact Chart */}
          <div className="glass p-8 md:p-12 rounded-3xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-8">
              <BarChart3 className="text-primary" size={28} />
              <h3 className="text-2xl font-playfair font-bold text-foreground">
                Predicted Yield Impact
              </h3>
            </div>

            {/* Simple bar visualization */}
            <div className="space-y-6">
              {[
                { crop: 'Wheat', impact: temperature > 2 ? -25 : -15 + temperature * 2, color: 'from-red-500 to-orange-500' },
                { crop: 'Corn', impact: rainfall < 1000 ? -20 : -5 + (rainfall - 1000) / 500, color: 'from-orange-500 to-yellow-500' },
                { crop: 'Soybean', impact: temperature > 3 ? -22 : -10 + temperature, color: 'from-red-600 to-orange-600' },
                { crop: 'Rice', impact: rainfall > 2000 ? 15 : -8 + (rainfall - 1000) / 200, color: 'from-green-500 to-emerald-500' },
              ].map((item) => (
                <div key={item.crop}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-foreground">{item.crop}</span>
                    <span className={`font-space-mono font-bold ${item.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.impact.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${item.color} transition-all duration-300`}
                      style={{
                        width: `${Math.max(0, Math.min(100, 50 + item.impact / 2))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Risk levels */}
            <div className="mt-8 p-4 rounded-lg bg-white/10 border border-white/20">
              <p className="text-sm text-muted-foreground mb-2">Overall Risk Level:</p>
              <div className="flex items-center gap-2">
                {temperature > 3 || rainfall < 1000 ? (
                  <>
                    <span className="text-red-500 text-lg">🔴</span>
                    <span className="font-bold text-red-600">High Risk</span>
                  </>
                ) : temperature > 1 || rainfall < 1500 ? (
                  <>
                    <span className="text-yellow-500 text-lg">🟡</span>
                    <span className="font-bold text-yellow-600">Medium Risk</span>
                  </>
                ) : (
                  <>
                    <span className="text-green-500 text-lg">🟢</span>
                    <span className="font-bold text-green-600">Low Risk</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
