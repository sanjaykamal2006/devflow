'use client';

import React, { useState, useRef } from 'react';
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
  Zap,
  Terminal,
  ChevronRight,
  Copy,
  Check,
  Keyboard,
  CheckCircle2,
  Sliders,
  ArrowDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { motion, useScroll, useTransform } from 'motion/react';

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
    key: 'DS-201',
    title: 'Linear dark token system & responsive layout for orb stage',
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

  // Atomic Sequence State
  const [seqCount, setSeqCount] = useState(105);
  const [lastAllocatedKey, setLastAllocatedKey] = useState('HSC-105');

  // Scroll animation hooks
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.75], [1, 0.9]);
  const heroY = useTransform(scrollYProgress, [0, 0.75], [0, -60]);

  const handleLaunchSandbox = () => {
    toast.success('⚡ Launching instant sandbox session...', {
      description: 'Pre-populating HyperScale Core with engineering issues.',
    });
    enterDemoSandbox();
    router.push('/dashboard');
  };

  const scrollToPlatform = () => {
    document.getElementById('platform')?.scrollIntoView({ behavior: 'smooth' });
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

  const handleCopyCli = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#1f1f21] text-[#f4f3f0] selection:bg-white/20 selection:text-white overflow-x-hidden">
      {/* ============================================================
          SECTION 1: Dedicated 3D Orb Hero Viewport (100dvh)
          ============================================================ */}
      <section
        ref={heroRef}
        className="relative min-h-[100dvh] h-[100dvh] flex flex-col justify-between overflow-hidden"
      >
        {/* Floating Top Navigation */}
        <header className="orb-nav">
          <Link href="/" className="orb-logo">
            <BrandLogo size="sm" showText={false} />
            <span className="font-semibold tracking-tight text-lg text-[#f4f3f0]">DevFlow</span>
          </Link>

          <nav className="orb-links">
            <button onClick={scrollToPlatform} className="text-[14.5px] text-zinc-400 hover:text-white transition">
              Interactive Demo
            </button>
            <button onClick={scrollToPlatform} className="text-[14.5px] text-zinc-400 hover:text-white transition">
              Capabilities
            </button>
            <button onClick={scrollToPlatform} className="text-[14.5px] text-zinc-400 hover:text-white transition">
              CLI & Terminal
            </button>
            <button onClick={scrollToPlatform} className="text-[14.5px] text-zinc-400 hover:text-white transition">
              Architecture
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
            <Link href="/auth/login" className="sign">
              Sign in
            </Link>
            <button onClick={handleLaunchSandbox} className="btn-orb sm solid flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Try Live Sandbox</span>
            </button>
          </div>
        </header>

        {/* Drag / Hover Affordance Hint Pill */}
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
          <span>Drag to spin &middot; hover a task</span>
        </div>

        {/* Animated 3D Orb Layer */}
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="absolute inset-0 pointer-events-auto"
        >
          <OrbGallery />
        </motion.div>

        {/* Bottom Hero Copy Band */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-20 mt-auto"
        >
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
                  <Zap className="w-4 h-4 fill-current text-amber-500" />
                  <span>⚡ Try Live Sandbox</span>
                </button>
                <button
                  onClick={scrollToPlatform}
                  className="btn-orb lg ghost flex items-center gap-2"
                >
                  <span>Explore Platform</span>
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="orb-proof">
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Next.js 15 App Router &middot; Spring Boot 3.3 &middot; Neon Postgres</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============================================================
          SECTION 2: Dedicated Interactive Platform & Kanban Workspace
          ============================================================ */}
      <section id="platform" className="relative z-20 bg-[#17171a] border-t border-white/10 py-28">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8 mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400 mb-3">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>Interactive Board Playground</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#f4f3f0]">
                Built for engineers who care about <em className="font-serif-instrument italic font-normal text-white">craft</em>.
              </h2>
            </div>
            <button
              onClick={handleLaunchSandbox}
              className="btn-orb sm solid self-start md:self-auto flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Open Guest Sandbox</span>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
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

          {/* CLI & Terminal Section */}
          <div className="orb-card rounded-2xl p-6 md:p-8 mb-16">
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
          <div className="border-t border-white/10 pt-12 pb-16">
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
          <p>&copy; {new Date().getFullYear()} DevFlow. Open source developer workspace. Built with craftsmanship.</p>
        </footer>
      </section>
    </div>
  );
}
