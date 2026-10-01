import React from 'react';
import { IssueType } from '@/types';

interface TypeBadgeProps {
  type: IssueType;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export function TypeBadge({ type, className = '', showIcon = true, size = 'md' }: TypeBadgeProps) {
  const meta: Record<
    IssueType,
    { color: string; bg: string; border: string; label: string; icon: React.ReactNode }
  > = {
    TASK: {
      color: 'text-zinc-300',
      bg: 'bg-zinc-900/60',
      border: 'border-zinc-800',
      label: 'Task',
      icon: (
        <svg className="w-3 h-3 text-zinc-400" viewBox="0 0 16 16" fill="none">
          <rect x="3" y="3" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 8L7.5 9.5L10 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    BUG: {
      color: 'text-rose-300',
      bg: 'bg-rose-950/40',
      border: 'border-rose-800/60',
      label: 'Bug',
      icon: (
        <svg className="w-3 h-3 text-rose-400" viewBox="0 0 16 16" fill="none">
          <path d="M5.5 6.5C5.5 5.11929 6.61929 4 8 4C9.38071 4 10.5 5.11929 10.5 6.5V9.5C10.5 10.8807 9.38071 12 8 12C6.61929 12 5.5 10.8807 5.5 9.5V6.5Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 7H5.5M10.5 7H13M3 10H5.5M10.5 10H13M6 4L4.5 2.5M10 4L11.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    FEATURE: {
      color: 'text-emerald-300',
      bg: 'bg-emerald-950/40',
      border: 'border-emerald-800/60',
      label: 'Feature',
      icon: (
        <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 16 16" fill="none">
          <path d="M8 2L9.5 5.5L13 6.5L10.5 9.5L11 13L8 11.5L5 13L5.5 9.5L3 6.5L6.5 5.5L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  };

  const current = meta[type] || meta.TASK;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border select-none backdrop-blur-sm shadow-sm ${padding} ${current.bg} ${current.border} ${current.color} ${className}`}
    >
      {showIcon && current.icon}
      <span>{current.label}</span>
    </span>
  );
}
