'use client';

import React, { useState } from 'react';
import { Project } from '@/types';
import { api } from '@/lib/api';
import { X, Loader2 } from 'lucide-react';

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
      onClose();
      setName('');
      setKey('');
      setDescription('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-md w-full p-5 shadow-2xl relative text-zinc-100">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
          <h2 className="text-sm font-semibold text-white">Create New Project</h2>
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Project Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Backend Platform"
              className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-md px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Project Key <span className="text-rose-400">*</span>
              <span className="text-zinc-500 font-normal ml-1">
                (Used as issue prefix, e.g. <span className="font-mono text-zinc-400">API-1</span>)
              </span>
            </label>
            <input
              type="text"
              required
              maxLength={10}
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="e.g. API"
              className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-md px-3 text-xs font-mono font-medium text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this project scope..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 resize-none transition"
            />
          </div>

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
              disabled={loading || !name.trim() || !key.trim()}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-zinc-200 text-zinc-950 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
