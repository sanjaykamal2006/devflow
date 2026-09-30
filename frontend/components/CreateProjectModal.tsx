'use client';

import React, { useState } from 'react';
import { Project } from '@/types';
import { api } from '@/lib/api';
import { X, Loader2, FolderGit2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateProjectModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export function CreateProjectModal({
  workspaceId,
  isOpen,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
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

  const handleNameChange = (val: string) => {
    setName(val);
    if (!key || key.length <= 4) {
      const words = val.trim().split(/\s+/);
      let suggested = '';
      if (words.length === 1 && words[0].length >= 2) {
        suggested = words[0].substring(0, 4).toUpperCase();
      } else if (words.length > 1) {
        suggested = words.map((w) => w.charAt(0)).join('').substring(0, 4).toUpperCase();
      }
      if (suggested) setKey(suggested.replace(/[^A-Z0-9]/g, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const project = await api.projects.create(workspaceId, {
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: description.trim() || undefined,
      });

      onCreated(project);
      toast.success(`Project ${project.name} (${project.key}) created`);
      onClose();
      setName('');
      setKey('');
      setDescription('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create project';
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
        aria-labelledby="create-project-title"
        className="bg-[#0c0c0e]/95 border border-white/[0.12] rounded-2xl max-w-md w-full p-6 shadow-2xl backdrop-blur-2xl relative text-zinc-100"
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06] mb-4">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-sky-400" />
            <h2 id="create-project-title" className="text-sm font-semibold text-white">Create New Project</h2>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="project-name" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Project Name <span className="text-rose-400">*</span>
            </label>
            <input
              id="project-name"
              type="text"
              required
              autoFocus
              autoComplete="off"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Backend Platform"
              className="w-full h-9 bg-zinc-950 border border-white/[0.08] rounded-lg px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/[0.25] transition-colors"
            />
          </div>

          <div>
            <label htmlFor="project-key" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Project Key <span className="text-rose-400">*</span>
              <span className="text-zinc-500 font-normal ml-1">
                (Prefix for issues, e.g. <span className="font-mono text-zinc-400">API-1</span>)
              </span>
            </label>
            <input
              id="project-key"
              type="text"
              required
              maxLength={10}
              autoComplete="off"
              spellCheck={false}
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="e.g. API"
              className="w-full h-9 bg-zinc-950 border border-white/[0.08] rounded-lg px-3 text-xs font-mono font-medium text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/[0.25] transition-colors"
            />
          </div>

          <div>
            <label htmlFor="project-desc" className="block text-xs font-medium text-zinc-300 mb-1.5">Description</label>
            <textarea
              id="project-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this project scope…"
              className="w-full bg-zinc-950 border border-white/[0.08] rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/[0.25] resize-none transition-colors"
            />
          </div>

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
              disabled={loading || !name.trim() || !key.trim()}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-zinc-200 text-zinc-950 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-[0_0_12px_rgba(255,255,255,0.1)]"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
