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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase">{workspace.name}</h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 text-zinc-300 border border-white/10">
              <Shield className="w-2.5 h-2.5 text-[#FFC554]" />
              {workspace.currentUserRole}
            </span>
          </div>
          {workspace.description && (
            <p className="text-xs text-zinc-400 mt-1.5 max-w-2xl font-normal leading-relaxed">{workspace.description}</p>
          )}
        </div>

        {canManage && (
          <button
            onClick={() => setCreateProjectOpen(true)}
            className="px-4 py-2.5 bg-[#FFC554] hover:bg-[#ffd166] text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg shadow-[#FFC554]/10 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Project</span>
          </button>
        )}
      </div>

      {error && (
        <div className="my-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="my-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mt-6 border-b border-white/10 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 uppercase tracking-wider text-[11px] transition-all ${
            activeTab === 'projects'
              ? 'bg-[#FFC554] text-black font-black shadow-md shadow-[#FFC554]/10'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 uppercase tracking-wider text-[11px] transition-all ${
            activeTab === 'members'
              ? 'bg-[#FFC554] text-black font-black shadow-md shadow-[#FFC554]/10'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Team ({members.length})</span>
        </button>
      </div>

      {/* Tab: Projects */}
      {activeTab === 'projects' && (
        <div className="mt-6">
          {projects.length === 0 ? (
            <div className="border border-dashed border-white/10 rounded-[24px] p-12 text-center bg-zinc-950/40">
              <FolderGit2 className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">No projects yet</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Create a project (like <span className="font-mono text-zinc-300">CORE</span> or{' '}
                <span className="font-mono text-zinc-300">WEB</span>) to organize issues and track development work.
              </p>
              {canManage && (
                <button
                  onClick={() => setCreateProjectOpen(true)}
                  className="mt-5 px-4 py-2.5 bg-[#FFC554] hover:bg-[#ffd166] text-black rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Create Project</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((proj) => (
                <Link
                  key={proj.id}
                  href={`/projects/${proj.id}/issues`}
                  className="group bg-zinc-950/80 hover:bg-zinc-900/60 border border-white/10 hover:border-[#FFC554]/50 rounded-[24px] p-5 transition-all duration-200 flex flex-col justify-between hover:-translate-y-0.5 shadow-sm hover:shadow-xl hover:shadow-[#FFC554]/5"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-white/5 text-[#FFC554] border border-white/10 mb-2 inline-block">
                          {proj.key}
                        </span>
                        <h3 className="text-sm font-black text-white group-hover:text-[#FFC554] transition-colors truncate">
                          {proj.name}
                        </h3>
                      </div>
                      {proj.githubConnected && (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20" title="Connected to GitHub">
                          <GitBranch className="w-3 h-3" />
                          <span>GitHub</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2 min-h-[32px] mb-5 font-normal leading-relaxed">
                      {proj.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-500 font-mono">
                    <div className="flex items-center gap-3">
                      <span>{proj.totalIssues} issues</span>
                      <span>•</span>
                      <span className="text-emerald-400">{proj.doneIssues} done</span>
                    </div>

                    <span className="text-zinc-400 group-hover:text-[#FFC554] group-hover:translate-x-0.5 transition flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
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
            <div className="p-5 rounded-[24px] bg-zinc-950/80 border border-white/10 shadow-sm">
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#FFC554]" />
                <span>Invite Workspace Member</span>
              </h3>
              <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 bg-white/[0.03] border border-white/10 focus:border-[#FFC554] focus:outline-none rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 font-medium transition-all"
                />

                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                  className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-[#FFC554] font-bold uppercase tracking-wider"
                >
                  <option value="MEMBER">Role: MEMBER</option>
                  <option value="ADMIN">Role: ADMIN</option>
                </select>

                <button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="px-5 py-2.5 bg-[#FFC554] hover:bg-[#ffd166] text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
                >
                  {inviting && <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />}
                  <span>Invite</span>
                </button>
              </form>
            </div>
          )}

          {/* Members Table */}
          <div className="border border-white/10 rounded-[24px] overflow-hidden bg-zinc-950/80 shadow-sm">
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
