'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { BrandLogo } from '@/components/BrandLogo';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import {
  ArrowRight,
  Command as CommandIcon,
  Shield,
  Loader2,
  Zap,
  Terminal,
  ChevronRight,
  Users,
  Search,
  Sparkles,
  Bot,
  Activity,
  Copy,
  Check,
  Keyboard,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { generateAiIssueSpec, SpecMode } from '@/lib/ai-issue-doctor';
import { MarkdownContent } from '@/components/MarkdownContent';

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

interface DemoCard {
  id: string;
  key: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: 'TASK' | 'BUG' | 'FEATURE';
  assignee: string;
  tag: string;
}

const INITIAL_DEMO_CARDS: DemoCard[] = [
  {
    id: 'demo-1',
    key: 'ENG-104',
    title: 'Migrate connection pool to HikariCP for sub-millisecond acquisition',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    type: 'FEATURE',
    assignee: 'Sanjay',
    tag: 'Backend',
  },
  {
    id: 'demo-2',
    key: 'ENG-105',
    title: 'Implement pessimistic row-level locking on issue key generator',
    status: 'IN_REVIEW',
    priority: 'CRITICAL',
    type: 'BUG',
    assignee: 'Alex',
    tag: 'Database',
  },
  {
    id: 'demo-3',
    key: 'ENG-106',
    title: 'Add HMAC-SHA256 signature verification for GitHub push webhooks',
    status: 'DONE',
    priority: 'MEDIUM',
    type: 'FEATURE',
    assignee: 'Elena',
    tag: 'Integrations',
  },
  {
    id: 'demo-4',
    key: 'ENG-107',
    title: 'Global command palette keyboard listener with fuzzy match caching',
    status: 'TODO',
    priority: 'LOW',
    type: 'TASK',
    assignee: 'Sanjay',
    tag: 'Frontend',
  },
];

export default function HomePage() {
  const { user, enterDemoSandbox } = useAuth();
  const router = useRouter();
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoCards, setDemoCards] = useState<DemoCard[]>(INITIAL_DEMO_CARDS);
  const [selectedRole, setSelectedRole] = useState<'OWNER' | 'ADMIN' | 'MEMBER'>('OWNER');
  const [paletteQuery, setPaletteQuery] = useState('');
  const [sequenceCount, setSequenceCount] = useState(108);
  const [activeVimKey, setActiveVimKey] = useState<string>('J');
  const [specInput, setSpecInput] = useState('Build automated Discord notifications for critical bugs');
  const [specMode, setSpecMode] = useState<SpecMode>('PRD');
  const [specSynthesizing, setSpecSynthesizing] = useState(false);
  const [specGenerated, setSpecGenerated] = useState(false);
  const [synthesizedMarkdown, setSynthesizedMarkdown] = useState('');
  const [copiedCli, setCopiedCli] = useState(false);

  const handleExploreDemo = async () => {
    setDemoLoading(true);
    try {
      await enterDemoSandbox();
      toast.success('⚡ Sandbox activated! Welcome to DevFlow');
      router.push('/dashboard');
    } catch {
      router.push('/dashboard');
    } finally {
      setDemoLoading(false);
    }
  };

  const cycleCardStatus = (id: string) => {
    setDemoCards((prev) =>
      prev.map((card) => {
        if (card.id !== id) return card;
        const sequence: Array<'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'> = [
          'TODO',
          'IN_PROGRESS',
          'IN_REVIEW',
          'DONE',
        ];
        const currentIndex = sequence.indexOf(card.status);
        const nextStatus = sequence[(currentIndex + 1) % sequence.length];

        if (nextStatus === 'DONE') {
          try {
            confetti({
              particleCount: 40,
              spread: 55,
              origin: { y: 0.65 },
              colors: ['#34d399', '#38bdf8', '#fbbf24', '#f472b6'],
              ticks: 150,
              disableForReducedMotion: true,
            });
          } catch {
            // Non-blocking fallback
          }
          toast.success(`${card.key} moved to Done!`, { duration: 2000 });
        }

        return { ...card, status: nextStatus };
      })
    );
  };

  const generateNextSequenceKey = () => {
    setSequenceCount((c) => c + 1);
    toast.info(`Acquired lock: Generated sequence key ENG-${sequenceCount + 1}`, {
      duration: 1800,
    });
  };

  const handleSynthesizeSpec = async () => {
    if (!specInput.trim()) return;
    setSpecSynthesizing(true);
    try {
      const result = await generateAiIssueSpec({
        title: specInput.trim(),
        description: specInput.trim(),
        mode: specMode,
      });
      setSynthesizedMarkdown(result);
      setSpecGenerated(true);
      toast.success('AI Spec Doctor synthesized structured specification!');
    } catch {
      toast.error('Failed to synthesize specification');
    } finally {
      setSpecSynthesizing(false);
    }
  };

  const handleCopyCli = () => {
    navigator.clipboard.writeText('npx devflow start ENG-104');
    setCopiedCli(true);
    toast.success('CLI command copied to clipboard!');
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const paletteItems = [
    { title: 'Create new issue in Core Engine', shortcut: 'C', icon: '⚡' },
    { title: 'Switch to Frontend Workspace', shortcut: 'G W', icon: '📁' },
    { title: 'Trigger GitHub Webhook manual sync', shortcut: '⌘ S', icon: '🔄' },
    { title: 'Open Sprint Kanban Board', shortcut: 'B', icon: '📊' },
  ].filter((item) => item.title.toLowerCase().includes(paletteQuery.toLowerCase()));

  const vimShortcuts: Record<string, { label: string; desc: string }> = {
    J: { label: 'Navigate Down', desc: 'Moves focus to next issue row in table view' },
    K: { label: 'Navigate Up', desc: 'Moves focus to previous issue row in table view' },
    X: { label: 'Toggle Select', desc: 'Selects or unselects current issue for bulk action bar' },
    C: { label: 'Quick Create', desc: 'Opens instantaneous Create Issue modal from anywhere' },
    Space: { label: 'Quick Status', desc: 'Advances focused issue to next workflow stage' },
    '1-4': { label: 'Assign Priority', desc: 'Sets priority (1=Low, 2=Med, 3=High, 4=Crit)' },
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-zinc-100 flex flex-col selection:bg-sky-500/20 selection:text-sky-200 relative overflow-x-hidden">
      {/* Radiant Lighting Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[520px] bg-hero-glow pointer-events-none -z-10" />
      <div className="absolute top-[320px] left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-radial-subtle pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none -z-10 opacity-60" />

      {/* 1. Floating Island Capsule Dock */}
      <header className="sticky top-3 sm:top-4 z-50 px-3 sm:px-6 w-full max-w-6xl mx-auto">
        <div className="pinterest-dock rounded-full px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 sm:gap-8">
            <Link href="/" className="hover:opacity-90 transition p-1 rounded-full flex items-center">
              <BrandLogo size="md" showText={true} />
            </Link>

            <nav className="hidden sm:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/[0.05]">
              <a href="#demo" className="px-3 py-1 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all">
                Live Demo
              </a>
              <a href="#features" className="px-3 py-1 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all">
                Capabilities
              </a>
              <a href="#spec-doctor" className="px-3 py-1 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all">
                AI Spec
              </a>
              <a href="#architecture" className="px-3 py-1 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all">
                Architecture
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-1.5 bg-white text-zinc-950 font-semibold text-xs rounded-full hover:bg-zinc-200 active:scale-95 transition-all shadow-[0_0_16px_rgba(255,255,255,0.15)]"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/[0.06] transition-all"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  onClick={handleExploreDemo}
                  disabled={demoLoading}
                  className="px-4 py-1.5 bg-gradient-to-r from-amber-400 to-amber-200 text-zinc-950 font-bold text-xs rounded-full hover:brightness-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                  {demoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-zinc-950" />}
                  <span>⚡ Instant Sandbox</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section: High-Velocity Engineering */}
      <section className="pt-16 sm:pt-20 pb-12 px-4 sm:px-6 max-w-5xl mx-auto text-center flex flex-col items-center relative">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-white/[0.1] text-xs font-mono text-zinc-300 mb-6 shadow-inner backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
          <span className="text-zinc-200 font-semibold">DevFlow 2.0</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">Zero-Latency Engineering Workspace</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.08] max-w-4xl">
          Issue tracking engineered for <br />
          <span className="bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            high-velocity software teams.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto mb-9 leading-relaxed font-sans">
          Streamlined Kanban velocity, Vim keyboard navigation, AI PRD synthesis, and bidirectional GitHub webhooks. Built for developers who refuse to wait.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleExploreDemo}
            disabled={demoLoading}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-zinc-950 font-bold text-sm rounded-xl hover:brightness-105 transition-all flex items-center justify-center gap-2 shadow-[0_0_28px_rgba(251,191,36,0.35)] cursor-pointer disabled:opacity-60 ring-1 ring-amber-300/50 active:scale-97"
          >
            {demoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-zinc-950" />}
            <span>⚡ Try Live Demo (Instant Sandbox)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            href="/register"
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] hover:border-white/[0.16] text-zinc-200 text-sm font-medium transition-all flex items-center justify-center active:scale-97"
          >
            Create Free Account
          </Link>

          <a
            href="https://github.com/sanjaykamal2006/devflow"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] hover:border-white/[0.16] text-zinc-300 text-sm font-medium transition-all flex items-center justify-center gap-2 active:scale-97"
          >
            <GitHubIcon className="w-4 h-4 text-zinc-400" />
            <span>Star on GitHub</span>
          </a>
        </div>

        {/* Keyboard Quick Navigation Badge */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-500 font-mono">
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-zinc-900 border border-white/[0.08] rounded text-zinc-300 text-[11px]">⌘K</kbd>
            <span>Command Palette</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-zinc-900 border border-white/[0.08] rounded text-zinc-300 text-[11px]">C</kbd>
            <span>New Issue</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-zinc-900 border border-white/[0.08] rounded text-zinc-300 text-[11px]">J / K</kbd>
            <span>Vim Navigation</span>
          </span>
        </div>
      </section>

      {/* 3. Interactive Hero Widget: Live Kanban Preview in Action */}
      <section id="demo" className="px-4 sm:px-6 max-w-5xl mx-auto w-full pb-16 scroll-mt-14">
        <div className="linear-card rounded-2xl p-4 sm:p-6 shadow-[0_24px_64px_rgba(0,0,0,0.8)] border border-white/[0.1] relative">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-zinc-400 ml-2">devflow-workspace // Core-Engine</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
              <span className="text-[11px] text-zinc-500 hidden sm:inline">Click card status to cycle:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[11px] font-semibold">
                Interactive Board Preview
              </span>
            </div>
          </div>

          {/* Interactive Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {demoCards.map((card) => (
              <div
                key={card.id}
                onClick={() => cycleCardStatus(card.id)}
                className="bg-zinc-950/90 border border-white/[0.08] hover:border-white/[0.22] hover:bg-zinc-900/90 rounded-xl p-3.5 cursor-pointer transition-all duration-150 flex flex-col justify-between group shadow-sm active:scale-98"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-zinc-400 group-hover:text-sky-400 transition-colors">
                      {card.key}
                    </span>
                    <PriorityBadge priority={card.priority} showIcon={false} size="sm" />
                  </div>

                  <p className="text-xs font-medium text-zinc-200 group-hover:text-white line-clamp-2 mb-3 leading-snug">
                    {card.title}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
                  <StatusBadge status={card.status} size="sm" />
                  <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors flex items-center gap-1">
                    <span>Advance</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Bento Grid: High-Craft Capabilities Suite */}
      <section id="features" className="px-4 sm:px-6 max-w-5xl mx-auto w-full py-12 scroll-mt-14">
        <div className="mb-10 text-center sm:text-left">
          <span className="text-xs font-mono text-sky-400 font-semibold tracking-wider uppercase">
            ENGINEERING CAPABILITIES
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Engineered for precision, velocity, and zero lag.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-xl">
            From atomic sequence locks to AI PRD generation, DevFlow eliminates friction in your development loop.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bento 1: Command Palette Simulator */}
          <div className="linear-card rounded-2xl p-5 md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                  <CommandIcon className="w-4 h-4" />
                </div>
                <kbd className="px-2 py-0.5 bg-zinc-900 border border-white/[0.08] rounded text-xs font-mono text-zinc-400">
                  ⌘K
                </kbd>
              </div>

              <h3 className="text-base font-semibold text-white mb-1">
                Global Command Palette (⌘K)
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                Navigate anywhere in sub-50ms. Search issues, switch workspaces, or trigger GitHub sync.
              </p>

              {/* Interactive Palette Search Box */}
              <div className="bg-zinc-950/80 border border-white/[0.08] rounded-xl p-2.5 mb-3">
                <div className="flex items-center gap-2 px-2 pb-2 border-b border-white/[0.06]">
                  <Search className="w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Type to test search (e.g. issue, sync, board)..."
                    value={paletteQuery}
                    onChange={(e) => setPaletteQuery(e.target.value)}
                    className="w-full bg-transparent text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1 mt-2">
                  {paletteItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-zinc-900 text-xs text-zinc-300 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span>{item.title}</span>
                      </span>
                      <kbd className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-white/[0.06]">
                        {item.shortcut}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bento 2: Pessimistic Concurrency Sequence Generator */}
          <div className="linear-card rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400 mb-3">
                <Terminal className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">
                Atomic Issue Keys
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                Pessimistic locking (<code className="text-sky-300 font-mono">SELECT FOR UPDATE</code>) guarantees zero sequence collisions.
              </p>

              {/* Interactive Key Generator */}
              <div className="bg-zinc-950/80 border border-white/[0.08] rounded-xl p-3 text-center mb-2">
                <div className="text-xl font-bold font-mono text-white mb-1">
                  ENG-{sequenceCount}
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">Current Sequence Head</p>
                <button
                  type="button"
                  onClick={generateNextSequenceKey}
                  className="mt-3 w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-xs font-mono font-medium text-sky-400 rounded-lg border border-sky-500/20 transition-colors cursor-pointer"
                >
                  + Generate Next Key
                </button>
              </div>
            </div>
          </div>

          {/* Bento 3: Vim Keyboard Matrix */}
          <div className="linear-card rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-3">
                <Keyboard className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">
                Vim Keyboard Matrix
              </h3>
              <p className="text-xs text-zinc-400 mb-3">
                Never take your hands off the keyboard. Navigate and triage issues at lightspeed.
              </p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {Object.keys(vimShortcuts).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setActiveVimKey(k)}
                    className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all ${
                      activeVimKey === k
                        ? 'bg-emerald-400 text-zinc-950 shadow-sm'
                        : 'bg-zinc-900 border border-white/[0.08] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>

              <div className="bg-zinc-950/80 border border-white/[0.08] rounded-xl p-2.5 font-mono text-xs">
                <div className="text-emerald-300 font-semibold mb-0.5">
                  {vimShortcuts[activeVimKey]?.label}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {vimShortcuts[activeVimKey]?.desc}
                </div>
              </div>
            </div>
          </div>

          {/* Bento 4: 3-Tier Granular RBAC */}
          <div className="linear-card rounded-2xl p-5 md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono text-zinc-500">Spring Security 6</span>
              </div>

              <h3 className="text-base font-semibold text-white mb-1">
                Role-Based Access Control (RBAC)
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                Stateless JWT tokens encode workspace-scoped roles for clean authorization gating.
              </p>

              {/* Interactive Role Switcher */}
              <div className="flex items-center gap-2 mb-3">
                {(['OWNER', 'ADMIN', 'MEMBER'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      selectedRole === role
                        ? 'bg-white text-zinc-950 shadow-sm'
                        : 'bg-zinc-900 border border-white/[0.08] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <div className="bg-zinc-950/80 border border-white/[0.08] rounded-xl p-3 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-zinc-300">Active Permissions:</span>
                </div>
                <span className="text-zinc-400">
                  {selectedRole === 'OWNER' && 'Delete workspace, manage billing, all admin & member actions'}
                  {selectedRole === 'ADMIN' && 'Invite members, manage projects, update repository webhooks'}
                  {selectedRole === 'MEMBER' && 'Create/edit issues, leave comments, view board'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AI Spec Doctor Showcase Section */}
      <section id="spec-doctor" className="px-4 sm:px-6 max-w-5xl mx-auto w-full py-12 scroll-mt-14">
        <div className="linear-card rounded-2xl p-6 sm:p-8 border border-white/[0.1] relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold mb-1">
                <Bot className="w-4 h-4" />
                <span>INTELLIGENT SPEC SYNTHESIS</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                AI Spec Doctor & Markdown Engine
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                Transform brief developer one-liners and bug traces into structured technical specifications, acceptance criteria, and architecture RFCs.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSynthesizeSpec}
              disabled={specSynthesizing || !specInput.trim()}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-200 text-zinc-950 font-bold text-xs rounded-xl hover:brightness-105 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.25)] shrink-0 cursor-pointer disabled:opacity-60"
            >
              {specSynthesizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 fill-zinc-950" />}
              <span>{specSynthesizing ? 'Synthesizing Spec...' : `Synthesize ${specMode}`}</span>
            </button>
          </div>

          {/* Mode Tabs & Sample Chips */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-1.5 p-1 bg-zinc-950/80 border border-white/[0.08] rounded-xl text-xs font-mono">
              {(['PRD', 'BUG_REPORT', 'CHECKLIST', 'ARCHITECTURE', 'SUBTASKS'] as SpecMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSpecMode(m)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    specMode === m
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {m === 'BUG_REPORT' ? 'Bug RCA' : m}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
              <span className="text-zinc-500">Quick test:</span>
              {[
                'Discord Webhook signature check',
                'Fix Safari navbar dropdown overflow',
                'Atomic sequence counter concurrency lock',
                'Migrate Neon PostgreSQL pool to HikariCP',
              ].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setSpecInput(sample);
                    if (sample.includes('Fix')) setSpecMode('BUG_REPORT');
                    else if (sample.includes('Migrate') || sample.includes('lock')) setSpecMode('ARCHITECTURE');
                    else setSpecMode('PRD');
                  }}
                  className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-300 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                >
                  {sample.split(' ')[0]} {sample.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Side */}
            <div className="bg-zinc-950/80 border border-white/[0.08] rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Raw Developer Note</div>
                <textarea
                  value={specInput}
                  onChange={(e) => setSpecInput(e.target.value)}
                  rows={6}
                  className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-lg p-3 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400/40 resize-none transition-colors"
                  placeholder="Enter raw technical requirement or error trace..."
                />
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-2 flex items-center justify-between">
                <span>Edit any text above and click Synthesize</span>
                <span className="text-amber-400/80">Mode: {specMode}</span>
              </div>
            </div>

            {/* Synthesized Output Side */}
            <div className="bg-zinc-950/80 border border-white/[0.08] rounded-xl p-4 font-mono text-xs flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
                  <span className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Structured Spec Output</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">Live Rendered</span>
                </div>

                <div className="max-h-[220px] overflow-y-auto pr-1">
                  {specGenerated && synthesizedMarkdown ? (
                    <div className="animate-in fade-in duration-200">
                      <MarkdownContent content={synthesizedMarkdown} />
                    </div>
                  ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-zinc-500 text-center space-y-2">
                      <Bot className="w-6 h-6 text-zinc-600" />
                      <p className="text-xs text-zinc-400 max-w-xs">
                        Press <span className="text-amber-300 font-semibold">&quot;Synthesize {specMode}&quot;</span> to run the live semantic AI engine on your custom note.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CLI Companion & Sub-Millisecond Architecture */}
      <section id="architecture" className="px-4 sm:px-6 max-w-5xl mx-auto w-full py-12 scroll-mt-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CLI Terminal Showcase */}
          <div className="linear-card rounded-2xl p-6 border border-white/[0.1] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-mono font-semibold text-white">DevFlow CLI Companion</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCli}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-white/[0.08] hover:border-white/[0.16] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy command"
                >
                  {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                Start working on issues straight from your terminal. Automatically creates git branches linked to issue keys.
              </p>
              <div className="bg-zinc-950 rounded-xl p-3 font-mono text-xs text-zinc-300 border border-white/[0.08] space-y-1">
                <div className="text-zinc-500">$ npx devflow start ENG-104</div>
                <div className="text-emerald-400">✔ Fetched issue: Migrate connection pool to HikariCP</div>
                <div className="text-sky-400">✔ Created branch &apos;feature/ENG-104-hikaricp&apos;</div>
                <div className="text-zinc-400">✔ Issue status transitioned to IN_PROGRESS</div>
              </div>
            </div>
          </div>

          {/* Architecture Spec */}
          <div className="linear-card rounded-2xl p-6 border border-white/[0.1] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-semibold text-white">Sub-Millisecond Engine</span>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                Full-stack architecture optimized for instant SWR navigation and high-concurrency throughput.
              </p>
              <div className="space-y-2 text-xs font-mono text-zinc-300">
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/80 border border-white/[0.06]">
                  <span className="text-zinc-400">Frontend Stack</span>
                  <span className="text-emerald-300 font-semibold">Next.js 15 + React 19</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/80 border border-white/[0.06]">
                  <span className="text-zinc-400">Backend Engine</span>
                  <span className="text-sky-300 font-semibold">Spring Boot 3.3 / Java 21</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/80 border border-white/[0.06]">
                  <span className="text-zinc-400">Database Layer</span>
                  <span className="text-purple-300 font-semibold">Neon Serverless PostgreSQL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Minimalist High-Craft Footer */}
      <footer className="border-t border-white/[0.06] bg-[#08090a] py-8 px-4 sm:px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" showText={true} />
            <span className="text-zinc-700">|</span>
            <span className="text-xs text-zinc-500 font-sans">
              Crafted by <span className="text-zinc-300 font-medium">Sanjay Kamal</span>
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs text-zinc-400">
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
              className="hover:text-zinc-200 transition-colors flex items-center gap-1"
            >
              <GitHubIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span>GitHub Repo</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
