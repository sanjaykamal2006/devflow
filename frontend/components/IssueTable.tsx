'use client';

import React from 'react';
import Link from 'next/link';
import { Issue } from '@/types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { TypeBadge } from './TypeBadge';
import { MessageSquare, GitCommit } from 'lucide-react';

interface IssueTableProps {
  issues: Issue[];
}

export function IssueTable({ issues }: IssueTableProps) {
  if (issues.length === 0) {
    return (
      <div className="border border-dashed border-white/[0.08] rounded-2xl p-12 text-center bg-zinc-950/40">
        <p className="text-zinc-300 text-xs font-medium">No issues match the selected filter criteria.</p>
        <p className="text-zinc-500 text-[11px] font-mono mt-1">Try clearing active filters or create a new issue.</p>
      </div>
    );
  }

  return (
    <div className="border border-white/[0.08] rounded-2xl overflow-hidden bg-[#0c0c0e]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] bg-zinc-950/70 text-zinc-400 font-mono uppercase text-[11px] tracking-wider">
              <th className="py-3 px-4 font-semibold">Key</th>
              <th className="py-3 px-4 font-semibold">Title</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Priority</th>
              <th className="py-3 px-4 font-semibold">Type</th>
              <th className="py-3 px-4 font-semibold">Assignee</th>
              <th className="py-3 px-4 font-semibold text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {issues.map((issue) => (
              <tr
                key={issue.id}
                className="hover:bg-zinc-900/40 transition-colors duration-150 cursor-pointer group"
              >
                {/* Key */}
                <td className="py-3 px-4 font-mono font-semibold text-zinc-400 group-hover:text-white whitespace-nowrap">
                  <Link
                    href={`/issues/${issue.id}`}
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
                    <span className="text-zinc-600 font-mono text-xs">—</span>
                  )}
                </td>

                {/* Date */}
                <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-xs text-zinc-500 tabular-nums">
                  {new Date(issue.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
