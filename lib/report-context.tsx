'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface ReportData {
  filters: {
    yearRange: string
    selectedCrops: string
    selectedCountry: string
  }
  metrics: {
    avgTemperature: string
    avgRainfall: number
    avgSoilHealth: string
    avgYield: string
  }
  climateAnalysisInputs: {
    temp: number
    rain: number
    wind: number
    humidity: number
    moisture: number
  }
  predictionInputs?: any
  predictionResult?: any
  simulationResult?: any
  recommendations?: any[]
  alerts?: any
  tableData?: any[]
  // Data Viz Dashboard stats
  vizStats?: {
    avgYield: string
    avgTemp: string
    avgRainfall: string
    avgEconomicImpact: string
    topCountry: string
    topCrop: string
  }
  // Data for tables 7a and 7b
  yearlyYieldSummary?: any[]
  yieldByCountry?: any[]
}

interface ReportContextType {
  reportData: ReportData | null
  setReportData: (data: ReportData) => void
}

const ReportContext = createContext<ReportContextType | undefined>(undefined)

export function ReportProvider({ children }: { children: ReactNode }) {
  const [reportData, setReportData] = useState<ReportData | null>(null)

  return (
    <ReportContext.Provider value={{ reportData, setReportData }}>
      {children}
    </ReportContext.Provider>
  )
}

export function useReport() {
  const context = useContext(ReportContext)
  if (context === undefined) {
    throw new Error('useReport must be used within a ReportProvider')
  }
  return context
}
