'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { BrandLogo } from '@/components/BrandLogo';
import { Loader2, Zap, ArrowRight } from 'lucide-react';

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
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setLoading(true);
    setError(null);
    try {
      await login('sanjaykamal2006@gmail.com', 'password123');
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Demo access failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="mb-8 text-center space-y-3">
          <div className="flex justify-center mb-2">
            <BrandLogo size="lg" showText={false} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase text-white">
            DEVFLOW
          </h1>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
            Engineering Workspace
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-950/90 border border-white/10 rounded-[28px] p-7 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <span className="text-xs font-black uppercase tracking-wider text-white">Sign In</span>
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400">
              Workspace
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-[0.2em] ml-1">
                Email Address
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full h-12 sm:h-13 bg-white/[0.03] border border-white/10 text-white rounded-2xl px-5 text-sm font-medium outline-none focus:border-[#FFC554] focus:bg-white/[0.06] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-[0.2em] ml-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 sm:h-13 bg-white/[0.03] border border-white/10 text-white rounded-2xl px-5 text-sm font-medium outline-none focus:border-[#FFC554] focus:bg-white/[0.06] transition-all"
              />
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full h-12 sm:h-13 bg-[#FFC554] hover:bg-[#ffd166] text-black font-black rounded-2xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg shadow-[#FFC554]/10 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDemoAccess}
                disabled={loading}
                className="w-full h-11 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 text-[#FFC554]" />
                <span>1-Click Explore as Demo User</span>
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-xs text-zinc-500 font-medium">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#FFC554] hover:underline font-bold">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
