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

import { mockStore } from './mock-store';

let demoModeActive = false;

export function isDemoMode(): boolean {
  return demoModeActive;
}

function handleMockFallback<T>(endpoint: string, options: RequestInit = {}): T {
  demoModeActive = true;
  const method = (options.method || 'GET').toUpperCase();
  let body: Record<string, unknown> = {};
  try {
    if (options.body && typeof options.body === 'string') {
      body = JSON.parse(options.body);
    }
  } catch {
    body = {};
  }

  // Clean query string from endpoint for routing
  const cleanEndpoint = endpoint.split('?')[0];

  // Auth
  if (cleanEndpoint === '/api/auth/register') {
    return mockStore.register((body.email as string) || 'demo@devflow.io', (body.fullName as string) || 'Demo Developer') as unknown as T;
  }
  if (cleanEndpoint === '/api/auth/login') {
    return mockStore.login((body.email as string) || 'demo@devflow.io') as unknown as T;
  }
  if (cleanEndpoint === '/api/auth/logout') {
    return undefined as unknown as T;
  }
  if (cleanEndpoint === '/api/users/me') {
    return mockStore.getMe() as unknown as T;
  }

  // Workspaces
  if (cleanEndpoint === '/api/workspaces') {
    if (method === 'POST') {
      return mockStore.createWorkspace(body as unknown as { name: string; slug?: string; description?: string }) as unknown as T;
    }
    return mockStore.listWorkspaces() as unknown as T;
  }
  if (cleanEndpoint.startsWith('/api/workspaces/')) {
    const parts = cleanEndpoint.split('/');
    const wsId = parts[3];
    const sub = parts[4];

    if (!sub) {
      if (method === 'DELETE') {
        mockStore.deleteWorkspace(wsId);
        return undefined as unknown as T;
      }
      return mockStore.getWorkspace(wsId) as unknown as T;
    }
    if (sub === 'members') {
      if (method === 'POST') {
        return mockStore.addMember(wsId, (body.email as string) || 'member@devflow.io', (body.role as unknown as WorkspaceRole) || 'MEMBER') as unknown as T;
      }
      return mockStore.getWorkspaceMembers(wsId) as unknown as T;
    }
    if (sub === 'projects') {
      if (method === 'POST') {
        return mockStore.createProject(wsId, body as unknown as { name: string; key: string; description?: string }) as unknown as T;
      }
      return mockStore.listProjects(wsId) as unknown as T;
    }
  }

  // Projects
  if (cleanEndpoint.startsWith('/api/projects/')) {
    const parts = cleanEndpoint.split('/');
    const prjId = parts[3];
    const sub = parts[4];

    if (!sub) {
      if (method === 'DELETE') {
        mockStore.deleteProject(prjId);
        return undefined as unknown as T;
      }
      return mockStore.getProject(prjId) as unknown as T;
    }
    if (sub === 'issues') {
      if (method === 'POST') {
        return mockStore.createIssue(prjId, body as unknown as { title: string; description?: string; issueType?: IssueType; priority?: IssuePriority; assigneeId?: string }) as unknown as T;
      }
      return mockStore.listIssues(prjId) as unknown as T;
    }
    if (sub === 'labels') {
      if (method === 'POST') {
        return mockStore.createLabel(prjId, body as unknown as { name: string; color?: string }) as unknown as T;
      }
      return mockStore.listLabels(prjId) as unknown as T;
    }
    if (sub === 'github') {
      return {
        id: 'gh-1',
        projectId: prjId,
        repoOwner: 'demo',
        repoName: 'devflow-repo',
        repoUrl: 'https://github.com/demo/devflow-repo',
        defaultBranch: 'main',
        lastSyncAt: new Date().toISOString(),
      } as unknown as T;
    }
  }

  // Issues
  if (cleanEndpoint.startsWith('/api/issues/')) {
    const parts = cleanEndpoint.split('/');
    const issueId = parts[3];
    const sub = parts[4];

    if (!sub) {
      if (method === 'DELETE') {
        mockStore.deleteIssue(issueId);
        return undefined as unknown as T;
      }
      return mockStore.getIssue(issueId) as unknown as T;
    }
    if (sub === 'status' && method === 'PATCH') {
      return mockStore.changeIssueStatus(issueId, (body.status as unknown as IssueStatus) || 'TODO') as unknown as T;
    }
    if (sub === 'comments') {
      if (method === 'POST') {
        return mockStore.createComment(issueId, (body.content as string) || '') as unknown as T;
      }
      return mockStore.listComments(issueId) as unknown as T;
    }
    if (sub === 'github-activity') {
      return [] as unknown as T;
    }
  }

  return [] as unknown as T;
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

  try {
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
  } catch (networkError: unknown) {
    if (networkError instanceof ApiError) {
      throw networkError;
    }
    // If fetch failed due to offline backend / CORS / mixed content, seamlessly fall back to client-side mock store!
    return handleMockFallback<T>(endpoint, options);
  }
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
