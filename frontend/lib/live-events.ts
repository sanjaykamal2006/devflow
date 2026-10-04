'use client';

import { Issue } from '@/types';

// Real-time Event Bus & Cross-Tab Synchronizer
export interface LiveEvent {
  id: string;
  type: 'issue_created' | 'issue_updated' | 'issue_deleted' | 'comment_added' | 'github_activity' | 'webhook_dispatched';
  title: string;
  description: string;
  timestamp: string;
  issueKey?: string;
  issueId?: string;
  projectId?: string;
  author?: string;
  url?: string;
  issue?: Issue;
}

const STORAGE_KEY = 'devflow_notifications';
const CHANNEL_NAME = 'devflow_live_sync_channel';

class LiveEventManager {
  private channel: BroadcastChannel | null = null;
  private listeners: ((event: LiveEvent) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (msgEvent) => {
          if (msgEvent.data) {
            this.handleIncomingEvent(msgEvent.data);
          }
        };
      } catch {
        this.channel = null;
      }
    }
  }

  public subscribe(callback: (event: LiveEvent) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public dispatch(eventData: Omit<LiveEvent, 'id' | 'timestamp'>) {
    const event: LiveEvent = {
      ...eventData,
      id: 'evt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      timestamp: new Date().toISOString(),
    };

    this.saveNotification(event);
    this.handleIncomingEvent(event);

    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch {}
    }

    // Dispatch DOM event for decoupled components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('devflow:live-event', { detail: event }));
    }
  }

  private handleIncomingEvent(event: LiveEvent) {
    this.listeners.forEach((cb) => {
      try {
        cb(event);
      } catch {}
    });
  }

  public getNotifications(): LiveEvent[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}

    // Default seeded initial notifications for rich developer experience
    return [
      {
        id: 'seed-1',
        type: 'github_activity',
        title: 'Pull Request Merged',
        description: 'PR #42 (API-101) merged into origin/main by Sanjay K.',
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        issueKey: 'API-101',
      },
      {
        id: 'seed-2',
        type: 'issue_updated',
        title: 'Status Transitioned',
        description: 'DB-104 changed from IN_PROGRESS to DONE',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        issueKey: 'DB-104',
      },
      {
        id: 'seed-3',
        type: 'webhook_dispatched',
        title: 'Discord Webhook Delivered',
        description: 'Event issue.created delivered with HMAC-SHA256 signature (200 OK)',
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      },
    ];
  }

  public saveNotification(event: LiveEvent) {
    if (typeof window === 'undefined') return;
    try {
      const existing = this.getNotifications();
      const updated = [event, ...existing.filter((e) => e.id !== event.id)].slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  public clearAllNotifications() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch {}
  }
}

export const liveEvents = new LiveEventManager();

export function subscribeToLiveEvents(callback: (event: LiveEvent) => void) {
  return liveEvents.subscribe(callback);
}

export function dispatchLiveEvent(eventData: Omit<LiveEvent, 'id' | 'timestamp'>) {
  liveEvents.dispatch(eventData);
}
