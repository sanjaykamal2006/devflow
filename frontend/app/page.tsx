'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { BrandLogo } from '@/components/BrandLogo';
import {
  ArrowRight,
  GitBranch,
  Lock,
  Zap,
  Shield,
  GripVertical,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import confetti from 'canvas-confetti';
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

// Sample live demo issues for the landing page hero preview
interface PreviewIssue {
  id: string;
  key: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM';
  type: 'TASK' | 'BUG' | 'FEATURE';
  assignee: string;
  labels: string[];
}

const INITIAL_PREVIEW_ISSUES: PreviewIssue[] = [
  {
    id: 'p-1',
    key: 'ENG-101',
    title: 'Concurrency-Safe Pessimistic Lock for Key Generation',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    type: 'BUG',
    assignee: 'SK',
    labels: ['postgres', 'locking'],
  },
  {
    id: 'p-2',
    key: 'API-42',
    title: 'Zero-Latency Redis Caching with Graceful SQL Fallback',
    status: 'TODO',
    priority: 'HIGH',
    type: 'TASK',
    assignee: 'AL',
    labels: ['cache', 'redis'],
  },
  {
    id: 'p-3',
    key: 'WEB-88',
    title: 'StringTune Kinetic Hero & Raycast Command Palette',
    status: 'IN_REVIEW',
    priority: 'MEDIUM',
    type: 'FEATURE',
    assignee: 'JD',
    labels: ['ui', 'linear'],
  },
  {
    id: 'p-4',
    key: 'SEC-12',
    title: 'HMAC-SHA256 GitHub Webhook Auto-Transitions',
    status: 'DONE',
    priority: 'HIGH',
    type: 'FEATURE',
    assignee: 'SK',
    labels: ['security', 'github'],
  },
];

const PREVIEW_COLUMNS: { id: PreviewIssue['status']; title: string; color: string }[] = [
  { id: 'TODO', title: 'To Do', color: 'border-zinc-800' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-sky-500/30' },
  { id: 'IN_REVIEW', title: 'In Review', color: 'border-amber-500/30' },
  { id: 'DONE', title: 'Done', color: 'border-emerald-500/30' },
];

function PreviewDraggableCard({
  issue,
  onMove,
}: {
  issue: PreviewIssue;
  onMove: (id: string, dir: 'left' | 'right') => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: issue.id,
    data: { issue },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    URGENT: 'text-rose-400 bg-rose-950/40 border-rose-800/60',
    HIGH: 'text-amber-400 bg-amber-950/40 border-amber-800/60',
    MEDIUM: 'text-blue-400 bg-blue-950/40 border-blue-800/60',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`linear-card rounded-xl p-3 select-none text-left group ${
        isDragging ? 'opacity-30 border-dashed border-zinc-700' : 'hover:border-white/[0.14]'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-0.5 text-zinc-600 hover:text-zinc-300"
            title="Drag to test Kanban physics"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
          <span className="font-mono text-[11px] font-bold text-zinc-400 group-hover:text-white transition-colors">
            {issue.key}
          </span>
        </div>
        <span
          className={`text-[9px] font-mono font-medium px-1.5 py-0.5 rounded border ${
            priorityColors[issue.priority]
          }`}
        >
          {issue.priority}
        </span>
      </div>

      <p className="text-xs font-medium text-zinc-200 line-clamp-2 leading-relaxed mb-2">
        {issue.title}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-[10px] text-zinc-500 font-mono">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[9px] text-zinc-300">
            {issue.assignee}
          </div>
          {issue.labels.slice(0, 1).map((lbl) => (
            <span key={lbl} className="px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-800 text-zinc-400">
              #{lbl}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onMove(issue.id, 'left')}
            className="hover:text-zinc-200 px-1 py-0.5"
            title="Step left"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => onMove(issue.id, 'right')}
            className="hover:text-zinc-200 px-1 py-0.5"
            title="Step right"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewDroppableColumn({
  col,
  issues,
  onMove,
}: {
  col: (typeof PREVIEW_COLUMNS)[0];
  issues: PreviewIssue[];
  onMove: (id: string, dir: 'left' | 'right') => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl p-3 flex flex-col transition-all duration-200 border ${
        isOver
          ? 'border-sky-500/50 bg-sky-950/20 shadow-lg shadow-sky-500/10'
          : `bg-[#0c0c0e]/90 ${col.color}`
      }`}
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.05]">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
          {col.title}
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-850 text-zinc-400 border border-zinc-800 tabular-nums">
          {issues.length}
        </span>
      </div>

      <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[140px] flex-1">
          {issues.length === 0 ? (
            <div className="h-28 border border-dashed border-zinc-800/80 rounded-xl flex items-center justify-center text-[10px] text-zinc-600 font-mono">
              Drop here
            </div>
          ) : (
            issues.map((iss) => (
              <PreviewDraggableCard key={iss.id} issue={iss} onMove={onMove} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function HomePage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [demoLoading, setDemoLoading] = useState(false);
  const [previewIssues, setPreviewIssues] = useState<PreviewIssue[]>(INITIAL_PREVIEW_ISSUES);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleExploreDemo = async () => {
    setDemoLoading(true);
    try {
      if (user) {
        router.push('/dashboard');
        return;
      }
      // Demo guest authentication
      await login('demo@devflow.io', 'demo123');
      toast.success('Welcome to DevFlow Live Demo!');
      router.push('/dashboard');
    } catch {
      // Direct navigation fallback
      router.push('/dashboard');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleMoveStep = (issueId: string, dir: 'left' | 'right') => {
    const colOrder: PreviewIssue['status'][] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
    setPreviewIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        const curIdx = colOrder.indexOf(iss.status);
        const nextIdx = dir === 'left' ? Math.max(0, curIdx - 1) : Math.min(colOrder.length - 1, curIdx + 1);
        const newStatus = colOrder[nextIdx];
        if (newStatus === 'DONE' && iss.status !== 'DONE') {
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
          toast.success(`${iss.key} marked as Done! 🎉`);
        }
        return { ...iss, status: newStatus };
      })
    );
  };

  const handleDragStart = (e: DragStartEvent) => {
    setActivePreviewId(String(e.active.id));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActivePreviewId(null);
    if (!over) return;

    const issueId = String(active.id);
    let targetStatus: PreviewIssue['status'] | null = null;

    if (PREVIEW_COLUMNS.some((c) => c.id === over.id)) {
      targetStatus = over.id as PreviewIssue['status'];
    } else {
      const overIss = previewIssues.find((i) => i.id === over.id);
      if (overIss) targetStatus = overIss.status;
    }

    if (targetStatus) {
      setPreviewIssues((prev) =>
        prev.map((iss) => {
          if (iss.id === issueId) {
            if (targetStatus === 'DONE' && iss.status !== 'DONE') {
              confetti({
                particleCount: 70,
                spread: 65,
                origin: { y: 0.75 },
                colors: ['#38bdf8', '#34d399', '#a78bfa', '#f59e0b'],
              });
              toast.success(`${iss.key} moved to Done!`);
            }
            return { ...iss, status: targetStatus };
          }
          return iss;
        })
      );
    }
  };

  const activeIssue = previewIssues.find((i) => i.id === activePreviewId);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col bg-grid-subtle selection:bg-zinc-800 selection:text-white">
      {/* 1. Glass Header Navigation */}
      <header className="border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="hover:opacity-90 transition">
              <BrandLogo size="md" showText={true} />
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
              <a href="#preview" className="hover:text-zinc-100 transition-colors">
                Live Preview
              </a>
              <a href="#features" className="hover:text-zinc-100 transition-colors">
                Architecture
              </a>
              <a href="#stack" className="hover:text-zinc-100 transition-colors">
                Engineering Stack
              </a>
              <a
                href="https://github.com/sanjaykamal2006/devflow"
                target="_blank"
                rel="noreferrer"
                className="hover:text-zinc-100 transition-colors flex items-center gap-1"
              >
                Docs <ExternalLink className="w-3 h-3 text-zinc-500" />
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* GitHub Stars Badge */}
            <a
              href="https://github.com/sanjaykamal2006/devflow"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-white/[0.08] hover:border-white/[0.18] text-xs text-zinc-300 transition-all font-mono"
            >
              <GitHubIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span>★ 1.2k</span>
            </a>

            {user ? (
              <Link
                href="/dashboard"
                className="px-3.5 py-1.5 bg-white text-zinc-950 font-medium text-xs rounded-lg hover:bg-zinc-200 transition-all shadow-sm"
              >
                Open Workspace
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
                  className="px-3.5 py-1.5 bg-white text-zinc-950 font-medium text-xs rounded-lg hover:bg-zinc-200 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-60"
                >
                  {demoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Live Demo</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-20 pb-16 px-6 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Glow backdrop */}
        <div className="absolute top-12 -z-10 w-[500px] h-[300px] bg-gradient-to-tr from-sky-500/10 via-indigo-500/10 to-transparent blur-3xl rounded-full pointer-events-none" />

        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-white/[0.08] text-xs font-mono text-zinc-300 mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>DevFlow 2.0 • The High-Performance Issue Tracker for Engineers</span>
        </div>

        {/* Massive Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.08] max-w-4xl">
          Speed without friction. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500">
            Engineered for developers.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Zero bloat, tactile keyboard ergonomics, deterministic pessimistic sequence keys,
          sub-5ms Redis caching, and bidirectional GitHub commit auto-sync.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleExploreDemo}
            disabled={demoLoading}
            className="w-full sm:w-auto px-6 py-3 bg-white text-zinc-950 font-semibold text-sm rounded-xl hover:bg-zinc-200 transition-all shadow-xl flex items-center justify-center gap-2 group disabled:opacity-60"
          >
            {demoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Explore Live Demo Workspace</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <a
            href="https://github.com/sanjaykamal2006/devflow"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-900 border border-white/[0.08] hover:border-white/[0.18] text-zinc-200 text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <GitHubIcon className="w-4 h-4 text-zinc-400" />
            <span>View on GitHub</span>
          </a>
        </div>

        {/* Keyboard hint */}
        <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500 font-mono">
          <span>Global navigation with</span>
          <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-400">⌘K</kbd>
          <span>or</span>
          <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-400">Ctrl+K</kbd>
        </div>
      </section>

      {/* 3. Interactive Live Board Preview */}
      <section id="preview" className="px-4 sm:px-6 max-w-6xl mx-auto w-full py-12 scroll-mt-20">
        <div className="rounded-3xl border border-white/[0.08] bg-[#0c0c0e]/95 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
          {/* Mock Window Titlebar */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-zinc-500 ml-2 hidden sm:inline">
                devflow-workspace // sprint-42 // kanban
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
              <span className="hidden md:inline text-zinc-500">Try dragging issues to &quot;Done&quot;</span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-sky-400">
                Interactive Preview
              </span>
            </div>
          </div>

          {/* Dnd-kit Interactive Kanban Board in Hero */}
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PREVIEW_COLUMNS.map((col) => (
                <PreviewDroppableColumn
                  key={col.id}
                  col={col}
                  issues={previewIssues.filter((i) => i.status === col.id)}
                  onMove={handleMoveStep}
                />
              ))}
            </div>

            <DragOverlay dropAnimation={null}>
              {activeIssue ? (
                <div className="linear-card rounded-xl p-3 shadow-2xl border-sky-500/50 bg-[#121215] -rotate-1 scale-[1.03] cursor-grabbing w-[240px]">
                  <span className="font-mono text-xs font-bold text-sky-400">{activeIssue.key}</span>
                  <p className="text-xs font-medium text-zinc-100 line-clamp-2 mt-1">{activeIssue.title}</p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </section>

      {/* 4. Engineering Bento Grid */}
      <section id="features" className="px-6 max-w-6xl mx-auto w-full py-16 scroll-mt-20">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-sky-400 uppercase tracking-wider font-semibold">
            Engineering Principles
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white mt-2">
            Built for rigorous production demands
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto mt-2">
            Architected with Spring Boot 3.3, Java 21 virtual threads, and clean PostgreSQL sequence semantics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Pessimistic Key Sequences */}
          <div className="linear-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400 mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                Pessimistic Key Sequences (<code className="font-mono text-sky-300">CORE-101</code>)
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Atomic database row locking guarantees zero gap and zero key collision across high-concurrency ticket creation.
              </p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 font-mono text-[11px] text-zinc-400 overflow-x-auto">
              <span className="text-emerald-400">SELECT</span> current_val <span className="text-emerald-400">FROM</span> project_sequence{' '}
              <span className="text-amber-400">FOR UPDATE</span>;
            </div>
          </div>

          {/* Card 2: Zero-Latency Redis Caching */}
          <div className="linear-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400 mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                Zero-Latency Redis Caching & Fallback
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Sub-5ms board lookups via Redis with transparent degradation to indexed PostgreSQL queries during network partitions.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 flex-1 text-center">
                <span className="text-zinc-500 block text-[10px]">CACHE HIT</span>
                <span className="text-emerald-400 font-bold">&lt; 3.2ms</span>
              </div>
              <div className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 flex-1 text-center">
                <span className="text-zinc-500 block text-[10px]">SQL FALLBACK</span>
                <span className="text-zinc-300 font-bold">18.4ms</span>
              </div>
            </div>
          </div>

          {/* Card 3: HMAC-SHA256 GitHub Webhook Auto-Transitions */}
          <div className="linear-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400 mb-4">
                <GitBranch className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                HMAC-SHA256 GitHub Webhook Sync
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Commit messages referencing <code className="text-zinc-300">#CORE-101</code> or pull request merges automatically advance ticket lifecycles with verified HMAC signatures.
              </p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 font-mono text-[11px] text-zinc-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>X-Hub-Signature-256 Verified</span>
            </div>
          </div>

          {/* Card 4: Multi-Tenant Workspace RBAC */}
          <div className="linear-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                Multi-Tenant Workspace RBAC
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Strict tenant isolation. Granular role-based security rules for <code className="text-zinc-300">OWNER</code>, <code className="text-zinc-300">ADMIN</code>, and <code className="text-zinc-300">MEMBER</code>.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
              <span className="py-1 rounded bg-zinc-900 border border-zinc-800 text-sky-400 font-semibold">OWNER</span>
              <span className="py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">ADMIN</span>
              <span className="py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">MEMBER</span>
              <span className="py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">VIEWER</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Clean Minimalist Footer */}
      <footer id="stack" className="border-t border-white/[0.06] bg-[#0c0c0e] py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" showText={true} />
            <span className="text-zinc-600">|</span>
            <span className="text-xs text-zinc-500">
              Created by <span className="text-zinc-300 font-medium">Sanjay Kamal</span> • MIT License
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">Next.js 15</span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">Spring Boot 3.3</span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">Java 21</span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">PostgreSQL 16</span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">Redis 7</span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
