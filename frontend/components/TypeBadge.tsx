import React from 'react';
import { IssueType } from '@/types';
import { CheckSquare, Bug, Sparkles } from 'lucide-react';

interface TypeBadgeProps {
  type: IssueType;
  className?: string;
  showIcon?: boolean;
}

export function TypeBadge({ type, className = '', showIcon = true }: TypeBadgeProps) {
  const meta: Record<IssueType, { color: string; label: string; icon: React.ReactNode }> = {
    TASK: {
      color: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/60',
      label: 'Task',
      icon: <CheckSquare className="w-3 h-3 text-indigo-400" />,
    },
    BUG: {
      color: 'text-rose-400 bg-rose-950/40 border-rose-800/60',
      label: 'Bug',
      icon: <Bug className="w-3 h-3 text-rose-400" />,
    },
    FEATURE: {
      color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60',
      label: 'Feature',
      icon: <Sparkles className="w-3 h-3 text-emerald-400" />,
    },
  };

  const current = meta[type] || meta.TASK;

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border ${current.color} ${className}`}
    >
      {showIcon && current.icon}
      <span>{current.label}</span>
    </span>
  );
}
