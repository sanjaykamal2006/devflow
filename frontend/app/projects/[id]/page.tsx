'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Project, GitHubRepository, Workspace } from '@/types';
import { api } from '@/lib/api';
import { GitHubPanel } from '@/components/GitHubPanel';
import {
  Kanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  GitBranch,
  Trash2,
  FolderGit2,
} from 'lucide-react';

export default function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [gitHubRepo, setGitHubRepo] = useState<GitHubRepository | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const proj = await api.projects.get(projectId);
      setProject(proj);

      const ws = await api.workspaces.get(proj.workspaceId);
      setWorkspace(ws);

      try {
        const repo = await api.github.getRepo(projectId);
        setGitHubRepo(repo);
      } catch {
        setGitHubRepo(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const canManage = workspace?.currentUserRole === 'OWNER' || workspace?.currentUserRole === 'ADMIN';

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project and all its issues?')) return;
    try {
      await api.projects.delete(projectId);
      if (workspace) router.push(`/workspaces/${workspace.id}`);
      else router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  if (loading && !project) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-6 animate-pulse">
        <div className="pb-6 border-b border-white/[0.06] space-y-3">
          <div className="h-4 bg-zinc-900 rounded w-36" />
          <div className="flex justify-between items-center">
            <div className="h-8 bg-zinc-900 rounded-lg w-56" />
            <div className="h-9 bg-zinc-900 rounded-lg w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-24 bg-zinc-900/60 border border-white/[0.06] rounded-2xl" />
          <div className="h-24 bg-zinc-900/60 border border-white/[0.06] rounded-2xl" />
          <div className="h-24 bg-zinc-900/60 border border-white/[0.06] rounded-2xl" />
          <div className="h-24 bg-zinc-900/60 border border-white/[0.06] rounded-2xl" />
        </div>
        <div className="h-64 bg-zinc-900/40 border border-white/[0.06] rounded-2xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-sm text-zinc-400">Project not found.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-xs font-mono text-zinc-300 underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const completionPercent = project.totalIssues > 0
    ? Math.round((project.doneIssues / project.totalIssues) * 100)
    : 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb & Header */}
      <div className="pb-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-2">
          {workspace && (
            <>
              <Link href={`/workspaces/${workspace.id}`} className="hover:text-zinc-300 transition-colors">
                {workspace.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-zinc-200 font-semibold">{project.key}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white">{project.name}</h1>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-white/[0.08]">
                {project.key}
              </span>
              {project.githubConnected && (
                <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-800/60">
                  <GitBranch className="w-3 h-3" aria-hidden="true" />
                  <span>GitHub linked</span>
                </span>
              )}
            </div>
            {project.description && (
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl">{project.description}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/projects/${project.id}/issues`}
              className="h-9 px-4 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-2 shadow-[0_0_16px_rgba(255,255,255,0.12)] cursor-pointer"
            >
              <Kanban className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Issues &amp; Board</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>

            {canManage && (
              <button
                type="button"
                onClick={handleDeleteProject}
                aria-label="Delete project"
                className="h-9 w-9 flex items-center justify-center rounded-lg bg-zinc-900/80 border border-white/[0.08] hover:border-rose-800 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="linear-card rounded-2xl p-4">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <FolderGit2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Total Issues</span>
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100 tabular-nums">
            {project.totalIssues}
          </div>
        </div>

        <div className="linear-card rounded-2xl p-4">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
            <span>Open Issues</span>
          </div>
          <div className="text-2xl font-bold font-mono text-sky-300 tabular-nums">
            {project.openIssues}
          </div>
        </div>

        <div className="linear-card rounded-2xl p-4">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            <span>Completed</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300 tabular-nums">
            {project.doneIssues}
          </div>
        </div>

        <div className="linear-card rounded-2xl p-4">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
            <span>Completion Rate</span>
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-200 tabular-nums">
            {completionPercent}%
          </div>
        </div>
      </div>

      {/* GitHub Integration Panel */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2 font-semibold">
          <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
          <span>GitHub Integration</span>
        </h2>
        <GitHubPanel
          projectId={projectId}
          repository={gitHubRepo}
          canManage={canManage}
          onRepoUpdated={loadData}
        />
      </div>
    </div>
  );
}
