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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
      {COLUMNS.map((col) => {
        const colIssues = getIssuesForColumn(col.id);

        return (
          <div
            key={col.id}
            className={`bg-zinc-900/30 border ${col.border} rounded-lg p-3 flex flex-col min-h-[500px]`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-zinc-800/80">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                {col.title}
              </span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                {colIssues.length}
              </span>
            </div>

            {/* Cards List */}
            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {colIssues.length === 0 ? (
                <div className="h-28 border border-dashed border-zinc-800/80 rounded flex items-center justify-center text-xs text-zinc-600 font-mono">
                  No issues
                </div>
              ) : (
                colIssues.map((issue) => {
                  const nextStatus = getNextStatus(issue.status);
                  const prevStatus = getPrevStatus(issue.status);

                  return (
                    <div
                      key={issue.id}
                      className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-md p-3 transition shadow-sm group"
                    >
                      {/* Top Row: Key + Type + Priority */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <Link
                          href={`/issues/${issue.id}`}
                          className="font-mono text-xs font-semibold text-zinc-400 hover:text-zinc-100 hover:underline"
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
                        className="text-xs font-medium text-zinc-200 hover:text-white line-clamp-2 mb-2 block leading-snug"
                      >
                        {issue.title}
                      </Link>

                      {/* Labels */}
                      {issue.labels && issue.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {issue.labels.map((lbl) => (
                            <span
                              key={lbl.id}
                              className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400"
                              style={{ borderColor: lbl.color ? `${lbl.color}40` : undefined }}
                            >
                              {lbl.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer: Assignee + Counts + Quick Action */}
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-[11px] text-zinc-500">
                        <div className="flex items-center gap-2">
                          {issue.assignee ? (
                            <div
                              className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-300 font-mono"
                              title={`Assignee: ${issue.assignee.fullName}`}
                            >
                              {issue.assignee.fullName.charAt(0).toUpperCase()}
                            </div>
                          ) : (
                            <span className="text-zinc-600 text-[10px] font-mono">Unassigned</span>
                          )}

                          {issue.commentCount > 0 && (
                            <span className="flex items-center gap-0.5 text-zinc-400 font-mono text-[10px]">
                              <MessageSquare className="w-3 h-3" />
                              {issue.commentCount}
                            </span>
                          )}

                          {issue.githubActivityCount > 0 && (
                            <span className="flex items-center gap-0.5 text-sky-400 font-mono text-[10px]" title="Linked GitHub commits/PRs">
                              <GitCommit className="w-3 h-3" />
                              {issue.githubActivityCount}
                            </span>
                          )}
                        </div>

                        {/* Quick Status Advance / Regress Buttons */}
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">
                          {prevStatus && (
                            <button
                              onClick={() => onStatusChange(issue.id, prevStatus)}
                              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200"
                              title={`Move to ${prevStatus}`}
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {nextStatus && (
                            <button
                              onClick={() => onStatusChange(issue.id, nextStatus)}
                              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200"
                              title={`Move to ${nextStatus}`}
                            >
                              <ArrowRight className="w-3 h-3" />
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
