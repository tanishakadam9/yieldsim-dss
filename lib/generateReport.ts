import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function generateDashboardReport(params: {
  title: string
  generatedAt: string
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
  vizStats?: {
    avgYield: string
    avgTemp: string
    avgRainfall: string
    avgEconomicImpact: string
    topCountry: string
    topCrop: string
  }
  yearlyYieldSummary?: any[]
  yieldByCountry?: any[]
  tableData: any[]
}) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // --- Header ---
  doc.setFillColor(43, 106, 79) // Dark green
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  doc.setFontSize(22)
  doc.setTextColor(255, 255, 255)
  doc.text('YieldSim Agricultural Insight Report', pageWidth / 2, 20, { align: 'center' })

  doc.setFontSize(10)
  doc.text(`Generated on: ${params.generatedAt}`, pageWidth / 2, 30, { align: 'center' })

  let currentY = 50

  // 1. Dashboard Overview Metrics
  doc.setFontSize(14)
  doc.setTextColor(43, 106, 79)
  doc.text('1. Dashboard Overview Metrics', 14, currentY)
  autoTable(doc, {
    startY: currentY + 4,
    head: [['Metric', 'Value']],
    body: [
      ['Avg Temperature', `${params.metrics.avgTemperature}°C`],
      ['Avg Rainfall / Precipitation', `${params.metrics.avgRainfall} mm`],
      ['Avg Soil Health Index', params.metrics.avgSoilHealth],
      ['Avg Predicted Yield', `${params.metrics.avgYield} MT/ha`],
    ],
    headStyles: { fillColor: [43, 106, 79] },
    theme: 'grid',
  })
  currentY = (doc as any).lastAutoTable.finalY + 10

  // 2. Climate Analysis — Input Parameters
  doc.setFontSize(14)
  doc.text('2. Climate Analysis — Input Parameters', 14, currentY)
  autoTable(doc, {
    startY: currentY + 4,
    head: [['Parameter', 'Value Entered']],
    body: [
      ['Temperature (°C)', `${params.climateAnalysisInputs.temp}`],
      ['Rainfall (mm)', `${params.climateAnalysisInputs.rain}`],
      ['Wind Speed (km/h)', `${params.climateAnalysisInputs.wind}`],
      ['Humidity (%)', `${params.climateAnalysisInputs.humidity}%`],
      ['Soil Moisture (%)', `${params.climateAnalysisInputs.moisture}%`],
    ],
    headStyles: { fillColor: [43, 106, 79] },
    theme: 'grid',
  })
  currentY = (doc as any).lastAutoTable.finalY + 10

  // 3. Crop Yield Prediction
  if (params.predictionInputs || params.predictionResult) {
    doc.setFontSize(14)
    doc.text('3. Crop Yield Prediction', 14, currentY)
    
    const predictionBody = [
      ['Crop Type', params.predictionInputs?.cropType || '—'],
      ['Soil Type', 'Unknown'],
      ['Temperature (°C)', params.predictionInputs?.temperature || '—'],
      ['Precipitation (mm)', params.predictionInputs?.precipitation || '—'],
      ['CO₂ Emissions (MT)', params.predictionInputs?.co2Emissions || '—'],
      ['Fertilizer Use (kg/ha)', params.predictionInputs?.fertilizerUse || '—'],
      ['Soil Health Index', params.predictionInputs?.soilHealthIndex || '—'],
      ['Irrigation Access (%)', params.predictionInputs?.irrigationAccess || '—'],
    ]

    autoTable(doc, {
      startY: currentY + 4,
      head: [['Input Parameter', 'Value']],
      body: predictionBody,
      headStyles: { fillColor: [43, 106, 79] },
      theme: 'grid',
    })
    currentY = (doc as any).lastAutoTable.finalY + 4

    if (params.predictionResult) {
      autoTable(doc, {
        startY: currentY,
        head: [['Prediction Result Type', 'Value']],
        body: [
          ['Predicted Yield', `${params.predictionResult.predictedYield} MT/ha`],
          ['Confidence Level', params.predictionResult.confidence],
          ['Status', params.predictionResult.status],
          ['Adaptation Strategy', params.predictionResult.adaptationStrategy],
          ['Recommendation', params.predictionResult.recommendation],
        ],
        headStyles: { fillColor: [74, 120, 102] },
        theme: 'grid',
      })
      currentY = (doc as any).lastAutoTable.finalY + 10
    }
  }

  // 4. Climate Simulation Results
  if (params.simulationResult) {
    if (currentY > 240) { doc.addPage(); currentY = 20; }
    doc.setFontSize(14)
    doc.text('4. Climate Simulation Results', 14, currentY)
    autoTable(doc, {
      startY: currentY + 4,
      head: [['Simulation Parameter / Result', 'Value']],
      body: [
        ['Baseline Yield', `${params.simulationResult.baselineYield} MT/ha`],
        ['Simulated Yield', `${params.simulationResult.simulatedYield} MT/ha`],
        ['Impact (%)', `${params.simulationResult.changePercent >= 0 ? '+' : ''}${params.simulationResult.changePercent}%`],
        ['Impact Level', params.simulationResult.impact],
        ['Summary', params.simulationResult.summary],
      ],
      headStyles: { fillColor: [180, 100, 50] },
      theme: 'grid',
    })
    currentY = (doc as any).lastAutoTable.finalY + 10
  }

  // 5. Crop Recommendation
  if (params.recommendations && params.recommendations.length > 0) {
    if (currentY > 240) { doc.addPage(); currentY = 20; }
    doc.setFontSize(14)
    doc.text('5. Crop Recommendation', 14, currentY)
    autoTable(doc, {
      startY: currentY + 4,
      head: [['Crop', 'Score', 'Yield Range (MT/ha)', 'Note']],
      body: params.recommendations.map(r => [
        r.crop, `${r.stars}/5`, `${r.expectedYieldMin}-${r.expectedYieldMax}`, r.reason
      ]),
      headStyles: { fillColor: [100, 120, 40] },
      theme: 'striped',
    })
    currentY = (doc as any).lastAutoTable.finalY + 10
  }

  // 6. Configured Risk Thresholds
  if (params.alerts) {
    if (currentY > 240) { doc.addPage(); currentY = 20; }
    doc.setFontSize(14)
    doc.text('6. Configured Risk Thresholds', 14, currentY)
    autoTable(doc, {
      startY: currentY + 4,
      head: [['Parameter', 'Alert Threshold']],
      body: [
        ['Temperature Alert', `${params.alerts.temp}°C`],
        ['Rainfall Alert', `${params.alerts.rain} mm`],
        ['Soil Health Alert', `${params.alerts.soilHealth}`],
      ],
      headStyles: { fillColor: [200, 80, 80] },
      theme: 'grid',
    })
    currentY = (doc as any).lastAutoTable.finalY + 10
  }

  // 7. Data Visualization Dashboard
  if (params.vizStats) {
    if (currentY > 220) { doc.addPage(); currentY = 20; }
    doc.setFontSize(14)
    doc.text('7. Data Visualization Dashboard', 14, currentY)
    autoTable(doc, {
      startY: currentY + 4,
      head: [['Filter / Metric', 'Value']],
      body: [
        ['Year Range', params.filters.yearRange],
        ['Selected Crops', params.filters.selectedCrops],
        ['Country Filter', params.filters.selectedCountry],
        ['Dataset Avg Yield', `${params.vizStats.avgYield} MT/ha`],
        ['Dataset Avg Temperature', `${params.vizStats.avgTemp}°C`],
        ['Dataset Avg Rainfall', `${params.vizStats.avgRainfall} mm`],
        ['Avg Economic Impact', params.vizStats.avgEconomicImpact],
        ['Top Country by Yield', params.vizStats.topCountry],
        ['Top Crop by Yield', params.vizStats.topCrop],
      ],
      headStyles: { fillColor: [100, 100, 100] },
      theme: 'grid',
    })
    currentY = (doc as any).lastAutoTable.finalY + 10

    // 7a. Yearly Yield Summary
    if (params.yearlyYieldSummary) {
      if (currentY > 220) { doc.addPage(); currentY = 20; }
      doc.setFontSize(14)
      doc.text('7a. Yearly Yield Summary', 14, currentY)
      
      const crops = Object.keys(params.yearlyYieldSummary[0] || {}).filter(k => k !== 'year')
      autoTable(doc, {
        startY: currentY + 4,
        head: [['Year', ...crops]],
        body: params.yearlyYieldSummary.map(row => [
          row.year,
          ...crops.map(c => row[c] !== null ? row[c] : '—')
        ]),
        headStyles: { fillColor:[120, 120, 120] },
        theme: 'striped',
        styles: { fontSize: 8 }
      })
      currentY = (doc as any).lastAutoTable.finalY + 10
    }

    // 7b. Avg Yield by Country
    if (params.yieldByCountry) {
      if (currentY > 220) { doc.addPage(); currentY = 20; }
      doc.setFontSize(14)
      doc.text('7b. Avg Yield by Country', 14, currentY)
      autoTable(doc, {
        startY: currentY + 4,
        head: [['Country', 'Avg Yield (MT/ha)']],
        body: params.yieldByCountry.map(r => [r.country, r.yield]),
        headStyles: { fillColor:[120, 120, 120] },
        theme: 'grid',
        styles: { fontSize: 9 }
      })
    }
  }

  // --- Footers ---
  const totalPages = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`YieldSim DSS — Climate-Driven Crop Yield Prediction System | Page ${i} of ${totalPages}`, pageWidth / 2, 290, { align: 'center' })
  }

  doc.save(`YieldSim_DSS_Report_${new Date().toISOString().split('T')[0]}.pdf`)
}
