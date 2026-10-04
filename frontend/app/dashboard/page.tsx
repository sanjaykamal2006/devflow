'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Workspace, Project, Issue, WorkspaceMember, IssueStatus } from '@/types';
import { api } from '@/lib/api';
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
  ArrowUpRight,
  ArrowRight,
  Check,
  X,
  Menu,
  Zap,
  Inbox,
  ListOrdered,
  LogOut,
  Loader2,
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
  const { user, loading: authLoading, logout, enterDemoSandbox } = useAuth();
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

  // Activity Feed
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: 'act-1',
      user: 'Sanjay Kamal',
      avatarColor: 'from-sky-400 to-blue-600',
      action: 'created issue',
      target: 'API-104 (Configure JWT Auth Filter)',
      time: '4m ago',
      type: 'issue',
    },
    {
      id: 'act-2',
      user: 'Alex Chen',
      avatarColor: 'from-purple-400 to-indigo-600',
      action: 'moved to Done',
      target: 'WEB-102 (Kanban Board UI)',
      time: '18m ago',
      type: 'status',
    },
    {
      id: 'act-3',
      user: 'Sarah Connor',
      avatarColor: 'from-amber-400 to-orange-500',
      action: 'assigned issue',
      target: 'API-102 (Row-Level Locking)',
      time: '1h ago',
      type: 'issue',
    },
    {
      id: 'act-4',
      user: 'GitHub Bot',
      avatarColor: 'from-emerald-400 to-teal-600',
      action: 'merged PR #48',
      target: 'feat: live event synchronizer',
      time: '2h ago',
      type: 'ci',
    },
    {
      id: 'act-5',
      user: 'Sanjay Kamal',
      avatarColor: 'from-sky-400 to-blue-600',
      action: 'created project',
      target: 'Backend API Service',
      time: '5h ago',
      type: 'project',
    },
  ]);

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
          api.projects.list(activeWs.id),
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
        }
      }
    } catch (err: unknown) {
      console.error('Failed to load workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadWorkspaceData();
    }
  }, [user]);

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
            user: event.issue?.reporter?.fullName || 'Teammate',
            avatarColor: 'from-sky-400 to-blue-600',
            action: 'created issue',
            target: `${event.issue?.issueKey || 'NEW'} (${event.issue?.title})`,
            time: 'Just now',
            type: 'issue',
          },
          ...prev.slice(0, 7),
        ]);
      } else if (event.type === 'issue_updated' && event.issue) {
        setIssues((prev) =>
          prev.map((i) => (i.id === event.issue?.id ? (event.issue as Issue) : i))
        );
      }
    });

    return () => unsubscribe();
  }, []);

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

  // Filtered issues
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Tab filter
      if (activeTab === 'assigned' && user) {
        if (issue.assignee?.email !== user.email && issue.assignee?.id !== user.id) {
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

  // Metric Computations
  const openIssuesCount = useMemo(
    () => issues.filter((i) => i.status === 'TODO').length || 24,
    [issues]
  );
  const inProgressCount = useMemo(
    () => issues.filter((i) => i.status === 'IN_PROGRESS' || i.status === 'IN_REVIEW').length || 8,
    [issues]
  );
  const dueSoonCount = useMemo(
    () => issues.filter((i) => i.priority === 'CRITICAL' || i.priority === 'HIGH').length || 5,
    [issues]
  );
  const completedCount = useMemo(
    () => issues.filter((i) => i.status === 'DONE').length || 61,
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
    year: 'numeric',
  }).format(new Date());

  const firstProject = projects[0];

  return (
    <div className="min-h-screen w-full bg-[#000000] text-zinc-100 flex overflow-hidden select-none">
      {/* ----------------- Matrix Background Dots & Ambient Gradients ----------------- */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30 z-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Scattered Ambient Neon Glows */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/2 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* ----------------- Left Navigation Sidebar ----------------- */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#07080b]/90 backdrop-blur-3xl border-r border-white/[0.07] flex flex-col justify-between transition-transform duration-200 ease-in-out ${
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
                <span className="font-heading font-bold text-base text-white tracking-tight group-hover:text-sky-300 transition-colors">
                  DevFlow
                </span>
                <span className="text-[10px] font-mono text-zinc-500">v2.4 &middot; Active</span>
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
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-[0_0_14px_rgba(56,189,248,0.2),inset_0_1px_0_rgba(56,189,248,0.3)] transition-all"
              >
                <Home className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Dashboard</span>
              </Link>
            </div>

            {/* Section: WORK */}
            <div className="space-y-1">
              <div className="px-3 pb-1.5 text-[11px] font-bold font-mono tracking-wider text-zinc-500 uppercase">
                Work
              </div>
              <button
                onClick={() => {
                  setActiveTab('assigned');
                  const el = document.getElementById('my-issues-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'assigned'
                    ? 'text-white bg-white/[0.06]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-4 h-4 text-zinc-400" />
                  <span>My Issues</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-zinc-300">
                  {issues.filter((i) => i.assignee?.email === user?.email).length || 12}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('all');
                  const el = document.getElementById('my-issues-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'all'
                    ? 'text-white bg-white/[0.06]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ListOrdered className="w-4 h-4 text-zinc-400" />
                  <span>All Issues</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-zinc-300">
                  {issues.length || 24}
                </span>
              </button>

              {firstProject ? (
                <Link
                  href={`/projects/${firstProject.id}/issues`}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderGit2 className="w-4 h-4 text-zinc-400" />
                    <span>Projects</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-zinc-300">
                    {projects.length || 2}
                  </span>
                </Link>
              ) : (
                <button
                  onClick={() => setCreateProjectOpen(true)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderGit2 className="w-4 h-4 text-zinc-400" />
                    <span>Projects</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-zinc-300">
                    0
                  </span>
                </button>
              )}
            </div>

            {/* Section: TEAM */}
            <div className="space-y-1">
              <div className="px-3 pb-1.5 text-[11px] font-bold font-mono tracking-wider text-zinc-500 uppercase">
                Team
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById('team-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-zinc-400" />
                  <span>Members</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-zinc-300">
                  {members.length || 3}
                </span>
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('activity-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-zinc-400" />
                  <span>Activity</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            </div>

            {/* Section: WORKSPACE */}
            <div className="space-y-1">
              <div className="px-3 pb-1.5 text-[11px] font-bold font-mono tracking-wider text-zinc-500 uppercase">
                Workspace
              </div>
              <Link
                href="/settings"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] transition-all"
              >
                <Settings className="w-4 h-4 text-zinc-400" />
                <span>Settings</span>
              </Link>
              <button
                onClick={() => setWebhookModalOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Puzzle className="w-4 h-4 text-zinc-400" />
                  <span>Integrations</span>
                </div>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-500/15 px-1.5 py-0.5 rounded border border-purple-500/30">
                  GitHub
                </span>
              </button>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-400">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-zinc-400" />
                  <span>Billing</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  $0 Free
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Bottom: Active Workspace Pill */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500/30 to-purple-600/30 border border-sky-400/30 flex items-center justify-center font-bold text-xs text-sky-200 shrink-0">
                {selectedWorkspace?.name?.charAt(0) || 'D'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">
                  {selectedWorkspace?.name || 'DevFlow Engineering'}
                </span>
                <span className="text-[10px] text-zinc-500 truncate">
                  {members.length || 3} members &middot; {projects.length || 2} projects
                </span>
              </div>
            </div>
          </div>
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
        <header className="h-16 border-b border-white/[0.07] px-4 sm:px-8 flex items-center justify-between bg-[#08090d]/80 backdrop-blur-2xl sticky top-0 z-30">
          {/* Left: Mobile Toggle & Workspace Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 text-zinc-400 hover:text-white rounded-xl bg-white/[0.04]"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="relative">
              <button
                onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-zinc-200 transition-all cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span className="truncate max-w-[160px]">
                  {selectedWorkspace?.name || 'DevFlow Engineering'}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {/* Workspace Switcher Dropdown */}
              {wsDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-64 p-2 rounded-2xl bg-[#0e0f14] border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 py-1.5 text-[10px] font-mono font-bold text-zinc-500 uppercase">
                    Switch Workspace
                  </div>
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        setSelectedWorkspace(ws);
                        setWsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all ${
                        selectedWorkspace?.id === ws.id
                          ? 'bg-sky-500/15 text-sky-300 font-semibold'
                          : 'text-zinc-300 hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="truncate">{ws.name}</span>
                      {selectedWorkspace?.id === ws.id && (
                        <Check className="w-3.5 h-3.5 text-sky-400" />
                      )}
                    </button>
                  ))}
                  <div className="my-1 border-t border-white/10" />
                  <Link
                    href="/dashboard"
                    onClick={() => {
                      setWsDropdownOpen(false);
                      setCreateProjectOpen(true);
                    }}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-sky-400 hover:bg-sky-500/10 font-medium transition"
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
              className="w-full h-9 px-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] text-xs text-zinc-400 flex items-center justify-between transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                <span className="font-sans text-xs text-zinc-500 group-hover:text-zinc-400">
                  Search issues, projects, or docs...
                </span>
              </div>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-400 border border-white/10">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: + New Issue, Live Badge, Notifications, User Menu */}
          <div className="flex items-center gap-3">
            {/* Live Synchronizer Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Sync</span>
            </div>

            {/* + New Issue Primary Button */}
            <button
              onClick={() => setCreateIssueOpen(true)}
              className="h-8.5 px-3.5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Issue</span>
              <kbd className="hidden sm:inline ml-1 px-1 rounded bg-black/10 text-[9px] font-mono font-bold text-zinc-700">
                C
              </kbd>
            </button>

            {/* Global Notification Center */}
            <NotificationCenter />

            {/* User Profile Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-white/[0.06] transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                  {user?.fullName?.charAt(0) || 'S'}
                </div>
                <ChevronDown className="w-3 h-3 text-zinc-400 hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 p-2 rounded-2xl bg-[#0e0f14] border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <div className="text-xs font-semibold text-white">
                      {user?.fullName || 'Sanjay Kamal'}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      {user?.email || 'sanjaykamal2006@gmail.com'}
                    </div>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] transition"
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
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-amber-300 hover:bg-amber-500/10 transition"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Switch to Sandbox</span>
                  </button>
                  <div className="my-1 border-t border-white/10" />
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                      router.push('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition"
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
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Greeting & Date Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-white flex items-center gap-2.5">
                <span>
                  {greetingTime()}, {user?.fullName?.split(' ')[0] || 'Sanjay'}
                </span>
                <span className="text-xl">✨</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Here&apos;s what&apos;s happening in{' '}
                <span className="text-sky-300 font-medium">
                  {selectedWorkspace?.name || 'DevFlow Engineering'}
                </span>{' '}
                today.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-zinc-400">
                {todayFormatted}
              </div>
              <button
                onClick={() => setWebhookModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Puzzle className="w-3.5 h-3.5" />
                <span>Webhooks</span>
              </button>
            </div>
          </div>

          {/* ----------------- 4 Glowing Metric KPI Cards ----------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Open Issues (Cyan / Sky) */}
            <div className="relative p-5 rounded-2xl bg-[#0a0b10]/90 border border-sky-500/20 shadow-[0_0_30px_-10px_rgba(56,189,248,0.2)] hover:border-sky-500/40 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                  Open Issues
                </span>
                <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shadow-[0_0_12px_rgba(56,189,248,0.25)]">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-extrabold font-heading text-white tracking-tight">
                  {openIssuesCount}
                </div>
                <div className="text-xs font-mono text-emerald-400 flex items-center gap-0.5">
                  <span>+6%</span>
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
              <div className="mt-3 flex items-end gap-1 h-5 pt-2">
                <div className="flex-1 bg-sky-500/20 rounded-sm h-[40%]" />
                <div className="flex-1 bg-sky-500/30 rounded-sm h-[60%]" />
                <div className="flex-1 bg-sky-500/40 rounded-sm h-[80%]" />
                <div className="flex-1 bg-sky-500/60 rounded-sm h-[50%]" />
                <div className="flex-1 bg-sky-400 rounded-sm h-[100%]" />
              </div>
            </div>

            {/* Card 2: In Progress (Purple) */}
            <div className="relative p-5 rounded-2xl bg-[#0a0b10]/90 border border-purple-500/20 shadow-[0_0_30px_-10px_rgba(168,85,247,0.2)] hover:border-purple-500/40 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                  In Progress
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.25)]">
                  <GitBranch className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-extrabold font-heading text-white tracking-tight">
                  {inProgressCount}
                </div>
                <div className="text-xs font-mono text-purple-400 flex items-center gap-0.5">
                  <span>+2 active</span>
                </div>
              </div>
              <div className="mt-3 flex items-end gap-1 h-5 pt-2">
                <div className="flex-1 bg-purple-500/20 rounded-sm h-[70%]" />
                <div className="flex-1 bg-purple-500/40 rounded-sm h-[45%]" />
                <div className="flex-1 bg-purple-500/50 rounded-sm h-[90%]" />
                <div className="flex-1 bg-purple-500/70 rounded-sm h-[65%]" />
                <div className="flex-1 bg-purple-400 rounded-sm h-[85%]" />
              </div>
            </div>

            {/* Card 3: Due Soon / Critical (Amber) */}
            <div className="relative p-5 rounded-2xl bg-[#0a0b10]/90 border border-amber-500/20 shadow-[0_0_30px_-10px_rgba(251,191,36,0.2)] hover:border-amber-500/40 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                  Due Soon
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-[0_0_12px_rgba(251,191,36,0.25)]">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-extrabold font-heading text-white tracking-tight">
                  {dueSoonCount}
                </div>
                <div className="text-xs font-mono text-amber-400 flex items-center gap-0.5">
                  <span>2 high priority</span>
                </div>
              </div>
              <div className="mt-3 flex items-end gap-1 h-5 pt-2">
                <div className="flex-1 bg-amber-500/20 rounded-sm h-[30%]" />
                <div className="flex-1 bg-amber-500/40 rounded-sm h-[60%]" />
                <div className="flex-1 bg-amber-500/50 rounded-sm h-[40%]" />
                <div className="flex-1 bg-amber-500/70 rounded-sm h-[75%]" />
                <div className="flex-1 bg-amber-400 rounded-sm h-[55%]" />
              </div>
            </div>

            {/* Card 4: Completed (Emerald) */}
            <div className="relative p-5 rounded-2xl bg-[#0a0b10]/90 border border-emerald-500/20 shadow-[0_0_30px_-10px_rgba(52,211,153,0.2)] hover:border-emerald-500/40 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                  Completed
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-[0_0_12px_rgba(52,211,153,0.25)]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-extrabold font-heading text-white tracking-tight">
                  {completedCount}
                </div>
                <div className="text-xs font-mono text-emerald-400 flex items-center gap-0.5">
                  <span>+18% velocity</span>
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
              <div className="mt-3 flex items-end gap-1 h-5 pt-2">
                <div className="flex-1 bg-emerald-500/20 rounded-sm h-[50%]" />
                <div className="flex-1 bg-emerald-500/40 rounded-sm h-[70%]" />
                <div className="flex-1 bg-emerald-500/60 rounded-sm h-[60%]" />
                <div className="flex-1 bg-emerald-500/80 rounded-sm h-[90%]" />
                <div className="flex-1 bg-emerald-400 rounded-sm h-[100%]" />
              </div>
            </div>
          </div>

          {/* ----------------- Middle 2-Column Master Layout ----------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: "My Issues" High-Density Table Card */}
            <div
              id="my-issues-section"
              className="lg:col-span-8 p-5 sm:p-6 rounded-3xl bg-[#090a0f]/90 border border-white/[0.08] shadow-[0_0_40px_-15px_rgba(0,0,0,0.8)] flex flex-col justify-between"
            >
              <div>
                {/* Header & Filter Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
                  <div>
                    <h2 className="text-lg font-bold font-heading text-white">My Issues</h2>
                    <p className="text-xs text-zinc-400">Assigned tasks and active backlog items</p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <button
                      onClick={() => setActiveTab('assigned')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeTab === 'assigned'
                          ? 'bg-sky-500/15 text-sky-300 font-semibold shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Assigned to me
                    </button>
                    <button
                      onClick={() => setActiveTab('created')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeTab === 'created'
                          ? 'bg-sky-500/15 text-sky-300 font-semibold shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Created by me
                    </button>
                    <button
                      onClick={() => setActiveTab('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeTab === 'all'
                          ? 'bg-sky-500/15 text-sky-300 font-semibold shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      All Issues
                    </button>
                  </div>
                </div>

                {/* Interactive Table Content */}
                <div className="overflow-x-auto mt-4">
                  {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-500">
                      <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
                      <span className="text-xs font-mono">Loading issue repository...</span>
                    </div>
                  ) : filteredIssues.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <p className="text-xs text-zinc-400">No issues found matching this filter.</p>
                      <button
                        onClick={() => setCreateIssueOpen(true)}
                        className="text-xs font-semibold text-sky-400 hover:underline"
                      >
                        + Create a new issue
                      </button>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-[11px] font-mono font-semibold text-zinc-500 border-b border-white/[0.06]">
                          <th className="pb-3 pl-2 w-8"></th>
                          <th className="pb-3 pr-4">ID</th>
                          <th className="pb-3 pr-4">Title</th>
                          <th className="pb-3 pr-4">Project</th>
                          <th className="pb-3 pr-4">Priority</th>
                          <th className="pb-3 pr-4">Status</th>
                          <th className="pb-3 text-right pr-2">Due Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {filteredIssues.slice(0, 6).map((issue) => (
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
                                    : 'border-zinc-600 hover:border-sky-400 bg-black/40'
                                }`}
                              >
                                {issue.status === 'DONE' && <Check className="w-3 h-3 stroke-[3]" />}
                              </button>
                            </td>
                            <td className="py-3 pr-4 font-mono font-bold text-zinc-300">
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
                            <td className="py-3 pr-4 font-medium text-zinc-200 max-w-[240px] truncate">
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
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] text-[11px] text-zinc-400 border border-white/[0.06]">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                                <span>{issue.projectName || 'Platform'}</span>
                              </span>
                            </td>
                            <td className="py-3 pr-4">
                              {issue.priority === 'CRITICAL' || issue.priority === 'HIGH' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-semibold">
                                  • {issue.priority}
                                </span>
                              ) : issue.priority === 'MEDIUM' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold">
                                  • {issue.priority}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-500/10 text-zinc-300 border border-zinc-500/20 text-[10px]">
                                  • {issue.priority}
                                </span>
                              )}
                            </td>
                            <td className="py-3 pr-4">
                              {issue.status === 'DONE' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-semibold">
                                  • Done
                                </span>
                              ) : issue.status === 'IN_PROGRESS' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[10px] font-semibold">
                                  • In Progress
                                </span>
                              ) : issue.status === 'IN_REVIEW' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-semibold">
                                  • Review
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-400 border border-white/[0.06] text-[10px]">
                                  • To Do
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-right pr-2 font-mono text-zinc-400 text-[11px]">
                              Oct 3
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Table Card Footer */}
              {firstProject && (
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-zinc-500">
                    Showing {Math.min(filteredIssues.length, 6)} of {filteredIssues.length} issues
                  </span>
                  <Link
                    href={`/projects/${firstProject.id}/issues`}
                    className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 group transition"
                  >
                    <span>View full board</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              )}
            </div>

            {/* Right 4 Cols: "Recent Activity" Chronological Stream */}
            <div
              id="activity-section"
              className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-[#090a0f]/90 border border-white/[0.08] shadow-[0_0_40px_-15px_rgba(0,0,0,0.8)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-white/[0.06]">
                  <div>
                    <h2 className="text-lg font-bold font-heading text-white">Recent Activity</h2>
                    <p className="text-xs text-zinc-400">Live workspace events & git sync</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                {/* Timeline Stream with Connecting Vertical Rail */}
                <div className="relative pl-6 space-y-6 mt-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
                  {activities.map((act) => (
                    <div key={act.id} className="relative group">
                      {/* Avatar Node */}
                      <div
                        className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-gradient-to-tr ${act.avatarColor} border-2 border-[#090a0f] flex items-center justify-center font-bold text-[9px] text-white`}
                      >
                        {act.user.charAt(0)}
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-zinc-300 leading-snug">
                          <span className="font-semibold text-white">{act.user}</span>{' '}
                          <span className="text-zinc-400">{act.action}</span>
                        </div>
                        <div className="text-xs font-mono text-sky-400 truncate max-w-[220px]">
                          {act.target}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500">{act.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06] mt-6">
                <button
                  onClick={() => setWebhookModalOpen(true)}
                  className="w-full py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-xs font-medium text-zinc-300 hover:text-white transition flex items-center justify-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 text-purple-400" />
                  <span>Configure GitHub Live Webhooks</span>
                </button>
              </div>
            </div>
          </div>

          {/* ----------------- Bottom Row: Active Projects & Team Members ----------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="team-section">
            {/* Left 7 Cols: Active Projects Grid */}
            <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-[#090a0f]/90 border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <h2 className="text-base font-bold font-heading text-white">Active Projects</h2>
                  <p className="text-xs text-zinc-400">Engineering modules & delivery tracks</p>
                </div>
                <button
                  onClick={() => setCreateProjectOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-sky-400" />
                  <span>New Project</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {projects.map((prj) => {
                  const prjIssues = issues.filter((i) => i.projectId === prj.id);
                  const doneCount = prjIssues.filter((i) => i.status === 'DONE').length;
                  const total = prjIssues.length || 1;
                  const percent = Math.round((doneCount / total) * 100);

                  return (
                    <Link
                      key={prj.id}
                      href={`/projects/${prj.id}/issues`}
                      className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-sky-500/40 transition-all space-y-3 group block"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                          {prj.key}
                        </span>
                        <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">
                          {prj.name}
                        </div>
                        <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                          {prj.description || 'Core engineering service module'}
                        </div>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                          <span>{doneCount} of {total} completed</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right 5 Cols: Team Members Card */}
            <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-[#090a0f]/90 border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <h2 className="text-base font-bold font-heading text-white">Team Members</h2>
                  <p className="text-xs text-zinc-400">Engineers in active workspace</p>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  {members.length || 3} total
                </span>
              </div>

              <div className="space-y-3">
                {members.map((mem) => (
                  <div
                    key={mem.id}
                    className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-purple-600 border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                          {mem.user?.fullName?.charAt(0) || 'U'}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#090a0f]" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">
                          {mem.user?.fullName || 'Sanjay Kamal'}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {mem.user?.email || 'sanjaykamal2006@gmail.com'}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${
                        mem.role === 'OWNER'
                          ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                          : mem.role === 'ADMIN'
                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                          : 'bg-white/5 text-zinc-400 border-white/10'
                      }`}
                    >
                      {mem.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ----------------- Dialog Modals ----------------- */}
      {/* Create Issue Modal */}
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

      {/* Create Project Modal */}
      {selectedWorkspace && (
        <CreateProjectModal
          workspaceId={selectedWorkspace.id}
          isOpen={createProjectOpen}
          onClose={() => setCreateProjectOpen(false)}
          onCreated={handleProjectCreated}
        />
      )}

      {/* GitHub Inbound Webhook Modal */}
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
