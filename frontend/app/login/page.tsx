'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { NeonGlassLogo } from '@/components/NeonGlassLogo';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Loader2,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login, enterDemoSandbox } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activePersona, setActivePersona] = useState<'demo' | 'custom'>('custom');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectDemo = () => {
    setActivePersona('demo');
    setEmail('demo@devflow.io');
    setPassword('demo123');
    setError(null);
  };

  const selectCustom = () => {
    setActivePersona('custom');
    setEmail('');
    setPassword('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    try {
      await login(email.trim(), password);
      toast.success('Welcome back to DevFlow');
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.info('Demo Credentials Available', {
      description: 'Use the Demo Account option or instant sandbox for quick access.',
    });
  };

  const handleInstantSandbox = () => {
    toast.success('⚡ Launching instant sandbox session...', {
      description: 'Zero-login sandbox activated with HyperScale Core.',
    });
    enterDemoSandbox();
    router.push('/dashboard');
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[#000000] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* ----------------- Background Ambience & Orbital Neon Curves ----------------- */}

      {/* Matrix Dot Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 -z-20"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Scattered Cyan & Purple Sparkling Light Points */}
      <div className="absolute inset-0 pointer-events-none -z-15 overflow-hidden">
        <div className="absolute top-[18%] left-[12%] w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-pulse" />
        <div className="absolute top-[32%] left-[8%] w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_14px_#c084fc] animate-ping" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[24%] left-[15%] w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]" />
        <div className="absolute top-[16%] right-[14%] w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_16px_#a855f7] animate-pulse" />
        <div className="absolute top-[48%] right-[8%] w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9]" />
        <div className="absolute bottom-[18%] right-[18%] w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_12px_#8b5cf6]" />
      </div>

      {/* Glowing Orbital Neon Rings Behind Glass Panel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[920px] h-[550px] sm:h-[680px] pointer-events-none -z-10 flex items-center justify-center">
        {/* Sky/Cyan Neon Orbital Ellipse */}
        <svg
          viewBox="0 0 800 600"
          className="absolute inset-0 w-full h-full opacity-85 overflow-visible"
        >
          <defs>
            <linearGradient id="neonCyanArc" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
              <stop offset="35%" stopColor="#00f0ff" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="neonPurpleArc" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0" />
              <stop offset="40%" stopColor="#a855f7" stopOpacity="0.9" />
              <stop offset="80%" stopColor="#6366f1" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>

            <filter id="laserGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Cyan Outer Sweeping Arc */}
          <ellipse
            cx="400"
            cy="300"
            rx="320"
            ry="190"
            transform="rotate(-28 400 300)"
            fill="none"
            stroke="url(#neonCyanArc)"
            strokeWidth="1.8"
            filter="url(#laserGlow)"
          />

          {/* Violet Inner Sweeping Arc */}
          <ellipse
            cx="400"
            cy="300"
            rx="290"
            ry="170"
            transform="rotate(32 400 300)"
            fill="none"
            stroke="url(#neonPurpleArc)"
            strokeWidth="1.6"
            filter="url(#laserGlow)"
          />
        </svg>

        {/* Ambient Center Glow Haze */}
        <div className="w-[360px] h-[360px] rounded-full bg-gradient-to-tr from-sky-500/15 via-indigo-500/15 to-purple-600/15 blur-[90px] -z-10" />
      </div>

      {/* ----------------- Central Neon Glass Card ----------------- */}
      <div className="w-full max-w-[440px] relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Outer Radiant Neon Gradient Rim */}
        <div className="relative p-[1.5px] rounded-[28px] bg-gradient-to-br from-sky-400 via-indigo-500/40 to-purple-500 shadow-[0_0_50px_-10px_rgba(56,189,248,0.3),0_0_60px_-12px_rgba(168,85,247,0.35)]">
          {/* Frosted Glass Body */}
          <div className="w-full bg-[#08090d]/90 backdrop-blur-3xl rounded-[26.5px] p-6 sm:p-8 space-y-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
            {/* Header: 3D Isometric Glass Stack Logo, Title & Subtitle */}
            <div className="text-center space-y-1.5 flex flex-col items-center">
              <NeonGlassLogo size="lg" className="mb-1" />
              <h1 className="text-2xl font-bold font-heading tracking-tight text-white">
                DevFlow
              </h1>
              <p className="text-xs text-zinc-400 font-normal">
                Sign in to your workspace
              </p>
            </div>

            {/* Demo Account Quick Access */}
            <div className="grid grid-cols-2 gap-2.5 p-1 rounded-2xl bg-black/40 border border-white/[0.06]">
              <button
                type="button"
                onClick={selectDemo}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                  activePersona === 'demo'
                    ? 'bg-sky-500/15 border border-sky-500/80 text-sky-300 shadow-[0_0_14px_rgba(56,189,248,0.25),inset_0_1px_0_rgba(56,189,248,0.3)] font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <User className={`w-3.5 h-3.5 ${activePersona === 'demo' ? 'text-sky-400' : 'text-zinc-500'}`} />
                <span className="truncate">Demo Account</span>
              </button>

              <button
                type="button"
                onClick={selectCustom}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                  activePersona === 'custom'
                    ? 'bg-purple-500/15 border border-purple-500/80 text-purple-300 shadow-[0_0_14px_rgba(168,85,247,0.25),inset_0_1px_0_rgba(168,85,247,0.3)] font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <User className={`w-3.5 h-3.5 ${activePersona === 'custom' ? 'text-purple-400' : 'text-zinc-500'}`} />
                <span className="truncate">Your Account</span>
              </button>
            </div>

            {/* Error Notification Alert */}
            {error && (
              <div role="alert" className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-mono flex items-start gap-2">
                <span className="shrink-0 font-bold">•</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Work Email Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-zinc-300"
                >
                  Work Email
                </label>
                <div className="relative">
                  <Mail
                    className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    spellCheck={false}
                    inputMode="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setActivePersona('custom');
                    }}
                    placeholder="name@company.com"
                    className="w-full h-11 bg-black/60 border border-white/[0.1] rounded-xl pl-10 pr-3.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Password Field with Eye Toggle */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-zinc-300"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setActivePersona('custom');
                    }}
                    placeholder="••••••••"
                    className="w-full h-11 bg-black/60 border border-white/[0.1] rounded-xl pl-10 pr-10 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Options */}
              <div className="flex items-center justify-between pt-0.5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-zinc-200 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-black/80 border-white/20 text-sky-500 focus:ring-0 focus:ring-offset-0 transition cursor-pointer accent-sky-500"
                  />
                  <span>Keep me signed in</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Primary Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full h-11 bg-white hover:bg-zinc-200 active:scale-[0.99] text-zinc-950 font-bold rounded-full text-xs transition-all duration-150 flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(255,255,255,0.2)] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Instant Demo Sandbox Shortcut Option */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleInstantSandbox}
                className="w-full py-2 px-3 rounded-full bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 text-amber-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer group"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <span>Or launch instant sandbox (no credentials required)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 text-center space-y-2 text-xs text-zinc-500">
          <p>
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-zinc-300 hover:text-white font-medium underline underline-offset-4 transition"
            >
              Sign up
            </Link>
          </p>
          <p className="font-mono text-[11px] text-zinc-600">
            <Link href="/" className="hover:text-zinc-400 transition">
              ← Back to DevFlow Home
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
