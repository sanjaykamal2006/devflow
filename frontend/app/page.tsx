'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { BrandLogo } from '@/components/BrandLogo';
import { OrbGallery } from '@/components/OrbGallery';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import {
  Command as CommandIcon,
  Shield,
  Loader2,
  Zap,
  Terminal,
  ChevronRight,
  Sparkles,
  Bot,
  Copy,
  Check,
  Keyboard,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { generateAiIssueSpec, SpecMode } from '@/lib/ai-issue-doctor';
import { MarkdownContent } from '@/components/MarkdownContent';

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
    key: 'DS-201',
    title: 'Liquid-glass token system & responsive layout for orb.gallery stage',
    status: 'TODO',
    priority: 'MEDIUM',
    type: 'TASK',
    assignee: 'Guest',
    tag: 'Design',
  },
  {
    id: 'demo-4',
    key: 'MOB-12',
    title: 'Zero-latency optimistic rollback on offline sync reconnect',
    status: 'DONE',
    priority: 'HIGH',
    type: 'FEATURE',
    assignee: 'Elena',
    tag: 'Mobile',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { enterDemoSandbox } = useAuth();
  const [cards, setCards] = useState<DemoCard[]>(INITIAL_DEMO_CARDS);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // AI Doctor Playground State
  const [specTitle, setSpecTitle] = useState('WebSocket connection drops after 60s idle timeout');
  const [specDesc, setSpecDesc] = useState('Client disconnected randomly without handshake close frame in production load balancer.');
  const [specMode, setSpecMode] = useState<SpecMode>('BUG_REPORT');
  const [specResult, setSpecResult] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Atomic Sequence State
  const [seqCount, setSeqCount] = useState(105);
  const [lastAllocatedKey, setLastAllocatedKey] = useState('HSC-105');

  // Interactive Sandbox Drawer Toggle
  const [showSandboxDrawer, setShowSandboxDrawer] = useState(false);

  const handleLaunchSandbox = () => {
    toast.success('⚡ Launching instant sandbox session...', {
      description: 'Pre-populating HyperScale Core with 15 engineering issues.',
    });
    enterDemoSandbox();
    router.push('/dashboard');
  };

  const cycleCardStatus = (id: string) => {
    const statusOrder: DemoCard['status'][] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const nextIdx = (statusOrder.indexOf(c.status) + 1) % statusOrder.length;
        const nextStatus = statusOrder[nextIdx];
        if (nextStatus === 'DONE') {
          confetti({
            particleCount: 35,
            spread: 50,
            origin: { y: 0.8 },
            colors: ['#4ade80', '#38bdf8', '#f4f3f0'],
          });
          toast.success(`Completed ${c.key}!`, {
            description: 'Issue transitioned to Done state.',
          });
        }
        return { ...c, status: nextStatus };
      })
    );
  };

  const generateNextSequenceKey = () => {
    const nextNum = seqCount + 1;
    const newKey = `HSC-${nextNum}`;
    setSeqCount(nextNum);
    setLastAllocatedKey(newKey);
    toast.info(`Allocated Sequence Key: ${newKey}`, {
      description: 'Atomic row-level pessimistic lock committed in 1.4ms.',
    });
  };

  const handleSynthesizeSpec = async () => {
    if (!specTitle.trim()) return;
    setIsSynthesizing(true);
    try {
      const generated = await generateAiIssueSpec({
        title: specTitle,
        description: specDesc,
        mode: specMode,
      });
      setSpecResult(generated);
      toast.success('Spec synthesized successfully!');
    } catch {
      toast.error('Synthesis failed. Please try again.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleCopyCli = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="relative min-h-screen bg-[#1f1f21] text-[#f4f3f0] selection:bg-white/20 selection:text-white overflow-x-hidden">
      {/* ============================================================
          STAGE 1: 3D Orb Gallery Hero Stage
          ============================================================ */}
      <OrbGallery />

      {/* Floating Header */}
      <header className="orb-nav">
        <Link href="/" className="orb-logo">
          <BrandLogo size="sm" showText={false} />
          <span className="font-semibold tracking-tight text-lg text-[#f4f3f0]">DevFlow</span>
        </Link>

        <nav className="orb-links">
          <a href="#sandbox" onClick={(e) => { e.preventDefault(); setShowSandboxDrawer(!showSandboxDrawer); }}>
            Interactive Demo
          </a>
          <a href="#features">Capabilities</a>
          <a href="#doctor">AI Doctor</a>
          <a href="#cli">CLI & Terminal</a>
          <a href="#architecture">Architecture</a>
        </nav>

        <div className="orb-navend">
          <Link href="/auth/login" className="sign">
            Sign in
          </Link>
          <button onClick={handleLaunchSandbox} className="btn-orb sm solid flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Try Live Sandbox</span>
          </button>
        </div>
      </header>

      {/* Bottom Pinned Copy Band */}
      <section className="orb-band">
        <h1 className="orb-lead">
          Every issue<br />
          worth <em>solving</em>.
        </h1>

        <div className="orb-side">
          <span className="orb-badge">
            <i />
            1,428 issues shipped this month
          </span>

          <p className="orb-lede">
            High-velocity issue tracking, linear workflows, and AI-powered specs — built for engineering teams who ship relentlessly.
          </p>

          <div className="orb-cta">
            <button onClick={handleLaunchSandbox} className="btn-orb lg solid flex items-center gap-2">
              <Zap className="w-4 h-4 fill-current text-amber-500" />
              <span>⚡ Try Live Sandbox</span>
            </button>
            <button
              onClick={() => setShowSandboxDrawer(!showSandboxDrawer)}
              className="btn-orb lg ghost flex items-center gap-2"
            >
              <span>{showSandboxDrawer ? 'Hide Sandbox' : 'Explore Capabilities'}</span>
              <span className="arrow">&rarr;</span>
            </button>
          </div>

          <div className="orb-proof">
            <div className="orb-avatars">
              <span className="avatar-circle">SK</span>
              <span className="avatar-circle">AL</span>
              <span className="avatar-circle">JD</span>
              <span className="avatar-circle">EM</span>
            </div>
            <div>
              <div className="stars" aria-hidden="true">★★★★★</div>
              <div className="txt">Joined by 12,000+ engineers at Vercel & Stripe</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          STAGE 2: Interactive Sandbox & Engineering Capabilities
          ============================================================ */}
      <div id="sandbox" className={`relative z-20 pt-28 pb-32 transition-all duration-500 ${showSandboxDrawer ? 'block' : 'mt-[100vh]'}`}>
        <div className="max-w-6xl mx-auto px-6">
          {/* Section Anchor Divider */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-16">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400 mb-3">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Interactive Sandbox</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#f4f3f0]">
                Built for engineers who care about <em className="font-serif-instrument italic font-normal text-white">craft</em>.
              </h2>
            </div>
            <button
              onClick={handleLaunchSandbox}
              className="hidden md:inline-flex btn-orb sm solid items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Full Demo App</span>
            </button>
          </div>

          {/* Interactive Kanban Board Widget */}
          <div className="orb-card rounded-2xl p-6 md:p-8 mb-16">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span>Interactive Kanban Simulation</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Reactive
                  </span>
                </h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Click any card to cycle status across TODO, IN PROGRESS, IN REVIEW, and DONE.
                </p>
              </div>

              {/* Atomic Key Generator Tool */}
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-zinc-300">
                  Key: <span className="text-emerald-400 font-bold">{lastAllocatedKey}</span>
                </div>
                <button
                  onClick={generateNextSequenceKey}
                  className="btn-orb sm ghost text-xs flex items-center gap-1.5"
                >
                  <span>+ Allocate Next Key</span>
                </button>
              </div>
            </div>

            {/* Kanban Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {cards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => cycleCardStatus(card.id)}
                  className="group relative p-5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-white/10 hover:border-white/20 transition-all cursor-pointer shadow-lg select-none"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-semibold text-zinc-300 group-hover:text-white">
                      {card.key}
                    </span>
                    <PriorityBadge priority={card.priority} size="sm" showIcon={false} />
                  </div>

                  <p className="text-sm font-medium text-zinc-100 line-clamp-2 mb-4 leading-snug">
                    {card.title}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                    <StatusBadge status={card.status} size="sm" />
                    <span className="text-zinc-500 group-hover:text-zinc-400 flex items-center gap-1">
                      Cycle status <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Capabilities Bento Grid */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {/* Bento 1: Keyboard First Navigation */}
            <div className="orb-card rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 text-zinc-300">
                  <Keyboard className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Vim-Grade Navigation</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Navigate through issues with <code className="text-xs font-mono text-zinc-200 bg-white/5 px-1.5 py-0.5 rounded">j</code> and <code className="text-xs font-mono text-zinc-200 bg-white/5 px-1.5 py-0.5 rounded">k</code>. Press <code className="text-xs font-mono text-zinc-200 bg-white/5 px-1.5 py-0.5 rounded">c</code> to create, <code className="text-xs font-mono text-zinc-200 bg-white/5 px-1.5 py-0.5 rounded">x</code> to archive, and <code className="text-xs font-mono text-zinc-200 bg-white/5 px-1.5 py-0.5 rounded">Cmd+K</code> to jump anywhere.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-zinc-500 font-mono">
                <span>[J/K] Cycle</span> &middot; <span>[C] Create</span> &middot; <span>[Cmd+K] Search</span>
              </div>
            </div>

            {/* Bento 2: Command Palette */}
            <div className="orb-card rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 text-zinc-300">
                  <CommandIcon className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Universal Command Palette</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Instant fuzzy search across workspaces, issues, team members, and projects with sub-5ms keyboard reaction time powered by cmdk.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                <span>Press Cmd+K anytime</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">⌘K</kbd>
              </div>
            </div>

            {/* Bento 3: Stateless Enterprise Auth */}
            <div className="orb-card rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 text-zinc-300">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Stateless JWT & Neon DB</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Spring Boot 3.3 stateless JWT authentication with multi-tenant workspace isolation and serverless PostgreSQL compute scaling to zero on idle.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Multi-tenant UUID primary keys</span>
              </div>
            </div>
          </div>

          {/* AI Issue Doctor Live Playground */}
          <div id="doctor" className="orb-card rounded-2xl p-6 md:p-8 mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">AI Issue Doctor Playground</h3>
                <p className="text-xs text-zinc-400">Synthesize engineering reproduction steps and architecture specs in seconds.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Issue Title</label>
                  <input
                    type="text"
                    value={specTitle}
                    onChange={(e) => setSpecTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
                    placeholder="Brief description of the bug or feature..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Context & Reproduction Clues</label>
                  <textarea
                    rows={3}
                    value={specDesc}
                    onChange={(e) => setSpecDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 resize-none"
                    placeholder="Add logs, reproduction hints, or stack trace snippets..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(['BUG_REPORT', 'PRD', 'ARCHITECTURE'] as SpecMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setSpecMode(mode)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          specMode === mode
                            ? 'bg-white text-zinc-900 font-semibold'
                            : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {mode.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleSynthesizeSpec}
                    disabled={isSynthesizing}
                    className="btn-orb sm solid flex items-center gap-1.5"
                  >
                    {isSynthesizing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Synthesize Spec</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Output Preview */}
              <div className="p-4 rounded-xl bg-black/50 border border-white/10 min-h-[220px] max-h-[300px] overflow-y-auto text-xs text-zinc-300 font-mono">
                {specResult ? (
                  <MarkdownContent content={specResult} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 py-10">
                    <Sparkles className="w-6 h-6 mb-2 opacity-40 text-amber-400" />
                    <span>Click &ldquo;Synthesize Spec&rdquo; to generate reproduction steps and test verification criteria.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CLI & Terminal Section */}
          <div id="cli" className="orb-card rounded-2xl p-6 md:p-8 mb-16">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">DevFlow CLI Command Suite</h3>
                  <p className="text-xs text-zinc-400">Interact with your issues, projects, and cycles straight from your terminal.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
                <code className="text-xs font-mono text-zinc-200">npx devflow login</code>
                <button
                  onClick={() => handleCopyCli('npx devflow login', 'cli-login')}
                  className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition"
                  title="Copy command"
                >
                  {copiedKey === 'cli-login' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
                <code className="text-xs font-mono text-zinc-200">npx devflow issue create &quot;Add Redis cache&quot;</code>
                <button
                  onClick={() => handleCopyCli('npx devflow issue create "Add Redis cache"', 'cli-issue')}
                  className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition"
                  title="Copy command"
                >
                  {copiedKey === 'cli-issue' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Architecture Dossier Summary */}
          <div id="architecture" className="border-t border-white/10 pt-12 pb-16">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-6">
              Production Architecture Highlights
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-zinc-400">
              <div>
                <span className="block text-zinc-200 font-semibold mb-1">Frontend Runtime</span>
                <span>Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Three.js</span>
              </div>
              <div>
                <span className="block text-zinc-200 font-semibold mb-1">Backend Engine</span>
                <span>Java 21, Spring Boot 3.3.4, Hibernate 6, Stateless JWT Security</span>
              </div>
              <div>
                <span className="block text-zinc-200 font-semibold mb-1">Database Layer</span>
                <span>Neon Cloud Serverless PostgreSQL with auto scale-to-zero</span>
              </div>
              <div>
                <span className="block text-zinc-200 font-semibold mb-1">Deployment Target</span>
                <span>Vercel Edge Network + Render Docker Web Service</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 py-10 text-center text-xs text-zinc-500">
          <p>&copy; {new Date().getFullYear()} DevFlow. Inspired by Linear and Raycast. Built with craftsmanship.</p>
        </footer>
      </div>
    </div>
  );
}
