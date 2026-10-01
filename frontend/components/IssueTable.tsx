'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Issue, IssuePriority, IssueStatus, WorkspaceMember } from '@/types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { TypeBadge } from './TypeBadge';
import { MessageSquare, GitCommit, CheckSquare, Square, Trash2, UserCheck, X, Loader2, Keyboard } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ShortcutsModal } from './ShortcutsModal';

interface IssueTableProps {
  issues: Issue[];
  members?: WorkspaceMember[];
  onRefresh?: () => void;
}

export function IssueTable({ issues, members = [], onRefresh }: IssueTableProps) {
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchActionLoading, setBatchActionLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Status and Priority Dropdown state for bulk actions
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
  const [assignDropdownOpen, setAssignDropdownOpen] = useState(false);

  const allSelected = issues.length > 0 && selectedIds.size === issues.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(issues.map((i) => i.id)));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setStatusDropdownOpen(false);
    setPriorityDropdownOpen(false);
    setAssignDropdownOpen(false);
  };

  // Bulk Status Update
  const handleBulkStatus = async (newStatus: IssueStatus) => {
    if (selectedIds.size === 0) return;
    setBatchActionLoading(true);
    setStatusDropdownOpen(false);
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map((id) => api.issues.changeStatus(id, newStatus)));
      toast.success(`Updated status of ${ids.length} issues to ${newStatus.replace('_', ' ')}`);
      clearSelection();
      onRefresh?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bulk status update failed');
    } finally {
      setBatchActionLoading(false);
    }
  };

  // Bulk Priority Update
  const handleBulkPriority = async (newPriority: IssuePriority) => {
    if (selectedIds.size === 0) return;
    setBatchActionLoading(true);
    setPriorityDropdownOpen(false);
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map((id) => api.issues.update(id, { priority: newPriority })));
      toast.success(`Updated priority of ${ids.length} issues to ${newPriority}`);
      clearSelection();
      onRefresh?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bulk priority update failed');
    } finally {
      setBatchActionLoading(false);
    }
  };

  // Bulk Assign
  const handleBulkAssign = async (assigneeId: string | null) => {
    if (selectedIds.size === 0) return;
    setBatchActionLoading(true);
    setAssignDropdownOpen(false);
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map((id) => api.issues.assign(id, assigneeId || undefined)));
      toast.success(`Reassigned ${ids.length} issues`);
      clearSelection();
      onRefresh?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bulk assignment failed');
    } finally {
      setBatchActionLoading(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} selected issues? This action cannot be undone.`)) {
      return;
    }
    setBatchActionLoading(true);
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map((id) => api.issues.delete(id)));
      toast.success(`Deleted ${ids.length} issues`);
      clearSelection();
      onRefresh?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bulk delete failed');
    } finally {
      setBatchActionLoading(false);
    }
  };

  // Wire Vim power-user keyboard shortcuts
  useKeyboardShortcuts({
    onNextIssue: () => {
      setFocusedIndex((prev) => (prev === null || prev >= issues.length - 1 ? 0 : prev + 1));
    },
    onPrevIssue: () => {
      setFocusedIndex((prev) => (prev === null || prev <= 0 ? issues.length - 1 : prev - 1));
    },
    onToggleSelect: () => {
      if (focusedIndex !== null && issues[focusedIndex]) {
        const id = issues[focusedIndex].id;
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      }
    },
    onAssignMe: async () => {
      if (focusedIndex !== null && issues[focusedIndex] && user) {
        const issue = issues[focusedIndex];
        try {
          await api.issues.assign(issue.id, user.id);
          toast.success(`Assigned ${issue.issueKey} to you`);
          onRefresh?.();
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : 'Failed to assign issue');
        }
      }
    },
    onSetPriority: async (priority: IssuePriority) => {
      if (focusedIndex !== null && issues[focusedIndex]) {
        const issue = issues[focusedIndex];
        try {
          await api.issues.update(issue.id, { priority });
          toast.success(`Updated ${issue.issueKey} priority to ${priority}`);
          onRefresh?.();
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : 'Failed to update priority');
        }
      }
    },
    onDeleteIssue: async () => {
      if (selectedIds.size > 0) {
        handleBulkDelete();
        return;
      }
      if (focusedIndex !== null && issues[focusedIndex]) {
        const issue = issues[focusedIndex];
        if (confirm(`Delete issue ${issue.issueKey}?`)) {
          try {
            await api.issues.delete(issue.id);
            toast.success(`Deleted ${issue.issueKey}`);
            onRefresh?.();
          } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete issue');
          }
        }
      }
    },
    onToggleShortcuts: () => setShortcutsOpen((prev) => !prev),
    enabled: true,
  });

  if (issues.length === 0) {
    return (
      <>
        <div className="border border-dashed border-white/[0.08] rounded-2xl p-12 text-center bg-zinc-950/40">
          <p className="text-zinc-300 text-xs font-medium">No issues match the selected filter criteria.</p>
          <p className="text-zinc-500 text-[11px] font-mono mt-1">Try clearing active filters or create a new issue.</p>
        </div>
        <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      </>
    );
  }

  return (
    <div className="relative border border-white/[0.08] rounded-2xl overflow-hidden bg-[#0c0c0e]">
      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-0 z-30 bg-zinc-950/95 border-b border-sky-500/30 px-4 py-2.5 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded-full bg-sky-950/80 border border-sky-500/40 text-sky-400 font-mono text-[11px] font-semibold tabular-nums">
              {selectedIds.size} selected
            </span>
            <button
              type="button"
              onClick={clearSelection}
              className="text-zinc-500 hover:text-zinc-300 text-xs flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Deselect all</span>
            </button>
          </div>

          <div className="flex items-center gap-2 relative">
            {batchActionLoading && <Loader2 className="w-4 h-4 animate-spin text-sky-400" />}

            {/* Set Status Button & Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setStatusDropdownOpen(!statusDropdownOpen);
                  setPriorityDropdownOpen(false);
                  setAssignDropdownOpen(false);
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-white/[0.08] text-zinc-200 transition-colors flex items-center gap-1.5"
              >
                <span>Status</span>
                <span className="text-zinc-500 text-[10px]">▾</span>
              </button>
              {statusDropdownOpen && (
                <div className="absolute left-0 mt-1 w-36 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl py-1 z-40">
                  {(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as IssueStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleBulkStatus(st)}
                      className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Set Priority Button & Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setPriorityDropdownOpen(!priorityDropdownOpen);
                  setStatusDropdownOpen(false);
                  setAssignDropdownOpen(false);
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-855 border border-white/[0.08] text-zinc-200 transition-colors flex items-center gap-1.5"
              >
                <span>Priority</span>
                <span className="text-zinc-500 text-[10px]">▾</span>
              </button>
              {priorityDropdownOpen && (
                <div className="absolute left-0 mt-1 w-32 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl py-1 z-40">
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as IssuePriority[]).map((pr) => (
                    <button
                      key={pr}
                      type="button"
                      onClick={() => handleBulkPriority(pr)}
                      className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
                    >
                      {pr}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bulk Assign Button & Dropdown */}
            {members.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setAssignDropdownOpen(!assignDropdownOpen);
                    setStatusDropdownOpen(false);
                    setPriorityDropdownOpen(false);
                  }}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-white/[0.08] text-zinc-200 transition-colors flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Assign</span>
                  <span className="text-zinc-500 text-[10px]">▾</span>
                </button>
                {assignDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl py-1 z-40 max-h-48 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => handleBulkAssign(null)}
                      className="w-full text-left px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
                    >
                      Unassigned
                    </button>
                    <div className="border-t border-zinc-800 my-1" />
                    {members.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleBulkAssign(m.user.id)}
                        className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white truncate transition-colors"
                      >
                        {m.user.fullName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bulk Delete Button */}
            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 hover:text-white transition-colors flex items-center gap-1.5"
              title="Delete selected issues"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] bg-zinc-950/70 text-zinc-400 font-mono uppercase text-[11px] tracking-wider select-none">
              <th className="py-3 px-3 w-10 text-center">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  aria-label={allSelected ? 'Deselect all issues' : 'Select all issues'}
                  className="p-1 hover:text-white transition-colors"
                >
                  {allSelected ? (
                    <CheckSquare className="w-4 h-4 text-sky-400" />
                  ) : someSelected ? (
                    <CheckSquare className="w-4 h-4 text-sky-400/60" />
                  ) : (
                    <Square className="w-4 h-4 text-zinc-600" />
                  )}
                </button>
              </th>
              <th className="py-3 px-3 font-semibold">Key</th>
              <th className="py-3 px-4 font-semibold">Title</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Priority</th>
              <th className="py-3 px-4 font-semibold">Type</th>
              <th className="py-3 px-4 font-semibold">Assignee</th>
              <th className="py-3 px-4 font-semibold text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {issues.map((issue, index) => {
              const isSelected = selectedIds.has(issue.id);
              const isFocused = index === focusedIndex;

              return (
                <tr
                  key={issue.id}
                  onClick={(e) => {
                    setFocusedIndex(index);
                    toggleSelectOne(issue.id, e);
                  }}
                  className={`transition-colors duration-150 cursor-pointer group relative ${
                    isFocused ? 'ring-1 ring-cyan-500/70 bg-cyan-950/20' : ''
                  } ${
                    isSelected ? 'bg-sky-950/20' : 'hover:bg-zinc-900/40'
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => toggleSelectOne(issue.id, e)}
                      aria-label={`Select issue ${issue.issueKey}`}
                      className="p-1 hover:text-white transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-sky-400" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                      )}
                    </button>
                  </td>

                  {/* Key */}
                  <td className="py-3 px-3 font-mono font-semibold text-zinc-400 group-hover:text-white whitespace-nowrap">
                    <Link
                      href={`/issues/${issue.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:underline focus-visible:outline-none"
                    >
                      {issue.issueKey}
                    </Link>
                  </td>

                  {/* Title & Labels */}
                  <td className="py-3 px-4 max-w-md">
                    <div className="flex items-center gap-2.5">
                      <Link
                        href={`/issues/${issue.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-medium text-zinc-200 group-hover:text-white truncate"
                      >
                        {issue.title}
                      </Link>

                      {/* Metadata counts */}
                      <div className="flex items-center gap-2 flex-shrink-0 text-zinc-500 font-mono text-[11px] tabular-nums">
                        {issue.commentCount > 0 && (
                          <span className="flex items-center gap-1" title={`${issue.commentCount} comments`}>
                            <MessageSquare className="w-3 h-3 text-zinc-400" aria-hidden="true" />
                            <span>{issue.commentCount}</span>
                          </span>
                        )}
                        {issue.githubActivityCount > 0 && (
                          <span className="flex items-center gap-1 text-sky-400" title={`${issue.githubActivityCount} linked commits/PRs`}>
                            <GitCommit className="w-3 h-3" aria-hidden="true" />
                            <span>{issue.githubActivityCount}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {issue.labels && issue.labels.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {issue.labels.map((lbl) => (
                          <span
                            key={lbl.id}
                            className="text-[10px] px-1.5 py-0.5 rounded border border-white/[0.08] text-zinc-400 bg-zinc-950 font-mono"
                            style={{ borderColor: lbl.color ? `${lbl.color}40` : undefined }}
                          >
                            {lbl.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={issue.status} />
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <PriorityBadge priority={issue.priority} showIcon={false} size="sm" />
                  </td>

                  {/* Type */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <TypeBadge type={issue.issueType} size="sm" />
                  </td>

                  {/* Assignee */}
                  <td className="py-3 px-4 whitespace-nowrap text-zinc-400">
                    {issue.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/[0.1] flex items-center justify-center text-[10px] font-mono font-medium text-zinc-300 tabular-nums shadow-inner">
                          {issue.assignee.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[120px] text-xs text-zinc-300">{issue.assignee.fullName}</span>
                      </div>
                    ) : (
                      <span className="text-zinc-600 font-mono text-[11px]">Unassigned</span>
                    )}
                  </td>

                  {/* Created Date */}
                  <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-[11px] text-zinc-500 tabular-nums">
                    {new Date(issue.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Power-User Keyboard Hints Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-t border-white/[0.06] bg-zinc-950/80 text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-zinc-300">
            <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-white">Vim Engine</span>
          </span>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            <kbd className="px-1 py-0.5 rounded bg-zinc-900 border border-white/[0.08] text-zinc-300 text-[10px]">J</kbd> <kbd className="px-1 py-0.5 rounded bg-zinc-900 border border-white/[0.08] text-zinc-300 text-[10px]">K</kbd> navigate
          </span>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            <kbd className="px-1 py-0.5 rounded bg-zinc-900 border border-white/[0.08] text-zinc-300 text-[10px]">X</kbd> select
          </span>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            <kbd className="px-1 py-0.5 rounded bg-zinc-900 border border-white/[0.08] text-zinc-300 text-[10px]">Space</kbd> assign
          </span>
          <span className="text-zinc-600 hidden md:inline">•</span>
          <span className="hidden md:inline">
            <kbd className="px-1 py-0.5 rounded bg-zinc-900 border border-white/[0.08] text-zinc-300 text-[10px]">1-4</kbd> priority
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShortcutsOpen(true)}
          className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer text-zinc-400"
        >
          <span>Press</span>
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/[0.08] text-cyan-300 font-bold text-[10px]">?</kbd>
          <span>for shortcuts</span>
        </button>
      </div>

      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}
