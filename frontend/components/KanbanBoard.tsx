'use client';

import React from 'react';
import Link from 'next/link';
import { Issue, IssueStatus } from '@/types';
import { PriorityBadge } from './PriorityBadge';
import { TypeBadge } from './TypeBadge';
import { MessageSquare, GitCommit, ArrowRight, ArrowLeft } from 'lucide-react';

interface KanbanBoardProps {
  issues: Issue[];
  onStatusChange: (issueId: string, newStatus: IssueStatus) => Promise<void>;
}

const COLUMNS: { id: IssueStatus; title: string; border: string }[] = [
  { id: 'TODO', title: 'To Do', border: 'border-zinc-800' },
  { id: 'IN_PROGRESS', title: 'In Progress', border: 'border-sky-900/50' },
  { id: 'IN_REVIEW', title: 'In Review', border: 'border-amber-900/50' },
  { id: 'DONE', title: 'Done', border: 'border-emerald-900/50' },
];

export function KanbanBoard({ issues, onStatusChange }: KanbanBoardProps) {
  const getIssuesForColumn = (status: IssueStatus) => {
    return issues.filter((i) => i.status === status);
  };

  const getNextStatus = (current: IssueStatus): IssueStatus | null => {
    if (current === 'TODO') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'IN_REVIEW';
    if (current === 'IN_REVIEW') return 'DONE';
    return null;
  };

  const getPrevStatus = (current: IssueStatus): IssueStatus | null => {
    if (current === 'DONE') return 'IN_REVIEW';
    if (current === 'IN_REVIEW') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'TODO';
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-stretch min-h-[calc(100vh-230px)]">
      {COLUMNS.map((col) => {
        const colIssues = getIssuesForColumn(col.id);

        return (
          <div
            key={col.id}
            className={`bg-zinc-900/30 border ${col.border} rounded-xl p-4 flex flex-col`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                {col.title}
              </span>
              <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 tabular-nums">
                {colIssues.length}
              </span>
            </div>

            {/* Cards List */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {colIssues.length === 0 ? (
                <div className="h-32 border border-dashed border-zinc-800/80 rounded-lg flex items-center justify-center text-xs text-zinc-600 font-mono">
                  No issues
                </div>
              ) : (
                colIssues.map((issue) => {
                  const nextStatus = getNextStatus(issue.status);
                  const prevStatus = getPrevStatus(issue.status);

                  return (
                    <div
                      key={issue.id}
                      className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus-within:border-zinc-700 rounded-lg p-4 transition-colors duration-150 shadow-sm group"
                    >
                      {/* Top Row: Key + Type + Priority */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <Link
                          href={`/issues/${issue.id}`}
                          className="font-mono text-xs font-bold text-zinc-400 hover:text-zinc-100 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 rounded"
                        >
                          {issue.issueKey}
                        </Link>
                        <div className="flex items-center gap-1.5">
                          <TypeBadge type={issue.issueType} />
                          <PriorityBadge priority={issue.priority} showIcon={false} />
                        </div>
                      </div>

                      {/* Title */}
                      <Link
                        href={`/issues/${issue.id}`}
                        className="text-sm font-medium text-zinc-100 hover:text-white line-clamp-2 mb-3 block leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 rounded"
                      >
                        {issue.title}
                      </Link>

                      {/* Labels */}
                      {issue.labels && issue.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {issue.labels.map((lbl) => (
                            <span
                              key={lbl.id}
                              className="text-xs px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 font-mono"
                              style={{ borderColor: lbl.color ? `${lbl.color}40` : undefined }}
                            >
                              {lbl.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer: Assignee + Counts + Quick Action */}
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-900 text-xs text-zinc-500">
                        <div className="flex items-center gap-2.5">
                          {issue.assignee ? (
                            <div
                              className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs text-zinc-300 font-mono font-medium tabular-nums"
                              title={`Assignee: ${issue.assignee.fullName}`}
                            >
                              {issue.assignee.fullName.charAt(0).toUpperCase()}
                            </div>
                          ) : (
                            <span className="text-zinc-600 text-xs font-mono">Unassigned</span>
                          )}

                          {issue.commentCount > 0 && (
                            <span className="flex items-center gap-1 text-zinc-400 font-mono text-xs tabular-nums">
                              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>{issue.commentCount}</span>
                            </span>
                          )}

                          {issue.githubActivityCount > 0 && (
                            <span className="flex items-center gap-1 text-sky-400 font-mono text-xs tabular-nums" title="Linked GitHub commits/PRs">
                              <GitCommit className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>{issue.githubActivityCount}</span>
                            </span>
                          )}
                        </div>

                        {/* Quick Status Advance / Regress Buttons */}
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity duration-150">
                          {prevStatus && (
                            <button
                              type="button"
                              onClick={() => onStatusChange(issue.id, prevStatus)}
                              className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 transition-colors duration-150"
                              title={`Move to ${prevStatus.replace('_', ' ')}`}
                              aria-label={`Move ${issue.issueKey} to ${prevStatus.replace('_', ' ')}`}
                            >
                              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          )}
                          {nextStatus && (
                            <button
                              type="button"
                              onClick={() => onStatusChange(issue.id, nextStatus)}
                              className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 transition-colors duration-150"
                              title={`Move to ${nextStatus.replace('_', ' ')}`}
                              aria-label={`Move ${issue.issueKey} to ${nextStatus.replace('_', ' ')}`}
                            >
                              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
