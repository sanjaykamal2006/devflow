'use client';

import React, { useState } from 'react';
import { GitHubActivity, GitHubRepository } from '@/types';
import { api } from '@/lib/api';
import {
  GitBranch,
  Star,
  GitFork,
  RefreshCw,
  ExternalLink,
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  Unlink,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface GitHubPanelProps {
  projectId: string;
  repository: GitHubRepository | null;
  activities?: GitHubActivity[];
  canManage: boolean;
  onRepoUpdated: () => void;
}

export function GitHubPanel({
  projectId,
  repository,
  activities = [],
  canManage,
  onRepoUpdated,
}: GitHubPanelProps) {
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [owner, setOwner] = useState('');
  const [name, setName] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!owner.trim() || !name.trim()) return;

    setConnecting(true);
    setError(null);
    try {
      await api.github.connect(projectId, {
        owner: owner.trim(),
        name: name.trim(),
        webhookSecret: webhookSecret.trim() || undefined,
      });
      const successText = `Connected ${owner}/${name} successfully`;
      setSuccessMsg(successText);
      toast.success(successText);
      setOwner('');
      setName('');
      setWebhookSecret('');
      onRepoUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect repository';
      setError(msg);
      toast.error(msg);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect this repository?')) return;
    try {
      await api.github.disconnect(projectId);
      toast.success('GitHub repository disconnected');
      onRepoUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to disconnect';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await api.github.sync(projectId);
      const successText = `Synced! Linked ${res.newlyLinkedCommits} new commit(s).`;
      setSuccessMsg(successText);
      toast.success(successText);
      onRepoUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sync commits';
      setError(msg);
      toast.error(msg);
    } finally {
      setSyncing(false);
    }
  };

  if (!repository) {
    return (
      <div className="linear-card rounded-2xl p-6 bg-[#0c0c0e]/95">
        <div className="flex items-center gap-2 mb-2 text-zinc-100 font-semibold text-xs">
          <GitBranch className="w-4 h-4 text-sky-400" aria-hidden="true" />
          <span>Connect GitHub Repository</span>
        </div>
        <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
          Link a GitHub repository to automatically associate commit messages and pull requests referencing issue keys (e.g., <code className="font-mono text-zinc-200 bg-zinc-950 px-1.5 py-0.5 rounded border border-white/[0.08]">#API-37</code> or <code className="font-mono text-zinc-200 bg-zinc-950 px-1.5 py-0.5 rounded border border-white/[0.08]">API-37 Fix bug</code>).
        </p>

        {error && (
          <div role="alert" className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        {canManage ? (
          <form onSubmit={handleConnect} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="repo-owner" className="block text-xs font-medium text-zinc-300 mb-1.5">Repo Owner</label>
                <input
                  id="repo-owner"
                  type="text"
                  required
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="e.g. vercel"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full h-9 bg-zinc-950 border border-white/[0.08] rounded-lg px-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white/[0.25] font-mono transition-colors"
                />
              </div>
              <div>
                <label htmlFor="repo-name" className="block text-xs font-medium text-zinc-300 mb-1.5">Repo Name</label>
                <input
                  id="repo-name"
                  type="text"
                  required
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="e.g. next.js"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9 bg-zinc-950 border border-white/[0.08] rounded-lg px-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white/[0.25] font-mono transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="repo-secret" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Webhook Secret <span className="text-zinc-500 font-normal">(Optional)</span>
              </label>
              <input
                id="repo-secret"
                type="password"
                autoComplete="off"
                placeholder="Optional HMAC webhook secret"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                className="w-full h-9 bg-zinc-950 border border-white/[0.08] rounded-lg px-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white/[0.25] font-mono transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={connecting}
              className="px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-[0_0_12px_rgba(255,255,255,0.1)]"
            >
              {connecting && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
              <span>Connect Repository</span>
            </button>
          </form>
        ) : (
          <p className="text-xs text-zinc-500 italic">
            You need Workspace Admin permissions to connect a repository.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="linear-card rounded-2xl p-6 bg-[#0c0c0e]/95 space-y-4">
      {/* Header & Repo Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <a
              href={repository.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono font-semibold text-zinc-100 hover:underline flex items-center gap-1 focus-visible:outline-none rounded"
            >
              <span>{repository.repoOwner}/{repository.repoName}</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" aria-hidden="true" />
            </a>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-950 border border-white/[0.08] text-zinc-400">
              branch: {repository.defaultBranch}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400 font-mono">
            {repository.starsCount !== undefined && repository.starsCount !== null && (
              <span className="flex items-center gap-1 tabular-nums">
                <Star className="w-3 h-3 text-amber-400" aria-hidden="true" />
                <span>{repository.starsCount.toLocaleString()}</span>
              </span>
            )}
            {repository.forksCount !== undefined && repository.forksCount !== null && (
              <span className="flex items-center gap-1 tabular-nums">
                <GitFork className="w-3 h-3 text-zinc-400" aria-hidden="true" />
                <span>{repository.forksCount.toLocaleString()}</span>
              </span>
            )}
            <span className="text-[11px] text-zinc-500 tabular-nums">
              Connected {new Date(repository.connectedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-white/[0.08] hover:border-white/[0.16] text-xs text-zinc-200 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Sync Commits</span>
          </button>

          {canManage && (
            <button
              type="button"
              onClick={handleDisconnect}
              aria-label="Disconnect repository"
              className="p-2 rounded-lg bg-zinc-900/90 border border-white/[0.08] hover:border-rose-800/80 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Disconnect repository"
            >
              <Unlink className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div role="status" className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div role="alert" className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Linked Activities */}
      {activities.length > 0 && (
        <div>
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2.5">
            Linked GitHub Activity (<span className="tabular-nums">{activities.length}</span>)
          </h4>
          <div className="space-y-1.5">
            {activities.map((act) => (
              <div
                key={act.id}
                className="flex items-start justify-between gap-2 p-3 rounded-xl bg-zinc-950/60 border border-white/[0.06] text-xs"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  {act.activityType === 'COMMIT' ? (
                    <GitCommit className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  ) : (
                    <GitPullRequest className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <div className="min-w-0">
                    <a
                      href={act.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-zinc-200 hover:underline hover:text-white truncate block"
                    >
                      {act.title}
                    </a>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mt-1">
                      <span>{act.authorName || 'Unknown'}</span>
                      <span aria-hidden="true">•</span>
                      <span>Ref: {act.externalId.substring(0, 7)}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 flex-shrink-0 tabular-nums">
                  {new Date(act.eventTimestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
