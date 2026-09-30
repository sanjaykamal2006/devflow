'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Workspace } from '@/types';
import { api } from '@/lib/api';
import {
  Layers,
  FolderGit2,
  Users,
  Plus,
  ArrowRight,
  Loader2,
  Shield,
  X,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingWs, setCreatingWs] = useState(false);
  const [wsName, setWsName] = useState('');
  const [wsDescription, setWsDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const data = await api.workspaces.list();
      setWorkspaces(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadWorkspaces();
    }
  }, [user]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsName.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const created = await api.workspaces.create({
        name: wsName.trim(),
        description: wsDescription.trim() || undefined,
      });
      setCreatingWs(false);
      setWsName('');
      setWsDescription('');
      router.push(`/workspaces/${created.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!creatingWs) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCreatingWs(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [creatingWs]);

  if (authLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-8 bg-zinc-900 rounded-lg w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="h-44 bg-zinc-900/60 border border-white/[0.06] rounded-2xl" />
          <div className="h-44 bg-zinc-900/60 border border-white/[0.06] rounded-2xl" />
          <div className="h-44 bg-zinc-900/60 border border-white/[0.06] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Workspaces
            </h1>
            <span className="text-xs font-mono text-zinc-400 px-2 py-0.5 rounded-full bg-zinc-900 border border-white/[0.08]">
              {workspaces.length} total
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Logged in as <span className="text-zinc-200 font-mono font-medium">{user?.email}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreatingWs(true)}
          className="h-9 px-4 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 transition-all duration-150 shadow-[0_0_16px_rgba(255,255,255,0.12)] flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>New Workspace</span>
        </button>
      </div>

      {error && (
        <div role="alert" className="my-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Create Workspace Modal */}
      {creatingWs && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCreatingWs(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-ws-title"
            className="bg-[#0e0e11] border border-white/[0.12] rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-zinc-100"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h2 id="create-ws-title" className="text-sm font-semibold text-white">Create Workspace</h2>
              </div>
              <button
                type="button"
                onClick={() => setCreatingWs(false)}
                aria-label="Close dialog"
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label htmlFor="ws-name" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Workspace Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="ws-name"
                  type="text"
                  required
                  autoFocus
                  autoComplete="off"
                  placeholder="e.g. Core Engineering"
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  className="w-full h-9 bg-zinc-950 border border-white/[0.08] rounded-lg px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/[0.25] transition-colors"
                />
              </div>

              <div>
                <label htmlFor="ws-desc" className="block text-xs font-medium text-zinc-300 mb-1.5">Description</label>
                <textarea
                  id="ws-desc"
                  rows={3}
                  placeholder="What repositories or systems does this workspace encompass?"
                  value={wsDescription}
                  onChange={(e) => setWsDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-lg p-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/[0.25] resize-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setCreatingWs(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !wsName.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-zinc-200 text-zinc-950 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-[0_0_12px_rgba(255,255,255,0.1)]"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
                  <span>Create Workspace</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workspaces Grid */}
      <div className="mt-6">
        {loading && workspaces.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            <div className="h-44 bg-zinc-900/60 border border-white/[0.06] rounded-2xl p-5" />
            <div className="h-44 bg-zinc-900/60 border border-white/[0.06] rounded-2xl p-5" />
            <div className="h-44 bg-zinc-900/60 border border-white/[0.06] rounded-2xl p-5" />
          </div>
        ) : workspaces.length === 0 ? (
          <div className="border border-dashed border-white/[0.08] rounded-2xl p-12 text-center bg-zinc-950/40">
            <Layers className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-200">No workspaces found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              You do not belong to any workspaces yet. Create your first workspace to start collaborating on projects and issues.
            </p>
            <button
              type="button"
              onClick={() => setCreatingWs(true)}
              className="mt-4 px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-[0_0_16px_rgba(255,255,255,0.12)] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Create Workspace</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((ws) => (
              <Link
                key={ws.id}
                href={`/workspaces/${ws.id}`}
                className="linear-card rounded-2xl p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-semibold text-zinc-100 group-hover:text-white truncate">
                      {ws.name}
                    </h3>
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-zinc-900 border border-white/[0.08] text-zinc-300 shrink-0">
                      <Shield className="w-3 h-3 text-zinc-400" aria-hidden="true" />
                      <span>{ws.currentUserRole}</span>
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 min-h-[36px] mb-4">
                    {ws.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 tabular-nums" title={`${ws.projectCount} projects`}>
                      <FolderGit2 className="w-3.5 h-3.5 text-zinc-500" aria-hidden="true" />
                      <span>{ws.projectCount} {ws.projectCount === 1 ? 'project' : 'projects'}</span>
                    </span>
                    <span className="flex items-center gap-1.5 tabular-nums" title={`${ws.memberCount} members`}>
                      <Users className="w-3.5 h-3.5 text-zinc-500" aria-hidden="true" />
                      <span>{ws.memberCount}</span>
                    </span>
                  </div>

                  <span className="text-zinc-500 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all duration-150 flex items-center gap-1 text-xs">
                    <span>Enter</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
