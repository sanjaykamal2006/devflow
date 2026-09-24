'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { BrandLogo } from '@/components/BrandLogo';
import { Loader2 } from 'lucide-react';

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

  const handleGuestAccess = async () => {
    setLoading(true);
    setError(null);
    try {
      await login('sanjaykamal2006@gmail.com', 'password123');
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to sign in as guest.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center p-4">
      <div className="w-full max-w-[360px]">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <BrandLogo size="lg" showText={false} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">Log in to DevFlow</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Enter your details below to access your workspace
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 shadow-sm">
          {error && (
            <div className="mb-4 p-2.5 rounded-md bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-md px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-zinc-300">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-md px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition"
              />
            </div>

            <div className="pt-1.5 space-y-2">
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full h-9 bg-white hover:bg-zinc-200 text-zinc-950 font-medium rounded-md text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Sign In</span>}
              </button>

              <button
                type="button"
                onClick={handleGuestAccess}
                disabled={loading}
                className="w-full h-9 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium rounded-md text-xs transition flex items-center justify-center gap-1.5"
              >
                <span>Continue as Guest</span>
              </button>
            </div>
          </form>

          <div className="mt-5 pt-4 border-t border-zinc-800/80 text-center">
            <p className="text-xs text-zinc-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-zinc-200 hover:text-white font-medium underline underline-offset-4">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
