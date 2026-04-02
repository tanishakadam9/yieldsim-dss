'use client'

import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import ClimateMetrics from '@/components/climate-metrics'
import CropCards from '@/components/crop-cards'
import ClimateSelector from '@/components/climate-selector'
import SimulationResults from '@/components/simulation-results'
import ClimateScenarios from '@/components/climate-scenarios'
import Newsletter from '@/components/newsletter'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-[#E8DCC8]">
      <Navbar />
      <main>
        <Hero />
        <ClimateMetrics />
        <CropCards />
        <ClimateSelector />
        <SimulationResults />
        <ClimateScenarios />
        <Newsletter />
      </main>
      <Footer />
    </div>
  )
}
