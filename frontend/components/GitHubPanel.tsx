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
      setSuccessMsg('GitHub repository connected successfully');
      setOwner('');
      setName('');
      setWebhookSecret('');
      onRepoUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to connect repository');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect this repository?')) return;
    try {
      await api.github.disconnect(projectId);
      onRepoUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await api.github.sync(projectId);
      setSuccessMsg(`Synced! Linked ${res.newlyLinkedCommits} new commit(s).`);
      onRepoUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sync commits');
    } finally {
      setSyncing(false);
    }
  };

  if (!repository) {
    return (
      <div className="border border-zinc-800 rounded-lg p-5 bg-zinc-950">
        <div className="flex items-center gap-2 mb-2 text-zinc-100 font-semibold text-sm">
          <GitBranch className="w-4 h-4 text-zinc-400" />
          <span>Connect GitHub Repository</span>
        </div>
        <p className="text-xs text-zinc-400 mb-4">
          Link a GitHub repository to automatically associate commit messages and pull requests referencing issue keys (e.g., <code className="font-mono text-zinc-300">#API-37</code> or <code className="font-mono text-zinc-300">API-37 Fix bug</code>).
        </p>

        {error && (
          <div className="mb-3 p-2 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {canManage ? (
          <form onSubmit={handleConnect} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Repo Owner</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. vercel"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Repo Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. next.js"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                Webhook Secret <span className="text-zinc-500">(Optional)</span>
              </label>
              <input
                type="password"
                placeholder="Optional HMAC webhook secret"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={connecting}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-xs font-medium transition flex items-center gap-1.5"
            >
              {connecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
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
    <div className="border border-zinc-800 rounded-lg p-5 bg-zinc-950 space-y-4">
      {/* Header & Repo Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-emerald-400" />
            <a
              href={repository.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono font-semibold text-zinc-100 hover:underline flex items-center gap-1"
            >
              <span>{repository.repoOwner}/{repository.repoName}</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
              branch: {repository.defaultBranch}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-1.5 text-xs text-zinc-400 font-mono">
            {repository.starsCount !== undefined && repository.starsCount !== null && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" />
                {repository.starsCount.toLocaleString()}
              </span>
            )}
            {repository.forksCount !== undefined && repository.forksCount !== null && (
              <span className="flex items-center gap-1">
                <GitFork className="w-3 h-3 text-zinc-400" />
                {repository.forksCount.toLocaleString()}
              </span>
            )}
            <span className="text-[11px] text-zinc-500">
              Connected {new Date(repository.connectedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 flex items-center gap-1.5 font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>Sync Commits</span>
          </button>

          {canManage && (
            <button
              onClick={handleDisconnect}
              className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-rose-800 text-zinc-500 hover:text-rose-400 transition"
              title="Disconnect repository"
            >
              <Unlink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-2 rounded bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Linked Activities */}
      {activities.length > 0 && (
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
            Linked GitHub Activity ({activities.length})
          </h4>
          <div className="space-y-1.5">
            {activities.map((act) => (
              <div
                key={act.id}
                className="flex items-start justify-between gap-2 p-2 rounded bg-zinc-900/60 border border-zinc-800 text-xs"
              >
                <div className="flex items-start gap-2 min-w-0">
                  {act.activityType === 'COMMIT' ? (
                    <GitCommit className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <GitPullRequest className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
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
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-0.5">
                      <span>{act.authorName || 'Unknown'}</span>
                      <span>•</span>
                      <span>{act.externalId.substring(0, 7)}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 flex-shrink-0">
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
