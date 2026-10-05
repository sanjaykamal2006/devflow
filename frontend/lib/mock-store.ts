import {
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
  PagedResponse,
} from '@/types';

const STORAGE_KEY = 'devflow_mock_db_v3';

interface MockDatabase {
  currentUser: User | null;
  users: User[];
  workspaces: Workspace[];
  members: WorkspaceMember[];
  projects: Project[];
  issues: Issue[];
  comments: IssueComment[];
  labels: Label[];
  githubRepos: GitHubRepository[];
  githubActivities: GitHubActivity[];
}

function getInitialDatabase(): MockDatabase {
  const defaultUser: User = {
    id: 'usr-1',
    email: 'alex.morgan@example.com',
    fullName: 'Alex Morgan',
    avatarUrl: null,
    createdAt: new Date().toISOString(),
  };

  const user2: User = {
    id: 'usr-2',
    email: 'jordan.lee@example.com',
    fullName: 'Jordan Lee',
    createdAt: new Date().toISOString(),
  };

  const user3: User = {
    id: 'usr-3',
    email: 'taylor.chen@example.com',
    fullName: 'Taylor Chen',
    createdAt: new Date().toISOString(),
  };

  const ws1: Workspace = {
    id: 'ws-1',
    name: 'DevFlow Engineering',
    slug: 'devflow-engineering',
    description: 'Primary engineering workspace for platform and web applications',
    owner: defaultUser,
    currentUserRole: 'OWNER',
    memberCount: 3,
    projectCount: 2,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const members: WorkspaceMember[] = [
    {
      id: 'wsm-1',
      user: defaultUser,
      role: 'OWNER',
      joinedAt: ws1.createdAt,
    },
    {
      id: 'wsm-2',
      user: user2,
      role: 'ADMIN',
      joinedAt: ws1.createdAt,
    },
    {
      id: 'wsm-3',
      user: user3,
      role: 'MEMBER',
      joinedAt: ws1.createdAt,
    },
  ];

  const p1: Project = {
    id: 'prj-1',
    workspaceId: ws1.id,
    workspaceName: ws1.name,
    name: 'Backend API',
    key: 'API',
    description: 'Spring Boot REST backend services, auth filters, and database schemas',
    createdBy: defaultUser,
    totalIssues: 5,
    openIssues: 3,
    doneIssues: 2,
    githubConnected: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const p2: Project = {
    id: 'prj-2',
    workspaceId: ws1.id,
    workspaceName: ws1.name,
    name: 'Frontend Client',
    key: 'WEB',
    description: 'Next.js 15 user interface, kanban board, and responsive layouts',
    createdBy: defaultUser,
    totalIssues: 3,
    openIssues: 2,
    doneIssues: 1,
    githubConnected: false,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const labels: Label[] = [
    { id: 'lbl-1', projectId: p1.id, name: 'backend', color: '#6366F1' },
    { id: 'lbl-2', projectId: p1.id, name: 'security', color: '#EF4444' },
    { id: 'lbl-3', projectId: p1.id, name: 'database', color: '#10B981' },
    { id: 'lbl-4', projectId: p1.id, name: 'p0', color: '#F59E0B' },
    { id: 'lbl-5', projectId: p2.id, name: 'frontend', color: '#3B82F6' },
    { id: 'lbl-6', projectId: p2.id, name: 'ui', color: '#8B5CF6' },
  ];

  const issues: Issue[] = [
    {
      id: 'iss-1',
      projectId: p1.id,
      projectKey: p1.key,
      projectName: p1.name,
      issueKey: 'API-1',
      sequenceNumber: 1,
      title: 'Configure JWT authentication filter and token expiration handling',
      description: 'Implement stateless JWT token validation filter with custom authentication entry point and RBAC roles.',
      status: 'DONE',
      priority: 'HIGH',
      issueType: 'FEATURE',
      reporter: defaultUser,
      assignee: defaultUser,
      labels: [labels[0], labels[1]],
      commentCount: 1,
      githubActivityCount: 1,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'iss-2',
      projectId: p1.id,
      projectKey: p1.key,
      projectName: p1.name,
      issueKey: 'API-2',
      sequenceNumber: 2,
      title: 'Implement database sequence generation with row-level locking',
      description: 'Use pessimistic locking to prevent race conditions during concurrent issue key generation.',
      status: 'DONE',
      priority: 'CRITICAL',
      issueType: 'BUG',
      reporter: defaultUser,
      assignee: user2,
      labels: [labels[0], labels[2], labels[3]],
      commentCount: 0,
      githubActivityCount: 0,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'iss-3',
      projectId: p1.id,
      projectKey: p1.key,
      projectName: p1.name,
      issueKey: 'API-3',
      sequenceNumber: 3,
      title: 'Add webhook signature verification for GitHub integrations',
      description: 'Validate incoming X-Hub-Signature-256 HMAC headers on push and pull-request webhooks.',
      status: 'IN_REVIEW',
      priority: 'HIGH',
      issueType: 'FEATURE',
      reporter: defaultUser,
      assignee: defaultUser,
      labels: [labels[0], labels[1]],
      commentCount: 0,
      githubActivityCount: 2,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'iss-4',
      projectId: p1.id,
      projectKey: p1.key,
      projectName: p1.name,
      issueKey: 'API-4',
      sequenceNumber: 4,
      title: 'Set up Redis caching with database fallback for issue queries',
      description: 'Cache issue lists by project in Redis with transparent fallback to PostgreSQL when cache is unavailable.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      issueType: 'TASK',
      reporter: defaultUser,
      assignee: user3,
      labels: [labels[0], labels[2]],
      commentCount: 0,
      githubActivityCount: 0,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'iss-5',
      projectId: p1.id,
      projectKey: p1.key,
      projectName: p1.name,
      issueKey: 'API-5',
      sequenceNumber: 5,
      title: 'Implement cascading deletion for workspace cleanup',
      description: 'Ensure related projects, issues, comments, and members are deleted cleanly when a workspace is removed.',
      status: 'TODO',
      priority: 'MEDIUM',
      issueType: 'TASK',
      reporter: defaultUser,
      assignee: defaultUser,
      labels: [labels[0]],
      commentCount: 0,
      githubActivityCount: 0,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'iss-6',
      projectId: p2.id,
      projectKey: p2.key,
      projectName: p2.name,
      issueKey: 'WEB-1',
      sequenceNumber: 1,
      title: 'Design responsive Kanban board with fluid horizontal swipe on mobile',
      description: 'Provide an intuitive kanban experience on mobile devices and responsive multi-column board on desktop.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      issueType: 'FEATURE',
      reporter: defaultUser,
      assignee: defaultUser,
      labels: [labels[4], labels[5]],
      commentCount: 0,
      githubActivityCount: 0,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'iss-7',
      projectId: p2.id,
      projectKey: p2.key,
      projectName: p2.name,
      issueKey: 'WEB-2',
      sequenceNumber: 2,
      title: 'Implement global search and command palette (Cmd+K)',
      description: 'Fast keyboard-driven navigation across workspaces, projects, issues, and quick creation actions.',
      status: 'DONE',
      priority: 'MEDIUM',
      issueType: 'FEATURE',
      reporter: defaultUser,
      assignee: user2,
      labels: [labels[4]],
      commentCount: 0,
      githubActivityCount: 0,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'iss-8',
      projectId: p2.id,
      projectKey: p2.key,
      projectName: p2.name,
      issueKey: 'WEB-3',
      sequenceNumber: 3,
      title: 'Add inline issue editing and quick status stepping',
      description: 'Allow engineers to edit issue title, description, and properties without page refreshes.',
      status: 'TODO',
      priority: 'MEDIUM',
      issueType: 'TASK',
      reporter: defaultUser,
      assignee: null,
      labels: [labels[4], labels[5]],
      commentCount: 0,
      githubActivityCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const comments: IssueComment[] = [
    {
      id: 'cmt-1',
      issueId: 'iss-1',
      author: defaultUser,
      content: 'JWT filter configuration verified against standard test suite.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  return {
    currentUser: defaultUser,
    users: [defaultUser, user2, user3],
    workspaces: [ws1],
    members,
    projects: [p1, p2],
    issues,
    comments,
    labels,
    githubRepos: [],
    githubActivities: [],
  };
}

class MockStore {
  private load(): MockDatabase {
    if (typeof window === 'undefined') return getInitialDatabase();
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    const init = getInitialDatabase();
    this.save(init);
    return init;
  }

  private save(db: MockDatabase): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      // ignore
    }
  }

  // Auth
  register(email: string, fullName: string): { accessToken: string; tokenType: string; user: User } {
    const db = this.load();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const user: User = existing || {
      id: `usr-${Date.now()}`,
      email,
      fullName: fullName || email.split('@')[0],
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    };

    if (!existing) {
      db.users.push(user);
    }
    db.currentUser = user;

    // Ensure user has at least one workspace
    if (db.workspaces.length === 0) {
      const newWs: Workspace = {
        id: `ws-${Date.now()}`,
        name: `${user.fullName}'s Workspace`,
        slug: 'primary-workspace',
        description: 'Default engineering workspace',
        owner: user,
        currentUserRole: 'OWNER',
        memberCount: 1,
        projectCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.workspaces.push(newWs);
      db.members.push({
        id: `wsm-${Date.now()}`,
        user,
        role: 'OWNER',
        joinedAt: new Date().toISOString(),
      });
    }

    this.save(db);
    return {
      accessToken: `mock-jwt-token-${user.id}`,
      tokenType: 'Bearer',
      user,
    };
  }

  login(email: string): { accessToken: string; tokenType: string; user: User } {
    return this.register(email, email.split('@')[0]);
  }

  getMe(): User {
    const db = this.load();
    return db.currentUser || db.users[0] || getInitialDatabase().users[0];
  }

  updateProfile(data: { fullName?: string; avatarUrl?: string }): User {
    const db = this.load();
    const me = this.getMe();
    const user = db.users.find((u) => u.id === me.id) || me;
    if (data.fullName !== undefined) user.fullName = data.fullName;
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl || null;
    db.currentUser = user;
    this.save(db);
    return user;
  }

  // Workspaces
  listWorkspaces(): Workspace[] {
    const db = this.load();
    return db.workspaces.map((ws) => ({
      ...ws,
      projectCount: db.projects.filter((p) => p.workspaceId === ws.id).length,
      memberCount: db.members.length,
    }));
  }

  getWorkspace(id: string): Workspace {
    const db = this.load();
    const ws = db.workspaces.find((w) => w.id === id) || db.workspaces[0];
    return {
      ...ws,
      projectCount: db.projects.filter((p) => p.workspaceId === ws.id).length,
      memberCount: db.members.length,
    };
  }

  createWorkspace(data: { name: string; slug?: string; description?: string }): Workspace {
    const db = this.load();
    const me = this.getMe();
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: data.description || null,
      owner: me,
      currentUserRole: 'OWNER',
      memberCount: 1,
      projectCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.workspaces.unshift(newWs);
    db.members.push({
      id: `wsm-${Date.now()}`,
      user: me,
      role: 'OWNER',
      joinedAt: new Date().toISOString(),
    });
    this.save(db);
    return newWs;
  }

  updateWorkspace(id: string, data: { name?: string; description?: string }): Workspace {
    const db = this.load();
    const ws = db.workspaces.find((w) => w.id === id);
    if (ws) {
      if (data.name !== undefined) ws.name = data.name;
      if (data.description !== undefined) ws.description = data.description || null;
      ws.updatedAt = new Date().toISOString();
      this.save(db);
      return ws;
    }
    return db.workspaces[0];
  }

  deleteWorkspace(id: string): void {
    const db = this.load();
    db.workspaces = db.workspaces.filter((w) => w.id !== id);
    db.projects = db.projects.filter((p) => p.workspaceId !== id);
    this.save(db);
  }

  getWorkspaceMembers(workspaceId: string): WorkspaceMember[] {
    const db = this.load();
    const ws = db.workspaces.find((w) => w.id === workspaceId);
    return ws ? db.members : db.members;
  }

  addMember(workspaceId: string, email: string, role: WorkspaceRole): WorkspaceMember {
    const db = this.load();
    const ws = db.workspaces.find((w) => w.id === workspaceId);
    if (ws) {
      ws.memberCount = (ws.memberCount || 1) + 1;
    }
    const user: User = {
      id: `usr-${Date.now()}`,
      email,
      fullName: email.split('@')[0],
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    const member: WorkspaceMember = {
      id: `wsm-${Date.now()}`,
      user,
      role,
      joinedAt: new Date().toISOString(),
    };
    db.members.push(member);
    this.save(db);
    return member;
  }

  updateMemberRole(workspaceId: string, userId: string, role: WorkspaceRole): WorkspaceMember {
    const db = this.load();
    const member = db.members.find((m) => m.user.id === userId);
    if (member) {
      member.role = role;
      this.save(db);
      return member;
    }
    return db.members[0];
  }

  removeMember(workspaceId: string, userId: string): void {
    const db = this.load();
    db.members = db.members.filter((m) => m.user.id !== userId);
    const ws = db.workspaces.find((w) => w.id === workspaceId);
    if (ws && ws.memberCount && ws.memberCount > 1) {
      ws.memberCount -= 1;
    }
    this.save(db);
  }

  // Projects
  listProjects(workspaceId: string): Project[] {
    const db = this.load();
    return db.projects
      .filter((p) => p.workspaceId === workspaceId)
      .map((p) => {
        const pIssues = db.issues.filter((i) => i.projectId === p.id);
        return {
          ...p,
          totalIssues: pIssues.length,
          openIssues: pIssues.filter((i) => i.status !== 'DONE').length,
          doneIssues: pIssues.filter((i) => i.status === 'DONE').length,
        };
      });
  }

  getProject(id: string): Project {
    const db = this.load();
    const p = db.projects.find((proj) => proj.id === id) || db.projects[0];
    const pIssues = db.issues.filter((i) => i.projectId === p.id);
    return {
      ...p,
      totalIssues: pIssues.length,
      openIssues: pIssues.filter((i) => i.status !== 'DONE').length,
      doneIssues: pIssues.filter((i) => i.status === 'DONE').length,
    };
  }

  createProject(workspaceId: string, data: { name: string; key: string; description?: string }): Project {
    const db = this.load();
    const me = this.getMe();
    const ws = db.workspaces.find((w) => w.id === workspaceId) || db.workspaces[0];
    const newProj: Project = {
      id: `prj-${Date.now()}`,
      workspaceId,
      workspaceName: ws.name,
      name: data.name,
      key: data.key.toUpperCase(),
      description: data.description || null,
      createdBy: me,
      totalIssues: 0,
      openIssues: 0,
      doneIssues: 0,
      githubConnected: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.projects.unshift(newProj);
    this.save(db);
    return newProj;
  }

  updateProject(id: string, data: { name?: string; description?: string }): Project {
    const db = this.load();
    const p = db.projects.find((proj) => proj.id === id);
    if (p) {
      if (data.name !== undefined) p.name = data.name;
      if (data.description !== undefined) p.description = data.description || null;
      p.updatedAt = new Date().toISOString();
      this.save(db);
      return this.getProject(id);
    }
    return db.projects[0];
  }

  deleteProject(id: string): void {
    const db = this.load();
    db.projects = db.projects.filter((p) => p.id !== id);
    db.issues = db.issues.filter((i) => i.projectId !== id);
    this.save(db);
  }

  // Issues
  listIssues(
    projectId: string,
    params?: {
      status?: IssueStatus;
      priority?: IssuePriority;
      issueType?: IssueType;
      assigneeId?: string;
      labelId?: string;
      search?: string;
    }
  ): PagedResponse<Issue> {
    const db = this.load();
    let filtered = db.issues.filter((i) => i.projectId === projectId);

    if (params?.status) {
      filtered = filtered.filter((i) => i.status === params.status);
    }
    if (params?.priority) {
      filtered = filtered.filter((i) => i.priority === params.priority);
    }
    if (params?.issueType) {
      filtered = filtered.filter((i) => i.issueType === params.issueType);
    }
    if (params?.assigneeId) {
      filtered = filtered.filter((i) => i.assignee?.id === params.assigneeId);
    }
    if (params?.labelId) {
      filtered = filtered.filter((i) => i.labels?.some((l) => l.id === params.labelId));
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.issueKey.toLowerCase().includes(q) ||
          (i.description && i.description.toLowerCase().includes(q))
      );
    }

    return {
      content: filtered,
      page: 0,
      size: filtered.length,
      totalElements: filtered.length,
      totalPages: 1,
      last: true,
    };
  }

  getIssue(id: string): Issue {
    const db = this.load();
    return db.issues.find((i) => i.id === id || i.issueKey === id) || db.issues[0];
  }

  createIssue(
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
  ): Issue {
    const db = this.load();
    const project = db.projects.find((p) => p.id === projectId) || db.projects[0];
    const projectIssues = db.issues.filter((i) => i.projectId === project.id);
    const nextNumber = projectIssues.length + 1;
    const me = this.getMe();
    const assignee = data.assigneeId ? db.users.find((u) => u.id === data.assigneeId) : null;
    const selectedLabels = data.labelIds
      ? db.labels.filter((l) => data.labelIds!.includes(l.id))
      : [];

    const newIssue: Issue = {
      id: `iss-${Date.now()}`,
      projectId: project.id,
      projectKey: project.key,
      projectName: project.name,
      issueKey: `${project.key}-${nextNumber}`,
      sequenceNumber: nextNumber,
      title: data.title,
      description: data.description || null,
      status: 'TODO',
      priority: data.priority || 'MEDIUM',
      issueType: data.issueType || 'TASK',
      reporter: me,
      assignee: assignee || null,
      labels: selectedLabels,
      commentCount: 0,
      githubActivityCount: 0,
      dueDate: data.dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.issues.unshift(newIssue);
    this.save(db);
    return newIssue;
  }

  updateIssue(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      status?: IssueStatus;
      priority?: IssuePriority;
      issueType?: IssueType;
      assigneeId?: string | null;
      unassign?: boolean;
      labelIds?: string[];
      dueDate?: string | null;
      [key: string]: unknown;
    }
  ): Issue {
    const db = this.load();
    const issue = db.issues.find((i) => i.id === id);
    if (issue) {
      if (data.title !== undefined) issue.title = data.title;
      if (data.description !== undefined) issue.description = data.description || null;
      if (data.status !== undefined) issue.status = data.status;
      if (data.priority !== undefined) issue.priority = data.priority;
      if (data.issueType !== undefined) issue.issueType = data.issueType;
      if (data.dueDate !== undefined) issue.dueDate = data.dueDate || null;
      if (data.unassign) {
        issue.assignee = null;
      } else if (data.assigneeId !== undefined) {
        const found = db.users.find((u) => u.id === data.assigneeId);
        issue.assignee = found || null;
      }
      if (data.labelIds !== undefined) {
        issue.labels = db.labels.filter((l) => data.labelIds!.includes(l.id));
      }
      issue.updatedAt = new Date().toISOString();
      this.save(db);
      return issue;
    }
    return db.issues[0];
  }

  changeIssueStatus(id: string, status: IssueStatus): Issue {
    return this.updateIssue(id, { status });
  }

  assignIssue(id: string, assigneeId?: string): Issue {
    return this.updateIssue(id, { assigneeId, unassign: !assigneeId });
  }

  attachLabel(issueId: string, labelId: string): Issue {
    const db = this.load();
    const issue = db.issues.find((i) => i.id === issueId);
    const label = db.labels.find((l) => l.id === labelId);
    if (issue && label) {
      if (!issue.labels) issue.labels = [];
      if (!issue.labels.some((l) => l.id === labelId)) {
        issue.labels.push(label);
      }
      issue.updatedAt = new Date().toISOString();
      this.save(db);
      return issue;
    }
    return db.issues[0];
  }

  removeLabel(issueId: string, labelId: string): Issue {
    const db = this.load();
    const issue = db.issues.find((i) => i.id === issueId);
    if (issue && issue.labels) {
      issue.labels = issue.labels.filter((l) => l.id !== labelId);
      issue.updatedAt = new Date().toISOString();
      this.save(db);
      return issue;
    }
    return db.issues[0];
  }

  deleteIssue(id: string): void {
    const db = this.load();
    db.issues = db.issues.filter((i) => i.id !== id);
    db.comments = db.comments.filter((c) => c.issueId !== id);
    this.save(db);
  }

  // Comments
  listComments(issueId: string): IssueComment[] {
    const db = this.load();
    return db.comments.filter((c) => c.issueId === issueId);
  }

  createComment(issueId: string, content: string): IssueComment {
    const db = this.load();
    const me = this.getMe();
    const comment: IssueComment = {
      id: `cmt-${Date.now()}`,
      issueId,
      author: me,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.comments.push(comment);
    const issue = db.issues.find((i) => i.id === issueId);
    if (issue) {
      issue.commentCount = (issue.commentCount || 0) + 1;
    }
    this.save(db);
    return comment;
  }

  updateComment(id: string, content: string): IssueComment {
    const db = this.load();
    const comment = db.comments.find((c) => c.id === id);
    if (comment) {
      comment.content = content;
      comment.updatedAt = new Date().toISOString();
      this.save(db);
      return comment;
    }
    return db.comments[0];
  }

  deleteComment(id: string): void {
    const db = this.load();
    const comment = db.comments.find((c) => c.id === id);
    if (comment) {
      const issue = db.issues.find((i) => i.id === comment.issueId);
      if (issue && issue.commentCount && issue.commentCount > 0) {
        issue.commentCount -= 1;
      }
      db.comments = db.comments.filter((c) => c.id !== id);
      this.save(db);
    }
  }

  // Labels
  listLabels(projectId: string): Label[] {
    const db = this.load();
    return db.labels.filter((l) => l.projectId === projectId);
  }

  createLabel(projectId: string, data: { name: string; color?: string }): Label {
    const db = this.load();
    const newLbl: Label = {
      id: `lbl-${Date.now()}`,
      projectId,
      name: data.name,
      color: data.color || '#6366F1',
    };
    db.labels.push(newLbl);
    this.save(db);
    return newLbl;
  }

  initDemoSandbox(): { accessToken: string; tokenType: string; user: User } {
    const demoUser: User = {
      id: 'demo-user',
      email: 'guest@devflow.io',
      fullName: 'Guest Engineer',
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    };

    const userSarah: User = {
      id: 'usr-sarah',
      email: 'sarah.k@hyperscale.io',
      fullName: 'Sarah Connor',
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    };

    const userAlex: User = {
      id: 'usr-alex',
      email: 'alex.r@hyperscale.io',
      fullName: 'Alex Rivera',
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    };

    const userElena: User = {
      id: 'usr-elena',
      email: 'elena.r@hyperscale.io',
      fullName: 'Elena Rostova',
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    };

    const ws: Workspace = {
      id: 'ws-hyperscale',
      name: 'HyperScale Core',
      slug: 'hyperscale-core',
      description: 'Distributed consensus engine, design systems, and cross-platform engineering clients.',
      owner: demoUser,
      currentUserRole: 'ADMIN',
      memberCount: 4,
      projectCount: 3,
      createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const members: WorkspaceMember[] = [
      { id: 'wsm-demo', user: demoUser, role: 'ADMIN', joinedAt: ws.createdAt },
      { id: 'wsm-sarah', user: userSarah, role: 'OWNER', joinedAt: ws.createdAt },
      { id: 'wsm-alex', user: userAlex, role: 'MEMBER', joinedAt: ws.createdAt },
      { id: 'wsm-elena', user: userElena, role: 'MEMBER', joinedAt: ws.createdAt },
    ];

    const pQe: Project = {
      id: 'prj-qe',
      workspaceId: ws.id,
      workspaceName: ws.name,
      name: 'Quantum Engine (Backend)',
      key: 'QE',
      description: 'Pessimistic row-locking transaction pipeline and low-latency gRPC services.',
      createdBy: demoUser,
      totalIssues: 6,
      openIssues: 4,
      doneIssues: 2,
      githubConnected: true,
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const pDs: Project = {
      id: 'prj-ds',
      workspaceId: ws.id,
      workspaceName: ws.name,
      name: 'Design System v2 (Frontend)',
      key: 'DS',
      description: 'Obsidian dark UI tokens, kinetic typography, and fluid spring animations.',
      createdBy: demoUser,
      totalIssues: 5,
      openIssues: 3,
      doneIssues: 2,
      githubConnected: true,
      createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const pMob: Project = {
      id: 'prj-mob',
      workspaceId: ws.id,
      workspaceName: ws.name,
      name: 'Mobile App',
      key: 'MOB',
      description: 'Zero-latency mobile client with offline-first synchronization.',
      createdBy: demoUser,
      totalIssues: 4,
      openIssues: 3,
      doneIssues: 1,
      githubConnected: false,
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const labels: Label[] = [
      { id: 'lbl-perf', projectId: pQe.id, name: 'perf', color: '#F59E0B' },
      { id: 'lbl-auth', projectId: pQe.id, name: 'auth', color: '#8B5CF6' },
      { id: 'lbl-kernel', projectId: pQe.id, name: 'kernel', color: '#EF4444' },
      { id: 'lbl-security', projectId: pQe.id, name: 'security', color: '#10B981' },
      { id: 'lbl-ui', projectId: pDs.id, name: 'ui', color: '#06B6D4' },
      { id: 'lbl-ds-perf', projectId: pDs.id, name: 'perf', color: '#F59E0B' },
      { id: 'lbl-mob-ui', projectId: pMob.id, name: 'ui', color: '#06B6D4' },
      { id: 'lbl-mob-perf', projectId: pMob.id, name: 'perf', color: '#F59E0B' },
    ];

    const issues: Issue[] = [
      // Quantum Engine (Backend)
      {
        id: 'iss-qe-1',
        projectId: pQe.id,
        projectKey: pQe.key,
        projectName: pQe.name,
        issueKey: 'QE-1',
        sequenceNumber: 1,
        title: 'Migrate transaction log engine to LSM-Tree with compaction',
        description: `### 🎯 Objective / Problem Statement\nHigh write volumes saturate disk bandwidth under peak ingestion. Need append-only write path with background SSTable compaction.\n\n### 🧪 Steps to Reproduce\n1. Ingest 50,000 events/sec via batch pipeline\n2. Monitor p99 write latency\n3. Observe I/O wait spike to 84%\n\n### 📋 Acceptance Criteria\n- [ ] MemTable in-memory buffer with WAL journaling\n- [ ] Tiered SSTable compaction strategy\n- [ ] Write latency p99 under 3.5ms`,
        status: 'TODO',
        priority: 'CRITICAL',
        issueType: 'FEATURE',
        reporter: demoUser,
        assignee: userAlex,
        labels: [labels[0], labels[2]],
        commentCount: 1,
        githubActivityCount: 0,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'iss-qe-2',
        projectId: pQe.id,
        projectKey: pQe.key,
        projectName: pQe.name,
        issueKey: 'QE-2',
        sequenceNumber: 2,
        title: 'Implement pessimistic row-level locking on issue key sequence',
        description: `### 🎯 Objective\nPrevent race conditions and sequence collisions during burst parallel issue creation.\n\n### 📋 Acceptance Criteria\n- [x] Use SELECT FOR UPDATE row locking on ProjectKeySequence entity\n- [x] Zero duplicate key generation under 1,000 concurrent workers\n- [ ] Unit tests verifying rollback behavior on timeout`,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        issueType: 'BUG',
        reporter: demoUser,
        assignee: demoUser,
        labels: [labels[0], labels[2]],
        commentCount: 2,
        githubActivityCount: 1,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'iss-qe-3',
        projectId: pQe.id,
        projectKey: pQe.key,
        projectName: pQe.name,
        issueKey: 'QE-3',
        sequenceNumber: 3,
        title: 'Add HMAC-SHA256 signature verification for GitHub push webhooks',
        description: `Validate incoming X-Hub-Signature-256 header against project webhookSecret using constant-time comparison.`,
        status: 'DONE',
        priority: 'HIGH',
        issueType: 'FEATURE',
        reporter: demoUser,
        assignee: userSarah,
        labels: [labels[1], labels[3]],
        commentCount: 1,
        githubActivityCount: 2,
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: 'iss-qe-4',
        projectId: pQe.id,
        projectKey: pQe.key,
        projectName: pQe.name,
        issueKey: 'QE-4',
        sequenceNumber: 4,
        title: 'Mitigate memory fragmentation in HikariCP connection pool',
        description: `Tune leakDetectionThreshold to 2000ms and configure minimumIdle to avoid pool churn under burst microservices traffic.`,
        status: 'IN_REVIEW',
        priority: 'CRITICAL',
        issueType: 'TASK',
        reporter: userAlex,
        assignee: demoUser,
        labels: [labels[0], labels[2]],
        commentCount: 0,
        githubActivityCount: 1,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'iss-qe-5',
        projectId: pQe.id,
        projectKey: pQe.key,
        projectName: pQe.name,
        issueKey: 'QE-5',
        sequenceNumber: 5,
        title: 'Stateless JWT token invalidation via Redis bloom filters',
        description: `Implement probabilistic bloom filter lookup for revoked session tokens with 0.1% false-positive rate.`,
        status: 'DONE',
        priority: 'MEDIUM',
        issueType: 'FEATURE',
        reporter: demoUser,
        assignee: userElena,
        labels: [labels[1], labels[3]],
        commentCount: 0,
        githubActivityCount: 0,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'iss-qe-6',
        projectId: pQe.id,
        projectKey: pQe.key,
        projectName: pQe.name,
        issueKey: 'QE-6',
        sequenceNumber: 6,
        title: 'Distributed raft heartbeat jitter compensation',
        description: `Add random jitter (150-300ms) to Raft consensus election timeouts to prevent split votes during network partitions.`,
        status: 'TODO',
        priority: 'LOW',
        issueType: 'TASK',
        reporter: demoUser,
        assignee: null,
        labels: [labels[2]],
        commentCount: 0,
        githubActivityCount: 0,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },

      // Design System v2 (Frontend)
      {
        id: 'iss-ds-1',
        projectId: pDs.id,
        projectKey: pDs.key,
        projectName: pDs.name,
        issueKey: 'DS-1',
        sequenceNumber: 1,
        title: 'Linear-grade keyboard command palette with fuzzy caching',
        description: `Implement cmdk palette with instant sub-millisecond search across workspaces, projects, issues, and global actions.`,
        status: 'DONE',
        priority: 'HIGH',
        issueType: 'FEATURE',
        reporter: demoUser,
        assignee: demoUser,
        labels: [labels[4]],
        commentCount: 1,
        githubActivityCount: 1,
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: 'iss-ds-2',
        projectId: pDs.id,
        projectKey: pDs.key,
        projectName: pDs.name,
        issueKey: 'DS-2',
        sequenceNumber: 2,
        title: 'Vim navigation engine: j/k selection, x bulk toggles, 1-4 priority',
        description: `Enable tactile, mouse-free navigation across Kanban columns and table rows with optical focus ring indicators.`,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        issueType: 'FEATURE',
        reporter: demoUser,
        assignee: demoUser,
        labels: [labels[4], labels[5]],
        commentCount: 0,
        githubActivityCount: 0,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
      {
        id: 'iss-ds-3',
        projectId: pDs.id,
        projectKey: pDs.key,
        projectName: pDs.name,
        issueKey: 'DS-3',
        sequenceNumber: 3,
        title: 'Zero-dependency tabbed Markdown editor with live preview',
        description: `Fenced code blocks with copy-to-clipboard, task lists (- [ ]), blockquotes, and shortcuts for bold, italic, code.`,
        status: 'DONE',
        priority: 'MEDIUM',
        issueType: 'FEATURE',
        reporter: demoUser,
        assignee: userSarah,
        labels: [labels[4]],
        commentCount: 0,
        githubActivityCount: 1,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: 'iss-ds-4',
        projectId: pDs.id,
        projectKey: pDs.key,
        projectName: pDs.name,
        issueKey: 'DS-4',
        sequenceNumber: 4,
        title: 'Accessible high-contrast focus rings and optical typography',
        description: `Enforce WCAG 2.1 AA focus visible rings across buttons, tabs, dropdowns, and modal dialogs.`,
        status: 'TODO',
        priority: 'LOW',
        issueType: 'TASK',
        reporter: userSarah,
        assignee: userAlex,
        labels: [labels[4]],
        commentCount: 0,
        githubActivityCount: 0,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'iss-ds-5',
        projectId: pDs.id,
        projectKey: pDs.key,
        projectName: pDs.name,
        issueKey: 'DS-5',
        sequenceNumber: 5,
        title: 'Sub-millisecond query optimization with composite B-Tree indexes',
        description: `Optimize frequent workspace and issue query paths with composite indexes and in-memory SWR caching for sub-10ms response times.`,
        status: 'IN_REVIEW',
        priority: 'HIGH',
        issueType: 'FEATURE',
        reporter: demoUser,
        assignee: demoUser,
        labels: [labels[4]],
        commentCount: 1,
        githubActivityCount: 0,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
      },

      // Mobile App
      {
        id: 'iss-mob-1',
        projectId: pMob.id,
        projectKey: pMob.key,
        projectName: pMob.name,
        issueKey: 'MOB-1',
        sequenceNumber: 1,
        title: 'Implement offline mutation queue with optimistic UI reconciliation',
        description: `Queue issue updates, drag movements, and comment additions locally in SQLite when offline, replaying upon network restoration.`,
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        issueType: 'FEATURE',
        reporter: demoUser,
        assignee: userElena,
        labels: [labels[7]],
        commentCount: 0,
        githubActivityCount: 0,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: 'iss-mob-2',
        projectId: pMob.id,
        projectKey: pMob.key,
        projectName: pMob.name,
        issueKey: 'MOB-2',
        sequenceNumber: 2,
        title: 'Biometric face authentication with secure keychain enclave',
        description: `Store encrypted session credentials in device Secure Enclave / Android KeyStore with FaceID verification.`,
        status: 'DONE',
        priority: 'HIGH',
        issueType: 'FEATURE',
        reporter: userElena,
        assignee: userElena,
        labels: [labels[6]],
        commentCount: 0,
        githubActivityCount: 0,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: 'iss-mob-3',
        projectId: pMob.id,
        projectKey: pMob.key,
        projectName: pMob.name,
        issueKey: 'MOB-3',
        sequenceNumber: 3,
        title: 'Haptic feedback triggers on kanban drag threshold crossing',
        description: `Trigger subtle tactile haptic vibration when an issue card is dragged across Kanban column boundaries.`,
        status: 'TODO',
        priority: 'LOW',
        issueType: 'TASK',
        reporter: demoUser,
        assignee: null,
        labels: [labels[6]],
        commentCount: 0,
        githubActivityCount: 0,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'iss-mob-4',
        projectId: pMob.id,
        projectKey: pMob.key,
        projectName: pMob.name,
        issueKey: 'MOB-4',
        sequenceNumber: 4,
        title: 'Background push notification dispatcher for Slack and Discord',
        description: `Deliver instant push alerts when issues assigned to current user are marked Critical or moved to Done.`,
        status: 'TODO',
        priority: 'MEDIUM',
        issueType: 'FEATURE',
        reporter: demoUser,
        assignee: userSarah,
        labels: [labels[6]],
        commentCount: 0,
        githubActivityCount: 0,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ];

    const comments: IssueComment[] = [
      {
        id: 'cmt-qe-1',
        issueId: 'iss-qe-2',
        author: userAlex,
        content: 'Benchmarked with 500 parallel threads: zero key collision recorded. Ready for merge.',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'cmt-qe-2',
        issueId: 'iss-qe-2',
        author: demoUser,
        content: 'Verified transaction rollback on deadlock timeout.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'cmt-ds-1',
        issueId: 'iss-ds-5',
        author: demoUser,
        content: 'AI Spec generation produces clean markdown with objective, test steps, and acceptance criteria.',
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
    ];

    const database: MockDatabase = {
      currentUser: demoUser,
      users: [demoUser, userSarah, userAlex, userElena],
      workspaces: [ws],
      members,
      projects: [pQe, pDs, pMob],
      issues,
      comments,
      labels,
      githubRepos: [],
      githubActivities: [],
    };

    this.save(database);

    return {
      accessToken: 'demo-guest-token',
      tokenType: 'Bearer',
      user: demoUser,
    };
  }

  reset(): void {
    this.save(getInitialDatabase());
  }
}

export const mockStore = new MockStore();
