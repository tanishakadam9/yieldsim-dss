import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'climate_change_impact_on_agriculture_2024.csv')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })

    // Map keys to match the expected format used by the frontend (which relied on Supabase column names)
    // The CSV columns are: Year,Country,Crop_Type,Average_Temperature_C,Total_Precipitation_mm,CO2_Emissions_MT,Crop_Yield_MT_per_HA,Extreme_Weather_Events,Irrigation_Access_%,Pesticide_Use_KG_per_HA,Fertilizer_Use_KG_per_HA,Soil_Health_Index,Adaptation_Strategies,Economic_Impact_Million_USD
    // Supabase format usually expects lowercase with underscores.
    const mappedRecords = records.map((record: any) => ({
      year: record['Year'],
      country: record['Country'],
      crop_type: record['Crop_Type'],
      average_temperature_c: record['Average_Temperature_C'],
      total_precipitation_mm: record['Total_Precipitation_mm'],
      co2_emissions_mt: record['CO2_Emissions_MT'],
      crop_yield_mt_per_ha: record['Crop_Yield_MT_per_HA'],
      extreme_weather_events: record['Extreme_Weather_Events'],
      irrigation_access_percent: record['Irrigation_Access_%'],
      pesticide_use_kg_per_ha: record['Pesticide_Use_KG_per_HA'],
      fertilizer_use_kg_per_ha: record['Fertilizer_Use_KG_per_HA'],
      soil_health_index: record['Soil_Health_Index'],
      adaptation_strategies: record['Adaptation_Strategies'],
      economic_impact_million_usd: record['Economic_Impact_Million_USD']
    }))

    return NextResponse.json(mappedRecords)
  } catch (error) {
    console.error('Error fetching CSV data:', error)
    return NextResponse.json({ error: 'Failed to load climate data' }, { status: 500 })
  }
}
