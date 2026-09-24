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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-white/15 rounded-[28px] max-w-xl w-full p-6 sm:p-7 shadow-2xl relative text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-white/5 text-[#FFC554] border border-white/10">
              {projectKey}
            </span>
            <h2 className="text-xs font-black uppercase tracking-wider text-white">Create Issue</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-[0.2em] ml-1">
              Title <span className="text-[#FFC554]">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement refresh token rotation"
              className="w-full h-12 bg-white/[0.03] border border-white/10 text-white rounded-xl px-4 text-xs font-medium outline-none focus:border-[#FFC554] focus:bg-white/[0.06] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-[0.2em] ml-1">Issue Type</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as IssueType)}
                className="w-full h-11 bg-zinc-900 border border-white/10 rounded-xl px-3 text-xs text-zinc-200 focus:outline-none focus:border-[#FFC554] font-bold uppercase tracking-wider"
              >
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
                <option value="FEATURE">Feature</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-[0.2em] ml-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                className="w-full h-11 bg-zinc-900 border border-white/10 rounded-xl px-3 text-xs text-zinc-200 focus:outline-none focus:border-[#FFC554] font-bold uppercase tracking-wider"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-[0.2em] ml-1">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full h-11 bg-zinc-900 border border-white/10 rounded-xl px-3 text-xs text-zinc-200 focus:outline-none focus:border-[#FFC554] font-bold uppercase tracking-wider"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-[0.2em] ml-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-11 bg-zinc-900 border border-white/10 rounded-xl px-3 text-xs text-zinc-200 focus:outline-none focus:border-[#FFC554] font-mono"
              />
            </div>
          </div>

          {labels.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-[0.2em] ml-1">Labels</label>
              <div className="flex flex-wrap gap-1.5">
                {labels.map((lbl) => {
                  const isSelected = selectedLabels.includes(lbl.id);
                  return (
                    <button
                      type="button"
                      key={lbl.id}
                      onClick={() => toggleLabel(lbl.id)}
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border transition ${
                        isSelected
                          ? 'bg-[#FFC554] text-black border-[#FFC554]'
                          : 'bg-white/5 text-zinc-400 border-white/10 hover:border-white/25'
                      }`}
                    >
                      {lbl.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-[0.2em] ml-1">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide technical context, reproduction steps, or requirements..."
              className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl p-3.5 text-xs font-medium outline-none focus:border-[#FFC554] focus:bg-white/[0.06] resize-none transition-all"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#FFC554] hover:bg-[#ffd166] text-black transition-all flex items-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />}
              <span>Create Issue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
