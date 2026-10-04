'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { BrandLogo } from '@/components/BrandLogo';
import { OrbGallery } from '@/components/OrbGallery';
import { PredictiveArcBackground } from '@/components/PredictiveArcBackground';
import {
  Zap,
  Terminal,
  Keyboard,
  Shield,
  Layers,
  Sparkles,
  X,
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

export default function LandingPage() {
  const router = useRouter();
  const { enterDemoSandbox } = useAuth();
  const [activeModal, setActiveModal] = useState<'shortcuts' | 'architecture' | 'cli' | null>(null);

  const handleLaunchSandbox = () => {
    toast.success('⚡ Launching instant sandbox session...', {
      description: 'Zero-login sandbox activated with HyperScale Core.',
    });
    enterDemoSandbox();
    router.push('/dashboard');
  };

  return (
    <main className="fixed inset-0 w-screen h-[100dvh] bg-[#1f1f21] text-[#f4f3f0] selection:bg-white/20 selection:text-white overflow-hidden flex flex-col justify-between select-none">
      {/* ThreeUI Signal Particles Ambient Background (Layer 0 - Ambient Canvas) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <PredictiveArcBackground opacity={0.65} />
      </div>

      {/* Floating Top Navigation (Layer 4 - Fixed / Top Nav) */}
      <header className="orb-nav relative z-30">
        <Link href="/" className="orb-logo">
          <BrandLogo size="sm" showText={false} />
          <span className="font-semibold tracking-tight text-lg text-[#f4f3f0]">DevFlow</span>
        </Link>

        <nav className="orb-links">
          <button
            onClick={() => setActiveModal('shortcuts')}
            className="flex items-center gap-1.5 text-[14.5px] text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <Keyboard className="w-3.5 h-3.5 text-zinc-500" />
            <span>Vim Shortcuts</span>
          </button>
          <button
            onClick={() => setActiveModal('cli')}
            className="flex items-center gap-1.5 text-[14.5px] text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-zinc-500" />
            <span>CLI Terminal</span>
          </button>
          <button
            onClick={() => setActiveModal('architecture')}
            className="flex items-center gap-1.5 text-[14.5px] text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-zinc-500" />
            <span>Architecture</span>
          </button>
          <a
            href="https://github.com/sanjaykamal2006/devflow"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[14.5px] text-zinc-400 hover:text-white transition"
          >
            <GitHubIcon className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </nav>

        <div className="orb-navend">
          <Link href="/login" className="sign">
            Sign in
          </Link>
          <button onClick={handleLaunchSandbox} className="btn-orb sm solid flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
            <span>Try Live Sandbox</span>
          </button>
        </div>
      </header>

      {/* Drag / Hover Affordance Hint Pill */}
      <div className="relative z-30 pointer-events-none">
        <div className="hint" id="hint" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
          >
            <path d="M7.2 2.9 L16.4 10.6 L11.6 11.2 L13.9 15.5 L11.6 16.7 L9.3 12.4 L6.6 15.3 Z" />
            <path d="M12 17.3 v2.2" />
            <ellipse cx="12" cy="20.5" rx="5.4" ry="1.7" />
          </svg>
          <span>Drag to spin 3D globe &middot; hover any task</span>
        </div>
      </div>

      {/* Interactive 3D Sphere WebGL Canvas (Layer 1) */}
      <div className="absolute inset-0 pointer-events-auto z-10">
        <OrbGallery />
      </div>

      {/* Bottom Hero Action Bar (Layer 3) */}
      <div className="relative z-20 mt-auto">
        <div className="orb-band">
          <h1 className="orb-lead">
            Every issue<br />
            worth <em>solving</em>.
          </h1>

          <div className="orb-side">
            <span className="orb-badge">
              <i />
              Open Source &middot; Linear-grade developer workspace
            </span>

            <p className="orb-lede">
              High-velocity issue tracking and project management for engineering teams. Sub-millisecond navigation, Vim keybindings, and real-time Kanban boards.
            </p>

            <div className="orb-cta">
              <button onClick={handleLaunchSandbox} className="btn-orb lg solid flex items-center gap-2">
                <Zap className="w-4 h-4 fill-current text-amber-400" />
                <span>⚡ Launch Instant Sandbox</span>
              </button>
              <Link href="/login" className="btn-orb lg ghost flex items-center gap-2">
                <span>Sign in to Workspace</span>
              </Link>
            </div>

            <div className="orb-proof">
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Next.js 15 App Router &middot; Spring Boot 3.3 &middot; Neon Postgres</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ambient bottom transition mask */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#17171a] via-[#17171a]/50 to-transparent pointer-events-none z-15" />

      {/* ============================================================
          QUICK INFO MODALS (Vim Shortcuts, Architecture, CLI)
          ============================================================ */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-6 rounded-2xl bg-[#18191c] border border-white/10 shadow-2xl text-left select-text">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                {activeModal === 'shortcuts' && <Keyboard className="w-5 h-5 text-sky-400" />}
                {activeModal === 'cli' && <Terminal className="w-5 h-5 text-emerald-400" />}
                {activeModal === 'architecture' && <Shield className="w-5 h-5 text-amber-400" />}
                <h3 className="text-lg font-semibold text-white">
                  {activeModal === 'shortcuts' && 'Vim & Global Shortcuts'}
                  {activeModal === 'cli' && 'DevFlow CLI Companion'}
                  {activeModal === 'architecture' && 'Full-Stack Architecture'}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 text-sm text-zinc-300 space-y-3 font-sans">
              {activeModal === 'shortcuts' && (
                <div className="space-y-2.5">
                  <p className="text-xs text-zinc-400">
                    Engineered for high-cadence keyboard-first navigation with zero mouse latency:
                  </p>
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                      <span className="text-zinc-400">Next / Prev issue</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-sky-400 font-bold">J / K</kbd>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                      <span className="text-zinc-400">Create new issue</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-emerald-400 font-bold">C</kbd>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                      <span className="text-zinc-400">Command palette</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-purple-400 font-bold">⌘K</kbd>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                      <span className="text-zinc-400">Mark complete</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-amber-400 font-bold">X</kbd>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'cli' && (
                <div className="space-y-3 font-mono text-xs">
                  <p className="text-zinc-400 font-sans">
                    Zero-dependency terminal companion script for lightning git and issue workflows:
                  </p>
                  <div className="p-3 rounded-lg bg-black/60 border border-white/10 space-y-1 text-zinc-300 select-all">
                    <div className="text-emerald-400"># Start work & auto-create git branch</div>
                    <div>$ npx devflow start QE-101</div>
                    <div className="text-zinc-500">✔ Switched to branch &quot;feature/qe-101&quot;</div>
                    <div className="text-emerald-400 pt-2"># Finish & auto-stage commit</div>
                    <div>$ npx devflow done QE-101</div>
                    <div className="text-zinc-500">✔ Generated commit: &quot;fix(qe-101): complete task&quot;</div>
                  </div>
                </div>
              )}

              {activeModal === 'architecture' && (
                <div className="space-y-3 text-xs">
                  <p className="text-zinc-400">
                    Production topology running under strict $0 zero-cost constraints:
                  </p>
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-zinc-500 block text-[10px] uppercase">Frontend</span>
                      <span className="text-white font-semibold">Next.js 15 App Router</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-zinc-500 block text-[10px] uppercase">Backend</span>
                      <span className="text-white font-semibold">Spring Boot 3.3.4 (Java 21)</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-zinc-500 block text-[10px] uppercase">Database</span>
                      <span className="text-white font-semibold">Neon Serverless Postgres</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-zinc-500 block text-[10px] uppercase">Security</span>
                      <span className="text-white font-semibold">Stateless JWT + RBAC</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-zinc-500">DevFlow HyperScale Suite</span>
              <button
                onClick={handleLaunchSandbox}
                className="btn-orb sm solid flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Try Live Sandbox</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
