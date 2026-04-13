'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, User, LayoutDashboard, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const [profileOpen, setProfileOpen] = useState(false)
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email ?? null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

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
        <div className="flex items-center gap-2">
          <span className="text-4xl">🌾</span>
          <span className="text-xl md:text-2xl font-playfair font-bold text-primary">YieldSim</span>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full glass border border-white/30 hover:border-primary/50 transition-all hover:scale-105"
            aria-label="Toggle theme"
          >
            {theme === 'dark'
              ? <Sun size={18} className="text-primary" />
              : <Moon size={18} className="text-primary" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-9 h-9 rounded-full glass border-2 border-primary/40 hover:border-primary transition-all hover:scale-105 flex items-center justify-center"
              aria-label="User profile"
            >
              <User size={16} className="text-primary" />
            </button>

            {profileOpen && (
              <>
                {/* Backdrop to close on outside click */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                />
                {/* Dropdown */}
                <div className="absolute right-0 top-12 z-50 glass rounded-2xl border border-white/30 shadow-xl p-2 min-w-48 animate-fade-in-up">
                  {/* User info header */}
                  <div className="px-3 py-2 mb-1 border-b border-white/20">
                    <p className="font-medium text-foreground text-sm">
                      {userEmail ? userEmail.split('@')[0] : 'My Account'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {userEmail ?? 'Not signed in'}
                    </p>
                  </div>
                  {/* Dashboard link */}
                  <button
                    onClick={() => { setProfileOpen(false); router.push('/dashboard') }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-primary/10 transition-colors text-left"
                  >
                    <LayoutDashboard size={16} className="text-primary" />
                    <span className="text-sm font-medium text-foreground">Dashboard</span>
                  </button>
                  {/* Sign out */}
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut()
                      setProfileOpen(false)
                      router.push('/login')
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut size={16} className="text-red-500" />
                    <span className="text-sm font-medium text-red-500">Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
