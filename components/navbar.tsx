'use client'

import { Sun, Moon, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useReport } from '@/lib/report-context'
import { generateDashboardReport } from '@/lib/generateReport'

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { reportData } = useReport()

  return (
    <>
      {/* Animated leaf particles background */}
      <div className="fixed top-0 left-0 w-full h-20 pointer-events-none overflow-hidden z-40">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-drift text-3xl opacity-20"
            style={{
              animationDelay: `${i * 2}s`,
              left: `${i * 33}%`,
            }}
          >
            🍃
          </div>
        ))}
      </div>

      <nav className="fixed top-0 left-0 right-0 h-20 glass z-50 border-b border-white/30 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <span className="text-4xl">🌾</span>
            <span className="text-xl md:text-2xl font-playfair font-bold text-primary">YieldSim</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Dashboard
            </button>
            <button 
              onClick={() => router.push('/analytics')}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Dataset Analytics
            </button>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {reportData && (
            <button
              onClick={() => generateDashboardReport({
                title: 'YieldSim DSS Comprehensive Report',
                generatedAt: new Date().toLocaleString(),
                ...reportData
              })}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-all border border-primary/30 text-sm font-semibold"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          )}

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full glass border border-white/30 hover:border-primary/50 transition-all hover:scale-105"
            aria-label="Toggle theme"
          >
            {theme === 'dark'
              ? <Sun size={18} className="text-primary" />
              : <Moon size={18} className="text-primary" />}
          </button>
        </div>
      </nav>
    </>
  )
}
