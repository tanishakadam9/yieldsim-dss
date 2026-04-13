import { supabase } from './supabase'

// Save a simulation result
export async function saveSimulation(data: {
  crop_type: string
  temp_change: number
  rainfall_change: number
  soil_moisture_change: number
  humidity_change: number
  baseline_yield: number
  simulated_yield: number
  impact_percent: number
  impact_label: string
  summary: string
}) {
  const { error } = await supabase.from('simulation_results').insert([data])
  if (error) console.error('Save simulation error:', error)
}

// Fetch last 10 simulations
export async function getSimulations() {
  const { data, error } = await supabase
    .from('simulation_results')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
  if (error) console.error('Fetch simulations error:', error)
  return data || []
}

// Save a crop yield prediction
export async function savePrediction(data: {
  crop_type: string
  soil_type: string
  temperature: number
  rainfall: number
  soil_moisture: number
  fertilizer: number
  irrigation_method: string
  predicted_yield: number
  confidence_level: string
  suitability: string
}) {
  const { error } = await supabase.from('crop_yield_predictions').insert([data])
  if (error) console.error('Save prediction error:', error)
}

// Fetch last 10 predictions
export async function getPredictions() {
  const { data, error } = await supabase
    .from('crop_yield_predictions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
  if (error) console.error('Fetch predictions error:', error)
  return data || []
}

// Fetch historical climate data
export async function getHistoricalData() {
  const { data, error } = await supabase
    .from('historical_climate_data')
    .select('*')
    .order('year', { ascending: true })
  if (error) console.error('Fetch historical error:', error)
  return data || []
}

// Fetch alert thresholds (always the first/only row)
export async function getAlertThresholds() {
  const { data, error } = await supabase
    .from('alert_thresholds')
    .select('*')
    .limit(1)
    .single()
  if (error) console.error('Fetch thresholds error:', error)
  return data
}

// Save/update alert thresholds (upsert the single row)
export async function saveAlertThresholds(data: {
  temperature_threshold: number
  rainfall_threshold: number
  moisture_threshold: number
}) {
  const { data: existing } = await supabase
    .from('alert_thresholds')
    .select('id')
    .limit(1)
    .single()

  if (existing?.id) {
    const { error } = await supabase
      .from('alert_thresholds')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
    if (error) console.error('Update thresholds error:', error)
  }
}
