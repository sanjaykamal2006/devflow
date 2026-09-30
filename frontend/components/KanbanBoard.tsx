'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Issue, IssueStatus } from '@/types';
import { PriorityBadge } from './PriorityBadge';
import { TypeBadge } from './TypeBadge';
import { MessageSquare, GitCommit, ArrowRight, ArrowLeft, GripVertical } from 'lucide-react';
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

const COLUMNS: { id: IssueStatus; title: string; defaultBorder: string; activeBorder: string }[] = [
  { id: 'TODO', title: 'To Do', defaultBorder: 'border-zinc-800', activeBorder: 'border-zinc-500 bg-zinc-900/40' },
  { id: 'IN_PROGRESS', title: 'In Progress', defaultBorder: 'border-sky-950/60', activeBorder: 'border-sky-500/50 bg-sky-950/20' },
  { id: 'IN_REVIEW', title: 'In Review', defaultBorder: 'border-amber-950/60', activeBorder: 'border-amber-500/50 bg-amber-950/20' },
  { id: 'DONE', title: 'Done', defaultBorder: 'border-emerald-950/60', activeBorder: 'border-emerald-500/50 bg-emerald-950/20' },
];

const COLUMN_NAMES: Record<IssueStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
};

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
      className={`bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3.5 transition-all duration-150 group relative ${
        isDragging ? 'opacity-30 border-dashed border-zinc-600' : 'hover:border-zinc-700 hover:bg-zinc-900'
      }`}
    >
      {/* Drag handle & top row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-zinc-500 hover:text-zinc-300 rounded transition-colors touch-none"
            title="Drag to reorder"
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
          <TypeBadge type={issue.issueType} />
          <PriorityBadge priority={issue.priority} showIcon={false} />
        </div>
      </div>

      {/* Title */}
      <Link
        href={`/issues/${issue.id}`}
        className="text-xs font-medium text-zinc-200 hover:text-white line-clamp-2 mb-2.5 block leading-snug focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 rounded"
      >
        {issue.title}
      </Link>

      {/* Labels */}
      {issue.labels && issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {issue.labels.map((lbl) => (
            <span
              key={lbl.id}
              className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-950 text-zinc-400 font-mono"
              style={{ borderColor: lbl.color ? `${lbl.color}40` : undefined }}
            >
              {lbl.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Assignee + Counts + Quick Step Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs text-zinc-500">
        <div className="flex items-center gap-2 min-w-0">
          {issue.assignee ? (
            <div
              className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-300 font-mono font-medium tabular-nums shrink-0"
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

        {/* Quick status step buttons - visible on touch/hover */}
        <div className="flex items-center gap-1 opacity-75 md:opacity-0 group-hover:opacity-100 transition-opacity">
          {prevStatus && (
            <button
              type="button"
              onClick={() => onStatusChange(issue.id, prevStatus)}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
              title={`Move to ${COLUMN_NAMES[prevStatus]}`}
              aria-label={`Move ${issue.issueKey} to ${COLUMN_NAMES[prevStatus]}`}
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
          {nextStatus && (
            <button
              type="button"
              onClick={() => onStatusChange(issue.id, nextStatus)}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
              title={`Move to ${COLUMN_NAMES[nextStatus]}`}
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
    <div className="bg-zinc-900 border border-sky-500/60 rounded-xl p-3.5 shadow-2xl scale-[1.02] cursor-grabbing w-[280px]">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono text-xs font-bold text-sky-400">{issue.issueKey}</span>
        <div className="flex items-center gap-1.5">
          <TypeBadge type={issue.issueType} />
          <PriorityBadge priority={issue.priority} showIcon={false} />
        </div>
      </div>
      <p className="text-xs font-medium text-zinc-100 line-clamp-2 mb-2 leading-snug">{issue.title}</p>
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
        <span>{issue.assignee?.fullName || 'Unassigned'}</span>
        <span className="font-mono text-[10px] text-sky-400 uppercase">{COLUMN_NAMES[issue.status]}</span>
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
      className={`w-[82vw] sm:w-[320px] md:w-auto shrink-0 md:shrink snap-center rounded-2xl p-3.5 flex flex-col transition-all duration-150 border ${
        isOver ? col.activeBorder : `bg-zinc-950/70 ${col.defaultBorder}`
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-zinc-500" />
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
            {col.title}
          </span>
        </div>
        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 tabular-nums">
          {issues.length}
        </span>
      </div>

      {/* Cards Sortable Container */}
      <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2.5 flex-1 min-h-[160px] overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
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
