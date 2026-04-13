'use client'

import { useState, useEffect } from 'react'
import { saveSimulation, getSimulations } from '@/lib/db'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { runSimulation, type SimulationResult } from '@/lib/predictionModel'
import { cropOptimalRanges } from '@/lib/dataset'

type CropKey = keyof typeof cropOptimalRanges

export default function SimulationBuilder() {
  const [tempChange, setTempChange] = useState(0)
  const [rainfallChange, setRainfallChange] = useState(0)
  const [co2Change, setCo2Change] = useState(0)
  const [moistureChange, setMoistureChange] = useState(0)
  const [humidityChange, setHumidityChange] = useState(0)
  const [selectedCrop, setSelectedCrop] = useState<CropKey>('Wheat')
  const [results, setResults] = useState<SimulationResult | null>(null)
  const [pastSimulations, setPastSimulations] = useState<any[]>([])

  useEffect(() => {
    getSimulations().then(setPastSimulations)
  }, [])

  const handleRunSimulation = async () => {
    const result = runSimulation({
      crop: selectedCrop,
      tempChange,
      precipChange: rainfallChange,
      co2Change,
    })
    setResults(result)

    await saveSimulation({
      crop_type: selectedCrop,
      temp_change: tempChange,
      rainfall_change: rainfallChange,
      soil_moisture_change: moistureChange,
      humidity_change: humidityChange,
      baseline_yield: result.baselineYield,
      simulated_yield: result.simulatedYield,
      impact_percent: result.changePercent,
      impact_label: result.impact,
      summary: result.summary,
    })
    getSimulations().then(setPastSimulations)
  }

  const sliders = [
    { emoji: '🌡️', label: 'Temperature Change', value: tempChange,    onChange: setTempChange,    min: -5,  max: 5,  step: 0.5, unit: '°C' },
    { emoji: '🌧️', label: 'Rainfall Change',    value: rainfallChange,onChange: setRainfallChange, min: -50, max: 50, step: 5,   unit: '%'  },
    { emoji: '💨', label: 'CO₂ Change (MT)',    value: co2Change,      onChange: setCo2Change,      min: -10, max: 10, step: 1,   unit: 'MT' },
    { emoji: '💧', label: 'Soil Moisture Change',value: moistureChange, onChange: setMoistureChange, min: -30, max: 30, step: 5,   unit: '%'  },
    { emoji: '🌫️', label: 'Humidity Change',    value: humidityChange, onChange: setHumidityChange, min: -20, max: 20, step: 5,   unit: '%'  },
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
              {(Object.keys(cropOptimalRanges) as CropKey[]).map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleRunSimulation}
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
                results.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {results.changePercent >= 0 ? '+' : ''}{results.changePercent}%
            </span>
            <p className="text-muted-foreground mt-2 text-sm">Yield Change</p>

            {/* Impact badge */}
            <div className="mt-4 flex justify-center">
              {results.impact === 'Positive' ? (
                <span className="px-4 py-2 rounded-full font-bold text-sm bg-green-100 text-green-800">
                  🟢 Positive Impact
                </span>
              ) : results.impact === 'Negative' ? (
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
                  <th className="text-center p-3">Baseline (dataset avg)</th>
                  <th className="text-center p-3 rounded-tr-xl">Simulated</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white/10">
                  <td className="p-3 font-medium text-foreground">Yield (t/ha)</td>
                  <td className="p-3 text-center font-space-mono text-primary">{results.baselineYield.toFixed(2)}</td>
                  <td className="p-3 text-center font-space-mono font-bold text-primary">{results.simulatedYield.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-foreground">Change (%)</td>
                  <td className="p-3 text-center text-muted-foreground">—</td>
                  <td className={`p-3 text-center font-space-mono font-bold ${results.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {results.changePercent >= 0 ? '+' : ''}{results.changePercent}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary paragraph from model */}
          <p className="text-muted-foreground text-sm leading-relaxed">
            {results.summary}
          </p>
        </div>
      )}

      {/* Past Simulations */}
      {pastSimulations.length > 0 && (
        <div className="glass rounded-3xl p-6 mt-8 animate-fade-in-up overflow-x-auto">
          <h3 className="text-xl font-playfair font-bold text-foreground mb-6">Past Simulations</h3>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'hsl(var(--primary))' }} className="text-primary-foreground">
                <th className="text-left p-3 rounded-tl-xl">Crop</th>
                <th className="text-center p-3">Baseline</th>
                <th className="text-center p-3">Simulated</th>
                <th className="text-center p-3">Impact</th>
                <th className="text-center p-3 rounded-tr-xl">Date</th>
              </tr>
            </thead>
            <tbody>
              {pastSimulations.map((sim, i) => {
                const impactPercent = Number(sim.impact_percent)
                return (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white/10' : ''}>
                    <td className="p-3 font-medium text-foreground">{sim.crop_type}</td>
                    <td className="p-3 text-center">{Number(sim.baseline_yield).toFixed(2)}</td>
                    <td className="p-3 text-center font-bold text-primary">{Number(sim.simulated_yield).toFixed(2)}</td>
                    <td className={`p-3 text-center font-bold ${impactPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {impactPercent >= 0 ? '+' : ''}{impactPercent}%
                    </td>
                    <td className="p-3 text-center text-muted-foreground">{new Date(sim.created_at).toLocaleDateString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
