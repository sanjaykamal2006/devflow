'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { useAuth } from '@/lib/auth-context';
import { api, getToken } from '@/lib/api';
import { Workspace, Project, Issue } from '@/types';
import { toast } from 'sonner';
import {
  Layers,
  FolderGit2,
  CheckCircle2,
  Plus,
  Key,
  Settings,
  LayoutDashboard,
  LogOut,
  Search,
  Loader2,
} from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  // Load workspaces and recent projects/issues when opened
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const wsList = await api.workspaces.list();
      setWorkspaces(wsList);

      if (wsList.length > 0) {
        // Collect projects from first few workspaces
        const projectPromises = wsList.slice(0, 3).map((ws) =>
          api.projects.list(ws.id).catch(() => [])
        );
        const projectArrays = await Promise.all(projectPromises);
        const allProjects = projectArrays.flat();
        setProjects(allProjects);

        // Fetch issues from the first project
        if (allProjects.length > 0) {
          const firstProjIssues = await api.issues.list(allProjects[0].id).catch(() => ({ content: [] }));
          setIssues(firstProjIssues.content || []);
        }
      }
    } catch {
      // Graceful fallback for offline / mock
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, loadData]);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K and custom event)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea/editable
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }

      // Hotkey 'c' for new issue creation (only when not inside inputs and palette is closed)
      if (!isInput && !open && e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('devflow:open-create-issue'));
        toast.info('Opening issue creator...', { duration: 1500 });
      }
    };

    const handleCustomOpen = () => setOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('devflow:open-command-palette', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('devflow:open-command-palette', handleCustomOpen);
    };
  }, [open]);

  const runCommand = (action: () => void) => {
    setOpen(false);
    setSearch('');
    action();
  };

  const copyToken = () => {
    const token = getToken();
    if (token) {
      navigator.clipboard.writeText(token);
      toast.success('JWT Access Token copied to clipboard');
    } else {
      toast.error('No active session token found');
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-black/80 backdrop-blur-md transition-all duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setOpen(false);
          setSearch('');
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        className="w-full max-w-xl bg-[#0c0c0e]/95 border border-white/[0.12] shadow-2xl rounded-2xl overflow-hidden backdrop-blur-2xl text-zinc-100 flex flex-col max-h-[75vh] animate-in fade-in zoom-in-95 duration-150"
      >
        <Command
          filter={(value, search) => {
            if (value.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Search Header Input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-zinc-950/60">
            {loading ? (
              <Loader2 className="w-4 h-4 text-zinc-500 animate-spin shrink-0" aria-hidden="true" />
            ) : (
              <Search className="w-4 h-4 text-zinc-400 shrink-0" aria-hidden="true" />
            )}
            <Command.Input
              autoFocus
              value={search}
              onValueChange={setSearch}
              placeholder="Search workspaces, projects, issues, or actions..."
              className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-white/[0.08] rounded">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <Command.List className="overflow-y-auto px-2 py-2.5 max-h-[380px] space-y-1 text-xs">
            <Command.Empty className="py-8 text-center text-xs text-zinc-500 font-mono">
              No results found for &quot;{search}&quot;
            </Command.Empty>

            {/* Quick Actions Group */}
            <Command.Group heading="Quick Actions" className="px-2 py-1 text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">
              <Command.Item
                value="Create New Issue c hotkey"
                onSelect={() =>
                  runCommand(() => {
                    window.dispatchEvent(new CustomEvent('devflow:open-create-issue'));
                    toast.info('Opening issue creator...', { duration: 1500 });
                  })
                }
                className="flex items-center justify-between px-2.5 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900/90 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-medium text-zinc-200">Create New Issue</span>
                </div>
                <kbd className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-white/[0.08]">
                  C
                </kbd>
              </Command.Item>

              <Command.Item
                value="Dashboard workspace overview"
                onSelect={() => runCommand(() => router.push('/dashboard'))}
                className="flex items-center justify-between px-2.5 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900/90 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="font-medium text-zinc-200">Go to Dashboard</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">Navigation</span>
              </Command.Item>

              <Command.Item
                value="Developer Settings API token profile"
                onSelect={() => runCommand(() => router.push('/settings'))}
                className="flex items-center justify-between px-2.5 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900/90 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="font-medium text-zinc-200">Developer Settings</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">Settings</span>
              </Command.Item>

              <Command.Item
                value="Copy JWT Token API key auth header"
                onSelect={() => runCommand(copyToken)}
                className="flex items-center justify-between px-2.5 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900/90 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-medium text-zinc-200">Copy Active JWT Access Token</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">API</span>
              </Command.Item>

              {user && (
                <Command.Item
                  value="Log Out sign out session"
                  onSelect={() => runCommand(logout)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg text-zinc-300 hover:text-rose-300 hover:bg-rose-950/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span className="font-medium text-rose-300">Sign Out</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">Session</span>
                </Command.Item>
              )}
            </Command.Group>

            {/* Workspaces Group */}
            {workspaces.length > 0 && (
              <Command.Group heading="Workspaces" className="px-2 py-1 text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider mt-2">
                {workspaces.map((ws) => (
                  <Command.Item
                    key={ws.id}
                    value={`Workspace ${ws.name} ${ws.slug}`}
                    onSelect={() => runCommand(() => router.push(`/workspaces/${ws.id}`))}
                    className="flex items-center justify-between px-2.5 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900/90 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-medium text-zinc-200">{ws.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">{ws.slug}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Projects Group */}
            {projects.length > 0 && (
              <Command.Group heading="Projects" className="px-2 py-1 text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider mt-2">
                {projects.map((proj) => (
                  <Command.Item
                    key={proj.id}
                    value={`Project ${proj.name} ${proj.key}`}
                    onSelect={() => runCommand(() => router.push(`/projects/${proj.id}/issues`))}
                    className="flex items-center justify-between px-2.5 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900/90 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-sky-400" />
                      <span className="font-medium text-zinc-200">{proj.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 font-semibold">{proj.key}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Issues Group */}
            {issues.length > 0 && (
              <Command.Group heading="Issues" className="px-2 py-1 text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider mt-2">
                {issues.map((iss) => (
                  <Command.Item
                    key={iss.id}
                    value={`Issue ${iss.issueKey} ${iss.title}`}
                    onSelect={() => runCommand(() => router.push(`/issues/${iss.id}`))}
                    className="flex items-center justify-between px-2.5 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900/90 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="font-mono text-[11px] font-semibold text-zinc-400 shrink-0">
                        {iss.issueKey}
                      </span>
                      <span className="truncate text-zinc-200">{iss.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase shrink-0">
                      {iss.status.replace('_', ' ')}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          {/* Footer Shortcuts Hint */}
          <div className="px-4 py-2 border-t border-white/[0.08] bg-zinc-950 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-zinc-900 border border-white/[0.08] rounded text-[10px]">↑</kbd>
                <kbd className="px-1 py-0.5 bg-zinc-900 border border-white/[0.08] rounded text-[10px]">↓</kbd>
                <span>navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-zinc-900 border border-white/[0.08] rounded text-[10px]">↵</kbd>
                <span>select</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-zinc-900 border border-white/[0.08] rounded text-[10px]">ESC</kbd>
              <span>dismiss</span>
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
}
