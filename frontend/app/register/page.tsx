'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { BrandLogo } from '@/components/BrandLogo';
import { Loader2, ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function RegisterPage() {
  const { register, login, enterDemoSandbox } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register(email.trim(), password, fullName.trim());
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    setLoading(true);
    setError(null);
    try {
      try {
        await login('sanjaykamal2006@gmail.com', 'password123');
      } catch {
        await login('demo@devflow.io', 'demo123');
      }
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to sign in as guest.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantSandbox = async () => {
    setLoading(true);
    try {
      await enterDemoSandbox();
      router.push('/dashboard');
    } catch {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Radiant Glow Atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[320px] bg-gradient-to-tr from-sky-500/12 via-indigo-500/10 to-amber-500/08 blur-[70px] pointer-events-none -z-10" />

      <div className="w-full max-w-[400px] space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <BrandLogo size="lg" showText={false} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create your account</h1>
          <p className="text-xs text-zinc-400">
            Get started with high-velocity issue tracking for your team
          </p>
        </div>

        {/* 1-Click Sandbox Fast Access Banner */}
        <button
          type="button"
          onClick={handleInstantSandbox}
          disabled={loading}
          className="w-full p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/50 text-amber-200 text-xs font-medium flex items-center justify-between transition-all cursor-pointer group shadow-sm active:scale-98"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span className="font-semibold text-amber-300">Instant Demo Sandbox</span>
            <span className="text-zinc-500 hidden sm:inline text-[11px]">• No sign-in</span>
          </div>
          <span className="text-[11px] font-mono text-amber-300 group-hover:translate-x-0.5 transition-transform">
            Try Now →
          </span>
        </button>

        {/* Specular Highlight Outer Container */}
        <div className="p-[1px] rounded-2xl bg-gradient-to-b from-white/[0.16] via-white/[0.04] to-transparent shadow-2xl">
          <div className="pinterest-card !rounded-2xl p-6 sm:p-7 bg-[#0c0d10]/95 backdrop-blur-2xl">
            {error && (
              <div role="alert" className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-mono flex items-start gap-2">
                <span className="shrink-0">•</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reg-fullname" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Full Name
                </label>
                <input
                  id="reg-fullname"
                  type="text"
                  required
                  autoFocus
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full h-9 bg-zinc-950 border border-white/[0.08] rounded-lg px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                />
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Work Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  spellCheck={false}
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-9 bg-zinc-950 border border-white/[0.08] rounded-lg px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                />
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Password
                </label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full h-9 bg-zinc-950 border border-white/[0.08] rounded-lg px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                />
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  disabled={loading || !fullName || !email || !password}
                  className="w-full h-9 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-lg text-xs transition-all duration-150 flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(255,255,255,0.12)] disabled:opacity-50 cursor-pointer active:scale-98"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleGuestAccess}
                  disabled={loading}
                  className="w-full h-9 bg-zinc-900/80 hover:bg-zinc-850 border border-white/[0.08] hover:border-white/[0.16] text-zinc-300 hover:text-white font-medium rounded-lg text-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
                  <span>Instant Demo Access</span>
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
              <p className="text-xs text-zinc-400">
                Already have an account?{' '}
                <Link href="/login" className="text-white hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Security badge note */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Stateless JWT &amp; Cloud Neon PostgreSQL</span>
        </div>
      </div>
    </div>
  );
}
