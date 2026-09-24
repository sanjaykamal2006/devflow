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

const STORAGE_KEY = 'devflow_mock_db_v2';

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
    email: 'sanjaykamal2006@gmail.com',
    fullName: 'Sanjay Kamal',
    avatarUrl: null,
    createdAt: new Date().toISOString(),
  };

  const user2: User = {
    id: 'usr-2',
    email: 'alex.chen@company.com',
    fullName: 'Alex Chen',
    createdAt: new Date().toISOString(),
  };

  const user3: User = {
    id: 'usr-3',
    email: 'sarah.connor@company.com',
    fullName: 'Sarah Connor',
    createdAt: new Date().toISOString(),
  };

  const ws1: Workspace = {
    id: 'ws-1',
    name: 'DevFlow Engineering',
    slug: 'devflow-engineering',
    description: 'Primary engineering workspace for platform and mobile teams',
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
    name: 'Platform Core',
    key: 'CORE',
    description: 'Core microservices, transaction managers, and security infrastructure',
    createdBy: defaultUser,
    totalIssues: 6,
    openIssues: 4,
    doneIssues: 2,
    githubConnected: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const p2: Project = {
    id: 'prj-2',
    workspaceId: ws1.id,
    workspaceName: ws1.name,
    name: 'Web & Mobile Client',
    key: 'CLIENT',
    description: 'Next.js 15 client dashboard and responsive interface',
    createdBy: defaultUser,
    totalIssues: 2,
    openIssues: 2,
    doneIssues: 0,
    githubConnected: false,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const labels: Label[] = [
    { id: 'lbl-1', projectId: p1.id, name: 'backend', color: '#6366F1' },
    { id: 'lbl-2', projectId: p1.id, name: 'security', color: '#EF4444' },
    { id: 'lbl-3', projectId: p1.id, name: 'database', color: '#10B981' },
    { id: 'lbl-4', projectId: p1.id, name: 'p0', color: '#F59E0B' },
  ];

  const issues: Issue[] = [
    {
      id: 'iss-1',
      projectId: p1.id,
      projectKey: p1.key,
      projectName: p1.name,
      issueKey: 'CORE-1',
      sequenceNumber: 1,
      title: 'Implement row-level pessimistic locking for sequence generator',
      description: 'Use JPA PESSIMISTIC_WRITE locks (SELECT ... FOR UPDATE) in an isolated transaction to prevent key collisions.',
      status: 'DONE',
      priority: 'HIGH',
      issueType: 'FEATURE',
      reporter: defaultUser,
      assignee: defaultUser,
      labels: [labels[0], labels[2]],
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
      issueKey: 'CORE-2',
      sequenceNumber: 2,
      title: 'Enforce anti-IDOR RBAC & remove vulnerable project cache',
      description: 'Ensure cross-tenant project lookups validate workspace membership in PostgreSQL directly.',
      status: 'DONE',
      priority: 'CRITICAL',
      issueType: 'BUG',
      reporter: defaultUser,
      assignee: user2,
      labels: [labels[1], labels[3]],
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
      issueKey: 'CORE-3',
      sequenceNumber: 3,
      title: 'GitHub webhook auto-transitions on fixes/closes commit syntax',
      description: 'Parse push commits and pull requests; advance referenced issues to DONE with HMAC-SHA256 signature validation.',
      status: 'IN_REVIEW',
      priority: 'HIGH',
      issueType: 'FEATURE',
      reporter: defaultUser,
      assignee: defaultUser,
      labels: [labels[0]],
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
      issueKey: 'CORE-4',
      sequenceNumber: 4,
      title: 'Graceful Redis circuit-breaker degradation on connection drop',
      description: 'GracefulCacheErrorHandler intercepts cache get/put failures and transparently executes SQL queries against PostgreSQL.',
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
      issueKey: 'CORE-5',
      sequenceNumber: 5,
      title: 'Cascading deletion service-layer child record cleanup',
      description: 'Explicitly delete child comments, activities, issues, and sequences before deleting parent workspaces.',
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
      projectId: p1.id,
      projectKey: p1.key,
      projectName: p1.name,
      issueKey: 'CORE-6',
      sequenceNumber: 6,
      title: 'Full multi-threaded concurrency integration test suite',
      description: 'Verify 10 parallel threads executing via CountDownLatch generate monotonic gapless issue keys.',
      status: 'TODO',
      priority: 'LOW',
      issueType: 'TASK',
      reporter: defaultUser,
      assignee: null,
      labels: [],
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
      content: 'Benchmarked with 10 concurrent threads—zero key collisions or sequence lock deadlocks observed.',
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
    }
  ): Issue {
    const db = this.load();
    const project = db.projects.find((p) => p.id === projectId) || db.projects[0];
    const projectIssues = db.issues.filter((i) => i.projectId === project.id);
    const nextNumber = projectIssues.length + 1;
    const me = this.getMe();
    const assignee = data.assigneeId ? db.users.find((u) => u.id === data.assigneeId) : null;

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
      labels: [],
      commentCount: 0,
      githubActivityCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.issues.unshift(newIssue);
    this.save(db);
    return newIssue;
  }

  changeIssueStatus(id: string, status: IssueStatus): Issue {
    const db = this.load();
    const issue = db.issues.find((i) => i.id === id);
    if (issue) {
      issue.status = status;
      issue.updatedAt = new Date().toISOString();
      this.save(db);
      return issue;
    }
    return db.issues[0];
  }

  deleteIssue(id: string): void {
    const db = this.load();
    db.issues = db.issues.filter((i) => i.id !== id);
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
    this.save(db);
    return comment;
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

  reset(): void {
    this.save(getInitialDatabase());
  }
}

export const mockStore = new MockStore();
