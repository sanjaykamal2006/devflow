'use client';

import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'Navigation' | 'Actions' | 'General';
}

const SHORTCUTS: ShortcutItem[] = [
  // Navigation
  { keys: ['J', '↓'], description: 'Focus next issue in list or board', category: 'Navigation' },
  { keys: ['K', '↑'], description: 'Focus previous issue in list or board', category: 'Navigation' },
  { keys: ['⌘', 'K'], description: 'Open global command palette', category: 'Navigation' },
  
  // Actions
  { keys: ['C'], description: 'Quickly create new issue', category: 'Actions' },
  { keys: ['X'], description: 'Toggle selection for bulk operations', category: 'Actions' },
  { keys: ['Space'], description: 'Assign focused issue to current user', category: 'Actions' },
  { keys: ['1'], description: 'Set priority to Low', category: 'Actions' },
  { keys: ['2'], description: 'Set priority to Medium', category: 'Actions' },
  { keys: ['3'], description: 'Set priority to High', category: 'Actions' },
  { keys: ['4'], description: 'Set priority to Critical', category: 'Actions' },
  { keys: ['⌫', 'Del'], description: 'Delete focused issue (with confirm)', category: 'Actions' },
  
  // General
  { keys: ['?'], description: 'Toggle keyboard shortcuts guide', category: 'General' },
  { keys: ['Esc'], description: 'Close modals / Clear active selection', category: 'General' },
];

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  useEffect(() => {
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

  const categories: Array<'Navigation' | 'Actions' | 'General'> = ['Navigation', 'Actions', 'General'];

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
        aria-labelledby="shortcuts-title"
        className="bg-[#0c0c0e]/95 border border-white/[0.12] rounded-2xl max-w-lg w-full p-5 shadow-2xl backdrop-blur-2xl relative text-zinc-100 max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-zinc-300">
              <Keyboard className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 id="shortcuts-title" className="text-sm font-semibold text-white">Keyboard Shortcuts</h2>
              <p className="text-[11px] text-zinc-400 font-mono">Linear-caliber Vim power navigation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts dialog"
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts list grouped by category */}
        <div className="space-y-4">
          {categories.map((cat) => {
            const items = SHORTCUTS.filter((s) => s.category === cat);
            return (
              <div key={cat} className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider px-1">
                  {cat}
                </div>
                <div className="bg-zinc-950/60 border border-white/[0.06] rounded-xl divide-y divide-white/[0.04] overflow-hidden">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3 py-2 text-xs">
                      <span className="text-zinc-300">{item.description}</span>
                      <div className="flex items-center gap-1 shrink-0 ml-3">
                        {item.keys.map((k, kidx) => (
                          <kbd
                            key={kidx}
                            className="min-w-[20px] h-5 px-1.5 flex items-center justify-center font-mono text-[11px] font-medium bg-zinc-900 text-zinc-200 border border-white/[0.1] rounded shadow-inner"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer tip */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>Press <kbd className="px-1 py-0.5 rounded bg-zinc-900 border border-white/[0.08] text-zinc-300 text-[10px]">?</kbd> anywhere to toggle</span>
          <span>Press <kbd className="px-1 py-0.5 rounded bg-zinc-900 border border-white/[0.08] text-zinc-300 text-[10px]">Esc</kbd> to dismiss</span>
        </div>
      </div>
    </div>
  );
}
