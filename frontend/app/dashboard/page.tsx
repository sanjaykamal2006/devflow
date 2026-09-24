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

  if (authLoading || (loading && !workspaces.length)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase">
              Workspaces
            </h1>
            <span className="w-2 h-2 rounded-full bg-[#FFC554]" />
          </div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">
            Logged in as <span className="text-zinc-300 font-mono">{user?.email}</span>
          </p>
        </div>

        <button
          onClick={() => setCreatingWs(true)}
          className="px-4 py-2.5 bg-[#FFC554] hover:bg-[#ffd166] text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg shadow-[#FFC554]/10 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Workspace</span>
        </button>
      </div>

      {error && (
        <div className="my-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Create Workspace Modal */}
      {creatingWs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-white/15 rounded-[28px] max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-white">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
              <h2 className="text-xs font-black uppercase tracking-wider text-white">
                New Workspace
              </h2>
              <button
                type="button"
                onClick={() => setCreatingWs(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-zinc-500 tracking-[0.2em] ml-1">
                  Workspace Name <span className="text-[#FFC554]">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Core Engineering"
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  className="w-full h-12 bg-white/[0.03] border border-white/10 text-white rounded-xl px-4 text-xs font-medium outline-none focus:border-[#FFC554] focus:bg-white/[0.06] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-zinc-500 tracking-[0.2em] ml-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="What team or products belong in this workspace?"
                  value={wsDescription}
                  onChange={(e) => setWsDescription(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl p-3.5 text-xs font-medium outline-none focus:border-[#FFC554] focus:bg-white/[0.06] resize-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCreatingWs(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !wsName.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#FFC554] hover:bg-[#ffd166] text-black transition-all flex items-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />}
                  <span>Create Workspace</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workspaces Grid */}
      <div className="mt-8">
        {workspaces.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-[24px] p-12 text-center bg-zinc-950/40">
            <Layers className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">No workspaces found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Create your first engineering workspace to start tracking projects and collaborating with your team.
            </p>
            <button
              onClick={() => setCreatingWs(true)}
              className="mt-5 px-4 py-2.5 bg-[#FFC554] hover:bg-[#ffd166] text-black rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Create Workspace</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workspaces.map((ws) => (
              <Link
                key={ws.id}
                href={`/workspaces/${ws.id}`}
                className="group bg-zinc-950/80 hover:bg-zinc-900/60 border border-white/10 hover:border-[#FFC554]/50 rounded-[24px] p-5 transition-all duration-200 flex flex-col justify-between hover:-translate-y-0.5 shadow-sm hover:shadow-xl hover:shadow-[#FFC554]/5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-sm font-black text-white group-hover:text-[#FFC554] transition-colors truncate">
                      {ws.name}
                    </h3>
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-zinc-300 flex-shrink-0">
                      <Shield className="w-2.5 h-2.5 text-[#FFC554]" />
                      {ws.currentUserRole}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 min-h-[32px] mb-5 font-normal leading-relaxed">
                    {ws.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-500 font-mono">
                  <div className="flex items-center gap-3.5">
                    <span className="flex items-center gap-1.5" title={`${ws.projectCount} projects`}>
                      <FolderGit2 className="w-3.5 h-3.5 text-zinc-400" />
                      {ws.projectCount} {ws.projectCount === 1 ? 'project' : 'projects'}
                    </span>
                    <span className="flex items-center gap-1.5" title={`${ws.memberCount} members`}>
                      <Users className="w-3.5 h-3.5 text-zinc-400" />
                      {ws.memberCount}
                    </span>
                  </div>

                  <span className="text-zinc-400 group-hover:text-[#FFC554] group-hover:translate-x-0.5 transition flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
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
