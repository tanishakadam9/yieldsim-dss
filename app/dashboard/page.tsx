'use client'

import { useState } from 'react'
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

// ─── Data ────────────────────────────────────────────────────────────────────
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const tempData = [22,25,30,35,38,36,32,31,29,26,23,21].map((t,i) => ({ month: months[i], temp: t }))
const rainData = [15,20,25,30,45,120,180,160,110,60,25,18].map((r,i) => ({ month: months[i], rain: r }))

const yieldYears = [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024]
const riceYields  = [3.2,3.4,3.1,3.6,3.8,3.5,3.9,4.0,3.7,4.1]
const wheatYields = [2.8,2.9,2.7,3.0,3.1,2.8,3.2,3.3,3.0,3.4]
const cornYields  = [3.5,3.6,3.4,3.8,4.0,3.7,4.1,4.2,3.9,4.3]
const yieldTrendData = yieldYears.map((y,i) => ({ year: y, Rice: riceYields[i], Wheat: wheatYields[i], Corn: cornYields[i] }))

const rainYieldRegions = [
  { region: 'North India', rainfall: 850, yield: 3.8 },
  { region: 'South India', rainfall: 1200, yield: 4.2 },
  { region: 'East India', rainfall: 1600, yield: 4.5 },
  { region: 'West India', rainfall: 520, yield: 2.9 },
  { region: 'Central India', rainfall: 750, yield: 3.4 },
]

const scatterData = {
  Rice:  [{x:400,y:3.8},{x:600,y:4.0},{x:800,y:4.3},{x:1000,y:4.5},{x:1200,y:4.6},{x:1400,y:4.7},{x:300,y:3.5},{x:500,y:3.9}],
  Wheat: [{x:300,y:2.8},{x:450,y:3.0},{x:600,y:3.2},{x:750,y:3.1},{x:900,y:2.9},{x:200,y:2.5},{x:550,y:3.1},{x:700,y:3.0}],
  Corn:  [{x:500,y:4.0},{x:700,y:4.3},{x:900,y:4.6},{x:1100,y:4.8},{x:1300,y:4.9},{x:400,y:3.8},{x:600,y:4.1},{x:800,y:4.5}],
}

const pieData = [
  { name: 'Rice', value: 35 },
  { name: 'Wheat', value: 28 },
  { name: 'Corn', value: 18 },
  { name: 'Sugarcane', value: 12 },
  { name: 'Maize', value: 7 },
]

const heatmapCrops = ['Rice', 'Wheat', 'Corn', 'Sugarcane', 'Maize']
const heatmapConditions = ['Temp', 'Rainfall', 'Humidity', 'Soil', 'Wind']
const heatmapValues = [
  [85, 90, 70, 80, 60],
  [70, 75, 65, 72, 55],
  [80, 85, 75, 78, 62],
  [90, 60, 55, 82, 50],
  [75, 80, 70, 68, 58],
]

const historicalRows = [
  { year: 2020, crop: 'Wheat',     temp: '28°C', rain: '620 mm', yield: '3.1 t/ha' },
  { year: 2021, crop: 'Rice',      temp: '31°C', rain: '980 mm', yield: '4.2 t/ha' },
  { year: 2022, crop: 'Corn',      temp: '29°C', rain: '750 mm', yield: '4.0 t/ha' },
  { year: 2023, crop: 'Sugarcane', temp: '33°C', rain: '1100 mm',yield: '5.8 t/ha' },
  { year: 2024, crop: 'Maize',     temp: '30°C', rain: '820 mm', yield: '4.1 t/ha' },
]

// ─── Crop recommendation logic ───────────────────────────────────────────────
type CropRec = { name: string; emoji: string; stars: number; yieldRange: string; water: string; note: string }
function getRecommendations(temp: number, rain: number, soil: string): CropRec[] {
  const crops = [
    { name: 'Rice',      emoji: '🍚', tempOk: temp>=25&&temp<=35, rainOk: rain>=800,       soils: ['Clay','Silty','Loamy'],           water: 'High',   note: 'Ideal for high rainfall regions.' },
    { name: 'Wheat',     emoji: '🌾', tempOk: temp>=15&&temp<=25, rainOk: rain>=300&&rain<=600, soils: ['Loamy','Clay','Sandy'],      water: 'Medium', note: 'Best suited for cool, dry seasons.' },
    { name: 'Corn',      emoji: '🌽', tempOk: temp>=20&&temp<=30, rainOk: rain>=500&&rain<=900, soils: ['Loamy','Sandy','Silty'],     water: 'Medium', note: 'Thrives in warm, moderate moisture.' },
    { name: 'Sugarcane', emoji: '🎋', tempOk: temp>=27&&temp<=38, rainOk: rain>=1000,      soils: ['Loamy','Clay'],                   water: 'High',   note: 'Requires tropical heat and moisture.' },
    { name: 'Cotton',    emoji: '🌿', tempOk: temp>=25&&temp<=35, rainOk: rain>=400&&rain<=700, soils: ['Sandy','Loamy','Peaty'],     water: 'Low',    note: 'Drought-tolerant cash crop.' },
    { name: 'Maize',     emoji: '🌽', tempOk: temp>=18&&temp<=32, rainOk: rain>=500&&rain<=800, soils: ['Loamy','Sandy','Silty'],     water: 'Medium', note: 'Versatile; adapts to varied soils.' },
  ]
  return crops.map((c) => {
    const soilMatch = c.soils.includes(soil)
    const score = (c.tempOk ? 2 : 0) + (c.rainOk ? 2 : 0) + (soilMatch ? 1 : 0)
    const stars = Math.max(1, score)
    const base = { Rice:4.0,Wheat:3.2,Corn:4.5,Sugarcane:6.0,Cotton:2.0,Maize:4.2 }[c.name] ?? 3.5
    const yieldRange = `${(base * 0.85).toFixed(1)}–${(base * 1.1).toFixed(1)} t/ha`
    return { name: c.name, emoji: c.emoji, stars, yieldRange, water: c.water, note: c.note }
  }).sort((a,b) => b.stars - a.stars)
}

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

// ─── Heatmap cell colour ─────────────────────────────────────────────────────
function heatCell(v: number) {
  if (v >= 85) return 'bg-green-200 text-green-900'
  if (v >= 70) return 'bg-yellow-100 text-yellow-900'
  if (v >= 55) return 'bg-orange-100 text-orange-900'
  return 'bg-red-200 text-red-900'
}

// ─── Dashboard component ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const [active, setActive] = useState('overview')

  // Climate Analysis state
  const [cTemp, setCTemp] = useState(28)
  const [cRain, setCRain] = useState(210)
  const [cWind, setCWind] = useState(15)
  const [cHumidity, setCHumidity] = useState(60)
  const [cMoisture, setCMoisture] = useState(42)
  const [climateCharts, setClimateCharts] = useState({ temp: cTemp, rain: cRain, humidity: cHumidity, moisture: cMoisture })

  // Yield prediction state
  const [pCrop, setPCrop] = useState('Wheat')
  const [pSoil, setPSoil] = useState('Loamy')
  const [pTemp, setPTemp] = useState(28)
  const [pRain, setPRain] = useState(600)
  const [pMoisture, setPMoisture] = useState(50)
  const [pFert, setPFert] = useState(120)
  const [pIrr, setPIrr] = useState('Drip')
  const [yieldResult, setYieldResult] = useState<null | { predicted: string; confidence: string; suitability: string }>(null)

  // Recommendations state
  const [rTemp, setRTemp] = useState(28)
  const [rRain, setRRain] = useState(700)
  const [rSoil, setRSoil] = useState('Loamy')
  const [rRegion, setRRegion] = useState('North India')
  const [rWater, setRWater] = useState('Medium')
  const [recs, setRecs] = useState<CropRec[] | null>(null)

  // Alerts state
  const [alertThresholds, setAlertThresholds] = useState({ temp: '', rain: '', moisture: '' })
  const [savedThresholds, setSavedThresholds] = useState<{ temp: number; rain: number; moisture: number } | null>(null)

  const predictYield = () => {
    const baseYield: Record<string, number> = { Rice:4.0, Wheat:3.2, Corn:4.5, Sugarcane:6.0, Cotton:2.0, Maize:4.2 }
    const tempFactor = pTemp > 35 ? 0.7 : pTemp > 30 ? 0.85 : pTemp > 20 ? 1.0 : 0.8
    const rainFactor = pRain > 250 ? 0.8 : pRain > 100 ? 1.0 : pRain > 50 ? 0.85 : 0.6
    const soilFactor = pMoisture > 70 ? 0.9 : pMoisture > 40 ? 1.0 : pMoisture > 20 ? 0.85 : 0.65
    const predicted = (baseYield[pCrop] * tempFactor * rainFactor * soilFactor).toFixed(2)
    const confidence = (tempFactor===1.0 && rainFactor===1.0 && soilFactor===1.0) ? 'High' : (tempFactor<0.8||rainFactor<0.7||soilFactor<0.7) ? 'Low' : 'Medium'
    const suitability = confidence==='High' ? 'Suitable' : confidence==='Low' ? 'Not Recommended' : 'Marginal'
    setYieldResult({ predicted, confidence, suitability })
  }

  // chart data for climate analysis
  const analysisAreaData = months.map((m,i) => ({ month: m, Temperature: climateCharts.temp + Math.sin(i/2)*3 }))
  const analysisBarData  = months.map((m,i) => ({ month: m, Humidity: climateCharts.humidity + (i%3), SoilMoisture: climateCharts.moisture + (i%2) }))
  const analysisLineData = months.map((m,i) => ({ month: m, Rainfall: climateCharts.rain * (0.5 + Math.abs(Math.sin(i))*0.8) }))

  const alertDefs = [
    { id:'drought',  color:'red',    border:'border-red-500',    bg:'bg-red-500/10',    badge:'bg-red-100 text-red-800',    icon:'🔴', title:'Drought Risk',  desc:'Soil moisture below 20%, Rainfall < 50mm',  severity:'Critical', threshCheck: savedThresholds ? (savedThresholds.moisture > 20 || savedThresholds.rain < 50) : true },
    { id:'heat',     color:'yellow', border:'border-yellow-500', bg:'bg-yellow-500/10', badge:'bg-yellow-100 text-yellow-800', icon:'🟡', title:'Heat Stress',   desc:'Temperature exceeds 35°C',                   severity:'High',     threshCheck: savedThresholds ? savedThresholds.temp < 35 : true },
    { id:'flood',    color:'orange', border:'border-orange-500', bg:'bg-orange-500/10', badge:'bg-orange-100 text-orange-800', icon:'🟠', title:'Flood Risk',    desc:'Rainfall > 300mm projected',                 severity:'High',     threshCheck: savedThresholds ? savedThresholds.rain > 300 : true },
    { id:'optimal',  color:'green',  border:'border-green-500',  bg:'bg-green-500/10',  badge:'bg-green-100 text-green-800',  icon:'🟢', title:'Optimal',       desc:'Current conditions favorable for rice',      severity:'Low',      threshCheck: true },
  ]

  const renderSection = () => {
    switch (active) {

      // ── SECTION 1: Overview ─────────────────────────────────────────────────
      case 'overview': return (
        <div className="animate-fade-in-up" key="overview">
          <h2 className="text-3xl font-playfair font-bold text-foreground mb-8">Dashboard Overview</h2>

          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { Icon: Thermometer, label: 'Avg Temperature', value: '28.4°C' },
              { Icon: CloudRain,   label: 'Rainfall',         value: '210 mm' },
              { Icon: Droplets,    label: 'Soil Moisture',    value: '42%' },
              { Icon: Wheat,       label: 'Predicted Yield',  value: '3.8 t/ha' },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="glass rounded-3xl p-6 text-center hover:scale-105 transition-all cursor-default">
                <Icon className="text-primary mx-auto mb-3" size={28} />
                <p className="text-muted-foreground text-sm mb-1">{label}</p>
                <p className="font-space-mono font-bold text-3xl text-primary">{value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-8 mt-8">
            <div className="glass rounded-3xl p-6">
              <h3 className="font-playfair font-bold text-foreground text-lg mb-4">Monthly Temperature Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={tempData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} />
                  <Line type="monotone" dataKey="temp" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="glass rounded-3xl p-6">
              <h3 className="font-playfair font-bold text-foreground text-lg mb-4">Monthly Rainfall</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={rainData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} />
                  <Bar dataKey="rain" fill="hsl(var(--secondary))" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical table */}
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
                {historicalRows.map((r, i) => (
                  <tr key={r.year} className={i % 2 === 0 ? 'bg-white/10' : ''}>
                    <td className="p-3 font-space-mono text-foreground">{r.year}</td>
                    <td className="p-3 font-medium text-foreground">{r.crop}</td>
                    <td className="p-3 text-muted-foreground">{r.temp}</td>
                    <td className="p-3 text-muted-foreground">{r.rain}</td>
                    <td className="p-3 font-space-mono text-primary font-bold">{r.yield}</td>
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
                { emoji:'🌡️', label:'Temperature (°C)', value:cTemp, onChange:setCTemp, isSlider:false, min:0, max:50 },
                { emoji:'🌧️', label:'Rainfall (mm)',    value:cRain, onChange:setCRain, isSlider:false, min:0, max:500 },
                { emoji:'💨', label:'Wind Speed (km/h)',value:cWind, onChange:setCWind, isSlider:false, min:0, max:100 },
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
            {/* Selects */}
            {[
              { emoji:'🌱', label:'Crop Type', value:pCrop, onChange:setPCrop, opts:['Rice','Wheat','Corn','Sugarcane','Cotton','Maize'] },
              { emoji:'🏔️', label:'Soil Type', value:pSoil, onChange:setPSoil, opts:['Sandy','Clay','Loamy','Silty','Peaty'] },
              { emoji:'🚿', label:'Irrigation Method', value:pIrr, onChange:setPIrr, opts:['Drip','Sprinkler','Flood','Rainfed'] },
            ].map(({ emoji, label, value, onChange, opts }) => (
              <div key={label} className="space-y-2">
                <label className="flex items-center gap-3 font-medium text-foreground"><span className="text-2xl">{emoji}</span>{label}</label>
                <Select value={value} onValueChange={onChange}>
                  <SelectTrigger className="glass border-white/30 rounded-2xl text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass border-white/30 rounded-2xl">
                    {opts.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
            {/* Number inputs */}
            {[
              { emoji:'🌡️', label:'Temperature (°C)', value:pTemp, onChange:setPTemp },
              { emoji:'🌧️', label:'Rainfall (mm)',    value:pRain, onChange:setPRain },
              { emoji:'💊', label:'Fertilizer (kg/ha)',value:pFert, onChange:setPFert },
            ].map(({ emoji, label, value, onChange }) => (
              <div key={label} className="space-y-2">
                <label className="flex items-center gap-3 font-medium text-foreground"><span className="text-2xl">{emoji}</span>{label}</label>
                <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
                  className="w-full glass border border-white/30 rounded-2xl px-4 py-3 text-foreground font-space-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            ))}
            {/* Moisture slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 font-medium text-foreground"><span className="text-2xl">💧</span>Soil Moisture (%)</label>
                <span className="font-space-mono text-primary font-bold">{pMoisture}%</span>
              </div>
              <Slider value={[pMoisture]} onValueChange={([v]) => setPMoisture(v)} min={0} max={100} step={1} className="w-full" />
            </div>
            <Button onClick={predictYield} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 text-base font-semibold">
              Predict Yield
            </Button>
          </div>

          {yieldResult && (
            <div className="glass rounded-3xl p-6 mt-6 animate-fade-in-up text-center">
              <p className="text-muted-foreground mb-2">Predicted Yield</p>
              <p className="font-space-mono font-bold text-4xl text-primary mb-4">{yieldResult.predicted} t/ha</p>
              <div className="flex justify-center gap-3 flex-wrap">
                <span className={`px-4 py-2 rounded-full font-bold text-sm ${yieldResult.confidence === 'High' ? 'bg-green-100 text-green-800' : yieldResult.confidence === 'Low' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  Confidence: {yieldResult.confidence}
                </span>
                <span className={`px-4 py-2 rounded-full font-bold text-sm ${yieldResult.suitability === 'Suitable' ? 'bg-green-100 text-green-800' : yieldResult.suitability === 'Not Recommended' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {yieldResult.suitability}
                </span>
              </div>
            </div>
          )}
        </div>
      )

      // ── SECTION 4: Climate Simulation ───────────────────────────────────────
      case 'simulation': return (
        <div className="animate-fade-in-up" key="simulation">
          <h2 className="text-3xl font-playfair font-bold text-foreground mb-8">Climate Simulation</h2>
          <SimulationBuilder />
        </div>
      )

      // ── SECTION 5: Crop Recommendation ──────────────────────────────────────
      case 'recommend': return (
        <div className="animate-fade-in-up" key="recommend">
          <h2 className="text-3xl font-playfair font-bold text-foreground mb-8">Crop Recommendation</h2>
          <div className="glass rounded-3xl p-8 space-y-6 mb-8">
            {[
              { emoji:'🌡️', label:'Temperature (°C)', value:rTemp, onChange:setRTemp },
              { emoji:'🌧️', label:'Rainfall (mm)',    value:rRain, onChange:setRRain },
            ].map(({ emoji, label, value, onChange }) => (
              <div key={label} className="space-y-2">
                <label className="flex items-center gap-3 font-medium text-foreground"><span className="text-2xl">{emoji}</span>{label}</label>
                <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
                  className="w-full glass border border-white/30 rounded-2xl px-4 py-3 text-foreground font-space-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            ))}
            {[
              { emoji:'🏔️', label:'Soil Type', value:rSoil, onChange:setRSoil, opts:['Sandy','Clay','Loamy','Silty','Peaty'] },
              { emoji:'🌍', label:'Region',    value:rRegion, onChange:setRRegion, opts:['North India','South India','East India','West India','Central India'] },
              { emoji:'💧', label:'Water Availability', value:rWater, onChange:setRWater, opts:['Low','Medium','High'] },
            ].map(({ emoji, label, value, onChange, opts }) => (
              <div key={label} className="space-y-2">
                <label className="flex items-center gap-3 font-medium text-foreground"><span className="text-2xl">{emoji}</span>{label}</label>
                <Select value={value} onValueChange={onChange}>
                  <SelectTrigger className="glass border-white/30 rounded-2xl text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass border-white/30 rounded-2xl">
                    {opts.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <Button onClick={() => setRecs(getRecommendations(rTemp, rRain, rSoil))}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 text-base font-semibold">
              Get Recommendations
            </Button>
          </div>

          {recs && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
              {recs.map((c) => (
                <div key={c.name} className="glass rounded-2xl p-6 text-center hover:scale-105 transition-all">
                  <div className="text-4xl mb-3">{c.emoji}</div>
                  <h3 className="font-playfair font-bold text-foreground mb-1">{c.name}</h3>
                  <div className="flex justify-center mb-2">{Array.from({ length: 5 }).map((_,i) => (
                    <Star key={i} size={14} className={i < c.stars ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'} />
                  ))}</div>
                  <p className="font-space-mono text-primary font-bold text-sm mb-2">{c.yieldRange}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block ${c.water === 'High' ? 'bg-blue-100 text-blue-800' : c.water === 'Low' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    💧 {c.water} Water
                  </span>
                  <p className="text-muted-foreground text-xs mt-2">{c.note}</p>
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
              const isActive = savedThresholds ? a.threshCheck : true
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
              { emoji:'🌡️', label:'Temperature threshold (°C)', key:'temp' as const },
              { emoji:'🌧️', label:'Rainfall threshold (mm)',    key:'rain' as const },
              { emoji:'💧', label:'Moisture threshold (%)',      key:'moisture' as const },
            ].map(({ emoji, label, key }) => (
              <div key={key} className="space-y-2">
                <label className="flex items-center gap-3 font-medium text-foreground"><span className="text-2xl">{emoji}</span>{label}</label>
                <input type="number" value={alertThresholds[key]} onChange={(e) => setAlertThresholds(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full glass border border-white/30 rounded-2xl px-4 py-3 text-foreground font-space-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder={key === 'temp' ? '35' : key === 'rain' ? '300' : '20'} />
              </div>
            ))}
            <Button
              onClick={() => setSavedThresholds({
                temp: Number(alertThresholds.temp) || 35,
                rain: Number(alertThresholds.rain) || 300,
                moisture: Number(alertThresholds.moisture) || 20,
              })}
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
              <Select defaultValue="2015-2024">
                <SelectTrigger className="glass border-white/30 rounded-xl text-foreground w-36"><SelectValue /></SelectTrigger>
                <SelectContent className="glass border-white/30 rounded-xl">
                  {['2015-2024','2018-2024','2020-2024'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">Crops:</span>
              {['Rice','Wheat','Corn'].map((c) => (
                <label key={c} className="flex items-center gap-1 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-primary rounded" /> {c}
                </label>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Region:</span>
              <Select defaultValue="All">
                <SelectTrigger className="glass border-white/30 rounded-xl text-foreground w-40"><SelectValue /></SelectTrigger>
                <SelectContent className="glass border-white/30 rounded-xl">
                  {['All','North India','South India','East India','West India'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Yield trend */}
            <div className="glass rounded-3xl p-6">
              <h3 className="font-playfair font-bold text-foreground text-lg mb-4">Yearly Yield Trend 2015–2024</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={yieldTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} />
                  <Legend />
                  <Line type="monotone" dataKey="Rice"  stroke="hsl(var(--primary))"   strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Wheat" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Corn"  stroke="hsl(var(--accent))"    strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Rainfall vs Yield by region */}
            <div className="glass rounded-3xl p-6">
              <h3 className="font-playfair font-bold text-foreground text-lg mb-4">Rainfall vs Yield by Region</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={rainYieldRegions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis dataKey="region" tick={{ fontSize: 9 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="rainfall" name="Rainfall (mm)" fill="hsl(var(--primary))" radius={[6,6,0,0]} />
                  <Bar yAxisId="right" dataKey="yield" name="Yield (t/ha)" fill="hsl(var(--secondary))" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly temp area */}
            <div className="glass rounded-3xl p-6">
              <h3 className="font-playfair font-bold text-foreground text-lg mb-4">Monthly Temperature</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={tempData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} />
                  <Area type="monotone" dataKey="temp" name="Temp (°C)" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Scatter */}
            <div className="glass rounded-3xl p-6">
              <h3 className="font-playfair font-bold text-foreground text-lg mb-4">Rainfall vs Yield (Scatter)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis dataKey="x" name="Rainfall (mm)" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="y" name="Yield (t/ha)" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter name="Rice"  data={scatterData.Rice}  fill="hsl(var(--primary))" />
                  <Scatter name="Wheat" data={scatterData.Wheat} fill="hsl(var(--secondary))" />
                  <Scatter name="Corn"  data={scatterData.Corn}  fill="hsl(var(--accent))" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            <div className="glass rounded-3xl p-6">
              <h3 className="font-playfair font-bold text-foreground text-lg mb-4">Crop Distribution by Area</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={i===0?'hsl(var(--primary))':i===1?'hsl(var(--secondary))':i===2?'hsl(var(--accent))':i===3?'hsl(var(--primary)/0.6)':'hsl(var(--secondary)/0.6)'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Heatmap */}
            <div className="glass rounded-3xl p-6">
              <h3 className="font-playfair font-bold text-foreground text-lg mb-4">Climate–Crop Suitability Heatmap</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center border-separate border-spacing-1">
                  <thead>
                    <tr>
                      <th className="text-left text-foreground font-medium p-2">Crop</th>
                      {heatmapConditions.map((c) => <th key={c} className="text-foreground font-medium p-2">{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {heatmapCrops.map((crop, ci) => (
                      <tr key={crop}>
                        <td className="text-left font-medium text-foreground p-2">{crop}</td>
                        {heatmapValues[ci].map((v, vi) => (
                          <td key={vi} className={`p-2 rounded-lg font-space-mono font-bold ${heatCell(v)}`}>{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
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
