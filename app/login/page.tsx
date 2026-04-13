'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Moon, Sun, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'

export default function LoginPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push('/dashboard')
    })
    return () => unsubscribe()
  }, [])

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl glass border border-white/20">

        {/* LEFT PANEL — Login Form */}
        <div className="md:w-1/2 w-full p-10 md:p-14 flex flex-col justify-center">
          {/* Top bar */}
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🌾</span>
              <span className="text-xl font-playfair font-bold text-primary">YieldSim</span>
            </div>
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

          {/* Heading */}
          <h1 className="font-playfair font-bold text-foreground mb-1" style={{ fontSize: '2rem' }}>
            Welcome back 👋
          </h1>
          <p className="text-muted-foreground text-sm mb-8">Please enter your details.</p>

          {/* Email input */}
          <div className="relative mb-4">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-full glass border border-white/30 focus:border-primary/60 outline-none text-sm text-foreground placeholder:text-muted-foreground bg-transparent transition-all"
            />
          </div>

          {/* Password input */}
          <div className="relative mb-3">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-full glass border border-white/30 focus:border-primary/60 outline-none text-sm text-foreground placeholder:text-muted-foreground bg-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between mb-6 text-xs text-muted-foreground">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-3.5 h-3.5 accent-primary rounded"
              />
              Remember for 30 days
            </label>
            <button className="hover:text-primary transition-colors font-medium">
              Forgot password?
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs text-center">
              {error}
            </div>
          )}

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all hover:scale-[1.02] active:scale-100 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Signing in...' : 'Log In'}
          </button>

          {/* Sign up link */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => router.push('/signup')}
              className="font-bold text-foreground hover:text-primary transition-colors"
            >
              Sign Up
            </button>
          </p>
        </div>

        {/* RIGHT PANEL — Agricultural Illustration */}
        <div className="hidden md:block md:w-1/2 relative overflow-hidden rounded-r-3xl" style={{ minHeight: '520px' }}>
          {/* Sky gradient — warm orange/yellow sunset */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, #E8834A 0%, #F2A842 25%, #F5C842 45%, #8DB87A 65%, #4A7A3A 85%, #2D5A20 100%)'
          }} />

          {/* Sun */}
          <div className="absolute rounded-full" style={{
            width: '48px', height: '48px',
            background: 'radial-gradient(circle, #FFF5B0 0%, #F5D842 60%, #F2A842 100%)',
            top: '14%', left: '55%',
            boxShadow: '0 0 40px 20px rgba(245,200,60,0.35)'
          }} />

          {/* Mountain silhouettes */}
          <svg className="absolute w-full" style={{ bottom: '38%' }} viewBox="0 0 400 120" preserveAspectRatio="none">
            <path d="M0 120 L60 40 L120 80 L180 20 L240 70 L300 30 L360 65 L400 35 L400 120 Z" fill="#6B5A3A" opacity="0.5" />
            <path d="M0 120 L80 55 L150 85 L220 35 L290 75 L350 45 L400 60 L400 120 Z" fill="#8B7355" opacity="0.4" />
          </svg>

          {/* Terraced rice field layers */}
          <svg className="absolute w-full" style={{ bottom: '0', height: '55%' }} viewBox="0 0 400 220" preserveAspectRatio="none">
            <ellipse cx="200" cy="60" rx="220" ry="55" fill="#3D7A2A" opacity="0.9" />
            <ellipse cx="200" cy="95" rx="210" ry="50" fill="#4A8A32" opacity="0.9" />
            <ellipse cx="200" cy="128" rx="200" ry="48" fill="#3A7228" opacity="0.95" />
            <ellipse cx="200" cy="158" rx="210" ry="48" fill="#2D6020" opacity="1" />
            <ellipse cx="200" cy="188" rx="220" ry="50" fill="#245218" opacity="1" />
            <ellipse cx="200" cy="215" rx="240" ry="55" fill="#1A3D12" opacity="1" />
          </svg>

          {/* Terrace highlight rings */}
          <svg className="absolute w-full" style={{ bottom: '0', height: '55%' }} viewBox="0 0 400 220" preserveAspectRatio="none">
            <ellipse cx="200" cy="60" rx="218" ry="53" fill="none" stroke="#5A9A3A" strokeWidth="1.5" opacity="0.6" />
            <ellipse cx="200" cy="95" rx="208" ry="48" fill="none" stroke="#5A9A3A" strokeWidth="1.5" opacity="0.6" />
            <ellipse cx="200" cy="128" rx="198" ry="46" fill="none" stroke="#4A8A30" strokeWidth="1.5" opacity="0.5" />
            <ellipse cx="200" cy="158" rx="208" ry="46" fill="none" stroke="#3A7228" strokeWidth="1" opacity="0.5" />
          </svg>

          {/* Farmer silhouette */}
          <svg className="absolute" style={{ bottom: '2%', right: '10%', width: '90px', height: '110px' }} viewBox="0 0 90 110">
            <ellipse cx="45" cy="28" rx="32" ry="8" fill="#1A2E10" />
            <path d="M20 28 L45 4 L70 28 Z" fill="#1A2E10" />
            <path d="M35 36 Q45 32 55 36 L60 75 Q45 80 30 75 Z" fill="#1A2E10" />
            <path d="M35 45 Q20 55 18 70" stroke="#1A2E10" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M55 45 Q65 50 62 65" stroke="#1A2E10" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M38 75 L34 100" stroke="#1A2E10" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M52 75 L56 100" stroke="#1A2E10" strokeWidth="5" fill="none" strokeLinecap="round" />
          </svg>

          {/* Foreground dark grass layer */}
          <div className="absolute bottom-0 left-0 right-0 h-16" style={{
            background: 'linear-gradient(180deg, transparent 0%, #0F2A08 100%)'
          }} />

          {/* Glass overlay caption */}
          <div className="absolute bottom-5 left-5 right-5 glass rounded-2xl px-4 py-3 border border-white/20">
            <p className="font-playfair font-bold text-white text-sm">🌾 YieldSim DSS</p>
            <p className="text-white/70 text-xs mt-0.5">Climate-Driven Crop Yield Prediction</p>
          </div>
        </div>

      </div>
    </div>
  )
}
