'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ORB_TILE_URLS } from '@/lib/orb-tiles';

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

// Geometry & Atlas Constants
const SPHERE = {
  R: 1,
  nEquator: 20,
  latLimit: 84,
  gap: 0.1,
};

const ASPECTS = [1.62, 1.56, 1.5, 1.5, 1.5, 1.44, 1.38, 1.32];
const TW = 384;
const TH = 256;
const COLS = 12;
const ROWS = 8;
const TILES = COLS * ROWS; // 96
const SEG = 7;
const PER = 4 * (SEG + 1); // 32
const HOVER_POP = 1.12;
const AUTO = (Math.PI * 2) / 22; // 22 seconds per revolution

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

function clearTo(cx: number, cy: number, el: Element | null): number {
  if (!el) return Infinity;
  const r = el.getBoundingClientRect();
  const dx = Math.max(r.left - cx, 0, cx - r.right);
  const dy = Math.max(r.top - cy, 0, cy - r.bottom);
  return Math.hypot(dx, dy);
}

// Procedural fallback card painter for instant zero-latency loading
function drawFallbackCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, i: number) {
  ctx.save();
  ctx.fillStyle = '#1c1c1f';
  ctx.fillRect(x, y, w, h);

  // Card header band
  ctx.fillStyle = '#28282c';
  ctx.fillRect(x, y, w, 32);

  // Subtle accent dot
  const colors = ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#fbbf24'];
  ctx.fillStyle = colors[i % colors.length];
  ctx.beginPath();
  ctx.arc(x + 18, y + 16, 5, 0, Math.PI * 2);
  ctx.fill();

  // Mock UI lines
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(x + 32, y + 12, 60, 8);
  ctx.fillRect(x + 18, y + 50, w - 36, 10);
  ctx.fillRect(x + 18, y + 70, w - 80, 8);
  ctx.fillRect(x + 18, y + 90, w - 120, 8);

  // Mock chart / metrics block
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.fillRect(x + 18, y + 120, w - 36, 90);

  // Mock bar lines
  ctx.fillStyle = colors[(i + 1) % colors.length];
  for (let b = 0; b < 6; b++) {
    const bh = 20 + ((b * 13 + i * 7) % 50);
    ctx.fillRect(x + 32 + b * 20, y + 195 - bh, 12, bh);
  }

  // Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
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

    // 1. Build Atlas Canvas
    const atlasCanvas = document.createElement('canvas');
    atlasCanvas.width = TW * COLS;
    atlasCanvas.height = TH * ROWS;
    const ac = atlasCanvas.getContext('2d');
    if (ac) {
      ac.fillStyle = '#18181b';
      ac.fillRect(0, 0, atlasCanvas.width, atlasCanvas.height);
      for (let i = 0; i < TILES; i++) {
        const tx = (i % COLS) * TW;
        const ty = Math.floor(i / COLS) * TH;
        drawFallbackCard(ac, tx, ty, TW, TH, i);
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

    // 3. Preload WebP Atlas Images
    const imageElements: HTMLImageElement[] = [];
    ORB_TILE_URLS.forEach((url, i) => {
      if (i >= TILES) return;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (isDisposed || !ac) return;
        const tx = (i % COLS) * TW;
        const ty = Math.floor(i / COLS) * TH;
        ac.drawImage(img, tx, ty, TW, TH);
        atlasTex.needsUpdate = true;
      };
      img.src = url;
      imageElements.push(img);
    });

    // 4. Build Cards & Geometry
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

      const cl = c.tile % COLS;
      const row = Math.floor(c.tile / COLS);
      const asp = c.w / c.h;
      const tileAsp = TW / TH;
      const us = asp > tileAsp ? 1 : asp / tileAsp;
      const vs = asp > tileAsp ? tileAsp / asp : 1;

      uv[up++] = (cl + 0.5) * TILEU;
      uv[up++] = (row + 0.5) * TILEV;

      for (let i = 0; i < c.outline.length; i++) {
        const lu = 0.5 + (c.outline[i][0] / c.w) * us;
        const lv = 0.5 + (c.outline[i][1] / c.h) * vs;
        uv[up++] = (cl + Math.min(1 - INSET, Math.max(INSET, lu))) * TILEU;
        uv[up++] = (row + (1 - Math.min(1 - INSET, Math.max(INSET, lv)))) * TILEV;
      }

      for (let i = 0; i < PER; i++) {
        idx[ip++] = vbase;
        idx[ip++] = vbase + 1 + i;
        idx[ip++] = vbase + 1 + ((i + 1) % PER);
      }
      vbase += PER + 1;
    }

    const geo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(pos, 3);
    const colAttr = new THREE.BufferAttribute(col, 3);
    geo.setAttribute('position', posAttr);
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setAttribute('color', colAttr);
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1.35);

    const mat = new THREE.MeshBasicMaterial({
      map: atlasTex,
      side: THREE.FrontSide,
      vertexColors: true,
      toneMapped: false,
    });

    const cardMesh = new THREE.Mesh(geo, mat);
    const orbGroup = new THREE.Group();
    orbGroup.add(cardMesh);
    scene.add(orbGroup);

    // 5. Dynamic Camera Sizing & Auto-Clearing Copy Elements
    let fitW = 0;
    let fitH = 0;

    const fitCamera = (force = false) => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const W = parent.clientWidth;
      const H = parent.clientHeight;
      if (W < 2 || H < 2) return;
      if (!force && W === fitW && H === fitH) return;
      fitW = W;
      fitH = H;

      const D = 4.0;
      const alpha = Math.asin(1 / D);
      let diameter: number;

      const isStacked = window.innerWidth <= 900;
      if (isStacked) {
        diameter = Math.min(0.88 * W, 0.92 * H);
      } else {
        const cx = W / 2;
        const cy = H / 2;
        let R = Math.min(0.32 * W, 0.44 * H);
        const navEl = document.querySelector('.orb-nav');
        const hintEl = document.querySelector('.hint');
        const leadEl = document.querySelector('.orb-lead');
        const sideEl = document.querySelector('.orb-side');
        for (const e of [navEl, hintEl, leadEl, sideEl]) {
          if (e) {
            R = Math.min(R, clearTo(cx, cy, e) - 20);
          }
        }
        diameter = 2 * Math.max(80, R);
      }

      const halfFov = Math.atan((Math.tan(alpha) * H) / diameter);
      camera.fov = Math.max(4, Math.min(100, (halfFov * 2 * 180) / Math.PI));
      camera.aspect = W / H;
      camera.position.set(0, 0, D);
      camera.updateProjectionMatrix();
      orbGroup.position.y = 0;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(W, H, false);
    };

    fitCamera(true);

    const resizeObserver = new ResizeObserver(() => fitCamera());
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    const handleWindowResize = () => fitCamera(true);
    window.addEventListener('resize', handleWindowResize);

    // 6. Interaction State
    let yaw = 0;
    let pitch = 0;
    let yawVel = 0;
    let pitchVel = 0;
    let dragging = false;
    let lastPointer: { x: number; y: number } | null = null;
    let hoverPos: { x: number; y: number } | null = null;
    let hoverIdx = -1;
    let dimT = 0;
    let slowT = 0;
    const hoverT = new Float32Array(cards.length);
    const live = new Set<number>();

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hoverBall = new THREE.Sphere(new THREE.Vector3(), 1.06);
    const hitPt = new THREE.Vector3();
    const canHover = !window.matchMedia || window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    const hintEl = document.getElementById('hint');

    // Pointer events
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

    // Hover logic
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

      const ease = 1 - Math.pow(0.0009, dt);
      dimT += ((hoverIdx >= 0 ? 1 : 0) - dimT) * ease;
      slowT += ((hoverIdx >= 0 ? 1 : 0) - slowT) * ease;
      const dimTo = 1 - 0.42 * dimT;
      mat.color.setScalar(dimTo);

      let movedGeo = false;
      let movedCol = false;
      for (const i of Array.from(live)) {
        const target = i === hoverIdx ? 1 : 0;
        const t = hoverT[i] + (target - hoverT[i]) * ease;
        hoverT[i] = Math.abs(t - target) < 0.0015 ? target : t;
        const c = cards[i];
        const k = 1 + hoverT[i] * (HOVER_POP - 1);
        writeCard(pos, c, k, k);
        movedGeo = true;

        const lift = 1 + hoverT[i] * (1 / dimTo - 1);
        const colArr = colAttr.array as Float32Array;
        const v0 = c.vBase * 3;
        const v1 = v0 + (PER + 1) * 3;
        for (let v = v0; v < v1; v++) {
          colArr[v] = lift;
        }
        movedCol = true;
        if (hoverT[i] === 0 && i !== hoverIdx) {
          live.delete(i);
        }
      }
      if (movedGeo) posAttr.needsUpdate = true;
      if (movedCol) colAttr.needsUpdate = true;
    };

    // 7. Render Loop
    let prev = performance.now();
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tick = (now: number) => {
      if (isDisposed) return;
      animId = requestAnimationFrame(tick);
      if (!isVisible) return;

      let dt = (now - prev) / 1000;
      prev = now;
      if (dt > 0.1) dt = 0.1;

      fitCamera();

      if (!dragging) {
        yaw += (AUTO * (reduceMotion ? 0 : 1) * (1 - 0.78 * slowT) + yawVel) * dt;
        yawVel *= Math.pow(0.0016, dt);
        pitch += pitchVel * dt;
        pitchVel *= Math.pow(0.0016, dt);
        pitch *= Math.pow(0.22, dt);
      }

      orbGroup.rotation.set(pitch, yaw, 0);
      updateHover(dt);
      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(tick);

    // 8. Visibility & Intersection Management
    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    io.observe(container);

    const onVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // 9. Cleanup
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('resize', handleWindowResize);
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
