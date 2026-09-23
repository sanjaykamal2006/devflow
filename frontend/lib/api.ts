import {
  ApiResponse,
  PagedResponse,
  User,
  Workspace,
  WorkspaceMember,
  WorkspaceRole,
  Project,
  Issue,
  IssueStatus,
  IssuePriority,
  IssueType,
  Label,
  IssueComment,
  GitHubRepository,
  GitHubActivity,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export class ApiError extends Error {
  status: number;
  errorCode: string;
  fieldErrors?: Record<string, string>;

  constructor(status: number, errorCode: string, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
    this.fieldErrors = fieldErrors;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('devflow_token');
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('devflow_token', token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('devflow_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    const status = response.status;
    const errorCode = body?.error || 'UNKNOWN_ERROR';
    const message = body?.message || response.statusText || 'An unexpected error occurred';
    const fieldErrors = body?.fieldErrors;

    if (status === 401 && typeof window !== 'undefined') {
      // Don't auto-redirect on login page
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        clearToken();
        window.location.href = '/login';
      }
    }

    throw new ApiError(status, errorCode, message, fieldErrors);
  }

  if (body && typeof body === 'object' && 'data' in body) {
    return (body as ApiResponse<T>).data;
  }

  return body as T;
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; fullName: string }) =>
      request<{ accessToken: string; tokenType: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ accessToken: string; tokenType: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logout: () =>
      request<void>('/api/auth/logout', { method: 'POST' }),
    getMe: () =>
      request<User>('/api/users/me'),
    updateProfile: (data: { fullName?: string; avatarUrl?: string }) =>
      request<User>('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  workspaces: {
    list: () =>
      request<Workspace[]>('/api/workspaces'),
    get: (id: string) =>
      request<Workspace>(`/api/workspaces/${id}`),
    create: (data: { name: string; slug?: string; description?: string }) =>
      request<Workspace>('/api/workspaces', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { name: string; description?: string }) =>
      request<Workspace>(`/api/workspaces/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/api/workspaces/${id}`, { method: 'DELETE' }),
    getMembers: (id: string) =>
      request<WorkspaceMember[]>(`/api/workspaces/${id}/members`),
    addMember: (id: string, data: { email: string; role: WorkspaceRole }) =>
      request<WorkspaceMember>(`/api/workspaces/${id}/members`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateMemberRole: (id: string, userId: string, data: { role: WorkspaceRole }) =>
      request<WorkspaceMember>(`/api/workspaces/${id}/members/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    removeMember: (id: string, userId: string) =>
      request<void>(`/api/workspaces/${id}/members/${userId}`, { method: 'DELETE' }),
  },

  projects: {
    list: (workspaceId: string) =>
      request<Project[]>(`/api/workspaces/${workspaceId}/projects`),
    get: (id: string) =>
      request<Project>(`/api/projects/${id}`),
    create: (workspaceId: string, data: { name: string; key: string; description?: string }) =>
      request<Project>(`/api/workspaces/${workspaceId}/projects`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { name: string; description?: string }) =>
      request<Project>(`/api/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/api/projects/${id}`, { method: 'DELETE' }),
  },

  issues: {
    list: (
      projectId: string,
      params?: {
        status?: IssueStatus;
        priority?: IssuePriority;
        issueType?: IssueType;
        assigneeId?: string;
        labelId?: string;
        search?: string;
        page?: number;
        size?: number;
        sort?: string;
      }
    ) => {
      const query = new URLSearchParams();
      if (params) {
        if (params.status) query.set('status', params.status);
        if (params.priority) query.set('priority', params.priority);
        if (params.issueType) query.set('issueType', params.issueType);
        if (params.assigneeId) query.set('assigneeId', params.assigneeId);
        if (params.labelId) query.set('labelId', params.labelId);
        if (params.search) query.set('search', params.search);
        if (params.page !== undefined) query.set('page', params.page.toString());
        if (params.size !== undefined) query.set('size', params.size.toString());
        if (params.sort) query.set('sort', params.sort);
      }
      const qs = query.toString();
      return request<PagedResponse<Issue>>(`/api/projects/${projectId}/issues${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) =>
      request<Issue>(`/api/issues/${id}`),
    getByKey: (key: string) =>
      request<Issue>(`/api/issues/key/${key}`),
    create: (
      projectId: string,
      data: {
        title: string;
        description?: string;
        issueType?: IssueType;
        priority?: IssuePriority;
        assigneeId?: string;
        labelIds?: string[];
        dueDate?: string;
      }
    ) =>
      request<Issue>(`/api/projects/${projectId}/issues`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (
      id: string,
      data: {
        title?: string;
        description?: string;
        status?: IssueStatus;
        priority?: IssuePriority;
        issueType?: IssueType;
        assigneeId?: string;
        unassign?: boolean;
        labelIds?: string[];
        dueDate?: string;
      }
    ) =>
      request<Issue>(`/api/issues/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    changeStatus: (id: string, status: IssueStatus) =>
      request<Issue>(`/api/issues/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    assign: (id: string, assigneeId?: string) =>
      request<Issue>(`/api/issues/${id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ assigneeId }),
      }),
    delete: (id: string) =>
      request<void>(`/api/issues/${id}`, { method: 'DELETE' }),
    attachLabel: (issueId: string, labelId: string) =>
      request<Issue>(`/api/issues/${issueId}/labels/${labelId}`, { method: 'POST' }),
    removeLabel: (issueId: string, labelId: string) =>
      request<Issue>(`/api/issues/${issueId}/labels/${labelId}`, { method: 'DELETE' }),
  },

  labels: {
    list: (projectId: string) =>
      request<Label[]>(`/api/projects/${projectId}/labels`),
    create: (projectId: string, data: { name: string; color?: string; description?: string }) =>
      request<Label>(`/api/projects/${projectId}/labels`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (projectId: string, labelId: string) =>
      request<void>(`/api/projects/${projectId}/labels/${labelId}`, { method: 'DELETE' }),
  },

  comments: {
    list: (issueId: string) =>
      request<IssueComment[]>(`/api/issues/${issueId}/comments`),
    create: (issueId: string, data: { content: string }) =>
      request<IssueComment>(`/api/issues/${issueId}/comments`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { content: string }) =>
      request<IssueComment>(`/api/comments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/api/comments/${id}`, { method: 'DELETE' }),
  },

  github: {
    getRepo: (projectId: string) =>
      request<GitHubRepository>(`/api/projects/${projectId}/github`),
    connect: (projectId: string, data: { owner: string; name: string; webhookSecret?: string }) =>
      request<GitHubRepository>(`/api/projects/${projectId}/github`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    disconnect: (projectId: string) =>
      request<void>(`/api/projects/${projectId}/github`, { method: 'DELETE' }),
    sync: (projectId: string) =>
      request<{ newlyLinkedCommits: number }>(`/api/projects/${projectId}/github/sync`, { method: 'POST' }),
    getActivities: (issueId: string) =>
      request<GitHubActivity[]>(`/api/issues/${issueId}/github-activity`),
  },
};
