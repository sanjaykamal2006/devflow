'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { BrandLogo } from '@/components/BrandLogo';
import { Loader2 } from 'lucide-react';

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

  const handleGuestAccess = async () => {
    setLoading(true);
    setError(null);
    try {
      await register('sanjaykamal2006@gmail.com', 'password123', 'Sanjay Kamal');
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
          <h1 className="text-xl font-semibold tracking-tight text-white">Create your account</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Get started with DevFlow for your team
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
                Full Name
              </label>
              <input
                type="text"
                required
                autoFocus
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-md px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-md px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-md px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition"
              />
            </div>

            <div className="pt-1.5 space-y-2">
              <button
                type="submit"
                disabled={loading || !fullName || !email || !password}
                className="w-full h-9 bg-white hover:bg-zinc-200 text-zinc-950 font-medium rounded-md text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Create Account</span>}
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
              Already have an account?{' '}
              <Link href="/login" className="text-zinc-200 hover:text-white font-medium underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
