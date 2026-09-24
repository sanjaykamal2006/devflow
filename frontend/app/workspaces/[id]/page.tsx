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
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-white">{workspace.name}</h1>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-800 border border-zinc-700 text-zinc-300">
              <Shield className="w-2.5 h-2.5 text-zinc-400" />
              {workspace.currentUserRole}
            </span>
          </div>
          {workspace.description && (
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">{workspace.description}</p>
          )}
        </div>

        {canManage && (
          <button
            onClick={() => setCreateProjectOpen(true)}
            className="px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-zinc-950 rounded-md text-xs font-medium transition shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        )}
      </div>

      {error && (
        <div className="my-4 p-3 rounded-md bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {success && (
        <div className="my-4 p-3 rounded-md bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-mono">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-4 mt-6 border-b border-zinc-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'projects'
              ? 'border-zinc-200 text-white font-medium'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'members'
              ? 'border-zinc-200 text-white font-medium'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Team Members ({members.length})</span>
        </button>
      </div>

      {/* Tab: Projects */}
      {activeTab === 'projects' && (
        <div className="mt-6">
          {projects.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-lg p-12 text-center bg-zinc-900/10">
              <FolderGit2 className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-zinc-200">No projects yet</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Create a project (like <span className="font-mono text-zinc-400">API</span> or{' '}
                <span className="font-mono text-zinc-400">WEB</span>) to organize issues and track development work.
              </p>
              {canManage && (
                <button
                  onClick={() => setCreateProjectOpen(true)}
                  className="mt-4 px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-zinc-950 rounded-md text-xs font-medium inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
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
                  className="group border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/60 rounded-lg p-5 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 mb-1 inline-block">
                          {proj.key}
                        </span>
                        <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white truncate">
                          {proj.name}
                        </h3>
                      </div>
                      {proj.githubConnected && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/60" title="Connected to GitHub">
                          <GitBranch className="w-3 h-3" />
                          <span>GitHub</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2 min-h-[32px] mb-4">
                      {proj.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 font-mono">
                    <div className="flex items-center gap-3">
                      <span>{proj.totalIssues} issues</span>
                      <span>•</span>
                      <span className="text-emerald-400">{proj.doneIssues} done</span>
                    </div>

                    <span className="text-zinc-400 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition flex items-center gap-1 text-[11px]">
                      <span>Board</span>
                      <ArrowRight className="w-3 h-3" />
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
            <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800">
              <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-zinc-400" />
                <span>Invite Workspace Member</span>
              </h3>
              <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 h-9 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-md px-3 text-xs text-zinc-100 placeholder-zinc-500"
                />

                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                  className="h-9 bg-zinc-950 border border-zinc-800 rounded-md px-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono"
                >
                  <option value="MEMBER">Role: MEMBER</option>
                  <option value="ADMIN">Role: ADMIN</option>
                </select>

                <button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-zinc-950 rounded-md text-xs font-medium transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {inviting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Add Member</span>
                </button>
              </form>
            </div>
          )}

          {/* Members Table */}
          <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Member</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Joined</th>
                  {canManage && <th className="py-2.5 px-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-900/30 transition">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-medium text-xs text-zinc-300">
                          {m.user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-zinc-200">{m.user.fullName}</div>
                          <div className="text-[11px] text-zinc-500 font-mono">{m.user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      {isOwner && m.role !== 'OWNER' ? (
                        <select
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.user.id, e.target.value as WorkspaceRole)}
                          className="bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-xs text-zinc-200 font-mono"
                        >
                          <option value="MEMBER">MEMBER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      ) : (
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                          {m.role}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-zinc-500 font-mono text-[11px]">
                      {new Date(m.joinedAt).toLocaleDateString()}
                    </td>

                    {canManage && (
                      <td className="py-2.5 px-3 text-right">
                        {m.role !== 'OWNER' && m.user.id !== user?.id && (
                          <button
                            onClick={() => handleRemoveMember(m.user.id)}
                            className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition"
                            title="Remove member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Danger Zone: Workspace Deletion */}
          {isOwner && (
            <div className="pt-6 border-t border-zinc-900">
              <div className="border border-rose-950/60 bg-rose-950/10 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-rose-300">Delete Workspace</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Permanently delete this workspace and all associated projects, issues, and comments. This cannot be undone.
                  </p>
                </div>
                <button
                  onClick={handleDeleteWorkspace}
                  className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded text-xs font-medium transition self-start sm:self-auto"
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
