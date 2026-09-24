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
  Loader2,
  GitBranch,
  Trash2,
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
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
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
      <div className="pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-sm font-mono text-zinc-400 mb-2">
          {workspace && (
            <>
              <Link href={`/workspaces/${workspace.id}`} className="hover:text-zinc-200">
                {workspace.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-zinc-200 font-bold">{project.key}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white">{project.name}</h1>
              <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                {project.key}
              </span>
            </div>
            {project.description && (
              <p className="text-sm text-zinc-400 mt-1 max-w-2xl">{project.description}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/projects/${project.id}/issues`}
              className="h-10 px-4 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg text-sm font-semibold transition flex items-center gap-2 shadow-sm"
            >
              <Kanban className="w-4 h-4" />
              <span>Issues & Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {canManage && (
              <button
                onClick={handleDeleteProject}
                className="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 hover:border-rose-800 text-zinc-400 hover:text-rose-400 transition"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
            Total Issues
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {project.totalIssues}
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-sky-400" />
            <span>Open Issues</span>
          </div>
          <div className="text-2xl font-bold font-mono text-sky-300">
            {project.openIssues}
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Completed</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            {project.doneIssues}
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span>Completion Rate</span>
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-200">
            {completionPercent}%
          </div>
        </div>
      </div>

      {/* GitHub Integration Panel */}
      <div>
        <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
          <GitBranch className="w-3.5 h-3.5 text-zinc-500" />
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
