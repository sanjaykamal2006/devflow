/**
 * Demo Data Generator for DevFlow
 *
 * This file contains ISOLATED demo/preview data used ONLY for:
 * - Development UI previews
 * - Demo sandbox mode
 * - Design system showcases
 *
 * IMPORTANT: This data is NEVER mixed with real user data.
 * Real application state comes from the database via API layer.
 */

import {
  User,
  Workspace,
  WorkspaceMember,
  Project,
  Issue,
  IssueStatus,
  IssuePriority,
  IssueType,
  Label,
  IssueComment,
} from '@/types';

/**
 * Generate fictional demo users
 * These are CLEARLY FICTIONAL and used only for demos
 */
export function generateDemoUsers(): User[] {
  return [
    {
      id: 'demo-usr-1',
      email: 'alex.morgan@example.com',
      fullName: 'Alex Morgan',
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-usr-2',
      email: 'jordan.lee@example.com',
      fullName: 'Jordan Lee',
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-usr-3',
      email: 'taylor.chen@example.com',
      fullName: 'Taylor Chen',
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    },
  ];
}

/**
 * Generate demo workspace
 */
export function generateDemoWorkspace(owner: User): Workspace {
  return {
    id: 'demo-ws-1',
    name: 'Demo Engineering Workspace',
    slug: 'demo-engineering',
    description: 'Demonstration workspace with sample projects and issues',
    owner,
    currentUserRole: 'OWNER',
    memberCount: 3,
    projectCount: 2,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate demo projects
 */
export function generateDemoProjects(workspaceId: string, workspaceName: string, creator: User): Project[] {
  return [
    {
      id: 'demo-prj-1',
      workspaceId,
      workspaceName,
      name: 'Backend API Service',
      key: 'API',
      description: 'REST API backend with authentication and database layer',
      createdBy: creator,
      totalIssues: 5,
      openIssues: 3,
      doneIssues: 2,
      githubConnected: false,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-prj-2',
      workspaceId,
      workspaceName,
      name: 'Web Application',
      key: 'WEB',
      description: 'Frontend user interface and responsive components',
      createdBy: creator,
      totalIssues: 3,
      openIssues: 2,
      doneIssues: 1,
      githubConnected: false,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

/**
 * Generate demo issues
 */
export function generateDemoIssues(projects: Project[], users: User[]): Issue[] {
  const [p1, p2] = projects;
  const [user1, user2, user3] = users;

  if (!p1 || !p2 || !user1 || !user2 || !user3) {
    return [];
  }

  return [
    {
      id: 'demo-iss-1',
      projectId: p1.id,
      projectKey: p1.key,
      projectName: p1.name,
      issueKey: 'API-1',
      sequenceNumber: 1,
      title: 'Configure JWT authentication filter',
      description: 'Implement stateless JWT token validation with RBAC roles.',
      status: 'DONE' as IssueStatus,
      priority: 'HIGH' as IssuePriority,
      issueType: 'FEATURE' as IssueType,
      reporter: user1,
      assignee: user1,
      labels: [],
      commentCount: 0,
      githubActivityCount: 0,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'demo-iss-2',
      projectId: p1.id,
      projectKey: p1.key,
      projectName: p1.name,
      issueKey: 'API-2',
      sequenceNumber: 2,
      title: 'Implement database row-level locking',
      description: 'Use pessimistic locking to prevent race conditions.',
      status: 'DONE' as IssueStatus,
      priority: 'CRITICAL' as IssuePriority,
      issueType: 'BUG' as IssueType,
      reporter: user1,
      assignee: user2,
      labels: [],
      commentCount: 0,
      githubActivityCount: 0,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'demo-iss-3',
      projectId: p1.id,
      projectKey: p1.key,
      projectName: p1.name,
      issueKey: 'API-3',
      sequenceNumber: 3,
      title: 'Add webhook signature verification',
      description: 'Validate incoming HMAC headers on webhooks.',
      status: 'IN_REVIEW' as IssueStatus,
      priority: 'HIGH' as IssuePriority,
      issueType: 'FEATURE' as IssueType,
      reporter: user1,
      assignee: user1,
      labels: [],
      commentCount: 0,
      githubActivityCount: 0,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'demo-iss-4',
      projectId: p1.id,
      projectKey: p1.key,
      projectName: p1.name,
      issueKey: 'API-4',
      sequenceNumber: 4,
      title: 'Set up caching layer with fallback',
      description: 'Cache issue queries with transparent fallback.',
      status: 'IN_PROGRESS' as IssueStatus,
      priority: 'MEDIUM' as IssuePriority,
      issueType: 'TASK' as IssueType,
      reporter: user1,
      assignee: user3,
      labels: [],
      commentCount: 0,
      githubActivityCount: 0,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'demo-iss-5',
      projectId: p1.id,
      projectKey: p1.key,
      projectName: p1.name,
      issueKey: 'API-5',
      sequenceNumber: 5,
      title: 'Implement cascading deletion',
      description: 'Ensure clean workspace deletion with related entities.',
      status: 'TODO' as IssueStatus,
      priority: 'MEDIUM' as IssuePriority,
      issueType: 'TASK' as IssueType,
      reporter: user1,
      assignee: user1,
      labels: [],
      commentCount: 0,
      githubActivityCount: 0,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'demo-iss-6',
      projectId: p2.id,
      projectKey: p2.key,
      projectName: p2.name,
      issueKey: 'WEB-1',
      sequenceNumber: 1,
      title: 'Design responsive Kanban board',
      description: 'Provide intuitive kanban experience on all devices.',
      status: 'IN_PROGRESS' as IssueStatus,
      priority: 'HIGH' as IssuePriority,
      issueType: 'FEATURE' as IssueType,
      reporter: user1,
      assignee: user1,
      labels: [],
      commentCount: 0,
      githubActivityCount: 0,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-iss-7',
      projectId: p2.id,
      projectKey: p2.key,
      projectName: p2.name,
      issueKey: 'WEB-2',
      sequenceNumber: 2,
      title: 'Implement command palette (Cmd+K)',
      description: 'Fast keyboard-driven navigation across workspace.',
      status: 'DONE' as IssueStatus,
      priority: 'MEDIUM' as IssuePriority,
      issueType: 'FEATURE' as IssueType,
      reporter: user1,
      assignee: user2,
      labels: [],
      commentCount: 0,
      githubActivityCount: 0,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'demo-iss-8',
      projectId: p2.id,
      projectKey: p2.key,
      projectName: p2.name,
      issueKey: 'WEB-3',
      sequenceNumber: 3,
      title: 'Add inline issue editing',
      description: 'Allow quick edits without page refreshes.',
      status: 'TODO' as IssueStatus,
      priority: 'MEDIUM' as IssuePriority,
      issueType: 'TASK' as IssueType,
      reporter: user1,
      assignee: null,
      labels: [],
      commentCount: 0,
      githubActivityCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

/**
 * Generate demo activity items
 */
export interface DemoActivity {
  id: string;
  user: string;
  avatarColor: string;
  action: string;
  target: string;
  time: string;
  type: 'issue' | 'project' | 'status' | 'ci';
}

export function generateDemoActivities(users: User[]): DemoActivity[] {
  const [user1, user2, user3] = users;

  if (!user1 || !user2 || !user3) {
    return [];
  }

  return [
    {
      id: 'demo-act-1',
      user: user1.fullName || 'Developer',
      avatarColor: 'from-sky-400 to-blue-600',
      action: 'created issue',
      target: 'API-3 Add webhook signature verification',
      time: '4m',
      type: 'issue',
    },
    {
      id: 'demo-act-2',
      user: user2.fullName || 'Developer',
      avatarColor: 'from-purple-400 to-indigo-600',
      action: 'moved to Done',
      target: 'WEB-2 Command palette',
      time: '18m',
      type: 'status',
    },
    {
      id: 'demo-act-3',
      user: user3.fullName || 'Developer',
      avatarColor: 'from-amber-400 to-orange-500',
      action: 'assigned',
      target: 'API-4 Caching layer',
      time: '1h',
      type: 'issue',
    },
    {
      id: 'demo-act-4',
      user: user1.fullName || 'Developer',
      avatarColor: 'from-sky-400 to-blue-600',
      action: 'created project',
      target: 'Backend API Service',
      time: '5h',
      type: 'project',
    },
  ];
}

/**
 * Check if running in demo mode
 */
export function isDemoDataActive(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('devflow_demo_mode') === 'true';
}
