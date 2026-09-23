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
  Briefcase,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-zinc-400" />
            <span>Developer Workspaces</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Logged in as <span className="text-zinc-200 font-mono font-medium">{user?.email}</span>
          </p>
        </div>

        <button
          onClick={() => setCreatingWs(true)}
          className="px-3.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-xs font-medium transition flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Workspace</span>
        </button>
      </div>

      {error && (
        <div className="my-4 p-3 rounded bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Create Workspace Modal */}
      {creatingWs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-md w-full p-5 shadow-2xl relative text-zinc-100">
            <h2 className="text-sm font-semibold text-white mb-3">Create New Workspace</h2>
            <form onSubmit={handleCreateWorkspace} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Workspace Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Core Engineering"
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="What team or project does this workspace represent?"
                  value={wsDescription}
                  onChange={(e) => setWsDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded p-2.5 text-xs text-zinc-100 placeholder-zinc-600 resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCreatingWs(false)}
                  className="px-3 py-1.5 rounded text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !wsName.trim()}
                  className="px-3.5 py-1.5 rounded text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-950 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workspaces Grid */}
      <div className="mt-6">
        {workspaces.length === 0 ? (
          <div className="border border-dashed border-zinc-800 rounded-lg p-12 text-center bg-zinc-900/10">
            <Layers className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-200">No workspaces found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              You do not belong to any workspaces yet. Create your first workspace to start collaborating on projects and issues.
            </p>
            <button
              onClick={() => setCreatingWs(true)}
              className="mt-4 px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-xs font-medium inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Workspace</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((ws) => (
              <Link
                key={ws.id}
                href={`/workspaces/${ws.id}`}
                className="group border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/80 rounded-lg p-4 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white truncate">
                      {ws.name}
                    </h3>
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-800 border border-zinc-700 text-zinc-300 flex-shrink-0">
                      <Shield className="w-2.5 h-2.5 text-zinc-400" />
                      {ws.currentUserRole}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 min-h-[32px] mb-4">
                    {ws.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 font-mono">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1" title={`${ws.projectCount} projects`}>
                      <FolderGit2 className="w-3.5 h-3.5 text-zinc-400" />
                      {ws.projectCount}
                    </span>
                    <span className="flex items-center gap-1" title={`${ws.memberCount} members`}>
                      <Users className="w-3.5 h-3.5 text-zinc-400" />
                      {ws.memberCount}
                    </span>
                  </div>

                  <span className="text-zinc-400 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition flex items-center gap-1 text-[11px]">
                    <span>Enter</span>
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
