'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
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
      await register(email, password, fullName);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded bg-zinc-100 text-zinc-950 font-bold font-mono text-sm mb-3">
            D
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white font-mono">DEVFLOW</h1>
          <p className="text-xs text-zinc-400 mt-1">Lightweight engineering workspace for developers</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-xl">
          <h2 className="text-sm font-semibold text-zinc-100 mb-4">Create your developer account</h2>

          {error && (
            <div className="mb-4 p-2.5 rounded bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                autoFocus
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Developer"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password || !fullName}
              className="w-full mt-2 py-2 px-3 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-zinc-800 text-center text-xs text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="text-zinc-200 hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
