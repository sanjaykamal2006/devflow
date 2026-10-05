'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Workspace, Project, Issue, WorkspaceMember, IssueStatus } from '@/types';
import { api } from '@/lib/api';
import { generateDemoActivities, DemoActivity } from '@/lib/demo-data';
import { NeonGlassLogo } from '@/components/NeonGlassLogo';
import { NotificationCenter } from '@/components/NotificationCenter';
import { CreateIssueModal } from '@/components/CreateIssueModal';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { GitHubWebhookModal } from '@/components/GitHubWebhookModal';
import { subscribeToLiveEvents, dispatchLiveEvent } from '@/lib/live-events';
import {
  Home,
  Layers,
  FolderGit2,
  Users,
  Activity,
  Settings,
  Puzzle,
  CreditCard,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  GitBranch,
  ArrowRight,
  Check,
  X,
  Menu,
  Zap,
  Inbox,
  ListOrdered,
  LogOut,
  Loader2,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

interface ActivityItem {
  id: string;
  user: string;
  avatarColor: string;
  action: string;
  target: string;
  time: string;
  type: 'issue' | 'project' | 'status' | 'ci';
}

export default function DashboardPage() {
  const { user, loading: authLoading, logout, enterDemoSandbox, isDemo } = useAuth();
  const router = useRouter();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [activeTab, setActiveTab] = useState<'assigned' | 'created' | 'all'>('assigned');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);

  // Modals
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);

  // Activity Feed - Dynamic from live events or empty in production
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  // Load all initial workspace data
  const loadWorkspaceData = async () => {
    try {
      setLoading(true);
      const wsList = await api.workspaces.list();
      setWorkspaces(wsList);

      const activeWs = wsList[0] || null;
      setSelectedWorkspace(activeWs);

      if (activeWs) {
        // Load projects and members
        const [prjList, memList] = await Promise.all([
          api.projects.list(activeWs.id).catch(() => []),
          api.workspaces.getMembers(activeWs.id).catch(() => []),
        ]);
        setProjects(prjList);
        setMembers(memList);

        // Load all issues across projects
        if (prjList.length > 0) {
          const issuePromises = prjList.map(async (p) => {
            try {
              const res = await api.issues.list(p.id);
              if (Array.isArray(res)) return res;
              if (res && typeof res === 'object' && 'content' in res && Array.isArray((res as { content: Issue[] }).content)) {
                return (res as { content: Issue[] }).content;
              }
              return [] as Issue[];
            } catch {
              return [] as Issue[];
            }
          });
          const issueLists = await Promise.all(issuePromises);
          const allIssues: Issue[] = issueLists.flat();
          setIssues(allIssues);

          // Populate initial demo activities ONLY if in demo sandbox mode and no real activities exist
          if (isDemo && allIssues.length > 0 && memList.length > 0) {
            const demoUsers = memList.map((m) => m.user);
            setActivities(generateDemoActivities(demoUsers));
          }
        } else {
          setIssues([]);
          setActivities([]);
        }
      } else {
        setProjects([]);
        setMembers([]);
        setIssues([]);
        setActivities([]);
      }
    } catch (err: unknown) {
      console.error('Failed to load workspace data:', err);
      setWorkspaces([]);
      setProjects([]);
      setMembers([]);
      setIssues([]);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadWorkspaceData();
    }
  }, [user, isDemo]);

  // Real-time synchronization event listener
  useEffect(() => {
    const unsubscribe = subscribeToLiveEvents((event) => {
      if (event.type === 'issue_created' && event.issue) {
        setIssues((prev) => {
          if (prev.some((i) => i.id === event.issue?.id)) return prev;
          return [event.issue as Issue, ...prev];
        });
        setActivities((prev) => [
          {
            id: `act-${Date.now()}`,
            user: event.issue?.reporter?.fullName || user?.fullName || 'Teammate',
            avatarColor: 'from-sky-400 to-blue-600',
            action: 'created issue',
            target: `${event.issue?.issueKey || 'NEW'} ${event.issue?.title}`,
            time: 'now',
            type: 'issue',
          },
          ...prev.slice(0, 9),
        ]);
      } else if (event.type === 'issue_updated' && event.issue) {
        setIssues((prev) =>
          prev.map((i) => (i.id === event.issue?.id ? (event.issue as Issue) : i))
        );
        setActivities((prev) => [
          {
            id: `act-${Date.now()}`,
            user: user?.fullName || 'Teammate',
            avatarColor: 'from-purple-400 to-indigo-600',
            action: 'updated issue',
            target: `${event.issue?.issueKey} status to ${event.issue?.status}`,
            time: 'now',
            type: 'status',
          },
          ...prev.slice(0, 9),
        ]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Keyboard shortcut: Press 'C' to create issue, '⌘K' for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setCreateIssueOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('devflow:open-command-palette'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered issues - strictly active only for "assigned" tab
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Tab filter
      if (activeTab === 'assigned' && user) {
        if (issue.assignee?.email !== user.email && issue.assignee?.id !== user.id) {
          return false;
        }
        if (issue.status === 'DONE') {
          return false;
        }
      } else if (activeTab === 'created' && user) {
        if (issue.reporter?.email !== user.email && issue.reporter?.id !== user.id) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          issue.title.toLowerCase().includes(q) ||
          issue.issueKey.toLowerCase().includes(q) ||
          issue.projectName?.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [issues, activeTab, user, searchQuery]);

  // Metric Computations - strictly computed from data
  const openIssuesCount = useMemo(
    () => issues.filter((i) => i.status === 'TODO').length,
    [issues]
  );
  const inProgressCount = useMemo(
    () => issues.filter((i) => i.status === 'IN_PROGRESS' || i.status === 'IN_REVIEW').length,
    [issues]
  );
  const dueSoonCount = useMemo(
    () => issues.filter((i) => i.priority === 'CRITICAL' || i.priority === 'HIGH').length,
    [issues]
  );
  const completedCount = useMemo(
    () => issues.filter((i) => i.status === 'DONE').length,
    [issues]
  );

  const handleToggleIssueStatus = async (issue: Issue) => {
    const newStatus: IssueStatus = issue.status === 'DONE' ? 'TODO' : 'DONE';
    try {
      await api.issues.changeStatus(issue.id, newStatus);
      setIssues((prev) => prev.map((i) => (i.id === issue.id ? { ...i, status: newStatus } : i)));
      dispatchLiveEvent({
        type: 'issue_updated',
        title: `Issue ${issue.issueKey} status updated`,
        description: `Status changed to ${newStatus}`,
        issueKey: issue.issueKey,
        issue: { ...issue, status: newStatus },
      });
      toast.success(`Issue ${issue.issueKey} marked as ${newStatus}`);
    } catch {
      toast.error('Failed to update issue status');
    }
  };

  const handleIssueCreated = (newIssue: Issue) => {
    setIssues((prev) => [newIssue, ...prev]);
    setCreateIssueOpen(false);
    dispatchLiveEvent({
      type: 'issue_created',
      title: `Issue ${newIssue.issueKey} created`,
      description: newIssue.title,
      issueKey: newIssue.issueKey,
      issue: newIssue,
    });
    toast.success(`Created issue ${newIssue.issueKey}`);
  };

  const handleProjectCreated = (newPrj: Project) => {
    setProjects((prev) => [...prev, newPrj]);
    setCreateProjectOpen(false);
    toast.success(`Created project ${newPrj.name}`);
  };

  const greetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const firstProject = projects[0];

  // User display name strictly from authenticated context
  const userDisplayName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || (user ? 'Developer' : 'Guest');

  return (
    <div className="min-h-screen w-full bg-[#000000] text-zinc-100 flex overflow-hidden">
      {/* Subtle ambient background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255, 255, 255, 0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* ----------------- Left Navigation Sidebar ----------------- */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#07080b] border-r border-white/[0.06] flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Top: Logo & Main Navigation */}
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo & Brand Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-white/[0.06]">
            <Link href="/" className="flex items-center gap-2.5 group">
              <NeonGlassLogo size="sm" />
              <div className="flex flex-col">
                <span className="font-heading font-bold text-base text-white tracking-tight">
                  DevFlow
                </span>
                <span className="text-[10px] font-mono text-zinc-500">v2.4</span>
              </div>
            </Link>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links List */}
          <div className="px-3 py-4 space-y-6">
            {/* Primary Main Section */}
            <div className="space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white/[0.06] text-white transition-all"
              >
                <Home className="w-4 h-4 shrink-0" />
                <span>Dashboard</span>
              </Link>
            </div>

            {/* Section: WORK */}
            <div className="space-y-1">
              <div className="px-3 pb-1.5 text-[10px] font-semibold font-mono tracking-wider text-zinc-500 uppercase">
                Work
              </div>
              <button
                onClick={() => {
                  setActiveTab('assigned');
                  const el = document.getElementById('my-issues-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'assigned'
                    ? 'text-white bg-white/[0.06]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-4 h-4" />
                  <span>My Issues</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-white/[0.08] text-[10px] font-mono text-zinc-400">
                  {issues.filter((i) => (i.assignee?.email === user?.email || i.assignee?.id === user?.id) && i.status !== 'DONE').length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('all');
                  const el = document.getElementById('my-issues-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'all'
                    ? 'text-white bg-white/[0.06]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ListOrdered className="w-4 h-4" />
                  <span>All Issues</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-white/[0.08] text-[10px] font-mono text-zinc-400">
                  {issues.length}
                </span>
              </button>

              {firstProject ? (
                <Link
                  href={`/projects/${firstProject.id}/issues`}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderGit2 className="w-4 h-4" />
                    <span>Projects</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-white/[0.08] text-[10px] font-mono text-zinc-400">
                    {projects.length}
                  </span>
                </Link>
              ) : (
                <button
                  onClick={() => setCreateProjectOpen(true)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderGit2 className="w-4 h-4" />
                    <span>Projects</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-white/[0.08] text-[10px] font-mono text-zinc-400">
                    0
                  </span>
                </button>
              )}
            </div>

            {/* Section: TEAM */}
            <div className="space-y-1">
              <div className="px-3 pb-1.5 text-[10px] font-semibold font-mono tracking-wider text-zinc-500 uppercase">
                Team
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById('team-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>Members</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-white/[0.08] text-[10px] font-mono text-zinc-400">
                  {members.length}
                </span>
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('activity-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4" />
                  <span>Activity</span>
                </div>
              </button>
            </div>

            {/* Section: WORKSPACE */}
            <div className="space-y-1">
              <div className="px-3 pb-1.5 text-[10px] font-semibold font-mono tracking-wider text-zinc-500 uppercase">
                Workspace
              </div>
              <Link
                href="/settings"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] transition-all"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
              <button
                onClick={() => setWebhookModalOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Puzzle className="w-4 h-4" />
                  <span>Integrations</span>
                </div>
              </button>
              <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-500">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Billing</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">
                  Free
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Bottom: Active Workspace Compact Footer */}
        <div className="p-3 border-t border-white/[0.06]">
          {selectedWorkspace ? (
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500/20 to-purple-600/20 border border-sky-400/20 flex items-center justify-center font-bold text-xs text-sky-300 shrink-0">
                {selectedWorkspace.name?.charAt(0) || 'W'}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-white truncate">
                  {selectedWorkspace.name}
                </span>
                <span className="text-[10px] text-zinc-500 truncate">
                  {members.length} members · {projects.length} projects
                </span>
              </div>
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
              <span className="text-xs text-zinc-500">No workspace</span>
            </div>
          )}
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* ----------------- Main Content Stage ----------------- */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto relative z-10">
        {/* Unified Top Navigation Bar */}
        <header className="h-16 border-b border-white/[0.06] px-4 sm:px-6 flex items-center justify-between bg-[#08090d]/95 backdrop-blur-xl sticky top-0 z-30">
          {/* Left: Mobile Toggle & Workspace Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg bg-white/[0.04]"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="relative">
              <button
                onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] text-xs font-semibold text-zinc-200 transition-all cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <span className="truncate max-w-[140px] hidden sm:inline">
                  {selectedWorkspace?.name || 'Select Workspace'}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {/* Workspace Switcher Dropdown */}
              {wsDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-64 p-2 rounded-xl bg-[#0e0f14] border border-white/[0.08] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 py-1.5 text-[10px] font-mono font-semibold text-zinc-500 uppercase">
                    Switch Workspace
                  </div>
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        setSelectedWorkspace(ws);
                        setWsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all ${
                        selectedWorkspace?.id === ws.id
                          ? 'bg-white/[0.08] text-white font-semibold'
                          : 'text-zinc-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      <span className="truncate">{ws.name}</span>
                      {selectedWorkspace?.id === ws.id && (
                        <Check className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                    </button>
                  ))}
                  <div className="my-1 border-t border-white/[0.06]" />
                  <Link
                    href="/dashboard"
                    onClick={() => {
                      setWsDropdownOpen(false);
                      setCreateProjectOpen(true);
                    }}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-sky-400 hover:bg-sky-500/10 font-medium transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create new project</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Center: Command Search Capsule */}
          <div className="hidden sm:flex items-center flex-1 max-w-md mx-6">
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent('devflow:open-command-palette'))
              }
              className="w-full h-8 px-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] text-xs text-zinc-500 flex items-center justify-between transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs text-zinc-500">
                  Search issues...
                </span>
              </div>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-500 border border-white/[0.06]">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: New Issue, Live Sync, Notifications, User Menu */}
          <div className="flex items-center gap-2">
            {/* Subtle Live Sync Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Synced</span>
            </div>

            {/* New Issue Primary Button */}
            <button
              onClick={() => setCreateIssueOpen(true)}
              className="h-8 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Issue</span>
              <kbd className="hidden sm:inline ml-0.5 px-1 rounded bg-black/10 text-[9px] font-mono font-bold text-zinc-700">
                C
              </kbd>
            </button>

            {/* Global Notification Center */}
            <NotificationCenter />

            {/* User Profile Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-white/[0.05] transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-400 to-indigo-600 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                  {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <ChevronDown className="w-3 h-3 text-zinc-500 hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 p-2 rounded-xl bg-[#0e0f14] border border-white/[0.08] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                    <div className="text-xs font-semibold text-white">
                      {user?.fullName || 'Authenticated User'}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      {user?.email || 'user@example.com'}
                    </div>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] transition"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Account Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      enterDemoSandbox();
                      toast.success('Switched to Demo Sandbox');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-amber-300 hover:bg-amber-500/10 transition"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Switch to Sandbox</span>
                  </button>
                  <div className="my-1 border-t border-white/[0.06]" />
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                      router.push('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ----------------- Workspace Content Body ----------------- */}
        <main className="flex-1 p-6 sm:p-10 max-w-[1600px] w-full mx-auto space-y-10">
          {/* Greeting & Date Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-white">
                {greetingTime()}, {userDisplayName}
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                {selectedWorkspace?.name || 'Your Workspace'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-zinc-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{todayFormatted}</span>
              </div>
              <button
                onClick={() => setWebhookModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] text-zinc-400 hover:text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Puzzle className="w-3.5 h-3.5" />
                <span>Webhooks</span>
              </button>
            </div>
          </div>

          {/* ----------------- 4 Clean Metric KPI Cards ----------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Open Issues */}
            <div className="p-5 rounded-xl bg-[#0c0d12] border border-white/[0.08] hover:border-white/[0.12] transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                  Open Issues
                </span>
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] text-zinc-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold font-heading text-white">
                {openIssuesCount}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                {openIssuesCount === 0 ? 'No open issues' : `${openIssuesCount} waiting to be started`}
              </div>
            </div>

            {/* Card 2: In Progress */}
            <div className="p-5 rounded-xl bg-[#0c0d12] border border-white/[0.08] hover:border-white/[0.12] transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                  In Progress
                </span>
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] text-zinc-400 flex items-center justify-center">
                  <GitBranch className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold font-heading text-white">
                {inProgressCount}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                {inProgressCount === 0 ? 'No active work' : `${inProgressCount} currently active`}
              </div>
            </div>

            {/* Card 3: Due Soon */}
            <div className="p-5 rounded-xl bg-[#0c0d12] border border-white/[0.08] hover:border-white/[0.12] transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                  Due Soon
                </span>
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] text-zinc-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold font-heading text-white">
                {dueSoonCount}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                {dueSoonCount === 0 ? 'None high/critical' : `${dueSoonCount} high priority`}
              </div>
            </div>

            {/* Card 4: Completed */}
            <div className="p-5 rounded-xl bg-[#0c0d12] border border-white/[0.08] hover:border-white/[0.12] transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                  Completed
                </span>
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] text-zinc-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold font-heading text-white">
                {completedCount}
              </div>
              <div className="text-xs text-emerald-400 mt-1">
                {completedCount === 0 ? '0 completed' : `${completedCount} issues closed`}
              </div>
            </div>
          </div>

          {/* ----------------- 2-Column: My Issues Table + Recent Activity ----------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: "My Issues" Table */}
            <div
              id="my-issues-section"
              className="lg:col-span-8 p-6 rounded-xl bg-[#0c0d12] border border-white/[0.08]"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
                <div>
                  <h2 className="text-base font-bold text-white">My Issues</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {activeTab === 'assigned' ? 'Active assigned work' : 'All issues in workspace'}
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <button
                    onClick={() => setActiveTab('assigned')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      activeTab === 'assigned'
                        ? 'bg-white/[0.08] text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Assigned
                  </button>
                  <button
                    onClick={() => setActiveTab('created')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      activeTab === 'created'
                        ? 'bg-white/[0.08] text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Created
                  </button>
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      activeTab === 'all'
                        ? 'bg-white/[0.08] text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto mt-5">
                {loading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-500">
                    <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
                    <span className="text-xs font-mono">Loading issues...</span>
                  </div>
                ) : filteredIssues.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <p className="text-xs text-zinc-400">
                      {activeTab === 'assigned' ? 'No active issues assigned to you.' : 'No issues found in this workspace.'}
                    </p>
                    <button
                      onClick={() => setCreateIssueOpen(true)}
                      className="text-xs font-semibold text-sky-400 hover:underline cursor-pointer"
                    >
                      + Create an issue
                    </button>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[11px] font-semibold text-zinc-500 border-b border-white/[0.06]">
                        <th className="pb-3 pl-2 w-8"></th>
                        <th className="pb-3 pr-4 min-w-[80px]">ID</th>
                        <th className="pb-3 pr-4 min-w-[280px]">Title</th>
                        <th className="pb-3 pr-4">Project</th>
                        <th className="pb-3 pr-4">Priority</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3 text-right pr-2">Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {filteredIssues.slice(0, 8).map((issue) => (
                        <tr
                          key={issue.id}
                          className="group hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-3 pl-2">
                            <button
                              onClick={() => handleToggleIssueStatus(issue)}
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                issue.status === 'DONE'
                                  ? 'bg-emerald-500 border-emerald-400 text-black'
                                  : 'border-zinc-600 hover:border-zinc-400 bg-black/40'
                              }`}
                            >
                              {issue.status === 'DONE' && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>
                          </td>
                          <td className="py-3 pr-4 font-mono font-semibold text-zinc-400 whitespace-nowrap">
                            <Link
                              href={
                                firstProject
                                  ? `/projects/${firstProject.id}/issues`
                                  : '/dashboard'
                              }
                              className="hover:text-sky-400 transition"
                            >
                              {issue.issueKey}
                            </Link>
                          </td>
                          <td className="py-3 pr-4 font-medium text-zinc-200 max-w-[320px] truncate" title={issue.title}>
                            <Link
                              href={
                                firstProject
                                  ? `/projects/${firstProject.id}/issues`
                                  : '/dashboard'
                              }
                              className="hover:text-white transition"
                            >
                              {issue.title}
                            </Link>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="text-[11px] text-zinc-400">
                              {issue.projectName || 'General'}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            {issue.priority === 'CRITICAL' ? (
                              <span className="text-[11px] text-rose-400">
                                ● Critical
                              </span>
                            ) : issue.priority === 'HIGH' ? (
                              <span className="text-[11px] text-amber-400">
                                ● High
                              </span>
                            ) : issue.priority === 'MEDIUM' ? (
                              <span className="text-[11px] text-zinc-400">
                                ● Medium
                              </span>
                            ) : (
                              <span className="text-[11px] text-zinc-500">
                                ● Low
                              </span>
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            {issue.status === 'DONE' ? (
                              <span className="text-[11px] text-emerald-400">
                                ● Done
                              </span>
                            ) : issue.status === 'IN_PROGRESS' ? (
                              <span className="text-[11px] text-sky-400">
                                ● In Progress
                              </span>
                            ) : issue.status === 'IN_REVIEW' ? (
                              <span className="text-[11px] text-purple-400">
                                ● Review
                              </span>
                            ) : (
                              <span className="text-[11px] text-zinc-400">
                                ● Todo
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-right pr-2 font-mono text-zinc-500 text-[11px]">
                            {issue.updatedAt ? new Date(issue.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Table Footer */}
              {firstProject && filteredIssues.length > 0 && (
                <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-zinc-500">
                    Showing {Math.min(filteredIssues.length, 8)} of {filteredIssues.length}
                  </span>
                  <Link
                    href={`/projects/${firstProject.id}/issues`}
                    className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 group transition"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              )}
            </div>

            {/* Right 4 Cols: "Recent Activity" Timeline */}
            <div
              id="activity-section"
              className="lg:col-span-4 p-6 rounded-xl bg-[#0c0d12] border border-white/[0.08]"
            >
              <div className="flex items-center justify-between pb-5 border-b border-white/[0.06]">
                <div>
                  <h2 className="text-base font-bold text-white">Activity</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Live workspace events</p>
                </div>
              </div>

              {/* Timeline Stream */}
              {activities.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500">
                  No recent activity recorded yet.
                </div>
              ) : (
                <div className="relative pl-5 space-y-5 mt-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/[0.08]">
                  {activities.map((act) => (
                    <div key={act.id} className="relative">
                      {/* Avatar Node */}
                      <div
                        className={`absolute -left-5 top-0.5 w-4 h-4 rounded-full bg-gradient-to-tr ${act.avatarColor} border-2 border-[#0c0d12] flex items-center justify-center font-bold text-[8px] text-white`}
                      >
                        {act.user.charAt(0)}
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs leading-relaxed">
                          <span className="font-medium text-white">{act.user}</span>{' '}
                          <span className="text-zinc-400">{act.action}</span>
                        </div>
                        <div className="text-xs text-zinc-300 font-normal truncate max-w-[240px]" title={act.target}>
                          {act.target}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500">{act.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-5 mt-5 border-t border-white/[0.06]">
                <button
                  onClick={() => setWebhookModalOpen(true)}
                  className="w-full py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] text-xs font-medium text-zinc-400 hover:text-zinc-200 transition flex items-center justify-center gap-1.5"
                >
                  <Puzzle className="w-3.5 h-3.5" />
                  <span>Configure Webhooks</span>
                </button>
              </div>
            </div>
          </div>

          {/* ----------------- Bottom Row: Active Projects & Team Members ----------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="team-section">
            {/* Left 7 Cols: Active Projects Grid */}
            <div className="lg:col-span-7 p-6 rounded-xl bg-[#0c0d12] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div>
                  <h2 className="text-base font-bold text-white">Projects</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Active engineering modules</p>
                </div>
                <button
                  onClick={() => setCreateProjectOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] text-xs font-semibold text-white flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No projects in this workspace.{' '}
                  <button
                    onClick={() => setCreateProjectOpen(true)}
                    className="text-sky-400 hover:underline"
                  >
                    Create one
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {projects.map((prj) => {
                    const prjIssues = issues.filter((i) => i.projectId === prj.id);
                    const doneCount = prjIssues.filter((i) => i.status === 'DONE').length;
                    const total = prjIssues.length || 1;
                    const percent = Math.round((doneCount / total) * 100);

                    return (
                      <Link
                        key={prj.id}
                        href={`/projects/${prj.id}/issues`}
                        className="p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.10] transition-all space-y-3 group block"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-semibold text-sky-400">
                            {prj.key}
                          </span>
                          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {prj.name}
                          </div>
                          <div className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                            {prj.description || 'Engineering service module'}
                          </div>
                        </div>
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                            <span>{doneCount} of {total}</span>
                            <span>{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div
                              className="h-full bg-sky-400 rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right 5 Cols: Team Members */}
            <div className="lg:col-span-5 p-6 rounded-xl bg-[#0c0d12] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div>
                  <h2 className="text-base font-bold text-white">Team</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">{members.length} members</p>
                </div>
              </div>

              {members.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No members in workspace.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {members.map((mem) => (
                    <div
                      key={mem.id}
                      className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-400 to-purple-600 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                            {mem.user?.fullName?.charAt(0) || mem.user?.email?.charAt(0) || 'U'}
                          </div>
                          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border-2 border-[#0c0d12]" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">
                            {mem.user?.fullName || 'Team Member'}
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            {mem.user?.email || 'email@example.com'}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          mem.role === 'OWNER'
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                            : mem.role === 'ADMIN'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : 'bg-white/[0.04] text-zinc-400 border-white/[0.06]'
                        }`}
                      >
                        {mem.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ----------------- Dialog Modals ----------------- */}
      {firstProject && (
        <CreateIssueModal
          projectId={firstProject.id}
          projectKey={firstProject.key}
          labels={[]}
          members={members}
          isOpen={createIssueOpen}
          onClose={() => setCreateIssueOpen(false)}
          onCreated={handleIssueCreated}
        />
      )}

      {selectedWorkspace && (
        <CreateProjectModal
          workspaceId={selectedWorkspace.id}
          isOpen={createProjectOpen}
          onClose={() => setCreateProjectOpen(false)}
          onCreated={handleProjectCreated}
        />
      )}

      {firstProject && (
        <GitHubWebhookModal
          projectName={firstProject.name}
          projectKey={firstProject.key}
          isOpen={webhookModalOpen}
          onClose={() => setWebhookModalOpen(false)}
        />
      )}
    </div>
  );
}
