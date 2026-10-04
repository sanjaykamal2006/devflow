'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  User,
  Flame,
  GitPullRequest,
  Inbox,
  BookmarkPlus,
} from 'lucide-react';
import { IssuePriority, IssueStatus } from '@/types';

export interface ViewPreset {
  id: string;
  name: string;
  icon: string;
  statusFilter?: IssueStatus | '';
  priorityFilter?: IssuePriority | '';
  assigneeFilter?: string;
  isCustom?: boolean;
}

interface CustomViewsBarProps {
  currentUserId?: string;
  activePresetId: string;
  onSelectPreset: (preset: ViewPreset) => void;
  currentFilters: {
    status: IssueStatus | '';
    priority: IssuePriority | '';
    assignee: string;
  };
}

const DEFAULT_PRESETS: ViewPreset[] = [
  { id: 'all', name: 'All Issues', icon: 'all' },
  { id: 'my-assigned', name: 'My Assigned', icon: 'user' },
  { id: 'urgent', name: 'Urgent & High', icon: 'flame', priorityFilter: 'HIGH' },
  { id: 'in-review', name: 'In Review', icon: 'pr', statusFilter: 'IN_REVIEW' },
  { id: 'backlog', name: 'To Do Backlog', icon: 'inbox', statusFilter: 'TODO' },
];

const STORAGE_KEY = 'devflow_custom_views';

export function CustomViewsBar({
  currentUserId,
  activePresetId,
  onSelectPreset,
  currentFilters,
}: CustomViewsBarProps) {
  const [customPresets, setCustomPresets] = useState<ViewPreset[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [customViewName, setCustomViewName] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCustomPresets(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleSaveView = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customViewName.trim()) return;

    const newPreset: ViewPreset = {
      id: 'custom-' + Date.now(),
      name: customViewName.trim(),
      icon: 'bookmark',
      statusFilter: currentFilters.status,
      priorityFilter: currentFilters.priority,
      assigneeFilter: currentFilters.assignee,
      isCustom: true,
    };

    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    setCustomViewName('');
    setShowSaveModal(false);
    onSelectPreset(newPreset);
  };

  const handleDeleteCustomPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    if (activePresetId === id) {
      onSelectPreset(DEFAULT_PRESETS[0]);
    }
  };

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case 'user':
        return <User className="w-3 h-3 text-sky-400" />;
      case 'flame':
        return <Flame className="w-3 h-3 text-rose-400" />;
      case 'pr':
        return <GitPullRequest className="w-3 h-3 text-purple-400" />;
      case 'inbox':
        return <Inbox className="w-3 h-3 text-amber-400" />;
      default:
        return <Layers className="w-3 h-3 text-zinc-400" />;
    }
  };

  const allPresets = [...DEFAULT_PRESETS, ...customPresets];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs select-none scrollbar-none">
      <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mr-1 shrink-0">
        Views:
      </span>

      {allPresets.map((preset) => {
        const isActive = activePresetId === preset.id;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => {
              if (preset.id === 'my-assigned' && currentUserId) {
                onSelectPreset({ ...preset, assigneeFilter: currentUserId });
              } else {
                onSelectPreset(preset);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
              isActive
                ? 'bg-white/15 text-white border border-white/20 shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06]'
            }`}
          >
            {getIconComponent(preset.icon)}
            <span>{preset.name}</span>
            {preset.isCustom && (
              <span
                onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
                className="hover:text-rose-400 transition p-0.5 ml-1"
                title="Delete view"
              >
                &times;
              </span>
            )}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => setShowSaveModal(true)}
        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/15 border border-sky-500/20 transition-all shrink-0 cursor-pointer"
        title="Save active filter as custom view"
      >
        <BookmarkPlus className="w-3 h-3" />
        <span>Save View</span>
      </button>

      {/* Save View Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0c0d10] border border-white/[0.14] rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-sm font-heading font-bold text-white">Save Custom View</h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveView} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">View Name</label>
                <input
                  type="text"
                  placeholder="e.g. My Sprint Focus"
                  value={customViewName}
                  onChange={(e) => setCustomViewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-sky-400"
                  autoFocus
                />
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-zinc-400 space-y-1">
                <div>Status: {currentFilters.status || 'Any'}</div>
                <div>Priority: {currentFilters.priority || 'Any'}</div>
                <div>Assignee: {currentFilters.assignee ? 'Selected' : 'Any'}</div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-3 py-1.5 rounded-full text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customViewName.trim()}
                  className="btn-orb sm solid text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
