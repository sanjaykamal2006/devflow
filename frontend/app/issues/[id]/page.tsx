'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  GitHubActivity,
  Issue,
  IssueComment,
  IssuePriority,
  IssueStatus,
  IssueType,
  Label,
  WorkspaceMember,
} from '@/types';
import { api } from '@/lib/api';
import {
  MessageSquare,
  GitCommit,
  GitPullRequest,
  Tag,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  Send,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

export default function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const issueId = resolvedParams.id;
  const { user } = useAuth();
  const router = useRouter();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<IssueComment[]>([]);
  const [activities, setActivities] = useState<GitHubActivity[]>([]);
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [descInput, setDescInput] = useState('');

  // Comment state
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  // Active tab in main area: comments or github
  const [mainTab, setMainTab] = useState<'comments' | 'github'>('comments');
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const issueData = await api.issues.get(issueId);
      setIssue(issueData);
      setTitleInput(issueData.title);
      setDescInput(issueData.description || '');

      const [commentsData, actsData, labelsData] = await Promise.all([
        api.comments.list(issueId),
        api.github.getActivities(issueId).catch(() => []),
        api.labels.list(issueData.projectId),
      ]);
      setComments(commentsData);
      setActivities(actsData);
      setAvailableLabels(labelsData);

      const proj = await api.projects.get(issueData.projectId);
      const membersData = await api.workspaces.getMembers(proj.workspaceId);
      setMembers(membersData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load issue');
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateStatus = async (newStatus: IssueStatus) => {
    if (!issue) return;
    try {
      const updated = await api.issues.changeStatus(issue.id, newStatus);
      setIssue((prev) => (prev ? { ...prev, status: updated.status } : null));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change status');
    }
  };

  const handleUpdatePriority = async (newPriority: IssuePriority) => {
    if (!issue) return;
    try {
      const updated = await api.issues.update(issue.id, { priority: newPriority });
      setIssue((prev) => (prev ? { ...prev, priority: updated.priority } : null));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change priority');
    }
  };

  const handleUpdateType = async (newType: IssueType) => {
    if (!issue) return;
    try {
      const updated = await api.issues.update(issue.id, { issueType: newType });
      setIssue((prev) => (prev ? { ...prev, issueType: updated.issueType } : null));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change type');
    }
  };

  const handleAssign = async (assigneeId: string) => {
    if (!issue) return;
    try {
      const updated = await api.issues.assign(issue.id, assigneeId || undefined);
      setIssue((prev) => (prev ? { ...prev, assignee: updated.assignee } : null));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update assignee');
    }
  };

  const handleSaveTitle = async () => {
    if (!issue || !titleInput.trim()) return;
    try {
      const updated = await api.issues.update(issue.id, { title: titleInput.trim() });
      setIssue((prev) => (prev ? { ...prev, title: updated.title } : null));
      setEditingTitle(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update title');
    }
  };

  const handleSaveDesc = async () => {
    if (!issue) return;
    try {
      const updated = await api.issues.update(issue.id, { description: descInput.trim() });
      setIssue((prev) => (prev ? { ...prev, description: updated.description } : null));
      setEditingDesc(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update description');
    }
  };

  const handleToggleLabel = async (labelId: string) => {
    if (!issue) return;
    const exists = issue.labels?.some((l) => l.id === labelId);
    try {
      let updated: Issue;
      if (exists) {
        updated = await api.issues.removeLabel(issue.id, labelId);
      } else {
        updated = await api.issues.attachLabel(issue.id, labelId);
      }
      setIssue((prev) => (prev ? { ...prev, labels: updated.labels } : null));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to toggle label');
    }
  };

  const handleDeleteIssue = async () => {
    if (!issue) return;
    if (!confirm(`Are you sure you want to delete ${issue.issueKey}?`)) return;
    try {
      await api.issues.delete(issue.id);
      router.push(`/projects/${issue.projectId}/issues`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete issue');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !issue) return;

    setPostingComment(true);
    try {
      const added = await api.comments.create(issue.id, { content: newComment.trim() });
      setComments((prev) => [...prev, added]);
      setNewComment('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editingCommentText.trim()) return;
    try {
      const updated = await api.comments.update(commentId, { content: editingCommentText.trim() });
      setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
      setEditingCommentId(null);
      setEditingCommentText('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to edit comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.comments.delete(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
    }
  };

  if (loading && !issue) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-sm text-zinc-400">Issue not found.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-xs font-mono text-zinc-300 underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <Link
            href={`/projects/${issue.projectId}/issues`}
            className="hover:text-zinc-300 flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>{issue.projectName}</span>
          </Link>
          <span>/</span>
          <span className="font-bold text-zinc-200">{issue.issueKey}</span>
        </div>

        <button
          onClick={handleDeleteIssue}
          className="text-zinc-500 hover:text-rose-400 p-1 rounded hover:bg-zinc-900 transition"
          title="Delete issue"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-2.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Main Content Layout: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Title, Description, Tabs (Comments / GitHub) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title Area */}
          <div>
            {editingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 focus:outline-none rounded px-3 py-1.5 text-base font-semibold text-white"
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setTitleInput(issue.title);
                    setEditingTitle(false);
                  }}
                  className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3 group">
                <h1 className="text-xl font-bold tracking-tight text-white">{issue.title}</h1>
                <button
                  onClick={() => setEditingTitle(true)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-zinc-300 rounded transition"
                  title="Edit title"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-xs font-mono uppercase text-zinc-500 tracking-wider">
              <span>Description</span>
              {!editingDesc && (
                <button
                  onClick={() => setEditingDesc(true)}
                  className="text-zinc-400 hover:text-zinc-200 text-xs font-sans normal-case flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {editingDesc ? (
              <div className="space-y-2">
                <textarea
                  rows={6}
                  autoFocus
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded p-2.5 text-xs text-zinc-100 focus:outline-none resize-none font-sans"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setDescInput(issue.description || '');
                      setEditingDesc(false);
                    }}
                    className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDesc}
                    className="px-3 py-1 bg-zinc-100 text-zinc-950 rounded text-xs font-medium hover:bg-white"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {issue.description || (
                  <span className="text-zinc-600 italic">No description provided.</span>
                )}
              </div>
            )}
          </div>

          {/* Tabs: Comments vs GitHub Activity */}
          <div>
            <div className="flex items-center gap-4 border-b border-zinc-800 text-xs font-medium pb-2 mb-4">
              <button
                onClick={() => setMainTab('comments')}
                className={`flex items-center gap-1.5 transition ${
                  mainTab === 'comments'
                    ? 'text-white font-semibold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Comments ({comments.length})</span>
              </button>

              <button
                onClick={() => setMainTab('github')}
                className={`flex items-center gap-1.5 transition ${
                  mainTab === 'github'
                    ? 'text-white font-semibold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <GitCommit className="w-3.5 h-3.5 text-sky-400" />
                <span>GitHub Activity ({activities.length})</span>
              </button>
            </div>

            {/* Tab: Comments Thread */}
            {mainTab === 'comments' && (
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="py-6 text-center text-xs text-zinc-600 font-mono">
                    No comments yet. Start the discussion below.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 space-y-2 group"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono text-[10px] text-zinc-300 font-medium">
                              {comment.author.fullName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-zinc-200">{comment.author.fullName}</span>
                            <span className="text-[11px] text-zinc-500 font-mono">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>

                          {/* Comment actions */}
                          {user?.id === comment.author.id && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditingCommentText(comment.content);
                                }}
                                className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-900"
                                title="Edit comment"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="p-1 text-zinc-500 hover:text-rose-400 rounded hover:bg-zinc-900"
                                title="Delete comment"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {editingCommentId === comment.id ? (
                          <div className="space-y-2 pt-1">
                            <textarea
                              rows={3}
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-zinc-100 focus:outline-none resize-none font-sans"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingCommentId(null)}
                                className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleUpdateComment(comment.id)}
                                className="px-3 py-1 bg-zinc-100 text-zinc-950 rounded text-xs font-medium hover:bg-white"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                            {comment.content}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment Input */}
                <form onSubmit={handleAddComment} className="space-y-2 pt-2">
                  <textarea
                    rows={3}
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-600 resize-none font-sans"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={postingComment || !newComment.trim()}
                      className="px-3.5 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {postingComment ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Post Comment</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab: GitHub Linked Activity */}
            {mainTab === 'github' && (
              <div className="space-y-3">
                {activities.length === 0 ? (
                  <div className="border border-dashed border-zinc-800 rounded-lg p-8 text-center text-xs text-zinc-500">
                    <GitCommit className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
                    <p>No GitHub activity linked to this issue yet.</p>
                    <p className="text-[11px] text-zinc-600 mt-1">
                      Include <code className="font-mono text-zinc-400">#{issue.issueKey}</code> or{' '}
                      <code className="font-mono text-zinc-400">{issue.issueKey}</code> in your commit message or PR title.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activities.map((act) => (
                      <div
                        key={act.id}
                        className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          {act.activityType === 'COMMIT' ? (
                            <GitCommit className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <GitPullRequest className="w-4 h-4 text-[#FFC554] flex-shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0">
                            <a
                              href={act.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-zinc-200 hover:underline hover:text-white flex items-center gap-1 truncate"
                            >
                              <span>{act.title}</span>
                              <ExternalLink className="w-3 h-3 text-zinc-500" />
                            </a>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-1">
                              <span>Author: {act.authorName || 'Unknown'}</span>
                              <span>•</span>
                              <span>Ref: {act.externalId.substring(0, 7)}</span>
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono text-zinc-500 flex-shrink-0">
                          {new Date(act.eventTimestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Metadata Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-800">
              Issue Properties
            </h3>

            {/* Status Select */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Status</label>
              <select
                value={issue.status}
                onChange={(e) => handleUpdateStatus(e.target.value as IssueStatus)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 font-medium"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            {/* Priority Select */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Priority</label>
              <select
                value={issue.priority}
                onChange={(e) => handleUpdatePriority(e.target.value as IssuePriority)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 font-medium"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {/* Type Select */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Type</label>
              <select
                value={issue.issueType}
                onChange={(e) => handleUpdateType(e.target.value as IssueType)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 font-medium"
              >
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
                <option value="FEATURE">Feature</option>
              </select>
            </div>

            {/* Assignee Select */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Assignee</label>
              <select
                value={issue.assignee?.id || ''}
                onChange={(e) => handleAssign(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Labels */}
            {availableLabels.length > 0 && (
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>Labels</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableLabels.map((lbl) => {
                    const isAttached = issue.labels?.some((l) => l.id === lbl.id);
                    return (
                      <button
                        key={lbl.id}
                        type="button"
                        onClick={() => handleToggleLabel(lbl.id)}
                        className={`text-[10px] px-2 py-0.5 rounded border transition ${
                          isAttached
                            ? 'bg-zinc-800 text-white border-zinc-600'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {lbl.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Metadata Timestamps */}
            <div className="pt-3 border-t border-zinc-800 text-[11px] text-zinc-500 space-y-1.5 font-mono">
              <div className="flex items-center justify-between">
                <span>Reporter:</span>
                <span className="text-zinc-300 font-sans">{issue.reporter.fullName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Created:</span>
                <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Updated:</span>
                <span>{new Date(issue.updatedAt).toLocaleDateString()}</span>
              </div>
              {issue.dueDate && (
                <div className="flex items-center justify-between text-amber-400">
                  <span>Due Date:</span>
                  <span>{new Date(issue.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
