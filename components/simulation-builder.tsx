'use client'

import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type CropKey = 'Rice' | 'Wheat' | 'Corn' | 'Sugarcane' | 'Maize'

export default function SimulationBuilder() {
  const [tempChange, setTempChange] = useState(0)
  const [rainfallChange, setRainfallChange] = useState(0)
  const [moistureChange, setMoistureChange] = useState(0)
  const [humidityChange, setHumidityChange] = useState(0)
  const [selectedCrop, setSelectedCrop] = useState<CropKey>('Wheat')
  const [results, setResults] = useState<null | {
    baseline: number
    simulated: string
    pct: string
    totalChange: number
    tempImpact: number
    rainImpact: number
  }>(null)

  const runSimulation = () => {
    const baseYields: Record<CropKey, number> = { Rice: 4.0, Wheat: 3.2, Corn: 4.5, Sugarcane: 6.0, Maize: 4.2 }
    const baseline = baseYields[selectedCrop]
    const tempImpact = tempChange > 0 ? -(tempChange * 5) : tempChange * -2
    const rainImpact = rainfallChange > 0 ? rainfallChange * 0.1 : rainfallChange * 0.15
    const soilImpact = moistureChange * 0.08
    const totalChange = tempImpact + rainImpact + soilImpact
    const simulated = Math.max(0, baseline + (baseline * totalChange / 100)).toFixed(2)
    const pct = ((parseFloat(simulated) - baseline) / baseline * 100).toFixed(1)
    setResults({ baseline, simulated, pct, totalChange, tempImpact, rainImpact })
  }

  const sliders = [
    { emoji: '🌡️', label: 'Temperature Change', value: tempChange, onChange: setTempChange, min: -5, max: 5, step: 0.5, unit: '°C' },
    { emoji: '🌧️', label: 'Rainfall Change', value: rainfallChange, onChange: setRainfallChange, min: -50, max: 50, step: 5, unit: '%' },
    { emoji: '💧', label: 'Soil Moisture Change', value: moistureChange, onChange: setMoistureChange, min: -30, max: 30, step: 5, unit: '%' },
    { emoji: '🌫️', label: 'Humidity Change', value: humidityChange, onChange: setHumidityChange, min: -20, max: 20, step: 5, unit: '%' },
  ]

  return (
    <div>
      {/* Scenario Builder card */}
      <div className="glass rounded-3xl p-8 md:p-12 animate-fade-in-up">
        <h2 className="text-2xl font-playfair font-bold text-foreground mb-8">
          Simulate Future Climate Scenarios
        </h2>

        <div className="space-y-8">
          {sliders.map((s) => (
            <div key={s.label} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 font-medium text-foreground">
                  <span className="text-2xl">{s.emoji}</span>
                  {s.label}
                </label>
                <span className="font-space-mono text-xl font-bold text-primary">
                  {s.value > 0 ? '+' : ''}{s.value}{s.unit}
                </span>
              </div>
              <Slider
                value={[s.value]}
                onValueChange={(val) => s.onChange(val[0])}
                min={s.min}
                max={s.max}
                step={s.step}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{s.min}{s.unit}</span>
                <span>{s.max}{s.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Crop selector */}
        <div className="mt-8 space-y-3">
          <label className="flex items-center gap-3 font-medium text-foreground">
            <span className="text-2xl">🌱</span>
            Crop Type
          </label>
          <Select value={selectedCrop} onValueChange={(v) => setSelectedCrop(v as CropKey)}>
            <SelectTrigger className="glass border-white/30 rounded-2xl text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass border-white/30 rounded-2xl">
              {(['Rice', 'Wheat', 'Corn', 'Sugarcane', 'Maize'] as CropKey[]).map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={runSimulation}
          className="w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 text-base font-semibold"
        >
          Run Simulation
        </Button>
      </div>

      {/* Results card */}
      {results && (
        <div className="glass rounded-3xl p-8 mt-8 animate-fade-in-up">
          <h3 className="text-xl font-playfair font-bold text-foreground mb-6">Simulation Results</h3>

          {/* Big impact percentage */}
          <div className="text-center mb-8">
            <span
              className={`font-space-mono font-bold text-5xl ${
                parseFloat(results.pct) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {parseFloat(results.pct) >= 0 ? '+' : ''}{results.pct}%
            </span>
            <p className="text-muted-foreground mt-2 text-sm">Yield Change</p>

            {/* Impact badge */}
            <div className="mt-4 flex justify-center">
              {results.totalChange > 2 ? (
                <span className="px-4 py-2 rounded-full font-bold text-sm bg-green-100 text-green-800">
                  🟢 Positive Impact
                </span>
              ) : results.totalChange < -2 ? (
                <span className="px-4 py-2 rounded-full font-bold text-sm bg-red-100 text-red-800">
                  🔴 Negative Impact
                </span>
              ) : (
                <span className="px-4 py-2 rounded-full font-bold text-sm bg-yellow-100 text-yellow-800">
                  🟡 Neutral
                </span>
              )}
            </div>
          </div>

          {/* Comparison table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'hsl(var(--primary))' }} className="text-primary-foreground">
                  <th className="text-left p-3 rounded-tl-xl">Condition</th>
                  <th className="text-center p-3">Baseline</th>
                  <th className="text-center p-3 rounded-tr-xl">Simulated</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white/10">
                  <td className="p-3 font-medium text-foreground">Yield (t/ha)</td>
                  <td className="p-3 text-center font-space-mono text-primary">{results.baseline.toFixed(2)}</td>
                  <td className="p-3 text-center font-space-mono font-bold text-primary">{results.simulated}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-foreground">Temperature Impact</td>
                  <td className="p-3 text-center text-muted-foreground">—</td>
                  <td className={`p-3 text-center font-space-mono font-bold ${results.tempImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {results.tempImpact >= 0 ? '+' : ''}{results.tempImpact.toFixed(1)}%
                  </td>
                </tr>
                <tr className="bg-white/10">
                  <td className="p-3 font-medium text-foreground">Rainfall Impact</td>
                  <td className="p-3 text-center text-muted-foreground">—</td>
                  <td className={`p-3 text-center font-space-mono font-bold ${results.rainImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {results.rainImpact >= 0 ? '+' : ''}{results.rainImpact.toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary paragraph */}
          <p className="text-muted-foreground text-sm leading-relaxed">
            Under this scenario, <strong className="text-foreground">{selectedCrop}</strong> yield is expected to{' '}
            <strong className={parseFloat(results.pct) >= 0 ? 'text-green-600' : 'text-red-600'}>
              {parseFloat(results.pct) >= 0 ? 'increase' : 'decrease'} by {Math.abs(parseFloat(results.pct))}%
            </strong>{' '}
            due to the applied climate changes.
          </p>
        </div>
      )}
    </div>
  )
}
