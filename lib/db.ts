/**
 * Mock database library
 * All Firebase logic has been removed as requested.
 * Functions are now in-memory only or return empty results.
 */

// Save a simulation result (stub)
export async function saveSimulation(data: any) {
  console.log('Local simulation result (not persisted):', data)
  return Promise.resolve()
}

// Fetch last 10 simulations (stub)
export async function getSimulations() {
  return Promise.resolve([])
}

// Save a crop yield prediction (stub)
export async function savePrediction(data: any) {
  console.log('Local prediction result (not persisted):', data)
  return Promise.resolve()
}

// Fetch last 10 predictions (stub)
export async function getPredictions() {
  return Promise.resolve([])
}

// Fetch historical climate data (stub)
export async function getHistoricalData() {
  return Promise.resolve([])
}

// Fetch alert thresholds (stub)
export async function getAlertThresholds() {
  return Promise.resolve(null)
}

// Save/update alert thresholds (stub)
export async function saveAlertThresholds(data: any) {
  console.log('Local alert thresholds (not persisted):', data)
  return Promise.resolve()
}
