'use client';

import React, { useState } from 'react';
import { Issue, IssuePriority, IssueType, Label, WorkspaceMember } from '@/types';
import { api } from '@/lib/api';
import { X, Loader2 } from 'lucide-react';

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
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setAssigneeId('');
      setSelectedLabels([]);
      setDueDate('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-xl w-full p-5 shadow-2xl relative text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
              {projectKey}
            </span>
            <h2 className="text-sm font-semibold text-white">Create Issue</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement refresh token rotation"
              className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-md px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Issue Type</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as IssueType)}
                className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-md px-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              >
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
                <option value="FEATURE">Feature</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-md px-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
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
              <label className="block text-xs font-medium text-zinc-300 mb-1">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-md px-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
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
              <label className="block text-xs font-medium text-zinc-300 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-md px-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono"
              />
            </div>
          </div>

          {labels.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Labels</label>
              <div className="flex flex-wrap gap-1.5">
                {labels.map((lbl) => {
                  const isSelected = selectedLabels.includes(lbl.id);
                  return (
                    <button
                      type="button"
                      key={lbl.id}
                      onClick={() => toggleLabel(lbl.id)}
                      className={`text-[11px] px-2 py-0.5 rounded border transition ${
                        isSelected
                          ? 'bg-zinc-800 text-white border-zinc-600'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
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
            <label className="block text-xs font-medium text-zinc-300 mb-1">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide technical context, reproduction steps, or requirements..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 resize-none transition"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-zinc-200 text-zinc-950 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create Issue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
