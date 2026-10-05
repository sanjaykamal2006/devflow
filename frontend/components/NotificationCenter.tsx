'use client';

import React, { useState, useEffect, useRef } from 'react';
import { liveEvents, LiveEvent } from '@/lib/live-events';
import {
  Bell,
  GitPullRequest,
  CheckCircle2,
  Webhook,
  MessageSquare,
  Sparkles,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<LiveEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = liveEvents.getNotifications();
    setNotifications(list);
    setUnreadCount(list.length > 0 ? Math.min(list.length, 3) : 0);

    const unsubscribe = liveEvents.subscribe((newEvent) => {
      setNotifications((prev) => [newEvent, ...prev.filter((p) => p.id !== newEvent.id)].slice(0, 50));
      setUnreadCount((prev) => prev + 1);
    });

    return () => unsubscribe();
  }, []);

  // Close panel on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setOptionsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setOptionsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleClearAll = () => {
    liveEvents.clearAllNotifications();
    setNotifications([]);
    setUnreadCount(0);
    setOptionsOpen(false);
  };

  const getEventIcon = (type: LiveEvent['type']) => {
    switch (type) {
      case 'github_activity':
        return <GitPullRequest className="w-3 h-3 text-purple-400" />;
      case 'issue_updated':
        return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
      case 'webhook_dispatched':
        return <Webhook className="w-3 h-3 text-sky-400" />;
      case 'comment_added':
        return <MessageSquare className="w-3 h-3 text-amber-400" />;
      case 'issue_created':
        return <Sparkles className="w-3 h-3 text-indigo-400" />;
      default:
        return <AlertCircle className="w-3 h-3 text-zinc-400" />;
    }
  };

  const formatRelativeTime = (iso: string) => {
    try {
      const diffSec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
      if (diffSec < 60) return 'just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
      return `${Math.floor(diffSec / 86400)}d`;
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setUnreadCount(0);
        }}
        className="relative p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] transition-all cursor-pointer flex items-center justify-center"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-sky-400" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[380px] bg-[#0e1015]/98 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left select-text overflow-hidden">
          {/* Fixed Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#0e1015]/60 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white tracking-tight">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setOptionsOpen(!optionsOpen)}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Options"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {optionsOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 p-1 rounded-lg bg-[#0a0b0f] border border-white/[0.08] shadow-xl z-20 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={handleClearAll}
                    disabled={notifications.length === 0}
                    className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-zinc-300 hover:text-white hover:bg-white/[0.08] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable List */}
          <div className="max-h-[420px] overflow-y-auto py-1">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                No notifications
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className="px-3 py-2.5 hover:bg-white/[0.03] transition flex items-start gap-2.5 border-b border-white/[0.02] last:border-0"
                >
                  <div className="w-6 h-6 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                    {getEventIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-zinc-200 leading-snug">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 shrink-0 mt-0.5">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
