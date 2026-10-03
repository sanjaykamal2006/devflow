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
  CheckCircle2,
  ChevronDown,
  Star,
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
    key: 'QE-104',
    title: 'Migrate connection pool to HikariCP for sub-millisecond acquisition',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    type: 'FEATURE',
    assignee: 'Sanjay',
    tag: 'Backend',
  },
  {
    id: 'demo-2',
    key: 'QE-105',
    title: 'Pessimistic row-level locking on issue key sequence generator',
    status: 'IN_REVIEW',
    priority: 'CRITICAL',
    type: 'BUG',
    assignee: 'Alex',
    tag: 'Database',
  },
  {
    id: 'demo-3',
    key: 'DS-42',
    title: 'Vim navigation engine with tactile J/K keyboard listener',
    status: 'DONE',
    priority: 'MEDIUM',
    type: 'FEATURE',
    assignee: 'Elena',
    tag: 'Frontend',
  },
  {
    id: 'demo-4',
    key: 'MOB-8',
    title: 'HMAC-SHA256 signature verification for outgoing webhooks',
    status: 'TODO',
    priority: 'LOW',
    type: 'TASK',
    assignee: 'Sanjay',
    tag: 'Integrations',
  },
];

const TICKER_ITEMS = [
  { key: 'QE-104', label: 'HikariCP Pool', metric: '0.4ms acquisition', gain: '+94% speed', isUp: true },
  { key: 'HSC-42', label: 'Pessimistic Lock', metric: '0 key collisions', gain: '100% atomic', isUp: true },
  { key: 'NEON-DB', label: 'PostgreSQL Cloud', metric: 'AWS us-east-2', gain: '99.99% SLA', isUp: true },
  { key: 'SPRING-3', label: 'Stateless JWT Auth', metric: 'Spring Security 6', gain: '<2ms verify', isUp: true },
  { key: 'VIM-NAV', label: 'Keyboard Engine', metric: 'J/K Table Focus', gain: '60 FPS tactile', isUp: true },
  { key: 'WEBHOOK', label: 'Discord & Slack', metric: 'Real-time alert dispatch', gain: 'Zero server cost', isUp: true },
  { key: 'AI-SPEC', label: 'Issue Doctor', metric: 'Structured PRD synthesis', gain: '1-click spec', isUp: true },
  { key: 'CLI-TOOL', label: 'DevFlow CLI', metric: 'devflow start <KEY>', gain: 'Automated git branch', isUp: true },
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
  const [annualBilling, setAnnualBilling] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
              particleCount: 45,
              spread: 60,
              origin: { y: 0.65 },
              colors: ['#00ffb2', '#38bdf8', '#fbbf24', '#f43f5e'],
              ticks: 160,
              disableForReducedMotion: true,
            });
          } catch {
            // Non-blocking fallback
          }
          toast.success(`${card.key} completed & verified!`, { duration: 2000 });
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
    navigator.clipboard.writeText('npx devflow start QE-104');
    setCopiedCli(true);
    toast.success('CLI command copied to clipboard!');
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const paletteItems = [
    { title: 'Create new issue in Quantum Engine', shortcut: 'C', icon: '⚡' },
    { title: 'Switch to Design System Workspace', shortcut: 'G W', icon: '📁' },
    { title: 'Trigger GitHub Webhook manual sync', shortcut: '⌘ S', icon: '🔄' },
    { title: 'Open Sprint Kanban Board', shortcut: 'B', icon: '📊' },
  ].filter((item) => item.title.toLowerCase().includes(paletteQuery.toLowerCase()));

  const vimShortcuts: Record<string, { label: string; desc: string }> = {
    J: { label: 'Navigate Down', desc: 'Moves active selection to next issue row in table view' },
    K: { label: 'Navigate Up', desc: 'Moves active selection to previous issue row in table view' },
    X: { label: 'Toggle Select', desc: 'Selects or unselects current issue for bulk actions' },
    C: { label: 'Quick Create', desc: 'Opens instantaneous Create Issue modal from anywhere' },
    Space: { label: 'Assign To Me', desc: 'Instantly claims focused issue to logged-in developer' },
    '1-4': { label: 'Set Priority', desc: 'Sets priority level (1=Crit, 2=High, 3=Med, 4=Low)' },
  };

  const faqs = [
    {
      q: 'What is DevFlow and how does it compare to Jira or Linear?',
      a: 'DevFlow is an engineering-first issue tracker and sprint orchestrator. Unlike legacy enterprise issue trackers with heavy load times, DevFlow loads sub-50ms, features Linear-grade Vim keyboard navigation, client-side guest sandboxes, AI spec generation, and bidirectional GitHub webhooks.',
    },
    {
      q: 'Can I test DevFlow without creating an account or providing a credit card?',
      a: 'Yes! Click "⚡ Try Live Demo (Instant Sandbox)" anywhere on this page to launch a fully hydrated engineering workspace (HyperScale Core) with 3 projects, 15 pre-loaded issues, Markdown reproduction steps, and mock comments.',
    },
    {
      q: 'How does the DevFlow CLI companion work?',
      a: 'The DevFlow CLI (npx devflow) is a zero-dependency Node.js tool that lets you login, list assigned issues, transition tasks to IN_PROGRESS, and automatically create and switch to clean git branches like feature/qe-104-hikaricp directly from your terminal.',
    },
    {
      q: 'How does the zero-cost Discord & Slack webhook engine work?',
      a: 'Every project includes a Webhook Alert card. Simply paste your Discord or Slack webhook URL, select your trigger events (urgent bugs, completed tasks, comments), and DevFlow automatically synthesizes rich embeds and Block Kit alerts with zero external server costs.',
    },
    {
      q: 'What is the underlying technology stack?',
      a: 'DevFlow is engineered on Next.js 15 App Router, React 19, TypeScript, and Tailwind CSS on the frontend. The backend runs Java 21 and Spring Boot 3.3.4 with stateless JWT tokens and Neon Serverless PostgreSQL with pessimistic concurrency locking.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#08070e] text-zinc-100 flex flex-col selection:bg-[#00ffb2]/20 selection:text-[#00ffb2] relative overflow-x-hidden font-sans">
      {/* 1. CryptiX Deep Neon Aurora & Chromatic Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[640px] bg-cryptix-glow pointer-events-none -z-10" />
      <div className="absolute top-[480px] left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-radial-subtle pointer-events-none -z-10 opacity-70" />
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none -z-10 opacity-40" />

      {/* 2. Floating Island Capsule Dock */}
      <header className="sticky top-3 sm:top-4 z-50 px-3 sm:px-6 w-full max-w-6xl mx-auto">
        <div className="pinterest-dock rounded-full px-4 sm:px-6 h-14 flex items-center justify-between gap-4 border border-white/[0.1] bg-[#0c0c12]/85 backdrop-blur-2xl shadow-[0_16px_40px_-6px_rgba(0,0,0,0.85)]">
          <div className="flex items-center gap-6 sm:gap-8">
            <Link href="/" className="hover:opacity-90 transition p-1 rounded-full flex items-center">
              <BrandLogo size="md" showText={true} />
            </Link>

            <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/[0.05]">
              <a href="#demo" className="px-3.5 py-1 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all">
                Live Demo
              </a>
              <a href="#ticker" className="px-3.5 py-1 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all">
                Velocity Ticker
              </a>
              <a href="#capabilities" className="px-3.5 py-1 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all">
                Capabilities
              </a>
              <a href="#how-it-works" className="px-3.5 py-1 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all">
                How It Works
              </a>
              <a href="#pricing" className="px-3.5 py-1 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all">
                Pricing
              </a>
              <a href="#faq" className="px-3.5 py-1 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all">
                FAQ
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
                  className="text-xs font-medium text-zinc-400 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/[0.06] transition-all"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  onClick={handleExploreDemo}
                  disabled={demoLoading}
                  className="px-4 py-1.5 cryptix-btn-mint text-xs rounded-full flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {demoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-zinc-950" />}
                  <span>⚡ Instant Sandbox</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 3. Hero Section: Monumental CryptiX Headline & Kinetic Glow */}
      <section className="pt-16 sm:pt-24 pb-14 px-4 sm:px-6 max-w-5xl mx-auto text-center flex flex-col items-center relative">
        {/* Pulsing Neon Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121118]/90 border border-[#00ffb2]/30 text-xs font-mono text-zinc-200 mb-6 shadow-[0_0_20px_rgba(0,255,178,0.12)] backdrop-blur-xl animate-in fade-in slide-in-from-top-3 duration-300">
          <span className="w-2 h-2 rounded-full bg-[#00ffb2] shadow-[0_0_10px_#00ffb2] animate-pulse" />
          <span className="text-[#00ffb2] font-bold tracking-wider">DEVFLOW 2.0</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-300">TAKE CONTROL OF YOUR SOFTWARE VELOCITY</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.08] max-w-4xl">
          Take control of your <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-white via-zinc-100 to-[#00ffb2] bg-clip-text text-transparent">
            software velocity.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto mb-9 leading-relaxed font-sans">
          Seamless Kanban velocity, Vim power-user navigation, 1-click AI PRD synthesis, and real-time webhook automation. Built for developers who refuse to wait.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleExploreDemo}
            disabled={demoLoading}
            className="w-full sm:w-auto px-7 py-3.5 cryptix-btn-mint text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-97"
          >
            {demoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-zinc-950" />}
            <span>⚡ Try Live Demo (Instant Sandbox)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            href="/register"
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-[#121118]/80 hover:bg-[#1a1924] border border-white/[0.1] hover:border-[#00ffb2]/40 text-zinc-200 text-sm font-medium transition-all flex items-center justify-center active:scale-97"
          >
            Create Free Account
          </Link>

          <a
            href="https://github.com/sanjaykamal2006/devflow"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-[#121118]/80 hover:bg-[#1a1924] border border-white/[0.1] hover:border-white/[0.2] text-zinc-300 text-sm font-medium transition-all flex items-center justify-center gap-2 active:scale-97"
          >
            <GitHubIcon className="w-4 h-4 text-zinc-400" />
            <span>Star on GitHub</span>
          </a>
        </div>

        {/* Social Proof Stack (CryptiX Signature Pill) */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-400 font-mono">
          <div className="flex -space-x-2 overflow-hidden items-center mr-1">
            <span className="inline-block h-6 w-6 rounded-full ring-2 ring-[#08070e] bg-gradient-to-tr from-sky-500 to-indigo-600 text-[10px] font-bold text-white flex items-center justify-center">SK</span>
            <span className="inline-block h-6 w-6 rounded-full ring-2 ring-[#08070e] bg-gradient-to-tr from-emerald-500 to-teal-600 text-[10px] font-bold text-white flex items-center justify-center">AL</span>
            <span className="inline-block h-6 w-6 rounded-full ring-2 ring-[#08070e] bg-gradient-to-tr from-purple-500 to-pink-600 text-[10px] font-bold text-white flex items-center justify-center">EL</span>
            <span className="inline-block h-6 w-6 rounded-full ring-2 ring-[#08070e] bg-gradient-to-tr from-amber-500 to-orange-600 text-[10px] font-bold text-white flex items-center justify-center">TC</span>
          </div>
          <span className="flex items-center gap-1 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="text-zinc-200 font-bold">4.9 / 5.0</span>
          </span>
          <span>•</span>
          <span className="text-zinc-400">Trusted by 10,000+ engineers worldwide</span>
        </div>
      </section>

      {/* 4. Interactive Hero Widget: Liquid Glass Board Preview */}
      <section id="demo" className="px-4 sm:px-6 max-w-5xl mx-auto w-full pb-14 scroll-mt-16">
        <div className="cryptix-card rounded-2xl p-4 sm:p-6 relative overflow-hidden group">
          {/* Subtle Corner Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ffb2]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top Window Bar */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-zinc-400 ml-2">devflow-workspace // HyperScale Core</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
              <span className="text-[11px] text-zinc-500 hidden sm:inline">Click card status to cycle:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#00ffb2]/10 border border-[#00ffb2]/30 text-[#00ffb2] text-[11px] font-semibold">
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
                className="bg-[#0f0e15]/90 border border-white/[0.08] hover:border-[#00ffb2]/40 hover:bg-[#14131d] rounded-xl p-3.5 cursor-pointer transition-all duration-200 flex flex-col justify-between group/card shadow-sm active:scale-98"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-zinc-400 group-hover/card:text-[#00ffb2] transition-colors">
                      {card.key}
                    </span>
                    <PriorityBadge priority={card.priority} showIcon={false} size="sm" />
                  </div>

                  <p className="text-xs font-medium text-zinc-200 group-hover/card:text-white line-clamp-2 mb-3 leading-snug">
                    {card.title}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
                  <StatusBadge status={card.status} size="sm" />
                  <span className="text-[10px] font-mono text-zinc-500 group-hover/card:text-[#00ffb2] transition-colors flex items-center gap-1">
                    <span>Advance</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Floating Metric Halo Badges */}
          <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-1.5 text-[#00ffb2]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ffb2] animate-ping" />
              <span>0.4ms Connection Acquisition (HikariCP)</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>0 Sequence Key Collisions (Pessimistic Lock)</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Neon Cloud PostgreSQL Active (AWS us-east-2)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Live Velocity Ticker Ribbon (CryptiX Ticker Marquee) */}
      <section id="ticker" className="w-full py-8 border-y border-white/[0.08] bg-[#0c0c12]/60 backdrop-blur-xl relative overflow-hidden">
        {/* Gradient edge masks */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#08070e] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#08070e] to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee gap-6 items-center">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#14131d]/90 border border-white/[0.08] hover:border-[#00ffb2]/40 transition-colors shrink-0"
            >
              <span className="font-mono text-xs font-bold text-[#00ffb2] bg-[#00ffb2]/10 px-2 py-0.5 rounded">
                {item.key}
              </span>
              <span className="text-xs font-medium text-white">{item.label}</span>
              <span className="text-xs text-zinc-400 font-mono">{item.metric}</span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                {item.gain}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. "TOTAL CONTROL" — Asymmetric Bento Suite */}
      <section id="capabilities" className="px-4 sm:px-6 max-w-5xl mx-auto w-full py-16 scroll-mt-14">
        <div className="mb-10 text-center sm:text-left">
          <span className="text-xs font-mono text-[#00ffb2] font-semibold tracking-widest uppercase">
            TOTAL CONTROL
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Engineered for precision, velocity, and zero lag.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-xl">
            From atomic sequence locks to AI PRD generation, DevFlow eliminates friction at every step of your development lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bento 1: Command Palette Simulator */}
          <div className="cryptix-card rounded-2xl p-5 md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                  <CommandIcon className="w-4 h-4" />
                </div>
                <kbd className="px-2 py-0.5 bg-zinc-900 border border-white/[0.08] rounded text-xs font-mono text-zinc-300">
                  ⌘K
                </kbd>
              </div>

              <h3 className="text-base font-semibold text-white mb-1">
                Global Command Palette (⌘K)
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                Navigate anywhere in sub-50ms. Search issues, jump to projects, or trigger GitHub sync.
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

          {/* Bento 2: Atomic Issue Keys */}
          <div className="cryptix-card rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#00ffb2]/10 border border-[#00ffb2]/30 flex items-center justify-center text-[#00ffb2] mb-3">
                <Terminal className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">
                Atomic Issue Keys
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                Pessimistic locking (<code className="text-[#00ffb2] font-mono">SELECT FOR UPDATE</code>) guarantees zero sequence collisions.
              </p>

              {/* Interactive Key Generator */}
              <div className="bg-zinc-950/80 border border-white/[0.08] rounded-xl p-3 text-center mb-2">
                <div className="text-xl font-bold font-mono text-white mb-1">
                  QE-{sequenceCount}
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">Current Sequence Head</p>
                <button
                  type="button"
                  onClick={generateNextSequenceKey}
                  className="mt-3 w-full py-1.5 bg-[#14131d] hover:bg-[#1c1b26] text-xs font-mono font-medium text-[#00ffb2] rounded-lg border border-[#00ffb2]/30 transition-colors cursor-pointer"
                >
                  + Generate Next Key
                </button>
              </div>
            </div>
          </div>

          {/* Bento 3: Vim Keyboard Matrix */}
          <div className="cryptix-card rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-3">
                <Keyboard className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">
                Vim Keyboard Matrix
              </h3>
              <p className="text-xs text-zinc-400 mb-3">
                Never take your hands off the keyboard. Navigate and triage issues at 60 FPS.
              </p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {Object.keys(vimShortcuts).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setActiveVimKey(k)}
                    className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all ${
                      activeVimKey === k
                        ? 'bg-[#00ffb2] text-zinc-950 shadow-sm'
                        : 'bg-zinc-900 border border-white/[0.08] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>

              <div className="bg-zinc-950/80 border border-white/[0.08] rounded-xl p-2.5 font-mono text-xs">
                <div className="text-[#00ffb2] font-semibold mb-0.5">
                  {vimShortcuts[activeVimKey]?.label}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {vimShortcuts[activeVimKey]?.desc}
                </div>
              </div>
            </div>
          </div>

          {/* Bento 4: 3-Tier Granular RBAC */}
          <div className="cryptix-card rounded-2xl p-5 md:col-span-2 flex flex-col justify-between">
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

      {/* 7. "HOW IT WORKS" — 3-Step Guided Workflow */}
      <section id="how-it-works" className="px-4 sm:px-6 max-w-5xl mx-auto w-full py-16 scroll-mt-14">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-[#00ffb2] font-semibold tracking-widest uppercase">
            HOW IT WORKS
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Three steps to peak engineering velocity.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-md mx-auto">
            A simple, fast, and secure platform to organize and ship software in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="cryptix-card rounded-2xl p-6 relative">
            <div className="w-9 h-9 rounded-full bg-[#00ffb2]/10 border border-[#00ffb2]/40 text-[#00ffb2] font-mono font-bold text-sm flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-white mb-2">Create Workspace</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Launch your team space in 10 seconds or tap the 1-click sandbox to test with zero sign-up friction.
            </p>
          </div>

          {/* Step 2 */}
          <div className="cryptix-card rounded-2xl p-6 relative">
            <div className="w-9 h-9 rounded-full bg-[#00ffb2]/10 border border-[#00ffb2]/40 text-[#00ffb2] font-mono font-bold text-sm flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-white mb-2">Orchestrate Sprints</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Manage issues with instant Vim keys (J/K/C/X), synthesize specs with AI, and track progress on real-time Kanban boards.
            </p>
          </div>

          {/* Step 3 */}
          <div className="cryptix-card rounded-2xl p-6 relative">
            <div className="w-9 h-9 rounded-full bg-[#00ffb2]/10 border border-[#00ffb2]/40 text-[#00ffb2] font-mono font-bold text-sm flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-white mb-2">Ship at Lightspeed</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Dispatch webhook notifications to Discord/Slack, transition tasks from terminal with DevFlow CLI, and deploy with zero bottlenecks.
            </p>
          </div>
        </div>
      </section>

      {/* 8. AI Spec Doctor Showcase Section */}
      <section id="spec-doctor" className="px-4 sm:px-6 max-w-5xl mx-auto w-full py-12 scroll-mt-14">
        <div className="cryptix-card rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#00ffb2] font-semibold mb-1">
                <Bot className="w-4 h-4" />
                <span>INTELLIGENT SPEC DOCTOR</span>
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
              className="px-4 py-2 cryptix-btn-mint text-xs rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-60"
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
                      ? 'bg-[#00ffb2]/20 text-[#00ffb2] border border-[#00ffb2]/30 font-semibold'
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
                  className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-lg p-3 text-xs text-zinc-200 font-mono focus:outline-none focus:border-[#00ffb2]/40 resize-none transition-colors"
                  placeholder="Enter raw technical requirement or error trace..."
                />
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-2 flex items-center justify-between">
                <span>Edit any text above and click Synthesize</span>
                <span className="text-[#00ffb2]/80">Mode: {specMode}</span>
              </div>
            </div>

            {/* Synthesized Output Side */}
            <div className="bg-zinc-950/80 border border-white/[0.08] rounded-xl p-4 font-mono text-xs flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
                  <span className="text-[11px] text-[#00ffb2] uppercase tracking-wider font-semibold flex items-center gap-1.5">
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
                        Press <span className="text-[#00ffb2] font-semibold">&quot;Synthesize {specMode}&quot;</span> to run the live semantic AI engine on your custom note.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CLI Companion & Sub-Millisecond Architecture */}
      <section id="architecture" className="px-4 sm:px-6 max-w-5xl mx-auto w-full py-12 scroll-mt-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CLI Terminal Showcase */}
          <div className="cryptix-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#00ffb2]" />
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
                <div className="text-zinc-500">$ npx devflow start QE-104</div>
                <div className="text-[#00ffb2]">✔ Fetched issue: Migrate connection pool to HikariCP</div>
                <div className="text-sky-400">✔ Created branch &apos;feature/qe-104-hikaricp&apos;</div>
                <div className="text-zinc-400">✔ Issue status transitioned to IN_PROGRESS</div>
              </div>
            </div>
          </div>

          {/* Architecture Spec */}
          <div className="cryptix-card rounded-2xl p-6 flex flex-col justify-between">
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
                  <span className="text-[#00ffb2] font-semibold">Next.js 15 + React 19</span>
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

      {/* 10. Interactive Pricing (CryptiX Signature Layout with 20% OFF Toggle) */}
      <section id="pricing" className="px-4 sm:px-6 max-w-5xl mx-auto w-full py-16 scroll-mt-14">
        <div className="text-center mb-10">
          <span className="text-xs font-mono text-[#00ffb2] font-semibold tracking-widest uppercase">
            PRICING
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Choose Your Plan. Start Shipping Today.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-md mx-auto">
            Transparent pricing for every engineering team. Scale as you grow with no hidden fees or surprise seat locks.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-6 inline-flex items-center gap-2 p-1 bg-[#121118] border border-white/[0.08] rounded-full text-xs font-mono">
            <button
              type="button"
              onClick={() => setAnnualBilling(false)}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                !annualBilling
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnualBilling(true)}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                annualBilling
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Yearly</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#00ffb2]/20 text-[#00ffb2] text-[10px] font-bold border border-[#00ffb2]/30">
                20% OFF
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Free Tier */}
          <div className="cryptix-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase">Developer</span>
              <div className="mt-2 mb-1 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white font-mono">$0</span>
                <span className="text-xs text-zinc-500 font-mono">/month</span>
              </div>
              <p className="text-xs text-zinc-400 mb-6">Perfect for solo builders exploring DevFlow</p>

              <div className="space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00ffb2]" />
                  <span>Unlimited local sandboxes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00ffb2]" />
                  <span>Up to 3 Active Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00ffb2]" />
                  <span>Vim Keyboard Navigation (J/K)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00ffb2]" />
                  <span>Command Palette (⌘K)</span>
                </div>
              </div>
            </div>

            <Link
              href="/register"
              className="mt-8 w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] text-center text-xs font-semibold text-zinc-200 transition-all"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Tier (Popular) */}
          <div className="cryptix-card rounded-2xl p-6 flex flex-col justify-between border-[#00ffb2]/40 relative shadow-[0_0_36px_rgba(0,255,178,0.12)]">
            <div className="absolute -top-3 right-5 px-2.5 py-0.5 rounded-full bg-[#00ffb2] text-zinc-950 font-mono font-bold text-[10px] tracking-wider uppercase">
              POPULAR
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-[#00ffb2] uppercase">Pro Engineer</span>
              <div className="mt-2 mb-1 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {annualBilling ? '$9.60' : '$12'}
                </span>
                <span className="text-xs text-zinc-500 font-mono">/month</span>
              </div>
              <p className="text-xs text-zinc-400 mb-6">Advanced acceleration for serious engineering teams</p>

              <div className="space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00ffb2]" />
                  <span>Everything in Developer, plus:</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00ffb2]" />
                  <span>Unlimited Projects & Workspaces</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00ffb2]" />
                  <span>AI Spec Doctor (PRD & Bug RCA)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00ffb2]" />
                  <span>Discord & Slack Outgoing Webhooks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00ffb2]" />
                  <span>DevFlow Terminal CLI Companion</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExploreDemo}
              className="mt-8 w-full py-2.5 rounded-xl cryptix-btn-mint text-center text-xs font-bold cursor-pointer"
            >
              Start Free Pro Trial
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="cryptix-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase">HyperScale</span>
              <div className="mt-2 mb-1 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {annualBilling ? '$31.20' : '$39'}
                </span>
                <span className="text-xs text-zinc-500 font-mono">/month</span>
              </div>
              <p className="text-xs text-zinc-400 mb-6">Custom architecture for enterprise organizations</p>

              <div className="space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00ffb2]" />
                  <span>Everything in Pro, plus:</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00ffb2]" />
                  <span>Dedicated Neon PostgreSQL compute</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00ffb2]" />
                  <span>Custom Webhook retry pipelines</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00ffb2]" />
                  <span>SLA 99.99% & 24/7 dedicated support</span>
                </div>
              </div>
            </div>

            <Link
              href="/register"
              className="mt-8 w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] text-center text-xs font-semibold text-zinc-200 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* 11. Testimonials: High-Conviction Quotes */}
      <section className="px-4 sm:px-6 max-w-4xl mx-auto w-full py-12">
        <div className="cryptix-card rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-[#00ffb2]/10 border border-[#00ffb2]/30 text-[#00ffb2] mx-auto mb-4 flex items-center justify-center">
            <Star className="w-5 h-5 fill-[#00ffb2]" />
          </div>
          <p className="text-base sm:text-lg text-zinc-100 font-medium leading-relaxed max-w-2xl mx-auto mb-6">
            &ldquo;DevFlow makes sprint management effortless. Blazing fast transactions, zero lag, and a sleek dark interface—exactly what our engineering team needed to replace Jira.&rdquo;
          </p>
          <div>
            <div className="text-xs font-bold text-white">Alex Mercer</div>
            <div className="text-[11px] font-mono text-zinc-500">Lead Systems Architect at NovaCloud</div>
          </div>
        </div>
      </section>

      {/* 12. Interactive FAQ Accordion */}
      <section id="faq" className="px-4 sm:px-6 max-w-3xl mx-auto w-full py-16 scroll-mt-14">
        <div className="text-center mb-10">
          <span className="text-xs font-mono text-[#00ffb2] font-semibold tracking-widest uppercase">
            COMMON QUESTIONS
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            All you need to know about DevFlow.
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="cryptix-card rounded-xl overflow-hidden border border-white/[0.08] transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-500 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#00ffb2]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-zinc-400 font-sans leading-relaxed border-t border-white/[0.04]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 13. High-Voltage Bottom CTA Banner */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto w-full py-16">
        <div className="cryptix-card rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden border-[#00ffb2]/40 shadow-[0_0_60px_rgba(0,255,178,0.15)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,178,0.12),_transparent_70%)] pointer-events-none" />

          <span className="text-xs font-mono text-[#00ffb2] font-bold tracking-widest uppercase mb-2 block">
            READY TO TAKE CONTROL?
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 max-w-2xl mx-auto">
            Orchestrate software at the speed of thought.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto mb-8 leading-relaxed">
            Join thousands of developers shipping with DevFlow. Zero credit cards, zero setup delays.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleExploreDemo}
              disabled={demoLoading}
              className="w-full sm:w-auto px-7 py-3.5 cryptix-btn-mint text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {demoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-zinc-950" />}
              <span>⚡ Try Live Demo (Instant Sandbox)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-white/[0.1] text-zinc-200 text-sm font-semibold transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* 14. Minimalist High-Craft Footer */}
      <footer className="border-t border-white/[0.06] bg-[#0c0c12]/80 py-10 px-4 sm:px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" showText={true} />
            <span className="text-zinc-700">|</span>
            <span className="text-xs text-zinc-500 font-sans">
              Designed for High-Velocity Software Teams
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-400">
            <Link href="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-white transition-colors">
              Register
            </Link>
            <a
              href="https://github.com/sanjaykamal2006/devflow"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <GitHubIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
