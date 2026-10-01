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
import { PriorityBadge } from '@/components/PriorityBadge';
import { TypeBadge } from '@/components/TypeBadge';
import { MarkdownContent, MarkdownEditor } from '@/components/MarkdownContent';
import { getWebhookConfig, sendWebhookNotification } from '@/lib/webhook-dispatcher';
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
  Calendar,
  User as UserIcon,
  History,
  CircleDot,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: string;
  icon: React.ReactNode;
  badgeClass: string;
  title: string;
  actor: string;
  description: string;
  isMarkdown?: boolean;
  url?: string;
  ref?: string;
}

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

  // Active tab in main area: comments, github, or timeline
  const [mainTab, setMainTab] = useState<'comments' | 'github' | 'timeline'>('comments');
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
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);

      // Outgoing webhook automation
      const webhookConfig = getWebhookConfig(issue.projectId);
      if (webhookConfig.enabled) {
        sendWebhookNotification(webhookConfig, {
          eventType: 'STATUS_CHANGED',
          projectKey: issue.projectKey || issue.issueKey.split('-')[0],
          projectName: issue.projectKey || 'DevFlow',
          issueKey: issue.issueKey,
          issueTitle: issue.title,
          issuePriority: issue.priority,
          issueStatus: newStatus,
          authorName: user?.fullName || 'Engineer',
        }).catch(() => {});
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change status';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleUpdatePriority = async (newPriority: IssuePriority) => {
    if (!issue) return;
    try {
      const updated = await api.issues.update(issue.id, { priority: newPriority });
      setIssue((prev) => (prev ? { ...prev, priority: updated.priority } : null));
      toast.success(`Priority updated to ${newPriority}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change priority';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleUpdateType = async (newType: IssueType) => {
    if (!issue) return;
    try {
      const updated = await api.issues.update(issue.id, { issueType: newType });
      setIssue((prev) => (prev ? { ...prev, issueType: updated.issueType } : null));
      toast.success(`Type changed to ${newType}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change type';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleAssign = async (assigneeId: string) => {
    if (!issue) return;
    try {
      const updated = await api.issues.assign(issue.id, assigneeId || undefined);
      setIssue((prev) => (prev ? { ...prev, assignee: updated.assignee } : null));
      toast.success('Assignee updated');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update assignee';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleSaveTitle = async () => {
    if (!issue || !titleInput.trim()) return;
    try {
      const updated = await api.issues.update(issue.id, { title: titleInput.trim() });
      setIssue((prev) => (prev ? { ...prev, title: updated.title } : null));
      setEditingTitle(false);
      toast.success('Title updated');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update title';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleSaveDesc = async () => {
    if (!issue) return;
    try {
      const updated = await api.issues.update(issue.id, { description: descInput.trim() });
      setIssue((prev) => (prev ? { ...prev, description: updated.description } : null));
      setEditingDesc(false);
      toast.success('Description updated');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update description';
      setError(msg);
      toast.error(msg);
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
      toast.success('Labels updated');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle label';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDeleteIssue = async () => {
    if (!issue) return;
    if (!confirm(`Are you sure you want to delete ${issue.issueKey}?`)) return;
    try {
      await api.issues.delete(issue.id);
      toast.success(`Deleted issue ${issue.issueKey}`);
      router.push(`/projects/${issue.projectId}/issues`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete issue';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !issue) return;

    setPostingComment(true);
    try {
      const added = await api.comments.create(issue.id, { content: newComment.trim() });
      setComments((prev) => [...prev, added]);

      // Outgoing webhook automation
      const webhookConfig = getWebhookConfig(issue.projectId);
      if (webhookConfig.enabled) {
        sendWebhookNotification(webhookConfig, {
          eventType: 'COMMENT_ADDED',
          projectKey: issue.projectKey || issue.issueKey.split('-')[0],
          projectName: issue.projectKey || 'DevFlow',
          issueKey: issue.issueKey,
          issueTitle: issue.title,
          authorName: user?.fullName || 'Engineer',
          commentBody: newComment.trim(),
        }).catch(() => {});
      }

      setNewComment('');
      toast.success('Comment posted');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to post comment';
      setError(msg);
      toast.error(msg);
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
      toast.success('Comment updated');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to edit comment';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.comments.delete(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete comment';
      setError(msg);
      toast.error(msg);
    }
  };

  // Generate chronological audit timeline from issue events, comments, and git links
  const timelineEvents: TimelineEvent[] = issue
    ? [
        {
          id: 'evt-created',
          timestamp: issue.createdAt,
          type: 'create',
          icon: <CircleDot className="w-3 h-3 text-emerald-400" />,
          badgeClass: 'bg-emerald-950/80 border-emerald-700/60',
          title: 'Issue opened',
          actor: issue.reporter.fullName,
          description: `Created issue ${issue.issueKey} (${issue.issueType}) with priority ${issue.priority}.`,
        },
        ...activities.map((act) => ({
          id: `evt-gh-${act.id}`,
          timestamp: act.eventTimestamp,
          type: 'github',
          icon:
            act.activityType === 'COMMIT' ? (
              <GitCommit className="w-3 h-3 text-sky-400" />
            ) : (
              <GitPullRequest className="w-3 h-3 text-emerald-400" />
            ),
          badgeClass: 'bg-sky-950/80 border-sky-700/60',
          title: act.activityType === 'COMMIT' ? 'Git commit referenced' : 'Pull request referenced',
          actor: act.authorName || 'GitHub',
          description: act.title,
          url: act.url,
          ref: act.externalId.substring(0, 7),
        })),
        ...comments.map((comm) => ({
          id: `evt-comment-${comm.id}`,
          timestamp: comm.createdAt,
          type: 'comment',
          icon: <MessageSquare className="w-3 h-3 text-indigo-400" />,
          badgeClass: 'bg-indigo-950/80 border-indigo-700/60',
          title: 'Comment added',
          actor: comm.author.fullName,
          description: comm.content,
          isMarkdown: true,
        })),
        ...(issue.updatedAt &&
        new Date(issue.updatedAt).getTime() > new Date(issue.createdAt).getTime() + 1000
          ? [
              {
                id: 'evt-updated',
                timestamp: issue.updatedAt,
                type: 'update',
                icon: <CheckCircle2 className="w-3 h-3 text-purple-400" />,
                badgeClass: 'bg-purple-950/80 border-purple-700/60',
                title: `Status at ${issue.status.replace('_', ' ')}`,
                actor: issue.assignee ? `Assigned: ${issue.assignee.fullName}` : 'Unassigned',
                description: `Current priority: ${issue.priority} • Type: ${issue.issueType}${
                  issue.dueDate ? ` • Due: ${new Date(issue.dueDate).toLocaleDateString()}` : ''
                }`,
              },
            ]
          : []),
      ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : [];

  if (loading && !issue) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-6 animate-pulse">
        <div className="flex justify-between items-center pb-4 border-b border-white/[0.06]">
          <div className="h-5 bg-zinc-900 rounded w-40" />
          <div className="h-9 bg-zinc-900 rounded-lg w-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-10 bg-zinc-900/80 rounded-xl w-3/4" />
            <div className="h-32 bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-4" />
            <div className="h-48 bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-4" />
          </div>
          <div className="space-y-4">
            <div className="h-72 bg-zinc-900/50 border border-white/[0.06] rounded-2xl p-5" />
          </div>
        </div>
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
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header: Breadcrumbs & Actions */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <Link
            href={`/projects/${issue.projectId}/issues`}
            className="hover:text-zinc-200 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{issue.projectName || 'Issues'}</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-zinc-200 bg-zinc-900 px-2 py-0.5 rounded-md border border-white/[0.08]">
            {issue.issueKey}
          </span>
        </div>

        <button
          type="button"
          onClick={handleDeleteIssue}
          aria-label="Delete issue"
          className="text-zinc-500 hover:text-rose-400 p-2 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-white/[0.06] transition-colors cursor-pointer"
          title="Delete issue"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 cols): Title, Description, Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title Area */}
          <div className="linear-card rounded-2xl p-5">
            {editingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  aria-label="Edit issue title"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/[0.12] focus:border-white/[0.25] rounded-lg px-3 py-1.5 text-base font-semibold text-white focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={handleSaveTitle}
                  aria-label="Save title"
                  className="p-2 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 transition-colors cursor-pointer shrink-0"
                >
                  <Check className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitleInput(issue.title);
                    setEditingTitle(false);
                  }}
                  aria-label="Cancel title editing"
                  className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-white/[0.08] transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4 group">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
                  {issue.title}
                </h1>
                <button
                  type="button"
                  onClick={() => setEditingTitle(true)}
                  aria-label="Edit title"
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 border border-transparent hover:border-white/[0.08] transition-all cursor-pointer shrink-0"
                  title="Edit title"
                >
                  <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="linear-card rounded-2xl p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06] text-xs font-mono uppercase text-zinc-400 tracking-wider">
              <span>Description</span>
              {!editingDesc && (
                <button
                  type="button"
                  onClick={() => setEditingDesc(true)}
                  aria-label="Edit description"
                  className="text-zinc-400 hover:text-zinc-200 text-xs font-sans normal-case flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" aria-hidden="true" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {editingDesc ? (
              <div className="space-y-3">
                <MarkdownEditor
                  value={descInput}
                  onChange={setDescInput}
                  minRows={6}
                  placeholder="Issue description in Markdown…"
                  enableAiPolish={true}
                  issueTitle={issue.title}
                  issueType={issue.issueType}
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDescInput(issue.description || '');
                      setEditingDesc(false);
                    }}
                    className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDesc}
                    className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg text-xs font-semibold transition-all shadow-[0_0_12px_rgba(255,255,255,0.1)] cursor-pointer"
                  >
                    Save Description
                  </button>
                </div>
              </div>
            ) : (
              <div className="min-h-[48px] py-1">
                <MarkdownContent content={issue.description || ''} />
              </div>
            )}
          </div>

          {/* Tabs: Comments vs GitHub Activity */}
          <div className="linear-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-6 border-b border-white/[0.06] text-xs font-medium pb-3" role="tablist" aria-label="Issue discussion tabs">
              <button
                type="button"
                role="tab"
                aria-selected={mainTab === 'comments'}
                onClick={() => setMainTab('comments')}
                className={`flex items-center gap-2 pb-1 border-b-2 transition-all cursor-pointer ${
                  mainTab === 'comments'
                    ? 'border-white text-white font-semibold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Comments (<span className="tabular-nums">{comments.length}</span>)</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={mainTab === 'github'}
                onClick={() => setMainTab('github')}
                className={`flex items-center gap-2 pb-1 border-b-2 transition-all cursor-pointer ${
                  mainTab === 'github'
                    ? 'border-white text-white font-semibold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <GitCommit className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
                <span>GitHub Activity (<span className="tabular-nums">{activities.length}</span>)</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={mainTab === 'timeline'}
                onClick={() => setMainTab('timeline')}
                className={`flex items-center gap-2 pb-1 border-b-2 transition-all cursor-pointer ${
                  mainTab === 'timeline'
                    ? 'border-white text-white font-semibold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <History className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
                <span>Audit Timeline (<span className="tabular-nums">{timelineEvents.length}</span>)</span>
              </button>
            </div>

            {/* Tab: Comments Thread */}
            {mainTab === 'comments' && (
              <div className="space-y-4 pt-1">
                {comments.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500 font-mono border border-dashed border-white/[0.06] rounded-xl bg-zinc-950/40">
                    No comments yet. Start the conversation below.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-xl border border-white/[0.06] bg-zinc-950/70 p-4 space-y-2 group"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/[0.1] flex items-center justify-center font-mono text-[10px] text-zinc-200 font-medium tabular-nums shadow-inner">
                              {comment.author.fullName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-zinc-200">{comment.author.fullName}</span>
                            <span className="text-[11px] text-zinc-500 font-mono tabular-nums">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>

                          {/* Comment actions */}
                          {user?.id === comment.author.id && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditingCommentText(comment.content);
                                }}
                                aria-label="Edit comment"
                                className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-900 transition-colors"
                                title="Edit comment"
                              >
                                <Edit2 className="w-3 h-3" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(comment.id)}
                                aria-label="Delete comment"
                                className="p-1 text-zinc-500 hover:text-rose-400 rounded hover:bg-zinc-900 transition-colors"
                                title="Delete comment"
                              >
                                <Trash2 className="w-3 h-3" aria-hidden="true" />
                              </button>
                            </div>
                          )}
                        </div>

                        {editingCommentId === comment.id ? (
                          <div className="space-y-2 pt-1">
                            <MarkdownEditor
                              value={editingCommentText}
                              onChange={setEditingCommentText}
                              minRows={3}
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingCommentId(null)}
                                className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateComment(comment.id)}
                                className="px-3.5 py-1 bg-white text-zinc-950 rounded-lg text-xs font-semibold hover:bg-zinc-200 transition-all shadow-sm"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-zinc-300 pl-8 pt-0.5">
                            <MarkdownContent content={comment.content} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment Input */}
                <form onSubmit={handleAddComment} className="space-y-2.5 pt-2">
                  <MarkdownEditor
                    value={newComment}
                    onChange={setNewComment}
                    placeholder="Write a comment or status update using markdown…"
                    minRows={3}
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={postingComment || !newComment.trim()}
                      className="px-4 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-[0_0_12px_rgba(255,255,255,0.1)] cursor-pointer"
                    >
                      {postingComment ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <Send className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                      <span>Post Comment</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab: GitHub Linked Activity */}
            {mainTab === 'github' && (
              <div className="space-y-3 pt-1">
                {activities.length === 0 ? (
                  <div className="border border-dashed border-white/[0.08] rounded-xl p-8 text-center text-xs text-zinc-400 bg-zinc-950/40">
                    <GitCommit className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
                    <p>No GitHub activity linked to this issue yet.</p>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Include <code className="font-mono text-zinc-300">#{issue.issueKey}</code> or{' '}
                      <code className="font-mono text-zinc-300">{issue.issueKey}</code> in your commit message or PR title.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activities.map((act) => (
                      <div
                        key={act.id}
                        className="rounded-xl border border-white/[0.06] bg-zinc-950/70 p-3.5 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          {act.activityType === 'COMMIT' ? (
                            <GitCommit className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                          ) : (
                            <GitPullRequest className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0">
                            <a
                              href={act.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-zinc-200 hover:underline hover:text-white flex items-center gap-1.5 truncate"
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

                        <span className="text-[10px] font-mono text-zinc-500 shrink-0 tabular-nums">
                          {new Date(act.eventTimestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Audit Timeline */}
            {mainTab === 'timeline' && (
              <div className="space-y-4 pt-1">
                {timelineEvents.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500 font-mono border border-dashed border-white/[0.06] rounded-xl bg-zinc-950/40">
                    No timeline events recorded yet.
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/[0.08]">
                    {timelineEvents.map((evt) => (
                      <div key={evt.id} className="relative flex items-start gap-3 group">
                        {/* Node point */}
                        <div
                          className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center border shadow-sm ${evt.badgeClass}`}
                        >
                          {evt.icon}
                        </div>

                        {/* Event content */}
                        <div className="w-full bg-zinc-950/70 border border-white/[0.06] rounded-xl p-3.5 space-y-1.5 transition-colors hover:border-white/[0.12]">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{evt.title}</span>
                              <span className="text-zinc-500 font-mono text-[10px]">•</span>
                              <span className="text-zinc-400 font-mono text-[11px]">{evt.actor}</span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500 tabular-nums">
                              {new Date(evt.timestamp).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          {evt.isMarkdown ? (
                            <div className="text-xs text-zinc-300 pt-0.5">
                              <MarkdownContent content={evt.description} />
                            </div>
                          ) : evt.url ? (
                            <div className="text-xs text-zinc-300 flex items-center gap-2">
                              <a
                                href={evt.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sky-400 hover:underline flex items-center gap-1 font-mono text-xs"
                              >
                                <span>{evt.description}</span>
                                <ExternalLink className="w-3 h-3 text-sky-400" />
                              </a>
                              {evt.ref && (
                                <span className="font-mono text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-white/[0.06]">
                                  {evt.ref}
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-400 leading-relaxed">{evt.description}</p>
                          )}
                        </div>
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
          <div className="linear-card rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 pb-3 border-b border-white/[0.06] font-semibold">
              Issue Properties
            </h3>

            {/* Status Select */}
            <div>
              <label htmlFor="issue-prop-status" className="block text-[11px] font-mono text-zinc-400 mb-1.5">
                Status
              </label>
              <select
                id="issue-prop-status"
                value={issue.status}
                onChange={(e) => handleUpdateStatus(e.target.value as IssueStatus)}
                className="w-full bg-zinc-950 border border-white/[0.08] focus:border-white/[0.25] rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none transition-colors"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            {/* Priority Select */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="issue-prop-priority" className="block text-[11px] font-mono text-zinc-400">
                  Priority
                </label>
                <PriorityBadge priority={issue.priority} size="sm" showIcon={false} />
              </div>
              <select
                id="issue-prop-priority"
                value={issue.priority}
                onChange={(e) => handleUpdatePriority(e.target.value as IssuePriority)}
                className="w-full bg-zinc-950 border border-white/[0.08] focus:border-white/[0.25] rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none transition-colors"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {/* Type Select */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="issue-prop-type" className="block text-[11px] font-mono text-zinc-400">
                  Type
                </label>
                <TypeBadge type={issue.issueType} size="sm" />
              </div>
              <select
                id="issue-prop-type"
                value={issue.issueType}
                onChange={(e) => handleUpdateType(e.target.value as IssueType)}
                className="w-full bg-zinc-950 border border-white/[0.08] focus:border-white/[0.25] rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none transition-colors"
              >
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
                <option value="FEATURE">Feature</option>
              </select>
            </div>

            {/* Assignee Select */}
            <div>
              <label htmlFor="issue-prop-assignee" className="block text-[11px] font-mono text-zinc-400 mb-1.5">
                Assignee
              </label>
              <select
                id="issue-prop-assignee"
                value={issue.assignee?.id || ''}
                onChange={(e) => handleAssign(e.target.value)}
                className="w-full bg-zinc-950 border border-white/[0.08] focus:border-white/[0.25] rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none transition-colors"
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
                <span className="block text-[11px] font-mono text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-zinc-500" aria-hidden="true" />
                  <span>Labels</span>
                </span>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Available labels">
                  {availableLabels.map((lbl) => {
                    const isAttached = issue.labels?.some((l) => l.id === lbl.id);
                    return (
                      <button
                        key={lbl.id}
                        type="button"
                        onClick={() => handleToggleLabel(lbl.id)}
                        aria-pressed={isAttached}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          isAttached
                            ? 'bg-zinc-800 text-white border-white/[0.2]'
                            : 'bg-zinc-950 text-zinc-400 border-white/[0.08] hover:border-white/[0.16]'
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
            <div className="pt-3 border-t border-white/[0.06] text-[11px] text-zinc-500 space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UserIcon className="w-3 h-3 text-zinc-500" />
                  <span>Reporter:</span>
                </span>
                <span className="text-zinc-300 font-sans">{issue.reporter.fullName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-zinc-500" />
                  <span>Created:</span>
                </span>
                <span className="tabular-nums">{new Date(issue.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Updated:</span>
                <span className="tabular-nums">{new Date(issue.updatedAt).toLocaleDateString()}</span>
              </div>
              {issue.dueDate && (
                <div className="flex items-center justify-between text-amber-400">
                  <span>Due Date:</span>
                  <span className="tabular-nums">{new Date(issue.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
