import React from 'react';
import { IssuePriority } from '@/types';
import { ArrowDown, ArrowUp, AlertOctagon, Minus } from 'lucide-react';

interface PriorityBadgeProps {
  priority: IssuePriority;
  className?: string;
  showIcon?: boolean;
}

export function PriorityBadge({ priority, className = '', showIcon = true }: PriorityBadgeProps) {
  const meta: Record<IssuePriority, { color: string; label: string; icon: React.ReactNode }> = {
    LOW: {
      color: 'text-zinc-400 bg-zinc-800/40 border-zinc-700/60',
      label: 'Low',
      icon: <ArrowDown className="w-3 h-3 text-zinc-400" />,
    },
    MEDIUM: {
      color: 'text-blue-400 bg-blue-950/40 border-blue-800/60',
      label: 'Medium',
      icon: <Minus className="w-3 h-3 text-blue-400" />,
    },
    HIGH: {
      color: 'text-amber-400 bg-amber-950/40 border-amber-800/60',
      label: 'High',
      icon: <ArrowUp className="w-3 h-3 text-amber-400" />,
    },
    CRITICAL: {
      color: 'text-rose-400 bg-rose-950/40 border-rose-800/60',
      label: 'Critical',
      icon: <AlertOctagon className="w-3 h-3 text-rose-400" />,
    },
  };

  const current = meta[priority] || meta.MEDIUM;

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-mono font-medium border ${current.color} ${className}`}
    >
      {showIcon && current.icon}
      <span>{current.label}</span>
    </span>
  );
}
