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
      // Auto-suggest uppercase alphanumeric key from name words
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-white/15 rounded-[28px] max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-white">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-white">Create New Project</h2>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-[0.2em] ml-1">
              Project Name <span className="text-[#FFC554]">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Backend Platform"
              className="w-full h-12 bg-white/[0.03] border border-white/10 text-white rounded-xl px-4 text-xs font-medium outline-none focus:border-[#FFC554] focus:bg-white/[0.06] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-[0.2em] ml-1">
              Project Key <span className="text-[#FFC554]">*</span>
              <span className="text-zinc-500 font-normal ml-1">
                (prefix: <span className="font-mono text-zinc-300">CORE-1</span>)
              </span>
            </label>
            <input
              type="text"
              required
              maxLength={10}
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="e.g. CORE"
              className="w-full h-12 bg-white/[0.03] border border-white/10 text-white rounded-xl px-4 text-xs font-mono font-bold outline-none focus:border-[#FFC554] focus:bg-white/[0.06] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black text-zinc-500 tracking-[0.2em] ml-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this project scope..."
              className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl p-3.5 text-xs font-medium outline-none focus:border-[#FFC554] focus:bg-white/[0.06] resize-none transition-all"
            />
          </div>

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
              disabled={loading || !name.trim() || !key.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#FFC554] hover:bg-[#ffd166] text-black transition-all flex items-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />}
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
