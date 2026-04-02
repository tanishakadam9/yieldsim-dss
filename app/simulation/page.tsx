'use client'

import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import SimulationBuilder from '@/components/simulation-builder'

export default function SimulationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-[#E8DCC8]">
      <Navbar />

      <main className="max-w-4xl mx-auto pt-32 pb-16 px-6 md:px-12">
        {/* Page header */}
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-4xl font-playfair font-bold text-foreground mb-3">
            Climate Simulation
          </h1>
          <p className="text-muted-foreground text-lg">
            Simulate future climate scenarios and predict crop yield impact.
          </p>
        </div>

        <SimulationBuilder />
      </main>

      <Footer />
    </div>
  )
}
