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

const COLUMNS: { id: IssueStatus; title: string }[] = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'IN_REVIEW', title: 'In Review' },
  { id: 'DONE', title: 'Done' },
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
            className="bg-zinc-950/60 border border-white/10 rounded-[24px] p-3.5 flex flex-col min-h-[520px] shadow-sm backdrop-blur-sm"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-white">
                {col.title}
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                {colIssues.length}
              </span>
            </div>

            {/* Cards List */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {colIssues.length === 0 ? (
                <div className="h-28 border border-dashed border-white/10 rounded-[18px] flex items-center justify-center text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                  No issues
                </div>
              ) : (
                colIssues.map((issue) => {
                  const nextStatus = getNextStatus(issue.status);
                  const prevStatus = getPrevStatus(issue.status);

                  return (
                    <div
                      key={issue.id}
                      className="bg-zinc-950 border border-white/10 hover:border-[#FFC554]/50 rounded-[18px] p-4 transition-all duration-150 group shadow-sm hover:shadow-xl hover:shadow-[#FFC554]/5"
                    >
                      {/* Top Row: Key + Type + Priority */}
                      <div className="flex items-center justify-between gap-1 mb-2.5">
                        <Link
                          href={`/issues/${issue.id}`}
                          className="font-mono text-xs font-black text-[#FFC554] hover:underline"
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
                        className="text-xs font-bold text-white hover:text-[#FFC554] transition-colors line-clamp-2 mb-3 block leading-snug"
                      >
                        {issue.title}
                      </Link>

                      {/* Labels */}
                      {issue.labels && issue.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {issue.labels.map((lbl) => (
                            <span
                              key={lbl.id}
                              className="text-[10px] px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-zinc-400 font-medium"
                              style={{ borderColor: lbl.color ? `${lbl.color}40` : undefined }}
                            >
                              {lbl.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer: Assignee + Counts + Quick Action */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px] text-zinc-500">
                        <div className="flex items-center gap-2">
                          {issue.assignee ? (
                            <div
                              className="w-5 h-5 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[10px] text-zinc-200 font-bold"
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
                            <span className="flex items-center gap-0.5 text-[#FFC554] font-mono text-[10px]" title="Linked GitHub commits/PRs">
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
                              className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                              title={`Move to ${prevStatus}`}
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {nextStatus && (
                            <button
                              onClick={() => onStatusChange(issue.id, nextStatus)}
                              className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
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
