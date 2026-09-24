'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { Issue, IssuePriority, IssueStatus, IssueType, Label, Project, Workspace, WorkspaceMember } from '@/types';
import { api } from '@/lib/api';
import { KanbanBoard } from '@/components/KanbanBoard';
import { IssueTable } from '@/components/IssueTable';
import { CreateIssueModal } from '@/components/CreateIssueModal';
import {
  Kanban,
  Table as TableIcon,
  Plus,
  Search,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  GitBranch,
} from 'lucide-react';

export default function ProjectIssuesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<Project | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);

  // View mode
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority | ''>('');
  const [typeFilter, setTypeFilter] = useState<IssueType | ''>('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');
  const [labelFilter, setLabelFilter] = useState<string>('');

  // Pagination for table view
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const proj = await api.projects.get(projectId);
      setProject(proj);

      const [ws, lbls, mems] = await Promise.all([
        api.workspaces.get(proj.workspaceId),
        api.labels.list(projectId),
        api.workspaces.getMembers(proj.workspaceId),
      ]);
      setWorkspace(ws);
      setLabels(lbls);
      setMembers(mems);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchIssues = useCallback(async () => {
    try {
      const res = await api.issues.list(projectId, {
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        issueType: typeFilter || undefined,
        assigneeId: assigneeFilter || undefined,
        labelId: labelFilter || undefined,
        search: search.trim() || undefined,
        page: viewMode === 'table' ? page : 0,
        size: viewMode === 'table' ? 20 : 100, // Fetch up to 100 for Kanban
      });
      setIssues(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch issues');
    }
  }, [projectId, statusFilter, priorityFilter, typeFilter, assigneeFilter, labelFilter, search, page, viewMode]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleStatusChange = async (issueId: string, newStatus: IssueStatus) => {
    try {
      const updated = await api.issues.changeStatus(issueId, newStatus);
      setIssues((prev) => prev.map((i) => (i.id === issueId ? updated : i)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update issue status');
    }
  };

  const hasActiveFilters = Boolean(
    search || statusFilter || priorityFilter || typeFilter || assigneeFilter || labelFilter
  );

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setTypeFilter('');
    setAssigneeFilter('');
    setLabelFilter('');
    setPage(0);
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      {/* Top Header: Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1.5 uppercase tracking-wider">
            {workspace && (
              <>
                <Link href={`/workspaces/${workspace.id}`} className="hover:text-zinc-300">
                  {workspace.name}
                </Link>
                <span>/</span>
              </>
            )}
            <Link href={`/projects/${project.id}`} className="hover:text-zinc-300">
              {project.name}
            </Link>
            <span>/</span>
            <span className="text-white font-bold">Issues</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">{project.key} Board</h1>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400">
              {totalElements} issues
            </span>
            {project.githubConnected && (
              <Link
                href={`/projects/${project.id}`}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20"
              >
                <GitBranch className="w-3 h-3" />
                <span>GitHub Sync</span>
              </Link>
            )}
          </div>
        </div>

        {/* View Toggle & New Issue Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                viewMode === 'kanban'
                  ? 'bg-[#FFC554] text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                viewMode === 'table'
                  ? 'bg-[#FFC554] text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-[#FFC554] hover:bg-[#ffd166] text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg shadow-[#FFC554]/10 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Issue</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-zinc-950/80 border border-white/10 rounded-[22px] p-3.5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search issues..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full bg-white/[0.03] border border-white/10 focus:border-[#FFC554] focus:outline-none rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 font-medium transition-all"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as IssueStatus | '');
                setPage(0);
              }}
              className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#FFC554] font-bold uppercase tracking-wider"
            >
              <option value="">Status: All</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value as IssuePriority | '');
                setPage(0);
              }}
              className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#FFC554] font-bold uppercase tracking-wider"
            >
              <option value="">Priority: All</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as IssueType | '');
                setPage(0);
              }}
              className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#FFC554] font-bold uppercase tracking-wider"
            >
              <option value="">Type: All</option>
              <option value="TASK">Task</option>
              <option value="BUG">Bug</option>
              <option value="FEATURE">Feature</option>
            </select>

            {/* Assignee Filter */}
            <select
              value={assigneeFilter}
              onChange={(e) => {
                setAssigneeFilter(e.target.value);
                setPage(0);
              }}
              className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#FFC554] font-bold uppercase tracking-wider"
            >
              <option value="">Assignee: All</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.fullName}
                </option>
              ))}
            </select>

            {/* Label Filter */}
            {labels.length > 0 && (
              <select
                value={labelFilter}
                onChange={(e) => {
                  setLabelFilter(e.target.value);
                  setPage(0);
                }}
                className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#FFC554] font-bold uppercase tracking-wider"
              >
                <option value="">Label: All</option>
                {labels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl transition"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main View: Kanban or Table */}
      {viewMode === 'kanban' ? (
        <KanbanBoard issues={issues} onStatusChange={handleStatusChange} />
      ) : (
        <div className="space-y-4">
          <IssueTable issues={issues} />

          {/* Table Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between py-2 text-xs text-zinc-400 font-mono">
              <div>
                Page {page + 1} of {totalPages} ({totalElements} issues)
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 disabled:opacity-40"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Issue Modal */}
      <CreateIssueModal
        projectId={projectId}
        projectKey={project.key}
        labels={labels}
        members={members}
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={(newIssue) => {
          setIssues((prev) => [newIssue, ...prev]);
          setTotalElements((cnt) => cnt + 1);
        }}
      />
    </div>
  );
}
