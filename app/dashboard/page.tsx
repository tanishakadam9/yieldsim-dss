'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
// Removed database imports
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import SimulationBuilder from '@/components/simulation-builder'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LineChart, BarChart, AreaChart, ScatterChart, PieChart,
  ResponsiveContainer, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, Line, Bar, Area, Scatter, Pie, Cell,
} from 'recharts'
import {
  Thermometer, CloudRain, Droplets, Wheat,
  BarChart3, AlertTriangle, Leaf, Wind, Star,
} from 'lucide-react'
import {
  dashboardStats,
  monthlyTemperature,
  monthlyRainfall,
  yearlyYieldByCrop,
  yieldByCountry,
  scatterData,
  cropDistribution,
  cropOptimalRanges,
} from '@/lib/dataset'
import {
  predictYield as modelPredictYield,
  recommendCrops,
  runSimulation as modelRunSimulation,
  type PredictionResult,
  type CropRecommendation,
  type SimulationResult,
  getConfidence, getStatus, getRecommendation, getAdaptationStrategy,
} from '@/lib/predictionModel'
import { generateDashboardReport } from '@/lib/generateReport'
import { Download } from 'lucide-react'

// ─── Real dataset historical records ─────────────────────────────────────────
const historicalRows = [
  { year: 2024, crop: 'Corn',     temp: '3.23°C',  rain: '2913 mm', yield: '1.74 t/ha' },
  { year: 2024, crop: 'Wheat',    temp: '21.11°C', rain: '1302 mm', yield: '1.72 t/ha' },
  { year: 2023, crop: 'Rice',     temp: '18.50°C', rain: '1850 mm', yield: '2.18 t/ha' },
  { year: 2022, crop: 'Barley',   temp: '12.30°C', rain: '980 mm',  yield: '2.03 t/ha' },
  { year: 2021, crop: 'Soybeans', temp: '22.10°C', rain: '1420 mm', yield: '2.46 t/ha' },
]

// ─── Sidebar nav items ───────────────────────────────────────────────────────────
const navItems = [
  { id: 'overview',    label: 'Dashboard Overview',    Icon: BarChart3 },
  { id: 'climate',     label: 'Climate Analysis',       Icon: Thermometer },
  { id: 'yield',       label: 'Crop Yield Prediction',  Icon: Wheat },
  { id: 'simulation',  label: 'Climate Simulation',     Icon: Wind },
  { id: 'recommend',   label: 'Crop Recommendation',    Icon: Leaf },
  { id: 'alerts',      label: 'Risk Alerts',            Icon: AlertTriangle },
  { id: 'viz',         label: 'Data Visualization',     Icon: BarChart3 },
]

// ─── Heatmap helpers ─────────────────────────────────────────────────────────
const heatmapCropNames = Object.keys(cropOptimalRanges)
const heatmapColumns = ['Temp Min', 'Temp Max', 'Precip Min', 'Precip Max', 'Soil Min']

function getHeatmapValue(cropName: string, col: string): number {
  const r = cropOptimalRanges[cropName]
  if (col === 'Temp Min')   return r.tempMin
  if (col === 'Temp Max')   return r.tempMax
  if (col === 'Precip Min') return r.precipMin
  if (col === 'Precip Max') return r.precipMax
  if (col === 'Soil Min')   return r.soilHealthMin
  return 0
}

function heatCell(col: string, value: number) {
  // Colour cells relative to "good" ranges per column
  if (col === 'Temp Min')   return value <= 12  ? 'bg-green-200 text-green-900' : value <= 18  ? 'bg-yellow-100 text-yellow-900' : 'bg-orange-100 text-orange-900'
  if (col === 'Temp Max')   return value >= 28  ? 'bg-green-200 text-green-900' : value >= 22  ? 'bg-yellow-100 text-yellow-900' : 'bg-orange-100 text-orange-900'
  if (col === 'Precip Min') return value <= 900 ? 'bg-green-200 text-green-900' : value <= 1200? 'bg-yellow-100 text-yellow-900' : 'bg-orange-100 text-orange-900'
  if (col === 'Precip Max') return value >= 2200? 'bg-green-200 text-green-900' : value >= 1800? 'bg-yellow-100 text-yellow-900' : 'bg-orange-100 text-orange-900'
  if (col === 'Soil Min')   return value <= 50  ? 'bg-green-200 text-green-900' : value <= 55  ? 'bg-yellow-100 text-yellow-900' : 'bg-orange-100 text-orange-900'
  return 'bg-white/10 text-foreground'
}

function calculateProfit(row: {
  crop_yield_mt_per_ha: number
  economic_impact_million_usd: number
  fertilizer_use_kg_per_ha: number
  pesticide_use_kg_per_ha: number
}): number {
  const revenue = row.crop_yield_mt_per_ha * (row.economic_impact_million_usd / 100)
  const cost = (row.fertilizer_use_kg_per_ha * 2 + row.pesticide_use_kg_per_ha * 5) / 1000
  return parseFloat(Math.max(0, revenue - cost).toFixed(2))
}

// ─── Dashboard component ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const [active, setActive] = useState('overview')

  const [rawData, setRawData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fiveYearGroups = ['1990-1994','1995-1999','2000-2004','2005-2009', '2010-2014','2015-2019','2020-2024']
  const [selectedYearRange, setSelectedYearRange] = useState('2020-2024')
  
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['Rice', 'Wheat', 'Corn'])
  const [selectedCountry, setSelectedCountry] = useState('All')

  const [lastPredictionInputs, setLastPredictionInputs] = useState<any>(null)
  const [lastPredictionResult, setLastPredictionResult] = useState<any>(null)

  const [economicView, setEconomicView] = useState<'avg'|'total'>('avg')

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/climate-data')
        const data = await response.json()
        if (data && !data.error) {
          setRawData(data)
          console.log('Raw data count:', data.length)
          console.log('Sample row:', data[0])
        }
      } catch (err) {
        console.error('Failed to load local climate data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Climate Analysis state
  const [cTemp, setCTemp] = useState(28)
  const [cRain, setCRain] = useState(210)
  const [cWind, setCWind] = useState(15)
  const [cHumidity, setCHumidity] = useState(60)
  const [cMoisture, setCMoisture] = useState(42)
  const [climateCharts, setClimateCharts] = useState({ temp: cTemp, rain: cRain, humidity: cHumidity, moisture: cMoisture })

  // Yield prediction state
  const [pCrop, setPCrop] = useState('Wheat')
  const [pTemp, setPTemp] = useState(20)
  const [pPrecip, setPPrecip] = useState(1200)
  const [pCo2, setPCo2] = useState(20)
  const [pSoilHealth, setPSoilHealth] = useState(65)
  const [pIrrigation, setPIrrigation] = useState(50)
  const [pFert, setPFert] = useState(60)
  const [pAdapt, setPAdapt] = useState('No Adaptation')
  const [yieldResult, setYieldResult] = useState<PredictionResult | null>(null)

  // Simulation state (managed inside SimulationBuilder, but for dashboard section we use inline)
  const [simCrop, setSimCrop] = useState('Wheat')
  const [simTempChange, setSimTempChange] = useState(0)
  const [simPrecipChange, setSimPrecipChange] = useState(0)
  const [simCo2Change, setSimCo2Change] = useState(0)
  const [simResult, setSimResult] = useState<SimulationResult | null>(null)

  // Recommendations state
  const [rTemp, setRTemp] = useState(20)
  const [rPrecip, setRPrecip] = useState(1200)
  const [rSoilHealth, setRSoilHealth] = useState(65)
  const [rCo2, setRCo2] = useState(20)
  const [rIrrigation, setRIrrigation] = useState(50)
  const [recs, setRecs] = useState<CropRecommendation[] | null>(null)

  // Alerts state
  const [alertThresholds, setAlertThresholds] = useState({ temp: '', rain: '', soilHealth: '' })
  const [savedThresholds, setSavedThresholds] = useState<{ temp: number; rain: number; soilHealth: number } | null>(null)
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [thresholds, setThresholds] = useState({ temperature_threshold: 35, rainfall_threshold: 50, moisture_threshold: 20 })

  useEffect(() => {
    // Database loading removed
  }, [])

    // old handlePredictYield removed

  const handleRunSimulation = () => {
    const result = modelRunSimulation({ crop: simCrop, tempChange: simTempChange, precipChange: simPrecipChange, co2Change: simCo2Change })
    setSimResult(result)
  }

  const handleGetRecommendations = () => {
    const result = recommendCrops({ temperature: rTemp, precipitation: rPrecip, soilHealth: rSoilHealth, co2: rCo2, irrigationAccess: rIrrigation })
    setRecs(result)
  }

  // Alert activation logic using real dataset ranges
  const getAlertActive = (id: string) => {
    if (!savedThresholds) return true
    const { temp, rain, soilHealth } = savedThresholds
    if (id === 'drought') return rain < 500 || soilHealth < 40
    if (id === 'heat')    return temp > 30
    if (id === 'flood')   return rain > 2500
    if (id === 'optimal') return temp >= 15 && temp <= 25 && rain >= 1000 && rain <= 2000
    return false
  }

  const alertDefs = [
    { id: 'drought', color: 'red',    border: 'border-red-500',    bg: 'bg-red-500/10',    badge: 'bg-red-100 text-red-800',    icon: '🔴', title: 'Drought Risk',  desc: 'Precipitation < 500mm OR Soil Health < 40',      severity: 'Critical' },
    { id: 'heat',    color: 'yellow', border: 'border-yellow-500', bg: 'bg-yellow-500/10', badge: 'bg-yellow-100 text-yellow-800', icon: '🟡', title: 'Heat Stress',  desc: 'Temperature exceeds 30°C (dataset threshold)',  severity: 'High' },
    { id: 'flood',   color: 'orange', border: 'border-orange-500', bg: 'bg-orange-500/10', badge: 'bg-orange-100 text-orange-800', icon: '🟠', title: 'Flood Risk',   desc: 'Precipitation > 2500mm (dataset max range)',   severity: 'High' },
    { id: 'optimal', color: 'green',  border: 'border-green-500',  bg: 'bg-green-500/10',  badge: 'bg-green-100 text-green-800',  icon: '🟢', title: 'Optimal',      desc: 'Temp 15–25°C AND Precipitation 1000–2000mm', severity: 'Low' },
  ]

  // chart data for climate analysis (dynamic from inputs)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const analysisAreaData = months.map((m,i) => ({ month: m, Temperature: climateCharts.temp + Math.sin(i/2)*3 }))
  const analysisBarData  = months.map((m,i) => ({ month: m, Humidity: climateCharts.humidity + (i%3), SoilMoisture: climateCharts.moisture + (i%2) }))
  const analysisLineData = months.map((m,i) => ({ month: m, Rainfall: climateCharts.rain * (0.5 + Math.abs(Math.sin(i))*0.8) }))


  const availableCrops = rawData.length ? [...new Set(rawData.map(r => r.crop_type))].sort() : ['Barley', 'Coffee', 'Corn', 'Cotton', 'Fruits', 'Rice', 'Soybeans', 'Sugarcane', 'Vegetables', 'Wheat']
  const availableCountries = rawData.length ? [...new Set(rawData.map(r => r.country))].sort() : ['Argentina', 'Australia', 'Brazil', 'Canada', 'China', 'France', 'India', 'Nigeria', 'Russia', 'USA']

  const avgTemp = rawData.length
    ? (rawData.reduce((s, r) => s + r.average_temperature_c, 0) / rawData.length).toFixed(1)
    : '28.4'
  const avgRainfall = rawData.length
    ? Math.round(rawData.reduce((s, r) => s + r.total_precipitation_mm, 0) / rawData.length)
    : 210
  const avgSoilHealth = rawData.length
    ? (rawData.reduce((s, r) => s + r.soil_health_index, 0) / rawData.length).toFixed(0)
    : '42'
  const avgYield = rawData.length
    ? (rawData.reduce((s, r) => s + r.crop_yield_mt_per_ha, 0) / rawData.length).toFixed(2)
    : '2.24'

  const datasetAvgTemp = rawData.length
    ? rawData.reduce((s, r) => s + r.average_temperature_c, 0) / rawData.length
    : 17.5
  const monthlyTempData = months.map((month, i) => ({
    month,
    temp: parseFloat((datasetAvgTemp + Math.sin((i - 2) * Math.PI / 6) * 8).toFixed(1))
  }))

  const datasetAvgRain = rawData.length
    ? rawData.reduce((s, r) => s + r.total_precipitation_mm, 0) / rawData.length / 12
    : 100
  const monthlyRainfallData = months.map((month, i) => ({
    month,
    rainfall: Math.round(datasetAvgRain * (0.4 + Math.abs(Math.sin(i * Math.PI / 6)) * 1.8))
  }))

  const [startYear, endYear] = selectedYearRange.split('-').map(Number)
  const filteredByYear = rawData.filter(r => {
    const rowYear = Number(r.year) // force number comparison
    return rowYear >= startYear && rowYear <= endYear
  })

  // When no crops are checked, default to showing all
  const activeCrops = selectedCrops.length > 0 ? selectedCrops : availableCrops

  const filteredData = filteredByYear
    .filter(r => activeCrops.includes(r.crop_type))
    .filter(r => selectedCountry === 'All' || r.country === selectedCountry)

  const yearsInRange = useMemo(() => {
    const [start, end] = selectedYearRange.split('-').map(Number)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [selectedYearRange])

  const yearlyYieldData = useMemo(() => {
    return yearsInRange.map(year => {
      const yearRows = filteredData.filter(r => Number(r.year) === year)
      const entry: Record<string, any> = { year: String(year) }
      activeCrops.forEach(crop => {
        const cropRows = yearRows.filter(r => r.crop_type === crop)
        entry[crop] = cropRows.length
          ? parseFloat((cropRows.reduce((s, r) => s + r.crop_yield_mt_per_ha, 0) / cropRows.length).toFixed(2))
          : null
      })
      return entry
    })
  }, [filteredData, yearsInRange, activeCrops])

  const compYieldByCountry = useMemo(() => {
    const countries = ['Argentina','Australia','Brazil','Canada','China',
      'France','India','Nigeria','Russia','USA']
    return countries.map(country => {
      const rows = filteredByYear.filter(r => 
        r.country === country &&
        (activeCrops.length === 0 || activeCrops.includes(r.crop_type))
      )
      return {
        country,
        yield: rows.length
          ? parseFloat((rows.reduce((s, r) => s + r.crop_yield_mt_per_ha, 0) / rows.length).toFixed(2))
          : 0
      }
    })
  }, [filteredByYear, activeCrops])

  // tempVsYield logic
  const compTempVsYield = filteredData.map(r => ({
    x: Number(r.average_temperature_c),
    y: Number(r.crop_yield_mt_per_ha),
    crop: r.crop_type
  }))

  const compCropDistribution = activeCrops.map(crop => ({
    name: crop,
    value: filteredData.filter(r => r.crop_type === crop).length
  }))

  // --- New Dashboard Section Computations ---

  const yearSummaries = yearsInRange.map(year => {
    const rows = filteredData.filter(r => Number(r.year) === year)
    if (!rows.length) return { year, avgYield: 0, avgEconomicImpact: 0, avgTemp: 0, totalProfit: 0, topCrop: '—', count: 0 }

    const avgYield = rows.reduce((s, r) => s + r.crop_yield_mt_per_ha, 0) / rows.length
    const avgEconomicImpact = rows.reduce((s, r) => s + r.economic_impact_million_usd, 0) / rows.length
    const avgTemp = rows.reduce((s, r) => s + r.average_temperature_c, 0) / rows.length
    const totalProfit = rows.reduce((s, r) => s + calculateProfit(r), 0) / rows.length

    const cropYields: Record<string, number[]> = {}
    rows.forEach(r => {
      if (!cropYields[r.crop_type]) cropYields[r.crop_type] = []
      cropYields[r.crop_type].push(r.crop_yield_mt_per_ha)
    })
    const topCrop = Object.entries(cropYields)
      .map(([crop, yields]) => ({ crop, avg: yields.reduce((a, b) => a + b, 0) / yields.length }))
      .sort((a, b) => b.avg - a.avg)[0]?.crop ?? '—'

    return {
      year,
      avgYield: parseFloat(avgYield.toFixed(2)),
      avgEconomicImpact: parseFloat(avgEconomicImpact.toFixed(0)),
      avgTemp: parseFloat(avgTemp.toFixed(1)),
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      topCrop,
      count: rows.length
    }
  })

  // Chart B1
  const yearlyProfitData = yearsInRange.map(year => {
    const rows = filteredData.filter(r => Number(r.year) === year)
    const avgProfit = rows.length
      ? rows.reduce((s, r) => s + calculateProfit(r), 0) / rows.length
      : 0
    return { year: String(year), profit: parseFloat(avgProfit.toFixed(2)) }
  })

  // Chart B2
  const countryProfitData = ['Argentina','Australia','Brazil','Canada','China',
    'France','India','Nigeria','Russia','USA']
    .filter(c => selectedCountry === 'All' || c === selectedCountry)
    .map(country => {
      const rows = filteredData.filter(r => r.country === country)
      const avgProfit = rows.length
        ? rows.reduce((s, r) => s + calculateProfit(r), 0) / rows.length
        : 0
      return { country, profit: parseFloat(avgProfit.toFixed(2)) }
    })
    .sort((a, b) => b.profit - a.profit)

  const allProfits = filteredData.map(r => calculateProfit(r))
  const maxProfit = allProfits.length ? Math.max(...allProfits).toFixed(2) : '0.00'
  const minProfit = allProfits.length ? Math.min(...allProfits).toFixed(2) : '0.00'
  const avgProfitAll = allProfits.length ? (allProfits.reduce((a, b) => a + b, 0) / allProfits.length).toFixed(2) : '0.00'

  // Chart C1
  const yearlyEconomicData = yearsInRange.map(year => {
    const rows = filteredData.filter(r => Number(r.year) === year)
    const avgImpact = rows.length
      ? rows.reduce((s, r) => s + r.economic_impact_million_usd, 0) / rows.length
      : 0
    const totalImpact = rows.reduce((s, r) => s + r.economic_impact_million_usd, 0)
    return {
      year: String(year),
      avgImpact: parseFloat(avgImpact.toFixed(2)),
      totalImpact: parseFloat(totalImpact.toFixed(0))
    }
  })

  // Chart C2
  const countryEconomicData = ['Argentina','Australia','Brazil','Canada','China',
    'France','India','Nigeria','Russia','USA']
    .filter(c => selectedCountry === 'All' || c === selectedCountry)
    .map(country => {
      const rows = filteredData.filter(r => r.country === country)
      return {
        country,
        avgImpact: rows.length
          ? parseFloat((rows.reduce((s, r) => s + r.economic_impact_million_usd, 0) / rows.length).toFixed(2))
          : 0,
        totalImpact: parseFloat(rows.reduce((s, r) => s + r.economic_impact_million_usd, 0).toFixed(0))
      }
    })
    .sort((a, b) => b.avgImpact - a.avgImpact)

  // Chart C3
  const countries = ['Argentina','Australia','Brazil','Canada','China','France','India','Nigeria','Russia','USA']
    .filter(c => selectedCountry === 'All' || c === selectedCountry)

  const heatmapData = yearsInRange.map(year => {
    const entry: Record<string, any> = { year }
    countries.forEach(country => {
      const rows = filteredData.filter(r => Number(r.year) === year && r.country === country)
      entry[country] = rows.length
        ? parseFloat((rows.reduce((s, r) => s + r.economic_impact_million_usd, 0) / rows.length).toFixed(0))
        : null
    })
    return entry
  })

  const allHeatValues = heatmapData.flatMap(row =>
    countries.map(c => row[c]).filter(Boolean)
  )
  const heatMin = allHeatValues.length ? Math.min(...allHeatValues) : 0
  const heatMax = allHeatValues.length ? Math.max(...allHeatValues) : 1

  function getHeatColor(value: number | null): string {
    if (!value) return 'bg-white/10'
    if (heatMax === heatMin) return 'bg-green-300/40 text-green-700'
    const ratio = (value - heatMin) / (heatMax - heatMin)
    if (ratio > 0.75) return 'bg-green-500/40 text-green-800'
    if (ratio > 0.5)  return 'bg-green-300/40 text-green-700'
    if (ratio > 0.25) return 'bg-yellow-300/40 text-yellow-800'
    return 'bg-red-300/40 text-red-800'
  }

  const handlePredictYield = () => {
    const yieldValueObj = modelPredictYield({
      temperature: pTemp,
      precipitation: pPrecip,
      co2Emissions: pCo2,
      fertilizerUse: pFert,
      soilHealthIndex: pSoilHealth,
      irrigationAccess: pIrrigation,
      cropType: pCrop
    })
    const yieldValue = typeof yieldValueObj === 'number' ? yieldValueObj : yieldValueObj.predictedYield;
    const confidence = getConfidence(yieldValue)
    const status = getStatus(yieldValue)
    const recommendation = getRecommendation({ yieldValue, temperature: pTemp, precipitation: pPrecip, soilHealthIndex: pSoilHealth, irrigationAccess: pIrrigation, cropType: pCrop })
    const strategy = getAdaptationStrategy({ temperature: pTemp, precipitation: pPrecip, soilHealthIndex: pSoilHealth })

    setLastPredictionInputs({ temperature: pTemp, precipitation: pPrecip, co2Emissions: pCo2, fertilizerUse: pFert, soilHealthIndex: pSoilHealth, irrigationAccess: pIrrigation, cropType: pCrop })
    setLastPredictionResult({ predictedYield: yieldValue, status, confidence, recommendation, adaptationStrategy: strategy })
    
    // savePrediction removed
  }

  const renderSection = () => {
    if (loading) {
      return (
        <div className="glass rounded-3xl p-8 animate-pulse flex items-center justify-center h-48">
          <p className="text-muted-foreground">Loading data from database...</p>
        </div>
      )
    }

    switch (active) {

      // ── SECTION 1: Overview ─────────────────────────────────────────────────
      case 'overview': return (
        <div className="animate-fade-in-up" key="overview">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-3xl font-playfair font-bold text-foreground">Dashboard Overview</h2>
            <Button
              onClick={() => generateDashboardReport({
                title: 'YieldSim DSS Dashboard Report',
                generatedAt: new Date().toLocaleString(),
                filters: {
                  yearRange: selectedYearRange,
                  selectedCrops,
                  selectedCountry,
                },
                inputParams: lastPredictionInputs,
                metrics: { avgTemperature: avgTemp, avgRainfall: avgRainfall as number, avgSoilHealth, avgYield },
                predictionResult: lastPredictionResult,
                tableData: rawData.slice(-10),
              })}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-2 flex items-center gap-2"
            >
              <Download size={16} />
              Download Report
            </Button>
          </div>

          {/* Metric cards — real dataset values */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { Icon: Thermometer, label: 'Avg Temperature', value: `${avgTemp}°C` },
              { Icon: CloudRain,   label: 'Rainfall',          value: `${avgRainfall} mm` },
              { Icon: Droplets,    label: 'Soil Health Index', value: `${avgSoilHealth}` },
              { Icon: Wheat,       label: 'Predicted Yield',   value: `${avgYield} t/ha` },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="glass rounded-3xl p-6 text-center hover:scale-105 transition-all cursor-default">
                <Icon className="text-primary mx-auto mb-3" size={28} />
                <p className="text-muted-foreground text-sm mb-1">{label}</p>
                <p className="font-space-mono font-bold text-3xl text-primary">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mt-8">
            <div className="glass rounded-3xl p-6">
              <h3 className="font-playfair font-bold text-foreground text-lg mb-4">Monthly Temperature Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTempData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} />
                  <Line type="monotone" dataKey="temp" name="Temp (°C)" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="glass rounded-3xl p-6">
              <h3 className="font-playfair font-bold text-foreground text-lg mb-4">Monthly Rainfall</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRainfallData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} />
                  <Bar dataKey="rainfall" name="Rainfall (mm)" fill="hsl(var(--secondary))" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical table — real dataset records */}
          <div className="glass rounded-3xl p-6 mt-8 overflow-x-auto">
            <h3 className="font-playfair font-bold text-foreground text-lg mb-4">Historical Data</h3>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'hsl(var(--primary))' }} className="text-primary-foreground">
                  <th className="text-left p-3 rounded-tl-xl">Year</th>
                  <th className="text-left p-3">Crop</th>
                  <th className="text-left p-3">Temperature</th>
                  <th className="text-left p-3">Rainfall</th>
                  <th className="text-left p-3 rounded-tr-xl">Yield</th>
                </tr>
              </thead>
              <tbody>
                {(historicalData.length > 0 ? historicalData.map(d => ({
                  /* REMOVED */
                  temp: `${d.temperature}°C`,
                  rain: `${d.rainfall} mm`,
                  yield: `${d.yield} t/ha`
                })) : historicalRows).map((r: any, i: number) => (
                  <tr key={`${r.year}-${r.crop_type}-${i}`} className={i % 2 === 0 ? 'bg-white/10' : ''}>
                    <td className="p-3 font-space-mono text-foreground">{r.year}</td>
                    <td className="p-3 font-medium text-foreground">{r.crop_type}</td>
                    <td className="p-3 text-muted-foreground">{r.average_temperature_c?.toFixed(1)}°C</td>
                    <td className="p-3 text-muted-foreground">{Math.round(r.total_precipitation_mm || 0)} mm</td>
                    <td className="p-3 font-space-mono text-primary font-bold">{r.crop_yield_mt_per_ha?.toFixed(2)} t/ha</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )

      // ── SECTION 2: Climate Analysis ─────────────────────────────────────────
      case 'climate': return (
        <div className="animate-fade-in-up" key="climate">
          <h2 className="text-3xl font-playfair font-bold text-foreground mb-8">Climate Analysis</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input panel */}
            <div className="glass rounded-3xl p-8 space-y-6">
              {[
                { emoji:'🌡️', label:'Temperature (°C)', value:cTemp, onChange:setCTemp },
                { emoji:'🌧️', label:'Rainfall (mm)',    value:cRain, onChange:setCRain },
                { emoji:'💨', label:'Wind Speed (km/h)',value:cWind, onChange:setCWind },
              ].map(({ emoji, label, value, onChange }) => (
                <div key={label} className="space-y-2">
                  <label className="flex items-center gap-3 font-medium text-foreground">
                    <span className="text-2xl">{emoji}</span>{label}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full glass border border-white/30 rounded-2xl px-4 py-3 text-foreground font-space-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              ))}
              {[
                { emoji:'🌫️', label:'Humidity (%)',      value:cHumidity, onChange:setCHumidity, min:0, max:100 },
                { emoji:'💧', label:'Soil Moisture (%)', value:cMoisture, onChange:setCMoisture, min:0, max:100 },
              ].map(({ emoji, label, value, onChange, min, max }) => (
                <div key={label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 font-medium text-foreground">
                      <span className="text-2xl">{emoji}</span>{label}
                    </label>
                    <span className="font-space-mono text-primary font-bold">{value}%</span>
                  </div>
                  <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={1} className="w-full" />
                </div>
              ))}
              <Button
                onClick={() => setClimateCharts({ temp: cTemp, rain: cRain, humidity: cHumidity, moisture: cMoisture })}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 text-base font-semibold"
              >
                Analyze
              </Button>
            </div>

            {/* Chart panel */}
            <div className="space-y-6">
              <div className="glass rounded-3xl p-6">
                <h3 className="font-playfair font-bold text-foreground mb-3">Temperature Trend</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={analysisAreaData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} />
                    <Area type="monotone" dataKey="Temperature" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="glass rounded-3xl p-6">
                <h3 className="font-playfair font-bold text-foreground mb-3">Humidity vs Soil Moisture</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={analysisBarData.slice(0,6)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} />
                    <Bar dataKey="Humidity" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                    <Bar dataKey="SoilMoisture" fill="hsl(var(--secondary))" radius={[4,4,0,0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="glass rounded-3xl p-6">
                <h3 className="font-playfair font-bold text-foreground mb-3">Rainfall Trend</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={analysisLineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} />
                    <Line type="monotone" dataKey="Rainfall" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )

      // ── SECTION 3: Yield Prediction ─────────────────────────────────────────
      case 'yield': return (
        <div className="animate-fade-in-up" key="yield">
          <h2 className="text-3xl font-playfair font-bold text-foreground mb-8">Crop Yield Prediction</h2>
          <div className="glass rounded-3xl p-8 space-y-6">
            {/* Crop type */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 font-medium text-foreground"><span className="text-2xl">🌱</span>Crop Type</label>
              <Select value={pCrop} onValueChange={setPCrop}>
                <SelectTrigger className="glass border-white/30 rounded-2xl text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent className="glass border-white/30 rounded-2xl">
                  {['Barley','Coffee','Corn','Cotton','Fruits','Rice','Soybeans','Sugarcane','Vegetables','Wheat'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* Number inputs */}
            {[
              { emoji:'🌡️', label:'Temperature (°C)',              value:pTemp,      onChange:setPTemp      },
              { emoji:'🌧️', label:'Annual Precipitation (mm)',     value:pPrecip,    onChange:setPPrecip, hint:'Range: 200–3000' },
              { emoji:'💨', label:'CO₂ Emissions (MT)',            value:pCo2,       onChange:setPCo2       },
              { emoji:'🌿', label:'Soil Health Index (0–100)',      value:pSoilHealth,onChange:setPSoilHealth },
              { emoji:'💊', label:'Fertilizer Use (kg/ha)',         value:pFert,      onChange:setPFert       },
            ].map(({ emoji, label, value, onChange, hint }) => (
              <div key={label} className="space-y-2">
                <label className="flex items-center gap-3 font-medium text-foreground"><span className="text-2xl">{emoji}</span>{label}</label>
                {hint && <p className="text-xs text-muted-foreground pl-9">{hint}</p>}
                <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
                  className="w-full glass border border-white/30 rounded-2xl px-4 py-3 text-foreground font-space-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            ))}
            {/* Irrigation slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 font-medium text-foreground"><span className="text-2xl">💧</span>Irrigation Access (%)</label>
                <span className="font-space-mono text-primary font-bold">{pIrrigation}%</span>
              </div>
              <Slider value={[pIrrigation]} onValueChange={([v]) => setPIrrigation(v)} min={0} max={100} step={1} className="w-full" />
            </div>
            {/* Adaptation strategy */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 font-medium text-foreground"><span className="text-2xl">🔬</span>Adaptation Strategy</label>
              <Select value={pAdapt} onValueChange={setPAdapt}>
                <SelectTrigger className="glass border-white/30 rounded-2xl text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent className="glass border-white/30 rounded-2xl">
                  {['Crop Rotation','Drought-resistant Crops','Organic Farming','Water Management','No Adaptation'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handlePredictYield} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 text-base font-semibold">
              Predict Yield
            </Button>
          </div>

          {yieldResult && (
            <div className="glass rounded-3xl p-6 mt-6 animate-fade-in-up">
              <div className="text-center mb-6">
                <p className="text-muted-foreground mb-2">Predicted Yield</p>
                <p className="font-space-mono font-bold text-4xl text-primary mb-4">{yieldResult.predictedYield} t/ha</p>
                <div className="flex justify-center gap-3 flex-wrap">
                  <span className={`px-4 py-2 rounded-full font-bold text-sm ${yieldResult.confidence === 'High' ? 'bg-green-100 text-green-800' : yieldResult.confidence === 'Low' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    Confidence: {yieldResult.confidence}
                  </span>
                  <span className={`px-4 py-2 rounded-full font-bold text-sm ${yieldResult.suitability === 'Suitable' ? 'bg-green-100 text-green-800' : yieldResult.suitability === 'Not Recommended' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {yieldResult.suitability}
                  </span>
                  <span className={`px-4 py-2 rounded-full font-bold text-sm ${yieldResult.riskLevel === 'Low' ? 'bg-green-100 text-green-800' : yieldResult.riskLevel === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    Risk: {yieldResult.riskLevel}
                  </span>
                </div>
              </div>
              {/* Factor breakdown bars */}
              <div className="space-y-3 mb-4">
                {yieldResult.factors.map(f => (
                  <div key={f.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-foreground">{f.label}</span>
                      <span className={`text-sm font-space-mono font-bold ${f.impact === 'positive' ? 'text-green-600' : f.impact === 'negative' ? 'text-red-600' : 'text-yellow-600'}`}>{f.score}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${f.impact === 'positive' ? 'bg-green-500' : f.impact === 'negative' ? 'bg-red-500' : 'bg-yellow-500'}`}
                        style={{ width: `${Math.min(100, f.score)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground text-sm italic">{yieldResult.recommendation}</p>
            </div>
          )}
        </div>
      )

      // ── SECTION 4: Climate Simulation ───────────────────────────────────────
      case 'simulation': return (
        <div className="animate-fade-in-up" key="simulation">
          <h2 className="text-3xl font-playfair font-bold text-foreground mb-8">Climate Simulation</h2>
          <div className="glass rounded-3xl p-8 space-y-6">
            {/* Crop selector */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 font-medium text-foreground"><span className="text-2xl">🌱</span>Crop Type</label>
              <Select value={simCrop} onValueChange={setSimCrop}>
                <SelectTrigger className="glass border-white/30 rounded-2xl text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent className="glass border-white/30 rounded-2xl">
                  {Object.keys(cropOptimalRanges).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* Sliders */}
            {[
              { emoji:'🌡️', label:'Temperature Change', value:simTempChange,   onChange:setSimTempChange,   min:-5,  max:5,  step:0.5, unit:'°C' },
              { emoji:'🌧️', label:'Rainfall Change',    value:simPrecipChange, onChange:setSimPrecipChange, min:-50, max:50, step:5,   unit:'%'  },
              { emoji:'💨', label:'CO₂ Change (MT)',    value:simCo2Change,   onChange:setSimCo2Change,    min:-10, max:10, step:1,   unit:'MT' },
            ].map(s => (
              <div key={s.label} className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 font-medium text-foreground">
                    <span className="text-2xl">{s.emoji}</span>{s.label}
                  </label>
                  <span className="font-space-mono text-xl font-bold text-primary">
                    {s.value > 0 ? '+' : ''}{s.value}{s.unit}
                  </span>
                </div>
                <Slider value={[s.value]} onValueChange={([v]) => s.onChange(v)} min={s.min} max={s.max} step={s.step} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{s.min}{s.unit}</span><span>{s.max}{s.unit}</span>
                </div>
              </div>
            ))}
            <Button onClick={handleRunSimulation} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 text-base font-semibold">
              Run Simulation
            </Button>
          </div>

          {simResult && (
            <div className="glass rounded-3xl p-8 mt-8 animate-fade-in-up">
              <h3 className="text-xl font-playfair font-bold text-foreground mb-6">Simulation Results</h3>
              <div className="text-center mb-8">
                <span className={`font-space-mono font-bold text-5xl ${simResult.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {simResult.changePercent >= 0 ? '+' : ''}{simResult.changePercent}%
                </span>
                <p className="text-muted-foreground mt-2 text-sm">Yield Change</p>
                <div className="mt-4 flex justify-center">
                  {simResult.impact === 'Positive' ? (
                    <span className="px-4 py-2 rounded-full font-bold text-sm bg-green-100 text-green-800">🟢 Positive Impact</span>
                  ) : simResult.impact === 'Negative' ? (
                    <span className="px-4 py-2 rounded-full font-bold text-sm bg-red-100 text-red-800">🔴 Negative Impact</span>
                  ) : (
                    <span className="px-4 py-2 rounded-full font-bold text-sm bg-yellow-100 text-yellow-800">🟡 Neutral</span>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'hsl(var(--primary))' }} className="text-primary-foreground">
                      <th className="text-left p-3 rounded-tl-xl">Metric</th>
                      <th className="text-center p-3">Baseline (dataset avg)</th>
                      <th className="text-center p-3 rounded-tr-xl">Simulated</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white/10">
                      <td className="p-3 font-medium text-foreground">Yield (t/ha)</td>
                      <td className="p-3 text-center font-space-mono text-primary">{simResult.baselineYield.toFixed(2)}</td>
                      <td className="p-3 text-center font-space-mono font-bold text-primary">{simResult.simulatedYield.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-foreground">Change (%)</td>
                      <td className="p-3 text-center text-muted-foreground">—</td>
                      <td className={`p-3 text-center font-space-mono font-bold ${simResult.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {simResult.changePercent >= 0 ? '+' : ''}{simResult.changePercent}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{simResult.summary}</p>
            </div>
          )}
        </div>
      )

      // ── SECTION 5: Crop Recommendation ──────────────────────────────────────
      case 'recommend': return (
        <div className="animate-fade-in-up" key="recommend">
          <h2 className="text-3xl font-playfair font-bold text-foreground mb-8">Crop Recommendation</h2>
          <div className="glass rounded-3xl p-8 space-y-6 mb-8">
            {[
              { emoji:'🌡️', label:'Temperature (°C)',         value:rTemp,      onChange:setRTemp      },
              { emoji:'🌧️', label:'Annual Precipitation (mm)', value:rPrecip,    onChange:setRPrecip    },
              { emoji:'🌿', label:'Soil Health Index (0–100)', value:rSoilHealth,onChange:setRSoilHealth },
              { emoji:'💨', label:'CO₂ Level (MT)',            value:rCo2,       onChange:setRCo2       },
            ].map(({ emoji, label, value, onChange }) => (
              <div key={label} className="space-y-2">
                <label className="flex items-center gap-3 font-medium text-foreground"><span className="text-2xl">{emoji}</span>{label}</label>
                <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
                  className="w-full glass border border-white/30 rounded-2xl px-4 py-3 text-foreground font-space-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            ))}
            {/* Irrigation slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 font-medium text-foreground"><span className="text-2xl">💧</span>Irrigation Access (%)</label>
                <span className="font-space-mono text-primary font-bold">{rIrrigation}%</span>
              </div>
              <Slider value={[rIrrigation]} onValueChange={([v]) => setRIrrigation(v)} min={0} max={100} step={1} className="w-full" />
            </div>
            <Button onClick={handleGetRecommendations}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 text-base font-semibold">
              Get Recommendations
            </Button>
          </div>

          {recs && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
              {recs.map((c) => (
                <div key={c.crop} className="glass rounded-2xl p-6 text-center hover:scale-105 transition-all">
                  <div className="text-4xl mb-3">{c.emoji}</div>
                  <h3 className="font-playfair font-bold text-foreground mb-1">{c.crop}</h3>
                  <div className="flex justify-center mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < c.stars ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'} />
                    ))}
                  </div>
                  <p className="font-space-mono text-primary font-bold text-sm mb-2">{c.expectedYieldMin}–{c.expectedYieldMax} t/ha</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block ${c.waterNeed === 'High' ? 'bg-blue-100 text-blue-800' : c.waterNeed === 'Low' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    💧 {c.waterNeed} Water
                  </span>
                  <p className="text-muted-foreground text-xs mt-2">{c.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )

      // ── SECTION 6: Risk Alerts ───────────────────────────────────────────────
      case 'alerts': return (
        <div className="animate-fade-in-up" key="alerts">
          <h2 className="text-3xl font-playfair font-bold text-foreground mb-8">Risk Alerts</h2>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {alertDefs.map((a) => {
              const isActive = getAlertActive(a.id)
              return (
                <div key={a.id} className={`glass rounded-2xl p-5 border-l-4 ${a.border} ${a.bg}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{a.icon}</span>
                      <h3 className="font-playfair font-bold text-foreground">{a.title}</h3>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${a.badge}`}>{a.severity}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">{a.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Updated: {new Date().toLocaleDateString()}</span>
                    {savedThresholds && (
                      <span className={`text-xs font-bold ${isActive ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {isActive ? '● Active' : '○ Inactive'}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="glass rounded-3xl p-8 space-y-6">
            <h3 className="font-playfair font-bold text-foreground text-xl">Set Alert Thresholds</h3>
            {[
              { emoji:'🌡️', label:'Temperature threshold (°C)', key:'temp' as const, placeholder:'30' },
              { emoji:'🌧️', label:'Precipitation threshold (mm)', key:'rain' as const, placeholder:'1000' },
              { emoji:'🌿', label:'Soil Health threshold (0–100)', key:'soilHealth' as const, placeholder:'40' },
            ].map(({ emoji, label, key, placeholder }) => (
              <div key={key} className="space-y-2">
                <label className="flex items-center gap-3 font-medium text-foreground"><span className="text-2xl">{emoji}</span>{label}</label>
                <input type="number" value={alertThresholds[key]} onChange={(e) => setAlertThresholds(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full glass border border-white/30 rounded-2xl px-4 py-3 text-foreground font-space-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder={placeholder} />
              </div>
            ))}
            <Button
              onClick={async () => {
                const tempThreshold = Number(alertThresholds.temp) || 30
                const rainThreshold = Number(alertThresholds.rain) || 1000
                const soilHealthThreshold = Number(alertThresholds.soilHealth) || 40
                
                const updated = {
                  temp: tempThreshold,
                  rain: rainThreshold,
                  soilHealth: soilHealthThreshold,
                }
                setSavedThresholds(updated)
                
                // saveAlertThresholds removed
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 text-base font-semibold"
            >
              Save Thresholds
            </Button>
          </div>
        </div>
      )

      // ── SECTION 7: Data Visualization ───────────────────────────────────────
      case 'viz': return (
        <div className="animate-fade-in-up" key="viz">
          <h2 className="text-3xl font-playfair font-bold text-foreground mb-8">Data Visualization</h2>

          {/* Filters */}
          <div className="glass rounded-2xl p-4 mb-8 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Year Range:</span>
              <Select value={selectedYearRange} onValueChange={setSelectedYearRange}>
                <SelectTrigger className="glass border-white/30 rounded-xl text-foreground w-36"><SelectValue /></SelectTrigger>
                <SelectContent className="glass border-white/30 rounded-xl">
                  {fiveYearGroups.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-foreground">Crops:</span>
              {availableCrops.map((c) => (
                <label key={c} className="flex items-center gap-1 text-sm text-foreground cursor-pointer whitespace-nowrap">
                  <input type="checkbox" checked={selectedCrops.includes(c)} onChange={(e) => {
                    if (e.target.checked) setSelectedCrops(p => [...p, c])
                    else setSelectedCrops(p => p.filter(x => x !== c))
                  }} className="accent-primary rounded" /> {c}
                </label>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Country:</span>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="glass border-white/30 rounded-xl text-foreground w-40"><SelectValue /></SelectTrigger>
                <SelectContent className="glass border-white/30 rounded-xl">
                  {['All', ...availableCountries].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Yield trend — real dataset */}
            <div className="glass rounded-3xl p-6">
              <p className="font-playfair font-bold text-xl text-foreground mb-4">
                Yearly Yield Trend {selectedYearRange}
              </p>
              {filteredData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                  No data for selected filters. Try changing Year Range, Crops, or Country.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={yearlyYieldData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[1.5, 3]} />
                    <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} />
                    <Legend />
                    {activeCrops.map((crop, i) => {
                      const CHART_COLORS = [
                        'hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))',
                        '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899'
                      ]
                      return (
                        <Line
                          key={crop}
                          type="monotone"
                          dataKey={crop}
                          stroke={CHART_COLORS[i % CHART_COLORS.length]}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          connectNulls={false}
                        />
                      )
                    })}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Yield by country — real dataset */}
            <div className="glass rounded-3xl p-6">
              <h3 className="font-playfair font-bold text-foreground text-lg mb-4">Avg Yield by Country (t/ha)</h3>
              {filteredData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                  No data for selected filters. Try changing Year Range, Crops, or Country.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={compYieldByCountry}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                    <XAxis dataKey="country" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[2.0, 2.4]} />
                    <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} />
                    <Bar dataKey="yield" name="Yield (t/ha)" fill="hsl(var(--primary))" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Monthly temperature area — real dataset */}
            <div className="glass rounded-3xl p-6">
              <h3 className="font-playfair font-bold text-foreground text-lg mb-4">Monthly Temperature (°C)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyTemperature}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} />
                  <Area type="monotone" dataKey="temp" name="Temp (°C)" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Scatter — Temperature vs Yield, real dataset */}
            <div className="glass rounded-3xl p-6">
              <h3 className="font-playfair font-bold text-foreground text-lg mb-4">Temperature vs Yield (Scatter)</h3>
              {filteredData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                  No data for selected filters. Try changing Year Range, Crops, or Country.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                    <XAxis dataKey="x" name="Value" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="y" name="Yield (t/ha)" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Yield" data={compTempVsYield} fill="hsl(var(--primary))" />
                  </ScatterChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie — crop distribution records, real dataset */}
            <div className="glass rounded-3xl p-6">
              <h3 className="font-playfair font-bold text-foreground text-lg mb-4">Crop Distribution (Records)</h3>
              {filteredData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                  No data for selected filters. Try changing Year Range, Crops, or Country.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={compCropDistribution} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name} ${value}`}>
                      {cropDistribution.map((_, i) => (
                        <Cell key={i} fill={
                          i === 0 ? 'hsl(var(--primary))' :
                          i === 1 ? 'hsl(var(--secondary))' :
                          i === 2 ? 'hsl(var(--accent))' :
                          i === 3 ? 'hsl(var(--primary)/0.7)' :
                          i === 4 ? 'hsl(var(--secondary)/0.7)' :
                          i === 5 ? 'hsl(var(--accent)/0.7)' :
                          i === 6 ? 'hsl(var(--primary)/0.5)' :
                          i === 7 ? 'hsl(var(--secondary)/0.5)' :
                          i === 8 ? 'hsl(var(--accent)/0.5)' :
                          'hsl(var(--primary)/0.3)'
                        } />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Heatmap — real cropOptimalRanges */}
            <div className="glass rounded-3xl p-6">
              <h3 className="font-playfair font-bold text-foreground text-lg mb-4">Crop Climate Optimal Ranges Heatmap</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center border-separate border-spacing-1">
                  <thead>
                    <tr>
                      <th className="text-left text-foreground font-medium p-2">Crop</th>
                      {heatmapColumns.map(c => <th key={c} className="text-foreground font-medium p-2">{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {heatmapCropNames.map(cropName => (
                      <tr key={cropName}>
                        <td className="text-left font-medium text-foreground p-2">{cropName}</td>
                        {heatmapColumns.map(col => {
                          const v = getHeatmapValue(cropName, col)
                          return (
                            <td key={col} className={`p-2 rounded-lg font-space-mono font-bold ${heatCell(col, v)}`}>{v}</td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* NEW SECTION A — Year-wise Summary Dashboard */}
          <div className="mt-8">
            <h3 className="font-playfair font-bold text-2xl text-foreground mb-6">Year-wise Agricultural Summary</h3>
            <div className="overflow-x-auto">
              <div className="flex gap-4 min-w-max pb-4">
                {yearSummaries.map(summary => (
                  <div key={summary.year} className="glass rounded-2xl p-4 w-44 flex-shrink-0 flex flex-col gap-3 hover:scale-105 transition-all">
                    <div className="text-center pb-2 border-b border-white/20">
                      <span className="font-playfair font-bold text-xl text-primary">{summary.year}</span>
                      <p className="text-xs text-muted-foreground">{summary.count} records</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">🌾 Avg Yield</span>
                        <span className="font-space-mono font-bold text-xs text-primary">{summary.avgYield} MT/ha</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">💰 Profit</span>
                        <span className="font-space-mono font-bold text-xs text-green-600">${summary.totalProfit}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">📊 Econ. Impact</span>
                        <span className="font-space-mono font-bold text-xs text-foreground">${summary.avgEconomicImpact}M</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">🌡️ Avg Temp</span>
                        <span className="font-space-mono font-bold text-xs text-foreground">{summary.avgTemp}°C</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">🥇 Top Crop</span>
                        <span className="font-space-mono font-bold text-xs text-secondary">{summary.topCrop}</span>
                      </div>
                    </div>
                    <div className="mt-1">
                      <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                          style={{ width: `${Math.min(100, (summary.totalProfit / 50) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* NEW SECTION B — Year-wise & Country-wise Profit Dashboard */}
          <div className="glass rounded-3xl p-6 mt-8">
            <h3 className="font-playfair font-bold text-xl text-foreground mb-4">Year-wise & Country-wise Profit Analysis</h3>
            <p className="text-xs text-muted-foreground mb-6">Profit Score = (Yield × Economic Impact / 100) − (Fertilizer × $2 + Pesticide × $5) / 1000</p>
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                {filteredData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                    No data for selected filters. Try changing Year Range, Crops, or Country.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={yearlyProfitData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value: number) => [`$${value}`, 'Avg Profit Score']}
                        contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: 'hsl(var(--primary))' }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div>
                {filteredData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                    No data for selected filters. Try changing Year Range, Crops, or Country.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={countryProfitData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="country" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value: number) => [`$${value}`, 'Avg Profit Score']}
                        contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }}
                      />
                      <Bar dataKey="profit" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="glass rounded-2xl p-4 text-center">
                <span className="font-space-mono font-bold text-primary">💰 Max Profit: ${maxProfit}</span>
              </div>
              <div className="glass rounded-2xl p-4 text-center">
                <span className="font-space-mono font-bold text-primary">📉 Min Profit: ${minProfit}</span>
              </div>
              <div className="glass rounded-2xl p-4 text-center">
                <span className="font-space-mono font-bold text-primary">📊 Avg Profit: ${avgProfitAll}</span>
              </div>
            </div>
          </div>

          {/* NEW SECTION C — Economic Impact Dashboard (Year + Country) */}
          <div className="glass rounded-3xl p-6 mt-8">
            <h3 className="font-playfair font-bold text-xl text-foreground mb-4">Economic Impact Analysis (Million USD)</h3>
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex gap-2 mb-3">
                  {(['avg', 'total'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setEconomicView(v)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        economicView === v
                          ? 'bg-primary text-primary-foreground'
                          : 'glass text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {v === 'avg' ? 'Avg Impact' : 'Total Impact'}
                    </button>
                  ))}
                </div>
                {filteredData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                    No data for selected filters. Try changing Year Range, Crops, or Country.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={yearlyEconomicData}>
                      <defs>
                        <linearGradient id="economicGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value: number) => [`$${value}M`, economicView === 'avg' ? 'Avg Impact' : 'Total Impact']}
                        contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }}
                      />
                      <Area
                        type="monotone"
                        dataKey={economicView === 'avg' ? 'avgImpact' : 'totalImpact'}
                        stroke="hsl(var(--primary))"
                        fill="url(#economicGrad)"
                        strokeWidth={2.5}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div>
                <div className="h-9 mb-3"></div>
                {filteredData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                    No data for selected filters. Try changing Year Range, Crops, or Country.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={countryEconomicData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="country" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          `$${value}M`,
                          name === 'avgImpact' ? 'Avg Impact' : 'Total Impact'
                        ]}
                        contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }}
                      />
                      <Legend />
                      <Bar dataKey="avgImpact" name="Avg Impact" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                      <Bar dataKey="totalImpact" name="Total Impact" fill="hsl(var(--secondary))" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="font-playfair font-bold text-lg text-foreground mb-3">Economic Impact Heatmap — Year × Country (Avg $M)</h4>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-xs border-collapse min-w-max">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground bg-white/10 rounded-tl-lg sticky left-0">Year</th>
                      {countries.map(c => (
                        <th key={c} className="px-3 py-2 text-center font-medium text-muted-foreground bg-white/10 whitespace-nowrap">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {heatmapData.map(row => (
                      <tr key={row.year} className="border-t border-white/10">
                        <td className="px-3 py-2 font-space-mono font-bold text-foreground sticky left-0 bg-background/50">{row.year}</td>
                        {countries.map(c => (
                          <td key={c} className={`px-3 py-2 text-center font-space-mono font-medium rounded-sm ${getHeatColor(row[c])}`}>
                            {row[c] ? `$${row[c]}M` : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                <span>🟢 bg-green-500/40 → High Impact (&gt;75th percentile)</span>
                <span>🟩 bg-green-300/40 → Above Average</span>
                <span>🟡 bg-yellow-300/40 → Below Average</span>
                <span>🔴 bg-red-300/40 → Low Impact (&lt;25th percentile)</span>
              </div>
            </div>
          </div>
        </div>
      )

      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-[#E8DCC8]">
      <Navbar />

      {/* Fixed sidebar */}
      <aside className="fixed left-0 top-20 h-full w-64 glass border-r border-white/20 p-6 z-40 overflow-y-auto">
        <h2 className="font-playfair font-bold text-foreground text-lg mb-6">Dashboard</h2>
        <nav className="space-y-2">
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium transition-all text-left ${
                active === id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:text-primary'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="ml-64 pt-28 px-8 pb-12">
        {renderSection()}
      </main>

      <div className="ml-64">
        <Footer />
      </div>
    </div>
  )
}
