'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail } from 'lucide-react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail('')
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  return (
    <section className="py-20 px-6 md:px-12 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 via-accent/20 to-secondary/20 -z-10" />

      {/* Floating cloud shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="absolute text-6xl opacity-10 animate-drift"
            style={{
              animationDelay: `${i * 4}s`,
              left: `${i * 40}%`,
              top: `${20 + i * 20}%`,
            }}
          >
            ☁️
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="glass p-8 md:p-16 rounded-3xl text-center animate-fade-in-up backdrop-blur-md">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="text-5xl">📬</div>
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">
            Get Climate Crop Reports in Your Inbox
          </h2>

          {/* Subheading */}
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Subscribe to our weekly reports featuring climate forecasts, crop yield predictions, and actionable insights for agricultural planning.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass rounded-full px-6 py-3 text-foreground placeholder:text-muted-foreground border-white/30 focus:border-primary"
              required
            />
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 whitespace-nowrap"
            >
              {submitted ? '✓ Subscribed' : 'Subscribe'}
            </Button>
          </form>

          {/* Success message */}
          {submitted && (
            <div className="mt-6 inline-block glass px-6 py-3 rounded-full border border-green-500/50">
              <p className="text-green-700 font-medium text-sm">
                ✓ Thank you for subscribing! Check your email for confirmation.
              </p>
            </div>
          )}

          {/* Features */}
          <div className="mt-12 grid sm:grid-cols-3 gap-6">
            {[
              { icon: '📊', title: 'Weekly Reports', desc: 'Comprehensive climate and yield forecasts' },
              { icon: '🎯', title: 'Actionable Insights', desc: 'Practical recommendations for farmers' },
              { icon: '🌍', title: 'Global Data', desc: 'Coverage across 140+ agricultural regions' },
            ].map((feature, i) => (
              <div key={i} className="space-y-2">
                <div className="text-4xl">{feature.icon}</div>
                <h4 className="font-bold text-foreground">{feature.title}</h4>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
