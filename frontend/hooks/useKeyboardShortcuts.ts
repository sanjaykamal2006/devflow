'use client';

import { useEffect, useCallback } from 'react';
import { IssuePriority } from '@/types';

interface KeyboardShortcutOptions {
  onNewIssue?: () => void;
  onNextIssue?: () => void;
  onPrevIssue?: () => void;
  onToggleSelect?: () => void;
  onAssignMe?: () => void;
  onSetPriority?: (priority: IssuePriority) => void;
  onDeleteIssue?: () => void;
  onToggleShortcuts?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onNewIssue,
  onNextIssue,
  onPrevIssue,
  onToggleSelect,
  onAssignMe,
  onSetPriority,
  onDeleteIssue,
  onToggleShortcuts,
  enabled = true,
}: KeyboardShortcutOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore when typing inside input elements or contenteditable
      const target = e.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName;
        if (
          tagName === 'INPUT' ||
          tagName === 'TEXTAREA' ||
          tagName === 'SELECT' ||
          target.isContentEditable ||
          target.closest('[role="dialog"]') !== null && !(target.closest('#shortcuts-modal-trigger'))
        ) {
          // Allow Escape to dismiss inside dialogs
          return;
        }
      }

      // Modifier key safety (allow Cmd+K to pass through to cmdk palette)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      const key = e.key;

      // 1. Toggle Shortcuts Modal: '?' (Shift + /)
      if (key === '?') {
        e.preventDefault();
        onToggleShortcuts?.();
        return;
      }

      // 2. Create Issue: 'c' or 'C'
      if (key === 'c' || key === 'C') {
        e.preventDefault();
        onNewIssue?.();
        return;
      }

      // 3. Navigate Down: 'j' or 'ArrowDown'
      if (key === 'j' || key === 'J' || key === 'ArrowDown') {
        e.preventDefault();
        onNextIssue?.();
        return;
      }

      // 4. Navigate Up: 'k' or 'ArrowUp'
      if (key === 'k' || key === 'K' || key === 'ArrowUp') {
        e.preventDefault();
        onPrevIssue?.();
        return;
      }

      // 5. Toggle Selection: 'x' or 'X'
      if (key === 'x' || key === 'X') {
        e.preventDefault();
        onToggleSelect?.();
        return;
      }

      // 6. Assign to Me: Space
      if (key === ' ') {
        e.preventDefault();
        onAssignMe?.();
        return;
      }

      // 7. Priority 1-4
      if (key === '1') {
        e.preventDefault();
        onSetPriority?.('LOW');
        return;
      }
      if (key === '2') {
        e.preventDefault();
        onSetPriority?.('MEDIUM');
        return;
      }
      if (key === '3') {
        e.preventDefault();
        onSetPriority?.('HIGH');
        return;
      }
      if (key === '4') {
        e.preventDefault();
        onSetPriority?.('CRITICAL');
        return;
      }

      // 8. Delete / Backspace
      if (key === 'Backspace' || key === 'Delete') {
        e.preventDefault();
        onDeleteIssue?.();
        return;
      }
    },
    [
      enabled,
      onNewIssue,
      onNextIssue,
      onPrevIssue,
      onToggleSelect,
      onAssignMe,
      onSetPriority,
      onDeleteIssue,
      onToggleShortcuts,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
