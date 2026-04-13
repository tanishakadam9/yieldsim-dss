'use client'

import React from 'react'
import Image from 'next/image'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function AnalyticsPage() {
  const charts = [
    {
      title: "Crop Type Distribution",
      description: "Visualizing the global share of records by crop type derived directly from the climate dataset.",
      src: "/charts/crop_distribution_pie.png"
    },
    {
      title: "Adaptation Strategies",
      description: "Analysis of various adopted climate resilience practices recorded across agricultural segments.",
      src: "/charts/adaptation_strategies_pie.png"
    },
    {
      title: "Average Yield by Country",
      description: "A cross-country comparative breakdown of mean crop yields (MT/HA).",
      src: "/charts/average_yield_comparison_bar.png"
    },
    {
      title: "Fertilizer Use vs. Yield",
      description: "A sampled correlation between the volume of fertilizer used per hectare versus output yields.",
      src: "/charts/fertilizer_yield_scatter.png"
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background font-dmsans">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-20 px-6 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-foreground mb-4">
            Dataset Analytics
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            High-resolution visual exports aggregated dynamically from the 10,000-row global climate and agriculture dataset.
          </p>
        </div>

        {/* Masonry-style Grid Layout for Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {charts.map((chart, index) => (
            <div key={index} className="glass rounded-3xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center">
              <h2 className="font-playfair font-bold text-xl text-foreground mb-2 w-full text-left">
                {chart.title}
              </h2>
              <p className="text-sm text-muted-foreground mb-6 w-full text-left">
                {chart.description}
              </p>
              
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-white/5 mx-auto border border-white/10 flex items-center justify-center">
                <Image
                  src={chart.src}
                  alt={chart.title}
                  fill
                  className="object-contain p-2"
                  unoptimized // since we are serving static PNGs
                />
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
