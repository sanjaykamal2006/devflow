'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { BrandLogo } from '@/components/BrandLogo';
import {
  ArrowRight,
  Kanban,
  Command as CommandIcon,
  Layers,
  MessageSquare,
  Shield,
  GitBranch,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export default function HomePage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleExploreDemo = async () => {
    setDemoLoading(true);
    try {
      if (user) {
        router.push('/dashboard');
        return;
      }
      try {
        await login('demo@devflow.io', 'demo123');
      } catch {
        await login('sanjaykamal2006@gmail.com', 'password123');
      }
      toast.success('Signed in to DevFlow workspace');
      router.push('/dashboard');
    } catch {
      router.push('/dashboard');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col selection:bg-zinc-800 selection:text-white">
      {/* 1. Header Navigation */}
      <header className="border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:opacity-90 transition">
              <BrandLogo size="md" showText={true} />
            </Link>

            <nav className="hidden sm:flex items-center gap-5 text-xs font-medium text-zinc-400">
              <a href="#features" className="hover:text-zinc-200 transition-colors">
                Features
              </a>
              <a href="#architecture" className="hover:text-zinc-200 transition-colors">
                Architecture
              </a>
              <a
                href="https://github.com/sanjaykamal2006/devflow"
                target="_blank"
                rel="noreferrer"
                className="hover:text-zinc-200 transition-colors flex items-center gap-1"
              >
                GitHub
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="px-3 py-1.5 bg-zinc-100 text-zinc-950 font-medium text-xs rounded-lg hover:bg-white transition-all shadow-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs text-zinc-400 hover:text-white px-2 py-1 transition-colors"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  onClick={handleExploreDemo}
                  disabled={demoLoading}
                  className="px-3 py-1.5 bg-zinc-100 text-zinc-950 font-medium text-xs rounded-lg hover:bg-white transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-60"
                >
                  {demoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Open Demo</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-16 pb-14 px-4 sm:px-6 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Simple badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 mb-6">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          <span>DevFlow • Developer Issue Tracking & Workspace</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-5 leading-tight">
          Issue tracking built for <br />
          fast engineering teams.
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto mb-8 leading-relaxed">
          Manage projects, track tasks on a responsive Kanban board, navigate instantly with keyboard shortcuts, and keep your engineering workflow organized.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleExploreDemo}
            disabled={demoLoading}
            className="w-full sm:w-auto px-5 py-2.5 bg-zinc-100 text-zinc-950 font-semibold text-xs sm:text-sm rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {demoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Launch Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            href="/register"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 text-zinc-200 text-xs sm:text-sm font-medium transition-all flex items-center justify-center"
          >
            Create Account
          </Link>

          <a
            href="https://github.com/sanjaykamal2006/devflow"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 text-zinc-300 text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <GitHubIcon className="w-4 h-4 text-zinc-400" />
            <span>Source Code</span>
          </a>
        </div>

        {/* Keyboard hint */}
        <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500 font-mono">
          <span>Command palette:</span>
          <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 text-[11px]">⌘K</kbd>
          <span>• Quick create issue:</span>
          <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 text-[11px]">C</kbd>
        </div>
      </section>

      {/* 3. Core Features Grid */}
      <section id="features" className="px-4 sm:px-6 max-w-5xl mx-auto w-full py-12 scroll-mt-14">
        <div className="border-t border-zinc-800/80 pt-10">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
            Core Features
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mb-8">
            Everything you need to organize tasks and ship features on schedule.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400 mb-3.5">
                  <Kanban className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">
                  Responsive Kanban Board
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Drag and drop cards across To Do, In Progress, In Review, and Done. Mobile-optimized with smooth horizontal snap-scrolling.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400 mb-3.5">
                  <CommandIcon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">
                  Command Palette (⌘K)
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Jump to any workspace, project, or issue in seconds without reaching for the mouse. Press C anywhere to create a new ticket.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-3.5">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">
                  Workspaces & Projects
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Group your repositories into focused workspaces with project keys (<code className="font-mono text-zinc-300">API-1</code>, <code className="font-mono text-zinc-300">WEB-2</code>).
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400 mb-3.5">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">
                  Inline Editing & Comments
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Update issue titles, descriptions, priorities, assignees, and labels in place. Leave threaded notes on any task.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400 mb-3.5">
                  <GitBranch className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">
                  GitHub Integration
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Connect repositories to link commits and pull requests directly to project issue keys.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 mb-3.5">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">
                  Role-Based Access
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Manage workspace collaborators with Owner, Admin, and Member permissions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Architecture / Dual Mode Info */}
      <section id="architecture" className="px-4 sm:px-6 max-w-5xl mx-auto w-full py-10 scroll-mt-14">
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-mono text-sky-400 uppercase tracking-wider font-semibold">
                Architecture
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                Next.js 15 Client & Spring Boot REST API
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl leading-relaxed">
                Connects to a Spring Boot backend with PostgreSQL and Redis when running locally, or operates fully client-side with persistent storage for zero-cost demo hosting.
              </p>
            </div>

            <div className="flex flex-col gap-2 shrink-0 text-xs font-mono text-zinc-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Next.js 15 App Router</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Spring Boot 3.3 / Java 21</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>PostgreSQL & Redis Caching</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Minimal Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#09090b] py-8 px-4 sm:px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" showText={true} />
            <span className="text-zinc-700">|</span>
            <span className="text-xs text-zinc-500">
              Created by <span className="text-zinc-300">Sanjay Kamal</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <Link href="/login" className="hover:text-zinc-200 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-zinc-200 transition-colors">
              Register
            </Link>
            <a
              href="https://github.com/sanjaykamal2006/devflow"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-200 transition-colors"
            >
              GitHub Repo
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
