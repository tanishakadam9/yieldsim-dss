import { db } from './firebase'
import { collection, addDoc, getDocs, query, orderBy, limit, doc, updateDoc } from 'firebase/firestore'

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
  try {
    await addDoc(collection(db, 'simulation_results'), {
      ...data,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Save simulation error:', error)
  }
}

// Fetch last 10 simulations
export async function getSimulations() {
  try {
    const q = query(
      collection(db, 'simulation_results'),
      orderBy('created_at', 'desc'),
      limit(10)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Fetch simulations error:', error)
    return []
  }
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
  try {
    await addDoc(collection(db, 'crop_yield_predictions'), {
      ...data,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Save prediction error:', error)
  }
}

// Fetch last 10 predictions
export async function getPredictions() {
  try {
    const q = query(
      collection(db, 'crop_yield_predictions'),
      orderBy('created_at', 'desc'),
      limit(10)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Fetch predictions error:', error)
    return []
  }
}

// Fetch historical climate data - Not heavily used natively if moving to CSV, but kept for compatibility
export async function getHistoricalData() {
  try {
    const q = query(
      collection(db, 'historical_climate_data'),
      orderBy('year', 'asc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Fetch historical error:', error)
    return []
  }
}

// Fetch alert thresholds (always the first/only row)
export async function getAlertThresholds() {
  try {
    const q = query(collection(db, 'alert_thresholds'), limit(1))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
  } catch (error) {
    console.error('Fetch thresholds error:', error)
    return null
  }
}

// Save/update alert thresholds (upsert the single row)
export async function saveAlertThresholds(data: {
  temperature_threshold: number
  rainfall_threshold: number
  moisture_threshold: number
}) {
  try {
    const q = query(collection(db, 'alert_thresholds'), limit(1))
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      const docRef = doc(db, 'alert_thresholds', snapshot.docs[0].id)
      await updateDoc(docRef, { ...data, updated_at: new Date().toISOString() })
    } else {
      await addDoc(collection(db, 'alert_thresholds'), {
        ...data,
        updated_at: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Update thresholds error:', error)
  }
}
