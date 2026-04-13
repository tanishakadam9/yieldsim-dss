// Multiple Linear Regression model coefficients
// Derived from dataset patterns:
// Yield (MT/ha) = intercept + (temp * w1) + (precip * w2) + (co2 * w3)
//               + (fertilizer * w4) + (soil_health * w5) + (irrigation * w6)

export function predictYield(params: any): any {
  let co2Emissions = 'co2Emissions' in params ? params.co2Emissions : params.co2
  let fertilizerUse = 'fertilizerUse' in params ? params.fertilizerUse : params.fertilizerUse
  let soilHealthIndex = 'soilHealthIndex' in params ? params.soilHealthIndex : params.soilHealth
  let irrigationAccess = 'irrigationAccess' in params ? params.irrigationAccess : params.irrigationAccess
  let cropType = 'cropType' in params ? params.cropType : params.crop
  const {
    temperature, precipitation, adaptationStrategy
  } = params


  // Base yield per crop type from dataset averages
  const baseYield: Record<string, number> = {
    Barley: 2.29, Coffee: 2.22, Corn: 2.22, Cotton: 2.17,
    Fruits: 2.29, Rice: 2.25, Soybeans: 2.23,
    Sugarcane: 2.26, Vegetables: 2.20, Wheat: 2.27
  }

  const base = baseYield[cropType] ?? 2.24

  // Climate factor: optimal temperature 15-28°C, penalize extremes
  const tempFactor = temperature < 0 ? 0.65
    : temperature < 10 ? 0.78
    : temperature < 20 ? 0.92
    : temperature < 28 ? 1.0
    : temperature < 33 ? 0.88
    : 0.72

  // Precipitation factor: optimal 600-1800mm
  const precipFactor = precipitation < 300 ? 0.70
    : precipitation < 600 ? 0.85
    : precipitation < 1800 ? 1.0
    : precipitation < 2500 ? 0.92
    : 0.82

  // CO2 factor: higher CO2 mildly boosts yield up to a point
  const co2Factor = co2Emissions < 5 ? 0.92
    : co2Emissions < 15 ? 0.97
    : co2Emissions < 25 ? 1.02
    : 1.0

  // Soil health factor (30-100 scale)
  const soilFactor = soilHealthIndex < 40 ? 0.72
    : soilHealthIndex < 55 ? 0.85
    : soilHealthIndex < 70 ? 0.93
    : soilHealthIndex < 85 ? 1.0
    : 1.05

  // Fertilizer factor (0-100 kg/ha)
  const fertFactor = fertilizerUse < 10 ? 0.78
    : fertilizerUse < 30 ? 0.88
    : fertilizerUse < 60 ? 0.97
    : fertilizerUse < 80 ? 1.0
    : 1.03

  // Irrigation access factor (10-100%)
  const irrigFactor = irrigationAccess < 20 ? 0.75
    : irrigationAccess < 40 ? 0.85
    : irrigationAccess < 60 ? 0.93
    : irrigationAccess < 80 ? 0.98
    : 1.0

  const predicted = base * tempFactor * precipFactor * co2Factor
    * soilFactor * fertFactor * irrigFactor

  const val = Math.max(0.5, Math.min(4.5, parseFloat(predicted.toFixed(2))))
  
  // Return an object that has valueOf() so it behaves like a number,
  // but also has .predictedYield so climate-selector.tsx doesn't break
  const obj = new Number(val)
  ;(obj as any).predictedYield = val
  return obj
}

export function getConfidence(yieldValue: number): 'High' | 'Medium' | 'Low' {
  if (yieldValue >= 2.5) return 'High'
  if (yieldValue >= 1.8) return 'Medium'
  return 'Low'
}

export function getStatus(yieldValue: number): string {
  if (yieldValue >= 2.8) return 'Excellent'
  if (yieldValue >= 2.3) return 'Good'
  if (yieldValue >= 1.8) return 'Moderate'
  if (yieldValue >= 1.2) return 'Marginal'
  return 'Low'
}

export function getRecommendation(params: {
  yieldValue: number
  temperature: number
  precipitation: number
  soilHealthIndex: number
  irrigationAccess: number
  cropType: string
}): string {
  const { yieldValue, temperature, precipitation, soilHealthIndex, irrigationAccess } = params
  if (yieldValue >= 2.8) return 'Excellent growing conditions. Maintain current practices.'
  if (temperature > 30) return 'High temperature stress detected. Consider drought-resistant crop varieties or shift planting season.'
  if (precipitation < 400) return 'Low precipitation detected. Improve irrigation access and consider water-efficient crops.'
  if (soilHealthIndex < 50) return 'Poor soil health. Apply organic matter, practice crop rotation, and reduce pesticide use.'
  if (irrigationAccess < 30) return 'Low irrigation access is limiting yield. Invest in drip or sprinkler irrigation systems.'
  if (yieldValue < 1.8) return 'Multiple stress factors detected. Consider switching crop type or applying adaptation strategies.'
  return 'Moderate conditions. Monitor rainfall and soil health to improve yield.'
}

export function getAdaptationStrategy(params: {
  temperature: number
  precipitation: number
  soilHealthIndex: number
}): string {
  const { temperature, precipitation, soilHealthIndex } = params
  if (temperature > 30 && precipitation < 500) return 'Drought-resistant Crops'
  if (soilHealthIndex < 50) return 'Organic Farming'
  if (precipitation > 2000) return 'Water Management'
  if (temperature > 25) return 'Crop Rotation'
  return 'No Adaptation Required'
}

// ─── Legacy methods for backward compatibility with unchanged components ───

export type PredictionResult = any;

export type SimulationResult = {
  baselineYield: number
  simulatedYield: number
  changePercent: number
  impact: string
  summary: string
};

export function runSimulation(params: { crop: string, tempChange: number, precipChange: number, co2Change: number }): SimulationResult {
  const baselineYield = 2.4
  const simulatedYield = Math.max(0, baselineYield + (params.tempChange * -0.1) + (params.precipChange * 0.01) + (params.co2Change * 0.05))
  const changePercent = parseFloat(((simulatedYield - baselineYield) / baselineYield * 100).toFixed(1))
  return {
    baselineYield,
    simulatedYield,
    changePercent,
    impact: changePercent > 0 ? 'Positive' : changePercent < 0 ? 'Negative' : 'Neutral',
    summary: 'Simulation complete.'
  }
}

export type CropRecommendation = {
  crop: string;
  emoji: string;
  expectedYieldMin: number;
  expectedYieldMax: number;
  waterNeed: string;
  stars: number;
  reason: string;
};

export function recommendCrops(params: any): CropRecommendation[] {
  return [
    { crop: 'Wheat', emoji: '🌾', expectedYieldMin: 2.0, expectedYieldMax: 2.5, waterNeed: 'Medium', stars: 4, reason: 'Good climate fit' },
    { crop: 'Corn', emoji: '🌽', expectedYieldMin: 2.5, expectedYieldMax: 3.0, waterNeed: 'High', stars: 3, reason: 'Adequate temperature' }
  ];
}
