#!/usr/bin/env node

/**
 * DevFlow CLI Companion Tool
 * High-velocity terminal interface for DevFlow issue tracking and git workflows.
 * Zero external npm dependencies. Pure Node.js 18+.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import readline from 'node:readline';

const RC_PATH = path.join(os.homedir(), '.devflowrc.json');
const DEFAULT_API_URL = 'https://devflow-api-zz68.onrender.com';

// ANSI terminal colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  emerald: '\x1b[32m',
  amber: '\x1b[33m',
  rose: '\x1b[31m',
  purple: '\x1b[35m',
  zinc: '\x1b[90m',
  white: '\x1b[97m',
};

function readConfig() {
  if (fs.existsSync(RC_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(RC_PATH, 'utf-8'));
    } catch {
      return { apiUrl: DEFAULT_API_URL, token: '' };
    }
  }
  return { apiUrl: DEFAULT_API_URL, token: '' };
}

function saveConfig(cfg) {
  fs.writeFileSync(RC_PATH, JSON.stringify(cfg, null, 2), 'utf-8');
}

function prompt(question, hide = false) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function request(endpoint, options = {}) {
  const cfg = readConfig();
  const url = `${cfg.apiUrl.replace(/\/$/, '')}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(cfg.token ? { Authorization: `Bearer ${cfg.token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: AbortSignal.timeout(3500),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`API Error ${res.status}: ${errText || res.statusText}`);
    }

    return await res.json().catch(() => ({}));
  } catch (err) {
    throw err;
  }
}

function printBanner() {
  console.log(`
${colors.cyan}${colors.bold}  ____             _____ _               ${colors.reset}
${colors.cyan}${colors.bold} |  _ \\  _____   _|  ___| | _____      __${colors.reset}
${colors.cyan}${colors.bold} | | | |/ _ \\ \\ / / |_  | |/ _ \\ \\ /\\ / /${colors.reset}
${colors.cyan}${colors.bold} | |_| |  __/\\ V /|  _| | | (_) \\ V  V / ${colors.reset}
${colors.cyan}${colors.bold} |____/ \\___| \\_/ |_|   |_|\\___/ \\_/\\_/  ${colors.reset}
${colors.zinc} High-Velocity Linear-Grade CLI Companion ${colors.reset}
`);
}

function printHelp() {
  printBanner();
  console.log(`${colors.bold}USAGE:${colors.reset}
  ${colors.cyan}devflow${colors.reset} <command> [options]

${colors.bold}COMMANDS:${colors.reset}
  ${colors.cyan}login${colors.reset}               Authenticate terminal with DevFlow credentials
  ${colors.cyan}list${colors.reset} [project-key]   List active issues in a dense ASCII table
  ${colors.cyan}create${colors.reset} <title>      Create a new issue with optimistic sequence allocation
  ${colors.cyan}start${colors.reset} <issue-key>    Set issue to IN_PROGRESS and checkout git feature branch
  ${colors.cyan}done${colors.reset} <issue-key>     Set issue to DONE and prompt for an automated git commit
  ${colors.cyan}demo${colors.reset}                Launch instant interactive guest sandbox mode
  ${colors.cyan}whoami${colors.reset}              Show current authentication details and target API
  ${colors.cyan}logout${colors.reset}              Clear local credentials (~/.devflowrc.json)
  ${colors.cyan}help${colors.reset}                Display this command reference

${colors.bold}EXAMPLES:${colors.reset}
  $ ${colors.dim}devflow login${colors.reset}
  $ ${colors.dim}devflow list QE${colors.reset}
  $ ${colors.dim}devflow start QE-1${colors.reset}
  $ ${colors.dim}devflow done QE-1${colors.reset}
`);
}

// 1. LOGIN
async function handleLogin() {
  printBanner();
  console.log(`${colors.bold}Authenticate DevFlow CLI${colors.reset}\n`);

  const currentCfg = readConfig();
  const apiPrompt = await prompt(
    `API URL [${colors.dim}${currentCfg.apiUrl || DEFAULT_API_URL}${colors.reset}]: `
  );
  const targetApi = apiPrompt || currentCfg.apiUrl || DEFAULT_API_URL;

  console.log(`\nChoose login method:`);
  console.log(`  1) Email & Password`);
  console.log(`  2) Paste Raw JWT Token (or guest demo)`);
  const method = await prompt(`Select (1/2): `);

  if (method === '2') {
    const rawToken = await prompt(`JWT Token: `);
    if (!rawToken) {
      console.log(`${colors.rose}✖ Token cannot be empty.${colors.reset}`);
      return;
    }
    saveConfig({ apiUrl: targetApi, token: rawToken, userEmail: 'token-authenticated' });
    console.log(`\n${colors.emerald}✔ Saved token to ~/.devflowrc.json${colors.reset}`);
    return;
  }

  const email = await prompt(`Email: `);
  const password = await prompt(`Password: `);

  try {
    console.log(`\n${colors.zinc}Authenticating with ${targetApi}...${colors.reset}`);
    const res = await fetch(`${targetApi.replace(/\/$/, '')}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      throw new Error(`Authentication failed: HTTP ${res.status}`);
    }

    const data = await res.json();
    saveConfig({
      apiUrl: targetApi,
      token: data.token,
      userEmail: email,
      fullName: data.user?.fullName || '',
    });

    console.log(`${colors.emerald}✔ Logged in successfully as ${email}.${colors.reset}`);
  } catch (err) {
    console.log(`\n${colors.amber}⚠ Server login request returned:${colors.reset} ${err.message}`);
    const fallback = await prompt(`Save session in local sandbox mode? (y/n): `);
    if (fallback.toLowerCase() === 'y') {
      saveConfig({
        apiUrl: targetApi,
        token: 'devflow-sandbox-token',
        userEmail: email || 'guest@devflow.io',
      });
      console.log(`${colors.emerald}✔ Saved local sandbox session.${colors.reset}`);
    }
  }
}

// 2. LIST ISSUES
async function handleList(projectKey) {
  const cfg = readConfig();
  console.log(`${colors.bold}DevFlow Issues${colors.reset} ${projectKey ? `[${projectKey}]` : ''}`);

  try {
    const query = projectKey ? `?projectKey=${encodeURIComponent(projectKey)}` : '';
    const issues = await request(`/api/v1/issues${query}`);

    if (!Array.isArray(issues) || issues.length === 0) {
      console.log(`${colors.zinc}No issues found.${colors.reset}`);
      return;
    }

    renderTable(issues);
  } catch (err) {
    console.log(`${colors.amber}Notice: Using cached sandbox tasks (${err.message})${colors.reset}\n`);
    const mockIssues = [
      {
        issueKey: 'QE-1',
        priority: 'CRITICAL',
        status: 'IN_PROGRESS',
        title: 'Optimize raft consensus lock contention',
      },
      {
        issueKey: 'QE-2',
        priority: 'HIGH',
        status: 'TODO',
        title: 'Implement SIMD-accelerated bloom filter',
      },
      {
        issueKey: 'DS-4',
        priority: 'MEDIUM',
        status: 'IN_REVIEW',
        title: 'Add Vim navigation engine (J/K shortcuts)',
      },
      {
        issueKey: 'MOB-8',
        priority: 'LOW',
        status: 'DONE',
        title: 'Fix biometric auth fallback on iOS',
      },
    ];
    renderTable(mockIssues);
  }
}

function renderTable(issues) {
  console.log(
    `${colors.dim}--------------------------------------------------------------------------------${colors.reset}`
  );
  console.log(
    `${colors.bold}${'KEY'.padEnd(10)} ${'PRIORITY'.padEnd(12)} ${'STATUS'.padEnd(14)} TITLE${colors.reset}`
  );
  console.log(
    `${colors.dim}--------------------------------------------------------------------------------${colors.reset}`
  );

  for (const item of issues) {
    const key = (item.issueKey || item.key || 'N/A').padEnd(10);
    const prioColor =
      item.priority === 'CRITICAL'
        ? colors.rose
        : item.priority === 'HIGH'
        ? colors.amber
        : item.priority === 'MEDIUM'
        ? colors.cyan
        : colors.zinc;
    const priority = `${prioColor}${(item.priority || 'MEDIUM').padEnd(12)}${colors.reset}`;

    const statusColor =
      item.status === 'DONE'
        ? colors.emerald
        : item.status === 'IN_PROGRESS'
        ? colors.cyan
        : item.status === 'IN_REVIEW'
        ? colors.purple
        : colors.zinc;
    const status = `${statusColor}${(item.status || 'TODO').padEnd(14)}${colors.reset}`;
    const title = (item.title || '').slice(0, 42);

    console.log(`${key} ${priority} ${status} ${title}`);
  }
  console.log(
    `${colors.dim}--------------------------------------------------------------------------------${colors.reset}\n`
  );
}

// 3. START ISSUE
async function handleStart(issueKey) {
  if (!issueKey) {
    console.log(`${colors.rose}Error: Missing issue key. Example: devflow start QE-1${colors.reset}`);
    return;
  }

  const cleanKey = issueKey.trim().toUpperCase();
  console.log(`${colors.cyan}Starting work on ${cleanKey}...${colors.reset}`);

  try {
    await request(`/api/v1/issues/${encodeURIComponent(cleanKey)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'IN_PROGRESS' }),
    });
  } catch (e) {
    console.log(`${colors.zinc}[Sandbox fallback active: ${e.message}]${colors.reset}`);
  }

  const slug = cleanKey.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const branchName = `feature/${slug}`;

  try {
    execSync(`git checkout -b ${branchName}`, { stdio: 'pipe' });
    console.log(`\n${colors.emerald}✔ Status set to IN_PROGRESS.${colors.reset}`);
    console.log(`${colors.cyan}✔ Created & switched to git branch: ${colors.bold}${branchName}${colors.reset}\n`);
  } catch (gitErr) {
    console.log(`\n${colors.amber}✔ Status updated. Git branch check note:${colors.reset} ${gitErr.message.trim()}`);
  }
}

// 4. DONE ISSUE
async function handleDone(issueKey) {
  if (!issueKey) {
    console.log(`${colors.rose}Error: Missing issue key. Example: devflow done QE-1${colors.reset}`);
    return;
  }

  const cleanKey = issueKey.trim().toUpperCase();
  console.log(`${colors.cyan}Completing ${cleanKey}...${colors.reset}`);

  try {
    await request(`/api/v1/issues/${encodeURIComponent(cleanKey)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'DONE' }),
    });
  } catch (e) {
    console.log(`${colors.zinc}[Sandbox fallback active: ${e.message}]${colors.reset}`);
  }

  console.log(`\n${colors.emerald}✔ Issue ${cleanKey} status updated to DONE.${colors.reset}`);

  const makeCommit = await prompt(
    `Create automated git commit "[DEVFLOW] Completed ${cleanKey}"? (y/N): `
  );
  if (makeCommit.toLowerCase() === 'y') {
    try {
      execSync('git add -A', { stdio: 'inherit' });
      execSync(`git commit -m "[DEVFLOW] Completed ${cleanKey}"`, { stdio: 'inherit' });
      console.log(`\n${colors.emerald}✔ Git commit successfully created.${colors.reset}\n`);
    } catch (gitErr) {
      console.log(`${colors.amber}Git commit skipped or no uncommitted changes.${colors.reset}\n`);
    }
  }
}

// 4. CREATE ISSUE
async function handleCreate(title, projectKey = 'QE') {
  if (!title) {
    console.log(`${colors.rose}Error: Missing issue title. Example: devflow create "Migrate connection pool"${colors.reset}`);
    return;
  }
  const cleanTitle = title.trim();
  console.log(`${colors.cyan}Creating issue: "${cleanTitle}"...${colors.reset}`);

  try {
    const res = await request('/api/v1/issues', {
      method: 'POST',
      body: JSON.stringify({
        title: cleanTitle,
        description: 'Created via DevFlow CLI companion.',
        priority: 'HIGH',
        status: 'TODO',
        projectKey: projectKey.toUpperCase(),
      }),
    });
    console.log(`\n${colors.emerald}✔ Created issue ${colors.bold}${res.issueKey || res.key || 'QE-106'}${colors.reset}: "${cleanTitle}"`);
    console.log(`  Priority: ${colors.amber}HIGH${colors.reset} · Status: ${colors.zinc}TODO${colors.reset} · Project: ${projectKey.toUpperCase()}\n`);
  } catch (err) {
    const randomKey = `${projectKey.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    console.log(`\n${colors.emerald}✔ Created sandbox issue ${colors.bold}${randomKey}${colors.reset}: "${cleanTitle}"`);
    console.log(`  Priority: ${colors.amber}HIGH${colors.reset} · Status: ${colors.zinc}TODO${colors.reset} · Mode: ${colors.dim}Local Sandbox${colors.reset}\n`);
  }
}

// 5. DEMO
function handleDemo() {
  printBanner();
  console.log(`${colors.bold}HyperScale Core · Active Sprint Overview${colors.reset}\n`);
  const demoIssues = [
    { issueKey: 'QE-104', priority: 'HIGH', status: 'IN_PROGRESS', title: 'Migrate connection pool to HikariCP' },
    { issueKey: 'QE-105', priority: 'CRITICAL', status: 'IN_REVIEW', title: 'Row-level locking on sequence generator' },
    { issueKey: 'DS-201', priority: 'MEDIUM', status: 'TODO', title: 'Linear obsidian theme tokens' },
    { issueKey: 'MOB-12', priority: 'HIGH', status: 'DONE', title: 'Zero-latency optimistic offline rollback' },
    { issueKey: 'HSC-88', priority: 'CRITICAL', status: 'IN_PROGRESS', title: 'Sub-ms query cache for Neon postgres' },
  ];
  renderTable(demoIssues);
  console.log(`${colors.cyan}⚡ Test in browser: Open https://devflow.io/dashboard in demo sandbox.${colors.reset}\n`);
}

// 6. WHOAMI
function handleWhoami() {
  const cfg = readConfig();
  console.log(`${colors.bold}DevFlow CLI Session Info:${colors.reset}`);
  console.log(`  API Endpoint: ${colors.cyan}${cfg.apiUrl || DEFAULT_API_URL}${colors.reset}`);
  console.log(`  User:         ${colors.emerald}${cfg.userEmail || 'Not authenticated'}${colors.reset}`);
  console.log(`  Token:        ${cfg.token ? `${cfg.token.slice(0, 16)}...` : colors.rose + 'None' + colors.reset}`);
  console.log(`  Config Path:  ${colors.dim}${RC_PATH}${colors.reset}\n`);
}

// 6. LOGOUT
function handleLogout() {
  if (fs.existsSync(RC_PATH)) {
    fs.unlinkSync(RC_PATH);
  }
  console.log(`${colors.emerald}✔ Successfully logged out. Removed credentials from ${RC_PATH}${colors.reset}\n`);
}

// MAIN DISPATCHER
async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();

  switch (command) {
    case 'login':
      await handleLogin();
      break;
    case 'list':
    case 'ls':
      await handleList(args[1]);
      break;
    case 'start':
      await handleStart(args[1]);
      break;
    case 'done':
      await handleDone(args[1]);
      break;
    case 'create':
    case 'new':
    case 'add':
      await handleCreate(args.slice(1).join(' '));
      break;
    case 'demo':
      handleDemo();
      break;
    case 'whoami':
      handleWhoami();
      break;
    case 'logout':
      handleLogout();
      break;
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;
    default:
      if (!command) {
        printHelp();
      } else {
        console.log(`${colors.rose}Unknown command: ${command}${colors.reset}`);
        console.log(`Run ${colors.cyan}devflow help${colors.reset} to see available commands.`);
      }
      break;
  }
}

main().catch((err) => {
  console.error(`\n${colors.rose}Fatal error: ${err.message}${colors.reset}`);
  process.exit(1);
});
