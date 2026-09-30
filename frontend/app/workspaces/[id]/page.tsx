'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Project, Workspace, WorkspaceMember, WorkspaceRole } from '@/types';
import { api } from '@/lib/api';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import {
  FolderGit2,
  Users,
  Plus,
  ArrowRight,
  Shield,
  Loader2,
  Trash2,
  UserPlus,
  GitBranch,
} from 'lucide-react';

export default function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const workspaceId = resolvedParams.id;
  const { user } = useAuth();
  const router = useRouter();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'members'>('projects');
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('MEMBER');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [wsData, projData, memData] = await Promise.all([
        api.workspaces.get(workspaceId),
        api.projects.list(workspaceId),
        api.workspaces.getMembers(workspaceId),
      ]);
      setWorkspace(wsData);
      setProjects(projData);
      setMembers(memData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load workspace');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const canManage = workspace?.currentUserRole === 'OWNER' || workspace?.currentUserRole === 'ADMIN';
  const isOwner = workspace?.currentUserRole === 'OWNER';

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setError(null);
    setSuccess(null);

    try {
      const added = await api.workspaces.addMember(workspaceId, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setMembers((prev) => [...prev, added]);
      setInviteEmail('');
      setSuccess(`Invited ${added.user.fullName} (${added.user.email}) as ${added.role}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: WorkspaceRole) => {
    try {
      await api.workspaces.updateMemberRole(workspaceId, targetUserId, { role: newRole });
      setMembers((prev) =>
        prev.map((m) => (m.user.id === targetUserId ? { ...m, role: newRole } : m))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change role');
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.workspaces.removeMember(workspaceId, targetUserId);
      setMembers((prev) => prev.filter((m) => m.user.id !== targetUserId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!confirm('Are you sure you want to PERMANENTLY delete this workspace and all its projects and issues?')) return;
    try {
      await api.workspaces.delete(workspaceId);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete workspace');
    }
  };

  if (loading && !workspace) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-sm text-zinc-400">Workspace not found.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-xs font-mono text-zinc-300 underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-8">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">{workspace.name}</h1>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-zinc-900 border border-white/[0.08] text-zinc-300">
              <Shield className="w-3 h-3 text-zinc-400" aria-hidden="true" />
              <span>{workspace.currentUserRole}</span>
            </span>
          </div>
          {workspace.description && (
            <p className="text-xs text-zinc-400 mt-1.5 max-w-2xl">{workspace.description}</p>
          )}
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setCreateProjectOpen(true)}
            className="h-9 px-4 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 transition-all duration-150 shadow-[0_0_16px_rgba(255,255,255,0.12)] flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>New Project</span>
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="my-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="my-4 p-3 rounded-lg bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs font-mono">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-6 mt-6 border-b border-white/[0.06] text-xs font-medium" role="tablist" aria-label="Workspace tabs">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'projects'}
          onClick={() => setActiveTab('projects')}
          className={`pb-3 flex items-center gap-2 border-b-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 rounded-t transition-all duration-150 ${
            activeTab === 'projects'
              ? 'border-white text-white font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Projects (<span className="tabular-nums">{projects.length}</span>)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'members'}
          onClick={() => setActiveTab('members')}
          className={`pb-3 flex items-center gap-2 border-b-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 rounded-t transition-all duration-150 ${
            activeTab === 'members'
              ? 'border-white text-white font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Team Members (<span className="tabular-nums">{members.length}</span>)</span>
        </button>
      </div>

      {/* Tab: Projects */}
      {activeTab === 'projects' && (
        <div className="mt-6">
          {projects.length === 0 ? (
            <div className="border border-dashed border-white/[0.08] rounded-2xl p-12 text-center bg-zinc-950/40">
              <FolderGit2 className="w-8 h-8 text-zinc-600 mx-auto mb-3" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-zinc-200">No projects yet</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Create a project (like <span className="font-mono text-zinc-400">API</span> or{' '}
                <span className="font-mono text-zinc-400">WEB</span>) to organize issues and track development work.
              </p>
              {canManage && (
                <button
                  type="button"
                  onClick={() => setCreateProjectOpen(true)}
                  className="mt-4 px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-[0_0_16px_rgba(255,255,255,0.12)] transition-all duration-150 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Create Project</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => (
                <Link
                  key={proj.id}
                  href={`/projects/${proj.id}/issues`}
                  className="linear-card rounded-2xl p-5 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-white/[0.08] mb-2 inline-block">
                          {proj.key}
                        </span>
                        <h3 className="text-base font-semibold text-zinc-100 group-hover:text-white truncate">
                          {proj.name}
                        </h3>
                      </div>
                      {proj.githubConnected && (
                        <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-800/60" title="Connected to GitHub">
                          <GitBranch className="w-3 h-3" aria-hidden="true" />
                          <span>GitHub</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2 min-h-[36px] mb-4">
                      {proj.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <div className="flex items-center gap-3 tabular-nums">
                      <span>{proj.totalIssues} issues</span>
                      <span aria-hidden="true" className="text-zinc-700">•</span>
                      <span className="text-emerald-400">{proj.doneIssues} done</span>
                    </div>

                    <span className="text-zinc-500 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all duration-150 flex items-center gap-1 text-xs">
                      <span>Board</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Members */}
      {activeTab === 'members' && (
        <div className="mt-6 space-y-6">
          {/* Invite Form */}
          {canManage && (
            <div className="linear-card rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
                <UserPlus className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                <span>Invite Workspace Member</span>
              </h3>
              <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  required
                  autoComplete="email"
                  spellCheck={false}
                  inputMode="email"
                  aria-label="Colleague email address"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 h-9 bg-zinc-950 border border-white/[0.08] focus:border-white/[0.25] rounded-lg px-3 text-xs text-zinc-100 placeholder-zinc-500 transition-colors"
                />

                <select
                  aria-label="Member role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                  className="h-9 bg-zinc-950 border border-white/[0.08] rounded-lg px-3 text-xs text-zinc-200 focus:outline-none focus:border-white/[0.25] font-mono transition-colors"
                >
                  <option value="MEMBER">Role: MEMBER</option>
                  <option value="ADMIN">Role: ADMIN</option>
                </select>

                <button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="h-9 px-4 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-[0_0_12px_rgba(255,255,255,0.1)]"
                >
                  {inviting && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
                  <span>Add Member</span>
                </button>
              </form>
            </div>
          )}

          {/* Members Table */}
          <div className="border border-white/[0.08] rounded-2xl overflow-hidden bg-[#0c0c0e]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] bg-zinc-950/60 text-zinc-400 font-mono uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4 font-semibold">Member</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Joined</th>
                  {canManage && <th className="py-3 px-4 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-900/30 transition-colors duration-150">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/[0.1] flex items-center justify-center font-mono font-medium text-xs text-zinc-200 tabular-nums shadow-inner">
                          {m.user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-zinc-200">{m.user.fullName}</div>
                          <div className="text-[11px] text-zinc-500 font-mono">{m.user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {isOwner && m.role !== 'OWNER' ? (
                        <select
                          aria-label={`Change role for ${m.user.fullName}`}
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.user.id, e.target.value as WorkspaceRole)}
                          className="h-7 bg-zinc-900 border border-white/[0.08] rounded-md px-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-white/[0.25] transition-colors"
                        >
                          <option value="MEMBER">MEMBER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      ) : (
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-zinc-900 border border-white/[0.08] text-zinc-300">
                          {m.role}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-zinc-400 font-mono text-xs tabular-nums">
                      {new Date(m.joinedAt).toLocaleDateString()}
                    </td>

                    {canManage && (
                      <td className="py-3 px-4 text-right">
                        {m.role !== 'OWNER' && m.user.id !== user?.id && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(m.user.id)}
                            aria-label={`Remove ${m.user.fullName} from workspace`}
                            className="p-1.5 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
                            title="Remove member"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Danger Zone */}
          {isOwner && (
            <div className="pt-6 border-t border-white/[0.06]">
              <div className="border border-rose-950/60 bg-rose-950/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-rose-300 uppercase tracking-wider font-mono">Danger Zone</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Permanently delete this workspace and all associated projects, issues, and comments.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteWorkspace}
                  className="h-9 px-4 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded-lg text-xs font-semibold transition-colors self-start sm:self-auto cursor-pointer"
                >
                  Delete Workspace
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        workspaceId={workspaceId}
        isOpen={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        onCreated={(newProj) => setProjects((prev) => [newProj, ...prev])}
      />
    </div>
  );
}
