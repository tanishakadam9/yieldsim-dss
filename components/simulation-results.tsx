'use client'

import { CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SimulationResults() {
  return (
    <section className="py-20 px-6 md:px-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-accent/5 -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Descriptive content */}
          <div className="animate-fade-in-up space-y-6">
            <h2 className="text-4xl font-playfair font-bold text-foreground">
              Understand Your Simulation Results
            </h2>

            <p className="text-lg text-muted-foreground">
              Our AI-powered simulation provides detailed insights into how climate variables impact your crops through every growth stage.
            </p>

            {/* Timeline infographic */}
            <div className="space-y-4 py-8">
              <div className="flex items-center gap-4">
                <div className="text-5xl">🌱</div>
                <div>
                  <h4 className="font-bold text-foreground">Germination Stage</h4>
                  <p className="text-sm text-muted-foreground">Initial soil conditions and temperature</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-5xl">🌿</div>
                <div>
                  <h4 className="font-bold text-foreground">Growth Phase</h4>
                  <p className="text-sm text-muted-foreground">Water availability and sunlight exposure</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-5xl">🌾</div>
                <div>
                  <h4 className="font-bold text-foreground">Maturation Stage</h4>
                  <p className="text-sm text-muted-foreground">Final yield and quality assessment</p>
                </div>
              </div>
            </div>

            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8">
              View Full Report
            </Button>
          </div>

          {/* Right - Results visualization */}
          <div className="glass p-8 md:p-12 rounded-3xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {/* Confidence bars */}
            <h3 className="text-2xl font-playfair font-bold text-foreground mb-8">
              Simulation Confidence
            </h3>

            <div className="space-y-6">
              {[
                { label: 'Temperature Model', confidence: 94 },
                { label: 'Rainfall Prediction', confidence: 87 },
                { label: 'Soil Analysis', confidence: 91 },
                { label: 'Yield Forecast', confidence: 85 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-foreground">{item.label}</span>
                    <span className="font-space-mono font-bold text-primary">{item.confidence}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-secondary to-accent transition-all duration-500"
                      style={{ width: `${item.confidence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Risk assessment */}
            <div className="mt-10 space-y-4">
              <h3 className="text-lg font-bold text-foreground">Risk Assessment</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-foreground text-sm">Low Frost Risk</p>
                    <p className="text-xs text-muted-foreground">Temperatures remain above critical thresholds</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-foreground text-sm">Moderate Drought Potential</p>
                    <p className="text-xs text-muted-foreground">Rainfall variance may impact irrigation needs</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-foreground text-sm">Optimal Sunlight Exposure</p>
                    <p className="text-xs text-muted-foreground">Conditions support photosynthesis and growth</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating fruit decoration */}
            <div className="absolute -bottom-8 -right-8 text-9xl opacity-20 pointer-events-none">
              🍅
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
