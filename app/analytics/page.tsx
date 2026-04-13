'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import {
  BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import { Loader2 } from 'lucide-react'

// Basic UI component for the dropdown if Radix isn't strictly necessary for a simple select
// However, since we used Select from components/ui/select in dashboard, we can reuse it if available.
// I will build a standard glassmorphic select here to avoid breaking dependencies.

const CATEGORICAL_COLUMNS = ['country', 'crop_type', 'adaptation_strategies']
const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#ec4899']

export default function AnalyticsDynamicPage() {
  const [data, setData] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [selectedColumn, setSelectedColumn] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/climate-data')
        const jsonData = await res.json()
        if (jsonData && jsonData.length > 0) {
          setData(jsonData)
          const cols = Object.keys(jsonData[0]).filter(k => k !== 'year') // exclude year from direct grouping for this simple viz
          setColumns(cols)
          setSelectedColumn('crop_type') // default
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Process data based on selected column
  const chartData = useMemo(() => {
    if (!selectedColumn || data.length === 0) return []

    const isCategorical = CATEGORICAL_COLUMNS.includes(selectedColumn)

    if (isCategorical) {
      // Frequency distribution for PieChart
      const counts: Record<string, number> = {}
      data.forEach(row => {
        const val = row[selectedColumn] || 'Unknown'
        counts[val] = (counts[val] || 0) + 1
      })
      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    } else {
      // Averages grouped by Country for BarChart
      const sums: Record<string, { total: number; count: number }> = {}
      data.forEach(row => {
        const country = row.country || 'Unknown'
        const val = parseFloat(row[selectedColumn])
        if (!isNaN(val)) {
          if (!sums[country]) sums[country] = { total: 0, count: 0 }
          sums[country].total += val
          sums[country].count += 1
        }
      })
      return Object.entries(sums)
        .map(([country, stats]) => ({
          name: country,
          value: Number((stats.total / stats.count).toFixed(2))
        }))
        .sort((a, b) => b.value - a.value)
    }
  }, [data, selectedColumn])

  const isCategorical = CATEGORICAL_COLUMNS.includes(selectedColumn)

  // Format labels nicely
  const formatColumnName = (col: string) => {
    return col.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-dmsans">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-20 px-6 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-foreground mb-4">
            Interactive Dataset Visualizer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dynamically query and aggregate the global climate records. Select a metric below to instantly generate a distribution or regional breakdown.
          </p>
        </div>

        {/* Content Section */}
        <div className="glass rounded-3xl p-8 border border-white/20 shadow-xl overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-primary w-12 h-12 mb-4" />
              <p className="text-muted-foreground">Loading 10,000 dataset rows...</p>
            </div>
          ) : (
            <>
              {/* Controls */}
              <div className="flex flex-col md:flex-row items-center gap-6 mb-10 w-full max-w-md mx-auto">
                <label className="text-sm font-bold text-foreground whitespace-nowrap">
                  Select Data Column:
                </label>
                <select
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl glass border border-white/30 text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23999%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px top 50%', backgroundSize: '12px auto' }}
                >
                  {columns.map(col => (
                    <option key={col} value={col} className="bg-background text-foreground">
                      {formatColumnName(col)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chart Render */}
              <div className="w-full h-[500px]">
                <h3 className="text-center font-playfair text-xl font-bold mb-6 text-foreground">
                  {isCategorical 
                    ? `Distribution of ${formatColumnName(selectedColumn)}` 
                    : `Average ${formatColumnName(selectedColumn)} by Country`}
                </h3>

                <ResponsiveContainer width="100%" height="100%">
                  {isCategorical ? (
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="45%"
                        outerRadius={150}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                      >
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} />
                    </PieChart>
                  ) : (
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80} 
                        tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} 
                      />
                      <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                      <Tooltip 
                        contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none' }} 
                        formatter={(val: number) => [val, 'Average Value']}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="hsl(var(--primary))" 
                        radius={[6, 6, 0, 0]} 
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
