'use client';

import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Keyboard,
  Terminal,
  Cpu,
  Webhook,
  Layers,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchDemo?: () => void;
}

type TabType = 'quickstart' | 'vim' | 'cli' | 'architecture' | 'webhooks' | 'api';

export function DocsModal({ isOpen, onClose, onLaunchDemo }: DocsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('quickstart');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[88vh] rounded-2xl bg-[#09090c] border border-white/[0.12] shadow-[0_24px_80px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.1)] flex flex-col overflow-hidden text-zinc-100 select-text font-sans">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-white">DevFlow Documentation & Guide</h2>
              <p className="text-xs text-zinc-400">Engineering guide, Vim shortcuts, CLI, and REST API</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area: Sidebar + Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Navigation Sidebar */}
          <div className="w-full md:w-56 p-3 border-b md:border-b-0 md:border-r border-white/[0.08] bg-black/30 flex md:flex-col gap-1 overflow-x-auto shrink-0">
            <button
              onClick={() => setActiveTab('quickstart')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left whitespace-nowrap ${
                activeTab === 'quickstart'
                  ? 'bg-white/10 text-white font-semibold border border-white/10'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Quickstart</span>
            </button>
            <button
              onClick={() => setActiveTab('vim')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left whitespace-nowrap ${
                activeTab === 'vim'
                  ? 'bg-white/10 text-white font-semibold border border-white/10'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5 text-purple-400" />
              <span>Vim Shortcuts</span>
            </button>
            <button
              onClick={() => setActiveTab('cli')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left whitespace-nowrap ${
                activeTab === 'cli'
                  ? 'bg-white/10 text-white font-semibold border border-white/10'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>CLI Companion</span>
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left whitespace-nowrap ${
                activeTab === 'architecture'
                  ? 'bg-white/10 text-white font-semibold border border-white/10'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Architecture & Perf</span>
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left whitespace-nowrap ${
                activeTab === 'webhooks'
                  ? 'bg-white/10 text-white font-semibold border border-white/10'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Webhook className="w-3.5 h-3.5 text-rose-400" />
              <span>Webhooks & Sync</span>
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left whitespace-nowrap ${
                activeTab === 'api'
                  ? 'bg-white/10 text-white font-semibold border border-white/10'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>REST API Reference</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {activeTab === 'quickstart' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">Getting Started with DevFlow</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    DevFlow is a Linear-inspired developer workspace engineered for high-cadence software teams.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">1. Instant Sandbox</span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Zero login required. Explore projects, cycle Kanban columns, and test shortcuts in local browser memory.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">2. Cloud Workspaces</span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Sign in with your team for multi-tenant UUID isolation, Neon Postgres compute, and real-time live sync.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-white/[0.08] space-y-2">
                  <span className="text-xs font-mono font-semibold text-zinc-300">Production Architecture & Zero-Cost Topology:</span>
                  <ul className="text-xs text-zinc-400 space-y-1.5 list-disc list-inside">
                    <li><strong className="text-white">Frontend:</strong> Next.js 15 App Router on Vercel Edge with SWR memory caching</li>
                    <li><strong className="text-white">Backend API:</strong> Spring Boot 3.3.4 (Java 21 LTS) on Render Web Service</li>
                    <li><strong className="text-white">Database:</strong> Neon Serverless PostgreSQL with auto-scale to zero</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'vim' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">Vim & Global Keybindings</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Navigate and manipulate issues at hardware speed without touching your mouse.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
                    <div>
                      <span className="text-zinc-200 block font-sans font-semibold">Row Selection Down / Up</span>
                      <span className="text-[11px] text-zinc-500">Cycle through issue list rows</span>
                    </div>
                    <kbd className="px-2 py-1 rounded bg-white/10 text-sky-400 font-bold text-xs">J / K</kbd>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
                    <div>
                      <span className="text-zinc-200 block font-sans font-semibold">Create New Issue</span>
                      <span className="text-[11px] text-zinc-500">Opens quick issue creation modal</span>
                    </div>
                    <kbd className="px-2 py-1 rounded bg-white/10 text-emerald-400 font-bold text-xs">C</kbd>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
                    <div>
                      <span className="text-zinc-200 block font-sans font-semibold">Universal Command Palette</span>
                      <span className="text-[11px] text-zinc-500">Fuzzy search all projects & issues</span>
                    </div>
                    <kbd className="px-2 py-1 rounded bg-white/10 text-purple-400 font-bold text-xs">⌘K</kbd>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
                    <div>
                      <span className="text-zinc-200 block font-sans font-semibold">Mark Completed / Archive</span>
                      <span className="text-[11px] text-zinc-500">Transition status to Done</span>
                    </div>
                    <kbd className="px-2 py-1 rounded bg-white/10 text-amber-400 font-bold text-xs">X</kbd>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cli' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">DevFlow CLI Companion</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Control issues, transition statuses, and automate git branches directly from your terminal.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-white/[0.08] space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                    <span className="text-zinc-400 font-sans font-semibold">CLI Commands</span>
                    <button
                      onClick={() => handleCopy('npx devflow start QE-1', 'cli-all')}
                      className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
                    >
                      {copiedCode === 'cli-all' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="space-y-2 text-zinc-300">
                    <div><span className="text-emerald-400"># Start task & auto-checkout git branch</span></div>
                    <div>$ npx devflow start QE-101</div>
                    <div className="pt-2"><span className="text-emerald-400"># Dense tabular ASCII summary</span></div>
                    <div>$ npx devflow list QE</div>
                    <div className="pt-2"><span className="text-emerald-400"># Mark DONE & stage Linear commit</span></div>
                    <div>$ npx devflow done QE-101</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'architecture' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">High-Velocity Architecture &amp; Caching</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Multi-tier performance stack engineered for sub-millisecond response and zero-cost cloud topology.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                    <span className="font-bold text-amber-400 font-mono">1. SWR In-Memory Cache</span>
                    <p className="text-zinc-400">Sub-millisecond GET caching with 60s TTL and atomic prefix invalidation on mutations.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                    <span className="font-bold text-emerald-400 font-mono">2. Cold-Start Failover</span>
                    <p className="text-zinc-400">4.5s fast-failover timeout with automatic mock-store fallback to eliminate UI freezes.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                    <span className="font-bold text-sky-400 font-mono">3. Stateless RBAC Security</span>
                    <p className="text-zinc-400">Spring Security 6 filter chain with 256-bit HMAC secret tokens and multi-tenant isolation.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                    <span className="font-bold text-indigo-400 font-mono">4. Neon Serverless Postgres</span>
                    <p className="text-zinc-400">Auto-scale to zero compute with HikariCP connection pool and 11 normalized relational tables.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'webhooks' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">Discord & Slack Webhooks Hub</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Real-time outgoing webhooks signed with HMAC-SHA256 tokens and exponential backoff retry.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-black/60 border border-white/[0.08] font-mono text-xs space-y-2">
                  <div className="text-purple-400">POST https://discord.com/api/webhooks/...</div>
                  <div className="text-zinc-400">X-DevFlow-Signature: sha256=404E6352...</div>
                  <pre className="text-zinc-300 text-[11px] pt-2">
{`{
  "event": "issue.created",
  "key": "QE-104",
  "title": "Migrate connection pool to HikariCP",
  "priority": "HIGH",
  "status": "TODO"
}`}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">Stateless REST API Reference</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Spring Boot 3.3 stateless JWT endpoints available on production cloud backend.
                  </p>
                </div>
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.08] flex items-center justify-between">
                    <span className="text-emerald-400 font-bold">GET</span>
                    <span className="text-zinc-300">/api/workspaces</span>
                    <span className="text-zinc-500 font-sans text-[11px]">List all workspaces</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.08] flex items-center justify-between">
                    <span className="text-sky-400 font-bold">POST</span>
                    <span className="text-zinc-300">/api/issues</span>
                    <span className="text-zinc-500 font-sans text-[11px]">Atomic key creation</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.08] flex items-center justify-between">
                    <span className="text-amber-400 font-bold">PATCH</span>
                    <span className="text-zinc-300">/api/issues/{'{id}'}</span>
                    <span className="text-zinc-500 font-sans text-[11px]">Update status/prio</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] bg-black/40 flex items-center justify-between text-xs text-zinc-400">
          <span>DevFlow Engineering Suite &middot; v1.0.0</span>
          {onLaunchDemo && (
            <button
              onClick={() => {
                onClose();
                onLaunchDemo();
              }}
              className="btn-orb sm solid flex items-center gap-1.5 font-semibold cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
              <span>Launch Sandbox</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
