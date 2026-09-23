import React from 'react';
import { IssueStatus } from '@/types';

interface StatusBadgeProps {
  status: IssueStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const styles: Record<IssueStatus, { bg: string; text: string; dot: string; label: string }> = {
    TODO: {
      bg: 'bg-zinc-800/80 border-zinc-700',
      text: 'text-zinc-300',
      dot: 'bg-zinc-400',
      label: 'Todo',
    },
    IN_PROGRESS: {
      bg: 'bg-sky-950/60 border-sky-800/80',
      text: 'text-sky-300',
      dot: 'bg-sky-400',
      label: 'In Progress',
    },
    IN_REVIEW: {
      bg: 'bg-amber-950/60 border-amber-800/80',
      text: 'text-amber-300',
      dot: 'bg-amber-400',
      label: 'In Review',
    },
    DONE: {
      bg: 'bg-emerald-950/60 border-emerald-800/80',
      text: 'text-emerald-300',
      dot: 'bg-emerald-400',
      label: 'Done',
    },
  };

  const current = styles[status] || styles.TODO;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${current.bg} ${current.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
}
