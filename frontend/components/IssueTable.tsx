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
      <div className="border border-zinc-800 rounded-lg p-12 text-center bg-zinc-900/20">
        <p className="text-zinc-400 text-sm font-medium">No issues match the selected criteria.</p>
        <p className="text-zinc-600 text-xs mt-1">Try clearing filters or create a new issue.</p>
      </div>
    );
  }

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 font-mono uppercase text-xs tracking-wider">
              <th className="py-3 px-4 font-semibold">Key</th>
              <th className="py-3 px-4 font-semibold">Title</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Priority</th>
              <th className="py-3 px-4 font-semibold">Type</th>
              <th className="py-3 px-4 font-semibold">Assignee</th>
              <th className="py-3 px-4 font-semibold text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {issues.map((issue) => (
              <tr
                key={issue.id}
                className="hover:bg-zinc-900/50 transition cursor-pointer group"
              >
                {/* Key */}
                <td className="py-3 px-4 font-mono font-semibold text-zinc-400 group-hover:text-zinc-200 whitespace-nowrap">
                  <Link href={`/issues/${issue.id}`} className="hover:underline">
                    {issue.issueKey}
                  </Link>
                </td>

                {/* Title & Labels */}
                <td className="py-3 px-4 max-w-md">
                  <div className="flex items-center gap-2.5">
                    <Link
                      href={`/issues/${issue.id}`}
                      className="text-sm font-medium text-zinc-200 group-hover:text-white truncate"
                    >
                      {issue.title}
                    </Link>

                    {/* Metadata counts */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 text-zinc-500 font-mono text-xs">
                      {issue.commentCount > 0 && (
                        <span className="flex items-center gap-1" title={`${issue.commentCount} comments`}>
                          <MessageSquare className="w-3.5 h-3.5" />
                          {issue.commentCount}
                        </span>
                      )}
                      {issue.githubActivityCount > 0 && (
                        <span className="flex items-center gap-1 text-sky-400" title={`${issue.githubActivityCount} linked commits/PRs`}>
                          <GitCommit className="w-3.5 h-3.5" />
                          {issue.githubActivityCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {issue.labels && issue.labels.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {issue.labels.map((lbl) => (
                        <span
                          key={lbl.id}
                          className="text-xs px-2 py-0.5 rounded border border-zinc-800 text-zinc-400 bg-zinc-900 font-mono"
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
                  <PriorityBadge priority={issue.priority} />
                </td>

                {/* Type */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <TypeBadge type={issue.issueType} />
                </td>

                {/* Assignee */}
                <td className="py-3 px-4 whitespace-nowrap text-zinc-400">
                  {issue.assignee ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono font-medium text-zinc-300">
                        {issue.assignee.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate max-w-[120px] text-xs text-zinc-300">{issue.assignee.fullName}</span>
                    </div>
                  ) : (
                    <span className="text-zinc-600 font-mono text-xs">—</span>
                  )}
                </td>

                {/* Date */}
                <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-xs text-zinc-500">
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
