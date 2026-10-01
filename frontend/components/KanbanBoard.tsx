'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Issue, IssueStatus } from '@/types';
import { PriorityBadge } from './PriorityBadge';
import { TypeBadge } from './TypeBadge';
import { MessageSquare, GitCommit, ArrowRight, ArrowLeft, GripVertical } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

interface KanbanBoardProps {
  issues: Issue[];
  onStatusChange: (issueId: string, newStatus: IssueStatus) => Promise<void>;
}

const COLUMNS: {
  id: IssueStatus;
  title: string;
  dotColor: string;
  headerBorder: string;
  defaultBorder: string;
  activeBorder: string;
}[] = [
  {
    id: 'TODO',
    title: 'To Do',
    dotColor: 'bg-zinc-400 shadow-[0_0_8px_rgba(161,161,170,0.4)]',
    headerBorder: 'border-zinc-800',
    defaultBorder: 'border-white/[0.06]',
    activeBorder: 'border-zinc-500 bg-zinc-900/60 shadow-[0_0_24px_rgba(255,255,255,0.04)]',
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress',
    dotColor: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)] animate-pulse',
    headerBorder: 'border-sky-900/40',
    defaultBorder: 'border-sky-950/40',
    activeBorder: 'border-sky-500/60 bg-sky-950/20 shadow-[0_0_24px_rgba(56,189,248,0.08)]',
  },
  {
    id: 'IN_REVIEW',
    title: 'In Review',
    dotColor: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
    headerBorder: 'border-amber-900/40',
    defaultBorder: 'border-amber-950/40',
    activeBorder: 'border-amber-500/60 bg-amber-950/20 shadow-[0_0_24px_rgba(251,191,36,0.08)]',
  },
  {
    id: 'DONE',
    title: 'Done',
    dotColor: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
    headerBorder: 'border-emerald-900/40',
    defaultBorder: 'border-emerald-950/40',
    activeBorder: 'border-emerald-500/60 bg-emerald-950/20 shadow-[0_0_24px_rgba(52,211,153,0.08)]',
  },
];

const COLUMN_NAMES: Record<IssueStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
};

function triggerCompletionCelebration() {
  try {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.75 },
      colors: ['#34d399', '#38bdf8', '#fbbf24', '#f472b6'],
      ticks: 180,
      disableForReducedMotion: true,
    });
  } catch {
    // Non-blocking fallback
  }
}

// Single draggable issue card
function SortableIssueCard({
  issue,
  onStatusChange,
  nextStatus,
  prevStatus,
}: {
  issue: Issue;
  onStatusChange: (issueId: string, newStatus: IssueStatus) => Promise<void>;
  nextStatus: IssueStatus | null;
  prevStatus: IssueStatus | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id, data: { issue } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`pinterest-card !p-3.5 !rounded-2xl transition-all duration-200 group relative ${
        isDragging ? 'opacity-20 border-dashed border-sky-400/80 scale-[0.98]' : 'hover:border-white/[0.2]'
      }`}
    >
      {/* Drag handle & top row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-zinc-500 hover:text-zinc-200 rounded-full transition-colors touch-none"
            title="Drag to reposition"
            aria-label="Drag handle"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
          <Link
            href={`/issues/${issue.id}`}
            className="font-mono text-xs font-semibold text-zinc-400 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 rounded shrink-0"
          >
            {issue.issueKey}
          </Link>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <TypeBadge type={issue.issueType} size="sm" />
          <PriorityBadge priority={issue.priority} showIcon={false} size="sm" />
        </div>
      </div>

      {/* Title */}
      <Link
        href={`/issues/${issue.id}`}
        className="text-xs font-medium text-zinc-100 hover:text-white line-clamp-2 mb-2.5 block leading-snug focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 rounded"
      >
        {issue.title}
      </Link>

      {/* Labels */}
      {issue.labels && issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {issue.labels.map((lbl) => (
            <span
              key={lbl.id}
              className="text-[10px] px-2 py-0.5 rounded-full border border-white/[0.08] bg-white/[0.04] text-zinc-300 font-mono shadow-sm"
              style={{ borderColor: lbl.color ? `${lbl.color}50` : undefined }}
            >
              {lbl.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Assignee + Counts + Quick Step Buttons */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-xs text-zinc-500">
        <div className="flex items-center gap-2 min-w-0">
          {issue.assignee ? (
            <div
              className="w-5 h-5 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/[0.14] flex items-center justify-center text-[10px] text-zinc-200 font-mono font-medium tabular-nums shrink-0 shadow-inner"
              title={`Assignee: ${issue.assignee.fullName}`}
            >
              {issue.assignee.fullName.charAt(0).toUpperCase()}
            </div>
          ) : (
            <span className="text-zinc-600 text-[10px] font-mono">Unassigned</span>
          )}

          {issue.commentCount > 0 && (
            <span className="flex items-center gap-1 text-zinc-400 font-mono text-[11px] tabular-nums">
              <MessageSquare className="w-3 h-3" aria-hidden="true" />
              <span>{issue.commentCount}</span>
            </span>
          )}

          {issue.githubActivityCount > 0 && (
            <span
              className="flex items-center gap-1 text-sky-400 font-mono text-[11px] tabular-nums"
              title="Linked GitHub commits/PRs"
            >
              <GitCommit className="w-3 h-3" aria-hidden="true" />
              <span>{issue.githubActivityCount}</span>
            </span>
          )}
        </div>

        {/* Quick status step buttons */}
        <div className="flex items-center gap-0.5 opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity">
          {prevStatus && (
            <button
              type="button"
              onClick={() => onStatusChange(issue.id, prevStatus)}
              className="p-1 hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 rounded-full transition-colors cursor-pointer"
              title={`Move back to ${COLUMN_NAMES[prevStatus]}`}
              aria-label={`Move ${issue.issueKey} to ${COLUMN_NAMES[prevStatus]}`}
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
          {nextStatus && (
            <button
              type="button"
              onClick={() => {
                onStatusChange(issue.id, nextStatus);
                if (nextStatus === 'DONE') triggerCompletionCelebration();
              }}
              className="p-1 hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 rounded-full transition-colors cursor-pointer"
              title={`Advance to ${COLUMN_NAMES[nextStatus]}`}
              aria-label={`Move ${issue.issueKey} to ${COLUMN_NAMES[nextStatus]}`}
            >
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Visual Card for DragOverlay
function OverlayIssueCard({ issue }: { issue: Issue }) {
  return (
    <div className="bg-zinc-900 border border-sky-400/80 rounded-xl p-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.8)] scale-[1.03] cursor-grabbing w-[280px] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono text-xs font-bold text-sky-400">{issue.issueKey}</span>
        <div className="flex items-center gap-1.5">
          <TypeBadge type={issue.issueType} size="sm" />
          <PriorityBadge priority={issue.priority} showIcon={false} size="sm" />
        </div>
      </div>
      <p className="text-xs font-medium text-zinc-100 line-clamp-2 mb-2 leading-snug">{issue.title}</p>
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
        <span>{issue.assignee?.fullName || 'Unassigned'}</span>
        <span className="font-mono text-[10px] text-sky-400 uppercase tracking-wider font-semibold">
          {COLUMN_NAMES[issue.status]}
        </span>
      </div>
    </div>
  );
}

// Droppable Column Component
function DroppableColumn({
  col,
  issues,
  onStatusChange,
  getNextStatus,
  getPrevStatus,
}: {
  col: (typeof COLUMNS)[0];
  issues: Issue[];
  onStatusChange: (issueId: string, newStatus: IssueStatus) => Promise<void>;
  getNextStatus: (s: IssueStatus) => IssueStatus | null;
  getPrevStatus: (s: IssueStatus) => IssueStatus | null;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: col.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-[82vw] sm:w-[320px] md:w-auto shrink-0 md:shrink snap-center rounded-2xl p-3 flex flex-col transition-all duration-200 border ${
        isOver
          ? col.activeBorder
          : `bg-[#0c0c0e]/80 ${col.defaultBorder} shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]`
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06] px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
            {col.title}
          </span>
        </div>
        <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-zinc-300 tabular-nums shadow-sm">
          {issues.length}
        </span>
      </div>

      {/* Cards Sortable Container */}
      <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 flex-1 min-h-[160px] overflow-y-auto max-h-[calc(100vh-270px)] pr-0.5">
          {issues.length === 0 ? (
            <div className="h-28 border border-dashed border-zinc-800/80 rounded-xl flex items-center justify-center text-[11px] text-zinc-600 font-mono select-none">
              No issues in {col.title}
            </div>
          ) : (
            issues.map((issue) => (
              <SortableIssueCard
                key={issue.id}
                issue={issue}
                onStatusChange={onStatusChange}
                nextStatus={getNextStatus(issue.status)}
                prevStatus={getPrevStatus(issue.status)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function KanbanBoard({ issues, onStatusChange }: KanbanBoardProps) {
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    const issue = issues.find((i) => i.id === event.active.id);
    if (issue) {
      setActiveIssue(issue);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over) return;

    const issueId = String(active.id);
    const draggedIssue = issues.find((i) => i.id === issueId);
    if (!draggedIssue) return;

    let targetStatus: IssueStatus | null = null;

    if (COLUMNS.some((c) => c.id === over.id)) {
      targetStatus = over.id as IssueStatus;
    } else {
      const overIssue = issues.find((i) => i.id === over.id);
      if (overIssue) {
        targetStatus = overIssue.status;
      }
    }

    if (targetStatus && targetStatus !== draggedIssue.status) {
      const oldStatus = draggedIssue.status;

      if (targetStatus === 'DONE') {
        triggerCompletionCelebration();
      }

      try {
        await onStatusChange(issueId, targetStatus);
        toast.success(`${draggedIssue.issueKey} moved to ${COLUMN_NAMES[targetStatus]}`, {
          action: {
            label: 'Undo',
            onClick: () => onStatusChange(issueId, oldStatus),
          },
        });
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to update issue status');
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Responsive layout: smooth horizontal snap scroll on mobile, 4-column grid on desktop */}
      <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 snap-x snap-mandatory md:snap-none items-start min-h-[calc(100vh-230px)]">
        {COLUMNS.map((col) => (
          <DroppableColumn
            key={col.id}
            col={col}
            issues={getIssuesForColumn(col.id)}
            onStatusChange={onStatusChange}
            getNextStatus={getNextStatus}
            getPrevStatus={getPrevStatus}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeIssue ? <OverlayIssueCard issue={activeIssue} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
