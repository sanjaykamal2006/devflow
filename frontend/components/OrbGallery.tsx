'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface OrbGalleryProps {
  className?: string;
  style?: React.CSSProperties;
}

// Deterministic PRNG
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(r: () => number, a: T[]): T => a[Math.min(a.length - 1, (r() * a.length) | 0)];
const rr = (r: () => number, a: number, b: number) => a + r() * (b - a);

// High-Definition Atlas Constants (4K/Retina Crispness)
const TW = 640;
const TH = 400;
const COLS = 8;
const ROWS = 6;
const TILES = COLS * ROWS; // 48 unique high-definition plates
const SEG = 7;
const PER = 4 * (SEG + 1); // 32
const HOVER_POP = 1.14;
const AUTO = (Math.PI * 2) / 22; // 22 seconds per full revolution

const SPHERE = {
  R: 1,
  nEquator: 20,
  latLimit: 84,
  gap: 0.1,
};

const ASPECTS = [1.62, 1.56, 1.5, 1.5, 1.5, 1.44, 1.38, 1.32];

interface CardItem {
  lat: number;
  lon: number;
  rad: number;
  w: number;
  h: number;
  roll: number;
  tile: number;
  basis: {
    n: [number, number, number];
    R: [number, number, number];
    U: [number, number, number];
  };
  outline: [number, number][];
  vBase: number;
}

function cardBasis(lat: number, lon: number, roll: number) {
  const cl = Math.cos(lat),
    sl = Math.sin(lat),
    cs = Math.cos(lon),
    sn = Math.sin(lon);
  const n: [number, number, number] = [cl * sn, sl, cl * cs];
  const u: [number, number, number] = [-sl * sn, cl, -sl * cs];
  const g: [number, number, number] = [
    u[1] * n[2] - u[2] * n[1],
    u[2] * n[0] - u[0] * n[2],
    u[0] * n[1] - u[1] * n[0],
  ];
  const cr = Math.cos(roll),
    sr = Math.sin(roll);
  return {
    n,
    R: [g[0] * cr + u[0] * sr, g[1] * cr + u[1] * sr, g[2] * cr + u[2] * sr] as [number, number, number],
    U: [u[0] * cr - g[0] * sr, u[1] * cr - g[1] * sr, u[2] * cr - g[2] * sr] as [number, number, number],
  };
}

function cardOutline(w: number, h: number, rad: number, seg: number): [number, number][] {
  const a = w / 2,
    b = h / 2,
    q = Math.min(rad, a * 0.9, b * 0.9),
    pts: [number, number][] = [];
  const corners: [number, number, number][] = [
    [a - q, b - q, 0],
    [-a + q, b - q, Math.PI / 2],
    [-a + q, -b + q, Math.PI],
    [a - q, -b + q, -Math.PI / 2],
  ];
  for (const [cx, cy, a0] of corners) {
    for (let s = 0; s <= seg; s++) {
      const t = a0 + (s / seg) * (Math.PI / 2);
      pts.push([cx + Math.cos(t) * q, cy + Math.sin(t) * q]);
    }
  }
  return pts;
}

function writeCard(
  pos: Float32Array,
  c: CardItem,
  scale: number,
  radMul: number
) {
  const b = c.basis;
  const rad = c.rad * radMul;
  const ox = b.n[0] * rad;
  const oy = b.n[1] * rad;
  const oz = b.n[2] * rad;
  let p = c.vBase * 3;
  pos[p++] = ox;
  pos[p++] = oy;
  pos[p++] = oz;
  for (let i = 0; i < c.outline.length; i++) {
    const x = c.outline[i][0] * scale;
    const y = c.outline[i][1] * scale;
    pos[p++] = ox + b.R[0] * x + b.U[0] * y;
    pos[p++] = oy + b.R[1] * x + b.U[1] * y;
    pos[p++] = oz + b.R[2] * x + b.U[2] * y;
  }
}

function buildCards(): CardItem[] {
  const r = mulberry32(424242);
  const out: Partial<CardItem>[] = [];
  const lim = (SPHERE.latLimit * Math.PI) / 180;
  const cellEq = (2 * Math.PI) / SPHERE.nEquator;
  const nRings = Math.max(1, Math.round((lim * 2) / (cellEq / 1.5)));
  const pitch = (lim * 2) / nRings;

  for (let j = 0; j <= nRings; j++) {
    const lat = -lim + j * pitch;
    const cl = Math.max(0.05, Math.cos(lat));
    const n = Math.max(1, Math.round(SPHERE.nEquator * cl));
    const cellW = (2 * Math.PI * cl) / n;
    const cellH = pitch;
    const maxW = cellW * (1 - SPHERE.gap);
    const maxH = cellH * (1 - SPHERE.gap);
    const off = r() * Math.PI * 2;

    for (let i = 0; i < n; i++) {
      const asp = pick(r, ASPECTS);
      const roll = rr(r, -0.045, 0.045);
      const ca = Math.cos(roll);
      const sa = Math.abs(Math.sin(roll));
      let w = Math.min(maxW / (ca + sa / asp), maxH / (ca / asp + sa));
      w *= rr(r, 0.86, 0.96);
      const h = w / asp;
      const slackLon = Math.max(0, (cellW - (w * ca + h * sa)) / 2);
      out.push({
        lat,
        lon: off + (i / n) * Math.PI * 2 + (slackLon / cl) * rr(r, -0.85, 0.85),
        rad: SPHERE.R * (1 + rr(r, 0, 0.02)),
        w,
        h,
        roll,
        tile: 0,
      });
    }
  }

  // Shuffle & clash avoidance across sphere
  const idx = out.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const k = (r() * (i + 1)) | 0;
    [idx[i], idx[k]] = [idx[k], idx[i]];
  }
  idx.forEach((o, i) => {
    out[o].tile = i % TILES;
  });

  const dir = out.map((c) => {
    const cl = Math.cos(c.lat!);
    return [cl * Math.sin(c.lon!), Math.sin(c.lat!), cl * Math.cos(c.lon!)];
  });
  const MIND = Math.cos(0.62); // ~35 deg arc
  const clash = (i: number) => {
    for (let j = 0; j < out.length; j++) {
      if (j === i || out[j].tile !== out[i].tile) continue;
      const d = dir[i][0] * dir[j][0] + dir[i][1] * dir[j][1] + dir[i][2] * dir[j][2];
      if (d > MIND) return true;
    }
    return false;
  };

  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < out.length; i++) {
      if (!clash(i)) continue;
      for (let t = 0; t < 24; t++) {
        const k = (r() * out.length) | 0;
        if (k === i) continue;
        const aTile = out[i].tile!;
        const bTile = out[k].tile!;
        out[i].tile = bTile;
        out[k].tile = aTile;
        if (!clash(i) && !clash(k)) break;
        out[i].tile = aTile;
        out[k].tile = bTile;
      }
    }
  }

  return out as CardItem[];
}

// ----------------------------------------------------------------------
// 48 EXHAUSTIVE UNIQUE DEVFLOW CARDS
// ----------------------------------------------------------------------
const DEVFLOW_CARDS = [
  { key: 'QE-101', title: 'HikariCP connection pool auto-acquisition', status: 'IN_PROGRESS', priority: 'HIGH', cat: 'DIFF', tag: 'Backend', author: 'Sanjay K.' },
  { key: 'HSC-102', title: 'Pessimistic row-level lock on key allocator', status: 'DONE', priority: 'CRITICAL', cat: 'METRICS', tag: 'Database', author: 'Alex M.' },
  { key: 'DS-103', title: 'Linear obsidian theme tokens & cmdk palette', status: 'TODO', priority: 'MEDIUM', cat: 'KANBAN', tag: 'Design', author: 'Elena R.' },
  { key: 'MOB-104', title: 'Optimistic offline mutation queue & rollback', status: 'IN_REVIEW', priority: 'HIGH', cat: 'DIFF', tag: 'Mobile', author: 'David L.' },
  { key: 'QE-105', title: 'WebSocket cluster broadcast P99 latency test', status: 'IN_PROGRESS', priority: 'CRITICAL', cat: 'METRICS', tag: 'Infra', author: 'Sanjay K.' },
  { key: 'HSC-106', title: 'Neon cloud serverless PostgreSQL compute', status: 'DONE', priority: 'HIGH', cat: 'CLI', tag: 'DevOps', author: 'Guest' },
  { key: 'DS-107', title: 'Vim navigation engine: J/K row selection', status: 'DONE', priority: 'MEDIUM', cat: 'VIM', tag: 'Frontend', author: 'Elena R.' },
  { key: 'SEC-108', title: 'Stateless JWT refresh token rotation guard', status: 'TODO', priority: 'HIGH', cat: 'SECURITY', tag: 'Security', author: 'Alex M.' },
  { key: 'MOB-109', title: 'Haptic feedback on kanban drag threshold', status: 'DONE', priority: 'LOW', cat: 'KANBAN', tag: 'Mobile', author: 'David L.' },
  { key: 'HSC-110', title: 'Distributed OpenTelemetry request spans', status: 'IN_REVIEW', priority: 'MEDIUM', cat: 'METRICS', tag: 'Infra', author: 'Sanjay K.' },
  { key: 'QE-111', title: 'Spring Boot 3.3 virtual thread dispatcher', status: 'DONE', priority: 'CRITICAL', cat: 'DIFF', tag: 'Kernel', author: 'Alex M.' },
  { key: 'DS-112', title: 'Spring animation curves for modal transitions', status: 'IN_PROGRESS', priority: 'HIGH', cat: 'KANBAN', tag: 'Design', author: 'Elena R.' },
  { key: 'CLI-113', title: 'npx devflow start QE-1 branch automation', status: 'DONE', priority: 'HIGH', cat: 'CLI', tag: 'Terminal', author: 'Sanjay K.' },
  { key: 'HOOK-114', title: 'Discord outgoing webhook HMAC verification', status: 'DONE', priority: 'MEDIUM', cat: 'WEBHOOK', tag: 'Webhooks', author: 'Alex M.' },
  { key: 'ENG-115', title: 'Sub-millisecond SWR client query cache', status: 'DONE', priority: 'CRITICAL', cat: 'METRICS', tag: 'Core', author: 'Sanjay K.' },
  { key: 'GIT-116', title: 'Auto-generate conventional Linear commits', status: 'IN_PROGRESS', priority: 'HIGH', cat: 'ACTIVITY', tag: 'VCS', author: 'Elena R.' },
  { key: 'SEC-117', title: 'Multi-tenant workspace schema isolation', status: 'DONE', priority: 'CRITICAL', cat: 'SECURITY', tag: 'Security', author: 'Alex M.' },
  { key: 'VIM-118', title: 'Global shortcut: C create, X select, ? help', status: 'DONE', priority: 'MEDIUM', cat: 'VIM', tag: 'Shortcuts', author: 'David L.' },
  { key: 'API-119', title: 'Spring Security 6 stateless filter chain', status: 'DONE', priority: 'HIGH', cat: 'DIFF', tag: 'Backend', author: 'Sanjay K.' },
  { key: 'DS-120', title: 'Frosted glass capsule navigation docks', status: 'DONE', priority: 'MEDIUM', cat: 'KANBAN', tag: 'Design', author: 'Elena R.' },
  { key: 'DB-121', title: 'Serverless PostgreSQL connection autoscale', status: 'IN_PROGRESS', priority: 'HIGH', cat: 'METRICS', tag: 'Database', author: 'Alex M.' },
  { key: 'CLI-122', title: 'npx devflow list QE formatted ASCII table', status: 'DONE', priority: 'MEDIUM', cat: 'CLI', tag: 'Terminal', author: 'Sanjay K.' },
  { key: 'HOOK-123', title: 'Slack Block Kit rich embed dispatch engine', status: 'IN_REVIEW', priority: 'HIGH', cat: 'WEBHOOK', tag: 'Webhooks', author: 'David L.' },
  { key: 'MOB-124', title: 'Touch drag-and-drop gesture acceleration', status: 'DONE', priority: 'LOW', cat: 'KANBAN', tag: 'Mobile', author: 'Elena R.' },
  { key: 'QE-125', title: 'SIMD-accelerated bloom filter membership', status: 'DONE', priority: 'CRITICAL', cat: 'DIFF', tag: 'Kernel', author: 'Sanjay K.' },
  { key: 'HSC-126', title: 'Zero-cost Neon serverless database topology', status: 'DONE', priority: 'HIGH', cat: 'METRICS', tag: 'Infra', author: 'Alex M.' },
  { key: 'GIT-127', title: 'Auto-link pull requests & commit activity', status: 'IN_PROGRESS', priority: 'MEDIUM', cat: 'ACTIVITY', tag: 'VCS', author: 'David L.' },
  { key: 'VIM-128', title: 'J/K navigation across 10,000 issue rows', status: 'DONE', priority: 'MEDIUM', cat: 'VIM', tag: 'Shortcuts', author: 'Elena R.' },
  { key: 'ENG-129', title: 'Fast-failover 4.5s cold start resilience', status: 'DONE', priority: 'CRITICAL', cat: 'METRICS', tag: 'Core', author: 'Sanjay K.' },
  { key: 'DS-130', title: 'High-contrast numeral rhythm and keys', status: 'DONE', priority: 'LOW', cat: 'KANBAN', tag: 'Design', author: 'Elena R.' },
  { key: 'CLI-131', title: 'npx devflow create with atomic sequence', status: 'DONE', priority: 'HIGH', cat: 'CLI', tag: 'Terminal', author: 'Sanjay K.' },
  { key: 'SEC-132', title: 'RBAC role gating: OWNER, ADMIN, MEMBER', status: 'DONE', priority: 'CRITICAL', cat: 'SECURITY', tag: 'Security', author: 'Alex M.' },
  { key: 'HOOK-133', title: 'Webhook retry backoff with jitter circuit', status: 'IN_PROGRESS', priority: 'MEDIUM', cat: 'WEBHOOK', tag: 'Webhooks', author: 'David L.' },
  { key: 'QE-134', title: 'Concurrent atomic counter lock-free loop', status: 'DONE', priority: 'HIGH', cat: 'DIFF', tag: 'Kernel', author: 'Sanjay K.' },
  { key: 'MOB-135', title: 'Native biometrics authentication fallback', status: 'DONE', priority: 'MEDIUM', cat: 'SECURITY', tag: 'Mobile', author: 'David L.' },
  { key: 'GIT-136', title: 'Branch naming convention feature/<KEY>', status: 'DONE', priority: 'LOW', cat: 'ACTIVITY', tag: 'VCS', author: 'Elena R.' },
  { key: 'DS-137', title: 'Markdown editor with syntax highlight copy', status: 'DONE', priority: 'MEDIUM', cat: 'KANBAN', tag: 'Editor', author: 'Elena R.' },
  { key: 'HSC-138', title: 'Neon cold boot auto-resume in 1.4s', status: 'DONE', priority: 'HIGH', cat: 'METRICS', tag: 'Database', author: 'Alex M.' },
  { key: 'CLI-139', title: 'npx devflow done QE-1 auto-stage commit', status: 'DONE', priority: 'HIGH', cat: 'CLI', tag: 'Terminal', author: 'Sanjay K.' },
  { key: 'VIM-140', title: 'Global fuzzy search cmdk palette jump', status: 'DONE', priority: 'MEDIUM', cat: 'VIM', tag: 'Shortcuts', author: 'Elena R.' },
  { key: 'QE-141', title: 'Jackson JSON streaming serializer tuning', status: 'IN_REVIEW', priority: 'HIGH', cat: 'DIFF', tag: 'Backend', author: 'Sanjay K.' },
  { key: 'SEC-142', title: 'CORS origin allowlist & secure headers', status: 'DONE', priority: 'CRITICAL', cat: 'SECURITY', tag: 'Security', author: 'Alex M.' },
  { key: 'HOOK-143', title: 'Real-time issue event dispatch pipeline', status: 'DONE', priority: 'HIGH', cat: 'WEBHOOK', tag: 'Webhooks', author: 'David L.' },
  { key: 'ENG-144', title: 'Instant skeleton loaders with 0 shift', status: 'DONE', priority: 'MEDIUM', cat: 'KANBAN', tag: 'Frontend', author: 'Elena R.' },
  { key: 'GIT-145', title: 'GitHub audit timeline chronological stream', status: 'DONE', priority: 'MEDIUM', cat: 'ACTIVITY', tag: 'VCS', author: 'Sanjay K.' },
  { key: 'DB-146', title: 'Hibernate 6 2nd-level cache validation', status: 'DONE', priority: 'HIGH', cat: 'METRICS', tag: 'Database', author: 'Alex M.' },
  { key: 'DS-147', title: 'Pinterest floating dock blur & borders', status: 'DONE', priority: 'MEDIUM', cat: 'KANBAN', tag: 'Design', author: 'Elena R.' },
  { key: 'CLI-148', title: 'Zero-dependency portable CLI runtime', status: 'DONE', priority: 'HIGH', cat: 'CLI', tag: 'Terminal', author: 'Sanjay K.' },
];

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }
}

function drawHDCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  index: number
) {
  ctx.save();

  // Anti-aliased rounded clip
  const radius = 24;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.clip();

  // 1. Luxury dark slate gradient
  const isLight = index % 8 === 3;
  if (isLight) {
    ctx.fillStyle = '#f4f3f0';
    ctx.fillRect(x, y, w, h);
  } else {
    const bgGrad = ctx.createLinearGradient(x, y, x, y + h);
    bgGrad.addColorStop(0, '#212126');
    bgGrad.addColorStop(1, '#121215');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(x, y, w, h);
  }

  // 2. Subtle top glow
  if (!isLight) {
    const glow = ctx.createRadialGradient(x + w / 2, y, 0, x + w / 2, y, w * 0.85);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, w, h);
  }

  const tmpl = DEVFLOW_CARDS[index % DEVFLOW_CARDS.length];
  const textColor = isLight ? '#111827' : '#f4f3f0';
  const dimColor = isLight ? '#4b5563' : '#9ca3af';

  // 3. Header Bar
  const headH = 54;
  ctx.fillStyle = isLight ? '#e7e6e2' : '#1b1b1e';
  ctx.fillRect(x, y, w, headH);

  // Window dots
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(x + 28, y + 27, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(x + 46, y + 27, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(x + 64, y + 27, 5.5, 0, Math.PI * 2);
  ctx.fill();

  // Issue key
  ctx.fillStyle = textColor;
  ctx.font = '700 19px Inter, ui-sans-serif, system-ui, sans-serif';
  ctx.fillText(tmpl.key, x + 88, y + 34);

  // Priority Badge
  const prioColors: Record<string, string> = {
    CRITICAL: '#f87171',
    HIGH: '#fb923c',
    MEDIUM: '#38bdf8',
    LOW: '#94a3b8',
  };
  const pCol = prioColors[tmpl.priority] || '#38bdf8';
  ctx.fillStyle = pCol;
  ctx.font = '600 12.5px Inter, ui-sans-serif, system-ui, sans-serif';
  ctx.fillText(tmpl.priority, x + w - 165, y + 34);

  // Status Badge Pill
  const statusColors: Record<string, { bg: string; text: string }> = {
    DONE: { bg: 'rgba(74, 222, 128, 0.18)', text: '#4ade80' },
    IN_PROGRESS: { bg: 'rgba(56, 189, 248, 0.18)', text: '#38bdf8' },
    IN_REVIEW: { bg: 'rgba(192, 132, 252, 0.18)', text: '#c084fc' },
    TODO: { bg: 'rgba(251, 191, 36, 0.18)', text: '#fbbf24' },
  };
  const sConf = statusColors[tmpl.status] || statusColors.TODO;
  ctx.fillStyle = sConf.bg;
  ctx.beginPath();
  drawRoundedRect(ctx, x + w - 88, y + 15, 68, 24, 12);
  ctx.fill();
  ctx.fillStyle = sConf.text;
  ctx.font = '700 11.5px Inter, sans-serif';
  ctx.fillText(tmpl.status, x + w - 80, y + 31);

  // Title
  ctx.fillStyle = textColor;
  ctx.font = '600 18px Inter, ui-sans-serif, system-ui, sans-serif';
  const displayTitle = tmpl.title.length > 36 ? tmpl.title.substring(0, 34) + '...' : tmpl.title;
  ctx.fillText(displayTitle, x + 28, y + 94);

  // 4. Specific Category Body Visualization
  if (tmpl.cat === 'DIFF') {
    // Code Diff Visualizer
    ctx.fillStyle = '#090a0d';
    ctx.beginPath();
    drawRoundedRect(ctx, x + 28, y + 116, w - 56, 194, 12);
    ctx.fill();

    ctx.font = '500 13px "JetBrains Mono", monospace';
    // File header
    ctx.fillStyle = '#64748b';
    ctx.fillText(`@@ -48,6 +48,8 @@ void acquireConnection() {`, x + 44, y + 145);
    // Deleted line
    ctx.fillStyle = 'rgba(244, 63, 94, 0.18)';
    ctx.fillRect(x + 36, y + 160, w - 72, 26);
    ctx.fillStyle = '#f43f5e';
    ctx.fillText(`-   Connection c = pool.poll(5000, TimeUnit.MS);`, x + 44, y + 178);
    // Added lines
    ctx.fillStyle = 'rgba(52, 211, 153, 0.18)';
    ctx.fillRect(x + 36, y + 192, w - 72, 26);
    ctx.fillStyle = '#34d399';
    ctx.fillText(`+   HikariDataSource ds = FastPool.acquire();`, x + 44, y + 210);

    ctx.fillStyle = 'rgba(52, 211, 153, 0.18)';
    ctx.fillRect(x + 36, y + 224, w - 72, 26);
    ctx.fillStyle = '#34d399';
    ctx.fillText(`+   return ds.getConnectionWithPessimisticLock();`, x + 44, y + 242);

    ctx.fillStyle = '#64748b';
    ctx.fillText(`} // commit: 24aa34b · sub-millisecond p99`, x + 44, y + 280);
  } else if (tmpl.cat === 'METRICS') {
    // Area Line Graph & Stat Cards
    ctx.fillStyle = '#0d0e12';
    ctx.beginPath();
    drawRoundedRect(ctx, x + 28, y + 116, w - 56, 194, 12);
    ctx.fill();

    // Metric Header
    ctx.font = '700 24px Inter, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('1.2ms', x + 46, y + 158);
    ctx.font = '500 13px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('P99 Acquisition Latency · 14.8k req/s', x + 128, y + 158);

    // Area Curve
    ctx.beginPath();
    ctx.moveTo(x + 46, y + 285);
    const pts = [35, 48, 25, 68, 42, 85, 52, 105, 40, 25];
    const step = (w - 150) / (pts.length - 1);
    for (let p = 0; p < pts.length; p++) {
      ctx.lineTo(x + 46 + p * step, y + 285 - pts[p]);
    }
    ctx.lineTo(x + 46 + (pts.length - 1) * step, y + 285);
    ctx.closePath();
    const areaGrad = ctx.createLinearGradient(x, y + 170, x, y + 285);
    areaGrad.addColorStop(0, 'rgba(56, 189, 248, 0.38)');
    areaGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // Stroke
    ctx.beginPath();
    for (let p = 0; p < pts.length; p++) {
      if (p === 0) ctx.moveTo(x + 46, y + 285 - pts[p]);
      else ctx.lineTo(x + 46 + p * step, y + 285 - pts[p]);
    }
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.stroke();
  } else if (tmpl.cat === 'CLI') {
    // Real Terminal Execution
    ctx.fillStyle = '#08080a';
    ctx.beginPath();
    drawRoundedRect(ctx, x + 28, y + 116, w - 56, 194, 12);
    ctx.fill();

    ctx.font = '500 13px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('devflow@workstation:~$ npx devflow start ' + tmpl.key, x + 44, y + 150);
    ctx.fillStyle = '#4ade80';
    ctx.fillText('✔ Switched to branch "feature/' + tmpl.key.toLowerCase() + '"', x + 44, y + 180);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('✔ Remote sync: Synced with Neon PostgreSQL', x + 44, y + 210);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('⚡ Vim keybindings enabled (j/k to cycle)', x + 44, y + 240);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('devflow@workstation:~$ _', x + 44, y + 270);
  } else if (tmpl.cat === 'VIM') {
    // Vim Keybindings Cheatsheet Card
    ctx.fillStyle = '#0e0f13';
    ctx.beginPath();
    drawRoundedRect(ctx, x + 28, y + 116, w - 56, 194, 12);
    ctx.fill();

    const shortcuts = [
      { key: 'J / K', desc: 'Select issue row down / up' },
      { key: 'C', desc: 'Open instant Create Issue modal' },
      { key: '⌘K', desc: 'Universal fuzzy command palette' },
      { key: 'X', desc: 'Archive or mark issue as done' },
    ];
    shortcuts.forEach((sc, sci) => {
      const sy = y + 150 + sci * 35;
      // Keycap
      ctx.fillStyle = '#22232a';
      ctx.beginPath();
      drawRoundedRect(ctx, x + 44, sy - 16, 58, 24, 6);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 12px "JetBrains Mono", monospace';
      ctx.fillText(sc.key, x + 52, sy);

      ctx.fillStyle = textColor;
      ctx.font = '500 13.5px Inter, sans-serif';
      ctx.fillText(sc.desc, x + 116, sy);
    });
  } else if (tmpl.cat === 'WEBHOOK') {
    // Webhook JSON & Delivery Card
    ctx.fillStyle = '#090a0d';
    ctx.beginPath();
    drawRoundedRect(ctx, x + 28, y + 116, w - 56, 194, 12);
    ctx.fill();

    ctx.font = '500 13px "JetBrains Mono", monospace';
    ctx.fillStyle = '#c084fc';
    ctx.fillText('POST https://discord.com/api/webhooks/...', x + 44, y + 148);
    ctx.fillStyle = '#34d399';
    ctx.fillText('Status: 200 OK · HMAC-SHA256 Signed', x + 44, y + 176);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText('{ "event": "issue.transitioned",', x + 44, y + 210);
    ctx.fillText('  "key": "' + tmpl.key + '", "status": "' + tmpl.status + '",', x + 44, y + 234);
    ctx.fillText('  "author": "' + tmpl.author + '" }', x + 44, y + 258);
  } else if (tmpl.cat === 'SECURITY') {
    // Security & RBAC Isolation
    ctx.fillStyle = '#0e0f13';
    ctx.beginPath();
    drawRoundedRect(ctx, x + 28, y + 116, w - 56, 194, 12);
    ctx.fill();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(x + 56, y + 155, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '700 16px Inter, sans-serif';
    ctx.fillStyle = textColor;
    ctx.fillText('Stateless RBAC Security Active', x + 80, y + 160);

    ctx.font = '500 13px Inter, sans-serif';
    ctx.fillStyle = dimColor;
    ctx.fillText('• Multi-tenant UUID workspace isolation', x + 48, y + 198);
    ctx.fillText('• 256-bit HMAC secret token rotation', x + 48, y + 226);
    ctx.fillText('• Zero-trust Spring Security 6 filter chain', x + 48, y + 254);
  } else if (tmpl.cat === 'ACTIVITY') {
    // Git & VCS Activity
    ctx.fillStyle = '#0e0f13';
    ctx.beginPath();
    drawRoundedRect(ctx, x + 28, y + 116, w - 56, 194, 12);
    ctx.fill();

    ctx.font = '600 14px Inter, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('git checkout -b feature/' + tmpl.key.toLowerCase(), x + 48, y + 155);

    ctx.font = '500 13px Inter, sans-serif';
    ctx.fillStyle = textColor;
    ctx.fillText('PR #42: Ready to merge into origin/main', x + 48, y + 192);

    ctx.fillStyle = '#4ade80';
    ctx.fillText('✔ CI Build Passed (11/11 tests green in 2.9s)', x + 48, y + 226);

    ctx.fillStyle = dimColor;
    ctx.fillText('Committed by ' + tmpl.author + ' · 2 mins ago', x + 48, y + 258);
  } else {
    // Kanban Checklist & Progress
    ctx.fillStyle = isLight ? '#ebeae6' : '#0d0e11';
    ctx.beginPath();
    drawRoundedRect(ctx, x + 28, y + 116, w - 56, 194, 12);
    ctx.fill();

    const tasks = [
      { text: 'Atomic pessimistic row-level lock', done: true },
      { text: 'Verify sub-millisecond query cache', done: true },
      { text: 'Linear obsidian theme tokens test', done: index % 2 === 0 },
    ];
    tasks.forEach((t, ti) => {
      const ty = y + 155 + ti * 38;
      ctx.fillStyle = t.done ? '#10b981' : '#64748b';
      ctx.beginPath();
      ctx.arc(x + 52, ty - 5, 6.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = t.done ? textColor : dimColor;
      ctx.font = '500 14.5px Inter, ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(t.text, x + 70, ty);
    });

    // Progress bar
    const progressW = (w - 112) * 0.82;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    drawRoundedRect(ctx, x + 48, y + 270, w - 96, 7, 3.5);
    ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    drawRoundedRect(ctx, x + 48, y + 270, progressW, 7, 3.5);
    ctx.fill();
  }

  // 5. Card Footer: Assignee & Tag
  const footY = y + h - 42;
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(x + 44, footY + 12, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 11.5px Inter, sans-serif';
  const initials = tmpl.author
    .split(' ')
    .map((n) => n[0])
    .join('');
  ctx.fillText(initials, x + 36, footY + 16);

  ctx.fillStyle = dimColor;
  ctx.font = '500 13.5px Inter, sans-serif';
  ctx.fillText(`${tmpl.author} · Engineering`, x + 66, footY + 17);

  // Tag Pill
  ctx.fillStyle = isLight ? '#d4d4d8' : '#27272a';
  ctx.beginPath();
  drawRoundedRect(ctx, x + w - 120, footY, 92, 24, 6);
  ctx.fill();
  ctx.fillStyle = isLight ? '#18181b' : '#e4e4e7';
  ctx.font = '600 11.5px Inter, sans-serif';
  ctx.fillText(`#${tmpl.tag}`, x + w - 105, footY + 16);

  // Subtle border outline
  ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

  ctx.restore();
}

export function OrbGallery({ className = '', style }: OrbGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let animId: number;
    let isDisposed = false;
    let isVisible = true;

    // 1. Build High-Definition 4K Canvas Texture Atlas (48 unique DevFlow cards)
    const atlasCanvas = document.createElement('canvas');
    atlasCanvas.width = TW * COLS;
    atlasCanvas.height = TH * ROWS;
    const ac = atlasCanvas.getContext('2d');
    if (ac) {
      ac.fillStyle = '#141416';
      ac.fillRect(0, 0, atlasCanvas.width, atlasCanvas.height);
      for (let i = 0; i < TILES; i++) {
        const tx = (i % COLS) * TW;
        const ty = Math.floor(i / COLS) * TH;
        drawHDCard(ac, tx, ty, TW, TH, i);
      }
    }

    // 2. Setup Three.js WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(19, 1, 0.1, 60);

    const atlasTex = new THREE.CanvasTexture(atlasCanvas);
    atlasTex.flipY = false;
    atlasTex.colorSpace = THREE.SRGBColorSpace;
    atlasTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    atlasTex.minFilter = THREE.LinearMipmapLinearFilter;
    atlasTex.magFilter = THREE.LinearFilter;
    atlasTex.generateMipmaps = true;
    atlasTex.needsUpdate = true;

    // 3. Build Cards & Geometry
    const cards = buildCards();
    const vCount = cards.length * (PER + 1);
    const pos = new Float32Array(vCount * 3);
    const uv = new Float32Array(vCount * 2);
    const col = new Float32Array(vCount * 3).fill(1);
    const idx = new Uint32Array(cards.length * PER * 3);

    const TILEU = 1 / COLS;
    const TILEV = 1 / ROWS;
    const INSET = 0.5 / TW;
    let up = 0;
    let ip = 0;
    let vbase = 0;

    for (const c of cards) {
      c.basis = cardBasis(c.lat, c.lon, c.roll);
      c.outline = cardOutline(c.w, c.h, c.w * 0.065, SEG);
      c.vBase = vbase;
      writeCard(pos, c, 1, 1);

      const colIdx = c.tile % COLS;
      const rowIdx = Math.floor(c.tile / COLS);
      const u0 = colIdx * TILEU + INSET;
      const u1 = (colIdx + 1) * TILEU - INSET;
      const v0 = rowIdx * TILEV + INSET;
      const v1 = (rowIdx + 1) * TILEV - INSET;

      uv[up++] = (u0 + u1) / 2;
      uv[up++] = (v0 + v1) / 2;

      for (let s = 0; s < c.outline.length; s++) {
        const nx = c.outline[s][0] / c.w + 0.5;
        const ny = 0.5 - c.outline[s][1] / c.h;
        uv[up++] = u0 + nx * (u1 - u0);
        uv[up++] = v0 + ny * (v1 - v0);
      }

      for (let s = 0; s < PER; s++) {
        const nxt = (s + 1) % PER;
        idx[ip++] = vbase;
        idx[ip++] = vbase + 1 + s;
        idx[ip++] = vbase + 1 + nxt;
      }
      vbase += PER + 1;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));

    const mat = new THREE.MeshBasicMaterial({
      map: atlasTex,
      vertexColors: true,
      side: THREE.FrontSide,
    });

    const cardMesh = new THREE.Mesh(geo, mat);
    const orbGroup = new THREE.Group();
    orbGroup.add(cardMesh);
    scene.add(orbGroup);

    // Initial orientation
    let yaw = -0.35;
    let pitch = 0.08;
    let yawVel = 0;
    let pitchVel = 0;
    let dragging = false;
    let lastPointer: { x: number; y: number } | null = null;
    let hoverPos: { x: number; y: number } | null = null;
    let hoverIdx = -1;
    let slowT = 0;
    const hoverT = new Float32Array(cards.length);
    const live = new Set<number>();

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hoverBall = new THREE.Sphere(new THREE.Vector3(), 1.06);
    const hitPt = new THREE.Vector3();
    const canHover = !window.matchMedia || window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    const hintEl = document.getElementById('hint');

    const rad = () => Math.min(canvas.clientWidth, canvas.clientHeight) || 1;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      if (hintEl) hintEl.classList.add('gone');
      canvas.classList.add('dragging');
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {}
      lastPointer = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (canHover && e.pointerType !== 'touch') {
        const b = canvas.getBoundingClientRect();
        hoverPos = {
          x: ((e.clientX - b.left) / b.width) * 2 - 1,
          y: -((e.clientY - b.top) / b.height) * 2 + 1,
        };
      }
      if (!dragging || !lastPointer) return;
      const dx = e.clientX - lastPointer.x;
      const dy = e.clientY - lastPointer.y;
      lastPointer = { x: e.clientX, y: e.clientY };
      const k = 2.6 / rad();
      yaw += dx * k;
      yawVel = dx * k * 60 * 0.35;
      pitch = Math.max(-0.26, Math.min(0.26, pitch + dy * k * 0.55));
      pitchVel = dy * k * 60 * 0.2;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      canvas.classList.remove('dragging');
      lastPointer = null;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerLeave = (e: PointerEvent) => {
      hoverPos = null;
      onPointerUp(e);
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);

    const updateHover = (dt: number) => {
      let want = -1;
      if (hoverPos && !dragging && canHover) {
        ndc.set(hoverPos.x, hoverPos.y);
        raycaster.setFromCamera(ndc, camera);
        hoverBall.center.copy(orbGroup.position);
        if (raycaster.ray.intersectsSphere(hoverBall)) {
          const intersects = raycaster.intersectObject(cardMesh, false);
          const hit = intersects[0];
          if (hit && hit.faceIndex != null) {
            want = Math.floor(hit.faceIndex / PER);
          } else if (hoverIdx >= 0) {
            want = hoverIdx;
          } else if (raycaster.ray.intersectSphere(hoverBall, hitPt)) {
            orbGroup.worldToLocal(hitPt).normalize();
            let best = -1;
            let bd = -2;
            for (let i = 0; i < cards.length; i++) {
              const n = cards[i].basis.n;
              const d = n[0] * hitPt.x + n[1] * hitPt.y + n[2] * hitPt.z;
              if (d > bd) {
                bd = d;
                best = i;
              }
            }
            want = best;
          }
        }
      }

      if (want !== hoverIdx) {
        if (hoverIdx >= 0) live.add(hoverIdx);
        if (want >= 0) live.add(want);
        hoverIdx = want;
      }

      let dirtyPos = false;
      let dirtyCol = false;
      const dead: number[] = [];

      for (const i of live) {
        const target = i === hoverIdx ? 1 : 0;
        const cur = hoverT[i];
        const rate = target > cur ? 18 : 8;
        const next = THREE.MathUtils.damp(cur, target, rate, dt);
        hoverT[i] = Math.abs(next - target) < 0.001 ? target : next;
        if (hoverT[i] === target && target === 0) dead.push(i);

        const s = THREE.MathUtils.lerp(1, HOVER_POP, hoverT[i]);
        const rMul = THREE.MathUtils.lerp(1, 1.05, hoverT[i]);
        writeCard(pos, cards[i], s, rMul);
        dirtyPos = true;

        const b = THREE.MathUtils.lerp(1, 1.25, hoverT[i]);
        const vb = cards[i].vBase;
        for (let v = 0; v <= PER; v++) {
          const p = (vb + v) * 3;
          col[p] = b;
          col[p + 1] = b;
          col[p + 2] = b;
        }
        dirtyCol = true;
      }

      for (const d of dead) live.delete(d);
      if (dirtyPos) geo.attributes.position.needsUpdate = true;
      if (dirtyCol) geo.attributes.color.needsUpdate = true;
    };

    const updateCameraLayout = () => {
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      camera.aspect = w / h;

      const isMobile = w < 1024;
      // Controlled, compact globe size that doesn't overwhelm viewport
      const baseDist = isMobile ? 11.5 : 9.6;
      camera.position.set(0, 0, baseDist);

      const targetX = isMobile ? 0 : 1.15;
      const targetY = isMobile ? 0.7 : 0.02;
      orbGroup.position.set(targetX, targetY, 0);
      orbGroup.scale.set(0.82, 0.82, 0.82);

      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    };

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      updateCameraLayout();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    let lastT = performance.now();
    const animate = (now: number) => {
      if (isDisposed) return;
      const dt = Math.min(0.1, (now - lastT) * 0.001);
      lastT = now;

      if (!dragging) {
        const targetSlow = hoverIdx >= 0 ? 0.2 : 0;
        slowT = THREE.MathUtils.damp(slowT, targetSlow, 4, dt);
        const curAuto = AUTO * (1 - slowT * 0.82);
        yaw += curAuto * dt;

        yaw += yawVel * dt;
        pitch += pitchVel * dt;
        yawVel = THREE.MathUtils.damp(yawVel, 0, 4, dt);
        pitchVel = THREE.MathUtils.damp(pitchVel, 0, 5, dt);
        pitch = THREE.MathUtils.damp(pitch, 0.08, 1.6, dt);
      }

      orbGroup.rotation.set(pitch, yaw, 0, 'YXZ');
      updateHover(dt);

      if (isVisible) {
        renderer.render(scene, camera);
      }
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    const onVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) lastT = performance.now();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry?.isIntersecting ?? true;
      if (isVisible) lastT = performance.now();
    });
    io.observe(canvas);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      resizeObserver.disconnect();
      io.disconnect();

      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);

      geo.dispose();
      mat.dispose();
      atlasTex.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
      style={style}
    >
      <canvas
        ref={canvasRef}
        id="orb"
        className="w-full h-full block cursor-grab active:cursor-grabbing touch-none"
      />
    </div>
  );
}
