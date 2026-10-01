import React from 'react';
import { IssuePriority } from '@/types';

interface PriorityBadgeProps {
  priority: IssuePriority;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, className = '', showIcon = true, size = 'md' }: PriorityBadgeProps) {
  const meta: Record<
    IssuePriority,
    { color: string; bg: string; border: string; label: string; icon: React.ReactNode }
  > = {
    LOW: {
      color: 'text-zinc-400',
      bg: 'bg-zinc-900/60',
      border: 'border-zinc-800',
      label: 'Low',
      icon: (
        <svg className="w-3 h-3 text-zinc-400" viewBox="0 0 16 16" fill="none">
          <path d="M8 3.5V12.5M8 12.5L4.5 9M8 12.5L11.5 9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    MEDIUM: {
      color: 'text-sky-300',
      bg: 'bg-sky-950/40',
      border: 'border-sky-800/60',
      label: 'Medium',
      icon: (
        <svg className="w-3 h-3 text-sky-400" viewBox="0 0 16 16" fill="none">
          <path d="M3.5 8H12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    HIGH: {
      color: 'text-amber-300',
      bg: 'bg-amber-950/40',
      border: 'border-amber-800/60',
      label: 'High',
      icon: (
        <svg className="w-3 h-3 text-amber-400" viewBox="0 0 16 16" fill="none">
          <path d="M8 12.5V3.5M8 3.5L4.5 7M8 3.5L11.5 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    CRITICAL: {
      color: 'text-rose-300',
      bg: 'bg-rose-950/40',
      border: 'border-rose-800/60',
      label: 'Critical',
      icon: (
        <svg className="w-3 h-3 text-rose-400" viewBox="0 0 16 16" fill="none">
          <path d="M8 2.5L13.5 13.5H2.5L8 2.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 6.5V9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
        </svg>
      ),
    },
  };

  const current = meta[priority] || meta.MEDIUM;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium border select-none backdrop-blur-sm shadow-sm ${padding} ${current.bg} ${current.border} ${current.color} ${className}`}
    >
      {showIcon && current.icon}
      <span>{current.label}</span>
    </span>
  );
}
