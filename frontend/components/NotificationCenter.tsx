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
  X,
} from 'lucide-react';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<LiveEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
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
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleClearAll = () => {
    liveEvents.clearAllNotifications();
    setNotifications([]);
    setUnreadCount(0);
  };

  const getEventIcon = (type: LiveEvent['type']) => {
    switch (type) {
      case 'github_activity':
        return <GitPullRequest className="w-3.5 h-3.5 text-purple-400" />;
      case 'issue_updated':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'webhook_dispatched':
        return <Webhook className="w-3.5 h-3.5 text-sky-400" />;
      case 'comment_added':
        return <MessageSquare className="w-3.5 h-3.5 text-amber-400" />;
      case 'issue_created':
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const formatRelativeTime = (iso: string) => {
    try {
      const diffSec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
      if (diffSec < 60) return 'just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
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
        className="relative p-2 rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08] active:scale-95 transition-all cursor-pointer flex items-center justify-center"
        aria-label="Notifications"
        title="Live Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.9)] animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0c0d10]/98 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.1)] p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-left select-text">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08] px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-heading font-bold text-white tracking-tight">
                Live Notifications
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-[10px] font-mono text-sky-400">
                Real-time
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="hover:text-zinc-200 transition cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto py-2 space-y-1.5 divide-y divide-white/[0.04]">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 font-sans">
                No notifications right now.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className="pt-2 first:pt-0 p-2 rounded-xl hover:bg-white/[0.04] transition flex items-start gap-2.5"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                    {getEventIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-zinc-200 truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-white/[0.08] px-1 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>DevFlow Synchronizer Active</span>
            <span>BroadcastChannel Sync</span>
          </div>
        </div>
      )}
    </div>
  );
}
