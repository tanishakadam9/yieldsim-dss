const fs = require('fs');

let content = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

// 1. imports
content = content.replace(
  `} from '@/lib/predictionModel'`,
  `  getConfidence, getStatus, getRecommendation, getAdaptationStrategy,\n} from '@/lib/predictionModel'\nimport { supabase } from '@/lib/supabase'\nimport { generateDashboardReport } from '@/lib/generateReport'\nimport { Download } from 'lucide-react'`
);

// 2. States
content = content.replace(
  `  const [active, setActive] = useState('overview')`,
  `  const [active, setActive] = useState('overview')

  const [rawData, setRawData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fiveYearGroups = ['1990-1994','1995-1999','2000-2004','2005-2009', '2010-2014','2015-2019','2020-2024']
  const [selectedYearRange, setSelectedYearRange] = useState('2020-2024')
  
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['Rice', 'Wheat', 'Corn'])
  const [selectedCountry, setSelectedCountry] = useState('All')

  const [lastPredictionInputs, setLastPredictionInputs] = useState<any>(null)
  const [lastPredictionResult, setLastPredictionResult] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('climate_data')
        .select('*')
      if (data) setRawData(data)
      setLoading(false)
    }
    fetchData()
  }, [])`
);

// 3. Remove the old handlePredictYield entirely
content = content.replace(/const handlePredictYield = async \(\) => \{[\s\S]*?\n  \}/, `  // old handlePredictYield removed`);

// 4. Computation blocks and renderSection logic
const computeBlock = `
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
    : 42
  const avgYield = rawData.length
    ? (rawData.reduce((s, r) => s + r.crop_yield_mt_per_ha, 0) / rawData.length).toFixed(2)
    : 2.24

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

  const filteredByYear = rawData.filter(r => {
    const [start, end] = selectedYearRange.split('-').map(Number)
    return r.year >= start && r.year <= end
  })
  const filteredData = filteredByYear
    .filter(r => selectedCrops.includes(r.crop_type))
    .filter(r => selectedCountry === 'All' || r.country === selectedCountry)

  const yearlyYieldData = fiveYearGroups
    .flatMap(group => {
      const [start, end] = group.split('-').map(Number)
      return Array.from({length: end - start + 1}, (_, i) => start + i)
    })
    .filter(y => {
      const [start, end] = selectedYearRange.split('-').map(Number)
      return y >= start && y <= end
    })
    .map(year => {
      const yearRows = filteredData.filter(r => r.year === year)
      const entry: any = { year }
      selectedCrops.forEach(crop => {
        const cropRows = yearRows.filter(r => r.crop_type === crop)
        entry[crop] = cropRows.length
          ? parseFloat((cropRows.reduce((s, r) => s + r.crop_yield_mt_per_ha, 0) / cropRows.length).toFixed(2))
          : null
      })
      return entry
    })

  const compYieldByCountry = availableCountries.map(country => {
    const rows = filteredData.filter(r => r.country === country)
    return {
      country,
      yield: parseFloat((rows.length ? rows.reduce((s, r) => s + r.crop_yield_mt_per_ha, 0) / rows.length : 0).toFixed(2))
    }
  })

  // tempVsYield logic
  const compTempVsYield = filteredData.map(r => ({
    x: parseFloat(r.average_temperature_c.toFixed(1)),
    y: parseFloat(r.crop_yield_mt_per_ha.toFixed(2)),
    crop: r.crop_type
  }))

  const compCropDistribution = availableCrops.map(crop => ({
    name: crop,
    value: filteredData.filter(r => r.crop_type === crop).length
  }))

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
  }

  const renderSection = () => {
    if (loading) {
      return (
        <div className="glass rounded-3xl p-8 animate-pulse flex items-center justify-center h-48">
          <p className="text-muted-foreground">Loading data from database...</p>
        </div>
      )
    }
`;
content = content.replace(`  const renderSection = () => {\n    switch (active) {`, computeBlock + `\n    switch (active) {`);

// 5. Replace Dashboard Overview
const overviewRegex = /case 'overview': return \([\s\S]*?\<\!-- Charts — real monthly data --\>.*/m;
content = content.replace(
  /<h2 className="text-3xl font-playfair font-bold text-foreground mb-8">Dashboard Overview<\/h2>[\s\S]*?(<div className="grid lg:grid-cols-2 gap-8 mt-8">)/m,
  `<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
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
              { Icon: Thermometer, label: 'Avg Temperature', value: \`\${avgTemp}°C\` },
              { Icon: CloudRain,   label: 'Rainfall',          value: \`\${avgRainfall} mm\` },
              { Icon: Droplets,    label: 'Soil Health Index', value: \`\${avgSoilHealth}\` },
              { Icon: Wheat,       label: 'Predicted Yield',   value: \`\${avgYield} t/ha\` },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="glass rounded-3xl p-6 text-center hover:scale-105 transition-all cursor-default">
                <Icon className="text-primary mx-auto mb-3" size={28} />
                <p className="text-muted-foreground text-sm mb-1">{label}</p>
                <p className="font-space-mono font-bold text-3xl text-primary">{value}</p>
              </div>
            ))}
          </div>

          $1`
);

content = content.replace(/<LineChart data=\{monthlyTemperature\}>/g, `<LineChart data={monthlyTempData}>`);
content = content.replace(/<BarChart data=\{monthlyRainfall\}>/g, `<BarChart data={monthlyRainfallData}>`);

content = content.replace(
  /\{\(historicalData\.length > 0 \? historicalData\.map[\s\S]*?\}\) \? historicalRows\)\.map/gm,
  `{(rawData.length > 0 ? rawData.slice(-5) : []).map`
);
content = content.replace(
  /<td className="p-3 text-muted-foreground">\{r\.temp\}<\/td>[\s\S]*?<td className="p-3 font-space-mono text-primary font-bold">\{r\.yield\}<\/td>/gm,
  `<td className="p-3 text-muted-foreground">{r.average_temperature_c?.toFixed(1)}°C</td>
                    <td className="p-3 text-muted-foreground">{Math.round(r.total_precipitation_mm || 0)} mm</td>
                    <td className="p-3 font-space-mono text-primary font-bold">{r.crop_yield_mt_per_ha?.toFixed(2)} t/ha</td>`
);
content = content.replace(
  /year: d\.year,[\s\S]*?crop: d\.crop_type,/,
  `/* REMOVED */`
);
content = content.replace(/r\.crop\}/gm, `r.crop_type}`);

// 6. Replace Yield Prediction
content = content.replace(
  /<h2 className="text-3xl font-playfair font-bold text-foreground mb-8">Crop Yield Prediction<\/h2>[\s\S]*?\{\/\* SECTION 4: Climate Simulation/m,
  `<h2 className="text-3xl font-playfair font-bold text-foreground mb-8">Crop Yield Prediction</h2>
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
              { emoji:'🌡️', label:'Temperature (°C)',              value:pTemp,      onChange:setPTemp, min: -5, max: 35 },
              { emoji:'🌧️', label:'Precipitation (mm)',            value:pPrecip,    onChange:setPPrecip, hint:'Range: 200–3000', min: 200, max: 3000 },
              { emoji:'💨', label:'CO₂ Emissions (MT)',            value:pCo2,       onChange:setPCo2, min: 0.5, max: 30 },
              { emoji:'🌿', label:'Soil Health Index',              value:pSoilHealth,onChange:setPSoilHealth, min: 30, max: 100 },
              { emoji:'💊', label:'Fertilizer Use (kg/ha)',         value:pFert,      onChange:setPFert, min: 0, max: 100 },
              { emoji:'💧', label:'Irrigation Access (%)',        value:pIrrigation,onChange:setPIrrigation, min: 10, max: 100 }
            ].map(({ emoji, label, value, onChange, hint, min, max }) => (
              <div key={label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 font-medium text-foreground"><span className="text-2xl">{emoji}</span>{label}</label>
                  <span className="font-space-mono text-primary font-bold">{value}</span>
                </div>
                {hint && <p className="text-xs text-muted-foreground pl-9">{hint}</p>}
                <div className="flex items-center gap-4">
                  <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={1} className="flex-1" />
                  <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
                    className="w-24 glass border border-white/30 rounded-xl px-3 py-2 text-foreground font-space-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 text-center" />
                </div>
              </div>
            ))}
            <Button onClick={handlePredictYield} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 text-base font-semibold">
              Predict Yield
            </Button>
          </div>

          {lastPredictionResult && (
            <div className="glass rounded-3xl p-6 mt-6 animate-fade-in-up">
              <div className="text-center mb-6">
                <p className="text-muted-foreground mb-2">Predicted Yield</p>
                <p className="font-space-mono font-bold text-4xl text-primary mb-4">{lastPredictionResult.predictedYield} MT/ha</p>
                <div className="flex justify-center gap-3 flex-wrap">
                  <span className={\`px-4 py-2 rounded-full font-bold text-sm \${lastPredictionResult.status === 'Excellent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}\`}>
                    Status: {lastPredictionResult.status}
                  </span>
                  <span className={\`px-4 py-2 rounded-full font-bold text-sm \${lastPredictionResult.confidence === 'High' ? 'bg-green-100 text-green-800' : lastPredictionResult.confidence === 'Low' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}\`}>
                    Confidence: {lastPredictionResult.confidence}
                  </span>
                  <span className="px-4 py-2 rounded-full font-bold text-sm bg-blue-100 text-blue-800">
                    Adaptation: {lastPredictionResult.adaptationStrategy}
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm text-center italic">{lastPredictionResult.recommendation}</p>
            </div>
          )}
        </div>
      )

      {/* SECTION 4: Climate Simulation`
);

// 7. Replace Data Visualization Filters
content = content.replace(
  /<div className="glass rounded-2xl p-4 mb-8 flex flex-wrap gap-4 items-center">[\s\S]*?<\/div>\s*<\/div>\s*<div className="grid lg:grid-cols-2 gap-8">/g,
  `<div className="glass rounded-2xl p-4 mb-8 flex flex-wrap gap-4 items-center">
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
          <div className="grid lg:grid-cols-2 gap-8">`
);

// 8. Replace Data Visualization Charts Values
content = content.replace(/data=\{yearlyYieldByCrop\}/g, `data={yearlyYieldData}`);
content = content.replace(/data=\{yieldByCountry\}/g, `data={compYieldByCountry}`);
content = content.replace(/ScatterChart>[\s\S]*?<\/ScatterChart>/g, `ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis dataKey="x" name="Value" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="y" name="Yield (t/ha)" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Yield" data={compTempVsYield} fill="hsl(var(--primary))" />
                </ScatterChart>`);
content = content.replace(/data=\{cropDistribution\}/g, `data={compCropDistribution}`);

fs.writeFileSync('app/dashboard/page.tsx', content);
