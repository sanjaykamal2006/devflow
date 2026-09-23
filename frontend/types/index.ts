export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export type IssueStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IssueType = 'TASK' | 'BUG' | 'FEATURE';

export type GitHubActivityType = 'COMMIT' | 'PULL_REQUEST';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  owner: User;
  currentUserRole: WorkspaceRole;
  memberCount: number;
  projectCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  user: User;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  workspaceName: string;
  name: string;
  key: string;
  description?: string | null;
  createdBy: User;
  totalIssues: number;
  openIssues: number;
  doneIssues: number;
  githubConnected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  projectId: string;
  name: string;
  color: string;
  description?: string | null;
}

export interface Issue {
  id: string;
  projectId: string;
  projectKey: string;
  projectName: string;
  issueKey: string;
  sequenceNumber: number;
  title: string;
  description?: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  issueType: IssueType;
  reporter: User;
  assignee?: User | null;
  labels: Label[];
  dueDate?: string | null;
  commentCount: number;
  githubActivityCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IssueComment {
  id: string;
  issueId: string;
  author: User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubRepository {
  id: string;
  projectId: string;
  repoOwner: string;
  repoName: string;
  repoUrl: string;
  defaultBranch: string;
  webhookConfigured: boolean;
  connectedAt: string;
  starsCount?: number | null;
  forksCount?: number | null;
  openIssuesCount?: number | null;
}

export interface GitHubActivity {
  id: string;
  issueId: string;
  issueKey: string;
  activityType: GitHubActivityType;
  externalId: string;
  title: string;
  url: string;
  authorName?: string | null;
  authorAvatarUrl?: string | null;
  eventTimestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: Record<string, string>;
}
