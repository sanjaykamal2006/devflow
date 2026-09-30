import React from 'react';
import { IssueStatus } from '@/types';

interface StatusBadgeProps {
  status: IssueStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, className = '', size = 'md' }: StatusBadgeProps) {
  const configs: Record<
    IssueStatus,
    { bg: string; text: string; border: string; label: string; icon: React.ReactNode }
  > = {
    TODO: {
      bg: 'bg-zinc-900/80',
      border: 'border-zinc-700/60',
      text: 'text-zinc-300',
      label: 'Todo',
      icon: (
        <svg className="w-3 h-3 text-zinc-400" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.75" strokeDasharray="3 3" />
        </svg>
      ),
    },
    IN_PROGRESS: {
      bg: 'bg-sky-950/40',
      border: 'border-sky-800/60',
      text: 'text-sky-300',
      label: 'In Progress',
      icon: (
        <svg className="w-3 h-3 text-sky-400 animate-[spin_4s_linear_infinite]" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.75" strokeOpacity="0.25" />
          <path d="M14 8A6 6 0 0 0 8 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      ),
    },
    IN_REVIEW: {
      bg: 'bg-amber-950/40',
      border: 'border-amber-800/60',
      text: 'text-amber-300',
      label: 'In Review',
      icon: (
        <svg className="w-3 h-3 text-amber-400" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="8" cy="8" r="2.5" fill="currentColor" />
        </svg>
      ),
    },
    DONE: {
      bg: 'bg-emerald-950/40',
      border: 'border-emerald-800/60',
      text: 'text-emerald-300',
      label: 'Done',
      icon: (
        <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.75" />
          <path d="M5.5 8.5L7 10L10.5 6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  };

  const current = configs[status] || configs.TODO;
  const padding = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium border font-sans select-none backdrop-blur-sm ${padding} ${current.bg} ${current.border} ${current.text} ${className}`}
    >
      {current.icon}
      <span>{current.label}</span>
    </span>
  );
}
