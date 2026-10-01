'use client';

import React, { useState } from 'react';
import { Issue, IssuePriority, IssueType, Label, WorkspaceMember } from '@/types';
import { api } from '@/lib/api';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { MarkdownEditor } from './MarkdownContent';

interface CreateIssueModalProps {
  projectId: string;
  projectKey: string;
  labels: Label[];
  members: WorkspaceMember[];
  isOpen: boolean;
  onClose: () => void;
  onCreated: (issue: Issue) => void;
}

export function CreateIssueModal({
  projectId,
  projectKey,
  labels,
  members,
  isOpen,
  onClose,
  onCreated,
}: CreateIssueModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState<IssueType>('TASK');
  const [priority, setPriority] = useState<IssuePriority>('MEDIUM');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleLabel = (labelId: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const newIssue = await api.issues.create(projectId, {
        title: title.trim(),
        description: description.trim() || undefined,
        issueType,
        priority,
        assigneeId: assigneeId || undefined,
        labelIds: selectedLabels.length > 0 ? selectedLabels : undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });

      onCreated(newIssue);
      toast.success(`Created issue ${newIssue.issueKey}`);
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setAssigneeId('');
      setSelectedLabels([]);
      setDueDate('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create issue';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-issue-title"
        className="bg-[#0c0c0e]/95 border border-white/[0.12] rounded-2xl max-w-xl w-full p-6 shadow-2xl backdrop-blur-2xl relative text-zinc-100 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06] mb-4">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-900 border border-white/[0.08] text-zinc-300">
              {projectKey}
            </span>
            <h2 id="create-issue-title" className="text-sm font-semibold text-white">Create New Issue</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="issue-title" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              id="issue-title"
              type="text"
              required
              autoFocus
              autoComplete="off"
              spellCheck={false}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement real-time sequence synchronization"
              className="w-full h-9 bg-zinc-950 border border-white/[0.08] rounded-lg px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/[0.25] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="issue-type" className="block text-xs font-medium text-zinc-300 mb-1.5">Issue Type</label>
              <select
                id="issue-type"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as IssueType)}
                className="w-full h-9 bg-zinc-950 border border-white/[0.08] rounded-lg px-2.5 text-xs text-zinc-200 focus:outline-none focus:border-white/[0.25] font-mono transition-colors"
              >
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
                <option value="FEATURE">Feature</option>
              </select>
            </div>

            <div>
              <label htmlFor="issue-priority" className="block text-xs font-medium text-zinc-300 mb-1.5">Priority</label>
              <select
                id="issue-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                className="w-full h-9 bg-zinc-950 border border-white/[0.08] rounded-lg px-2.5 text-xs text-zinc-200 focus:outline-none focus:border-white/[0.25] font-mono transition-colors"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="issue-assignee" className="block text-xs font-medium text-zinc-300 mb-1.5">Assignee</label>
              <select
                id="issue-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full h-9 bg-zinc-950 border border-white/[0.08] rounded-lg px-2.5 text-xs text-zinc-200 focus:outline-none focus:border-white/[0.25] transition-colors"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="issue-due-date" className="block text-xs font-medium text-zinc-300 mb-1.5">Due Date</label>
              <input
                id="issue-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-9 bg-zinc-950 border border-white/[0.08] rounded-lg px-2.5 text-xs text-zinc-200 focus:outline-none focus:border-white/[0.25] font-mono transition-colors"
              />
            </div>
          </div>

          {labels.length > 0 && (
            <div>
              <span className="block text-xs font-medium text-zinc-300 mb-2">Labels</span>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Issue labels">
                {labels.map((lbl) => {
                  const isSelected = selectedLabels.includes(lbl.id);
                  return (
                    <button
                      type="button"
                      key={lbl.id}
                      onClick={() => toggleLabel(lbl.id)}
                      aria-pressed={isSelected}
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-850 text-white border-white/[0.25] font-semibold'
                          : 'bg-zinc-950 text-zinc-400 border-white/[0.08] hover:border-white/[0.16]'
                      }`}
                    >
                      {lbl.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Description</label>
            <MarkdownEditor
              value={description}
              onChange={setDescription}
              placeholder="Provide technical context, reproduction steps, or requirements in markdown…"
              minRows={4}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-zinc-200 text-zinc-950 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-[0_0_12px_rgba(255,255,255,0.1)]"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
              <span>Create Issue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
