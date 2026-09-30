'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { BrandLogo } from '@/components/BrandLogo';
import { Loader2, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    try {
      await login(email.trim(), password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
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

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Radiant Glow in Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[300px] bg-gradient-to-tr from-sky-500/10 via-indigo-500/10 to-transparent blur-[60px] pointer-events-none -z-10" />

      <div className="w-full max-w-[380px] space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <BrandLogo size="lg" showText={false} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Log in to DevFlow</h1>
          <p className="text-xs text-zinc-400">
            Enter your credentials to access your engineering workspace
          </p>
        </div>

        {/* Card */}
        <div className="linear-card rounded-2xl p-6 sm:p-7 shadow-2xl">
          {error && (
            <div role="alert" className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-mono flex items-start gap-2">
              <span className="shrink-0">•</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Work Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                spellCheck={false}
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full h-9 bg-zinc-950 border border-white/[0.08] rounded-lg px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/[0.25] transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-medium text-zinc-300">
                  Password
                </label>
              </div>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-9 bg-zinc-950 border border-white/[0.08] rounded-lg px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/[0.25] transition-colors"
              />
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full h-9 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-lg text-xs transition-all duration-150 flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(255,255,255,0.12)] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleGuestAccess}
                disabled={loading}
                className="w-full h-9 bg-zinc-900/80 hover:bg-zinc-850 border border-white/[0.08] hover:border-white/[0.16] text-zinc-300 hover:text-white font-medium rounded-lg text-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
                <span>Continue with Demo Guest</span>
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
            <p className="text-xs text-zinc-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-white hover:underline font-medium">
                Create account
              </Link>
            </p>
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
