'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface CardData {
  key: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  tag: string;
  assignee: string;
}

const CARDS_DATA: CardData[] = [
  { key: 'QE-104', title: 'Migrate connection pool to HikariCP', status: 'IN_PROGRESS', priority: 'HIGH', tag: 'Backend', assignee: 'SK' },
  { key: 'QE-105', title: 'Pessimistic row-level locking on sequence generator', status: 'IN_REVIEW', priority: 'CRITICAL', tag: 'Database', assignee: 'AL' },
  { key: 'DS-201', title: 'Liquid-glass token system for cmdk palette', status: 'DONE', priority: 'MEDIUM', tag: 'Design', assignee: 'EM' },
  { key: 'DS-202', title: 'Vim keymap bindings: j/k navigation & x to delete', status: 'DONE', priority: 'HIGH', tag: 'Frontend', assignee: 'SK' },
  { key: 'HSC-88', title: 'Sub-millisecond query cache for Neon postgres', status: 'IN_PROGRESS', priority: 'CRITICAL', tag: 'Infra', assignee: 'JD' },
  { key: 'HSC-89', title: 'Stateless JWT refresh rotation & revoked blacklist', status: 'DONE', priority: 'HIGH', tag: 'Security', assignee: 'AL' },
  { key: 'MOB-12', title: 'Offline sync queue with optimistic rollback', status: 'TODO', priority: 'HIGH', tag: 'Mobile', assignee: 'JD' },
  { key: 'QE-106', title: 'WebSocket push notification channel for issue updates', status: 'IN_PROGRESS', priority: 'MEDIUM', tag: 'Backend', assignee: 'SK' },
  { key: 'AI-301', title: 'Issue Doctor: auto-generate test reproduction steps', status: 'DONE', priority: 'HIGH', tag: 'AI Engine', assignee: 'EM' },
  { key: 'DS-203', title: 'Spring animation curves on drag-and-drop board', status: 'DONE', priority: 'MEDIUM', tag: 'Frontend', assignee: 'SK' },
  { key: 'HSC-90', title: 'Distributed tracing via OpenTelemetry collector', status: 'TODO', priority: 'LOW', tag: 'Infra', assignee: 'AL' },
  { key: 'QE-107', title: 'Atomic issue key allocation: HSC-1, HSC-2', status: 'DONE', priority: 'CRITICAL', tag: 'Database', assignee: 'SK' },
  { key: 'AI-302', title: 'Context-aware PR title & commit message synthesis', status: 'IN_PROGRESS', priority: 'MEDIUM', tag: 'AI Engine', assignee: 'EM' },
  { key: 'MOB-13', title: 'Haptic feedback on gesture status transitions', status: 'TODO', priority: 'LOW', tag: 'Mobile', assignee: 'JD' },
  { key: 'HSC-91', title: 'Neon database branch instant ephemeral preview', status: 'DONE', priority: 'HIGH', tag: 'DevOps', assignee: 'AL' },
  { key: 'DS-204', title: 'Linear obsidian theme palette with #1f1f21 tone', status: 'DONE', priority: 'MEDIUM', tag: 'Design', assignee: 'SK' },
];

function drawCardCanvas(data: CardData): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background rounded rect
  const w = 512;
  const h = 320;
  const r = 24;

  ctx.clearRect(0, 0, w, h);

  // Card background
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, h - r);
  ctx.quadraticCurveTo(w, h, w - r, h);
  ctx.lineTo(r, h);
  ctx.quadraticCurveTo(0, h, 0, h - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.clip();

  // Gradient fill
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#27272b');
  grad.addColorStop(1, '#18181b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Border highlight
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.stroke();

  // Top header row: Key + Status dot
  ctx.restore();

  // Key badge
  ctx.fillStyle = '#f4f3f0';
  ctx.font = 'bold 26px Inter, system-ui, sans-serif';
  ctx.fillText(data.key, 32, 58);

  // Status badge pill
  let statusColor = '#38bdf8'; // sky
  let statusBg = 'rgba(56, 189, 248, 0.15)';
  if (data.status === 'DONE') {
    statusColor = '#4ade80';
    statusBg = 'rgba(74, 222, 128, 0.15)';
  } else if (data.status === 'IN_REVIEW') {
    statusColor = '#c084fc';
    statusBg = 'rgba(192, 132, 252, 0.15)';
  } else if (data.status === 'TODO') {
    statusColor = '#fbbf24';
    statusBg = 'rgba(251, 191, 36, 0.15)';
  }

  // Draw pill
  const pillText = data.status.replace('_', ' ');
  ctx.font = '600 18px Inter, system-ui, sans-serif';
  const pillWidth = ctx.measureText(pillText).width + 36;
  const pillX = w - pillWidth - 32;
  const pillY = 36;
  const pillHeight = 32;
  const pillR = 16;

  ctx.beginPath();
  ctx.fillStyle = statusBg;
  ctx.roundRect(pillX, pillY, pillWidth, pillHeight, pillR);
  ctx.fill();
  ctx.strokeStyle = statusColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Dot
  ctx.beginPath();
  ctx.arc(pillX + 16, pillY + 16, 4, 0, Math.PI * 2);
  ctx.fillStyle = statusColor;
  ctx.fill();

  // Pill text
  ctx.fillStyle = statusColor;
  ctx.fillText(pillText, pillX + 26, pillY + 22);

  // Title text (wrap if needed)
  ctx.fillStyle = '#f4f3f0';
  ctx.font = '600 28px Inter, system-ui, sans-serif';
  const words = data.title.split(' ');
  let line = '';
  let lineY = 120;
  const maxWidth = w - 64;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, 32, lineY);
      line = words[n] + ' ';
      lineY += 38;
      if (lineY > 200) {
        line = line + '...';
        break;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 32, lineY);

  // Bottom row divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(32, 245);
  ctx.lineTo(w - 32, 245);
  ctx.stroke();

  // Bottom tags & priority
  // Tag pill
  ctx.font = '500 18px Inter, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(244, 243, 240, 0.6)';
  ctx.fillText('#' + data.tag, 32, 285);

  // Priority indicator
  let prioColor = '#94a3b8';
  if (data.priority === 'CRITICAL') prioColor = '#f43f5e';
  else if (data.priority === 'HIGH') prioColor = '#fb923c';
  ctx.fillStyle = prioColor;
  ctx.font = '600 17px Inter, system-ui, sans-serif';
  ctx.fillText(data.priority, 170, 285);

  // Assignee circle
  ctx.beginPath();
  ctx.arc(w - 52, 280, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#3f3f46';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(data.assignee, w - 52, 280);

  return canvas;
}

export function OrbGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hintDismissed, setHintDismissed] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    // Scene setup
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 7.6;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Group for rotating sphere
    const sphereGroup = new THREE.Group();
    scene.add(sphereGroup);

    // Dark core sphere with atmospheric backlight
    const radius = 3.15;
    const coreGeo = new THREE.SphereGeometry(radius * 0.94, 48, 48);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x141416,
      transparent: true,
      opacity: 0.92,
    });
    const coreSphere = new THREE.Mesh(coreGeo, coreMat);
    sphereGroup.add(coreSphere);

    // Subtle geodesic lattice rings
    const ringGeo = new THREE.SphereGeometry(radius * 0.95, 24, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.035,
    });
    const ringSphere = new THREE.Mesh(ringGeo, ringMat);
    sphereGroup.add(ringSphere);

    // Generate Card Meshes
    const totalCards = 36;
    const cardMeshes: THREE.Mesh[] = [];
    const cardGeom = new THREE.PlaneGeometry(0.86, 0.54);

    // Fibonacci sphere distribution
    for (let i = 0; i < totalCards; i++) {
      const data = CARDS_DATA[i % CARDS_DATA.length];
      const cardCanvas = drawCardCanvas(data);
      const texture = new THREE.CanvasTexture(cardCanvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      const cardMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(cardGeom, cardMat);

      // Fibonacci sphere coordinates
      const phi = Math.acos(1 - (2 * (i + 0.5)) / totalCards);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      mesh.position.set(x, y, z);
      // Face outward away from center (0, 0, 0)
      mesh.lookAt(x * 2, y * 2, z * 2);

      mesh.userData = { id: data.key, baseScale: 1, originalScale: 1 };
      sphereGroup.add(mesh);
      cardMeshes.push(mesh);
    }

    // Pointer Drag & Velocity Interaction
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let velX = 0;
    let velY = 0;
    const baseRotationSpeed = 0.0016;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      velX = 0;
      velY = 0;
      canvas.style.cursor = 'grabbing';
      setHintDismissed(true);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevPointerX;
        const deltaY = e.clientY - prevPointerY;
        prevPointerX = e.clientX;
        prevPointerY = e.clientY;

        sphereGroup.rotation.y += deltaX * 0.005;
        sphereGroup.rotation.x += deltaY * 0.005;

        velX = deltaX * 0.005;
        velY = deltaY * 0.005;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
      canvas.style.cursor = 'grab';
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      if (width < 768) {
        camera.position.z = 9.2; // Move camera back on mobile
      } else {
        camera.position.z = 7.6;
      }
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Animation Loop
    let animId: number;
    let time = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      time += 0.01;

      if (!isDragging) {
        // Friction inertia
        velX *= 0.94;
        velY *= 0.94;
        sphereGroup.rotation.y += velX + baseRotationSpeed;
        sphereGroup.rotation.x += velY;

        // Soft tilt oscillation
        sphereGroup.rotation.z = Math.sin(time * 0.5) * 0.04;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('resize', handleResize);

      // Clean up Three.js resources
      coreGeo.dispose();
      coreMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      cardGeom.dispose();
      cardMeshes.forEach((mesh) => {
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.map?.dispose();
        mat.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="stage">
      <canvas id="orb" ref={canvasRef} className="w-full h-full block cursor-grab touch-none" />
      {/* Interactive hint under nav */}
      <div
        className={`hint transition-all duration-700 select-none ${
          hintDismissed ? 'opacity-0 translate-y-2 pointer-events-none' : 'opacity-100'
        }`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5 text-zinc-400 animate-pulse"
        >
          <path d="M7.2 2.9 L16.4 10.6 L11.6 11.2 L13.9 15.5 L11.6 16.7 L9.3 12.4 L6.6 15.3 Z" />
          <path d="M12 17.3 v2.2" />
          <ellipse cx="12" cy="20.5" rx="5.4" ry="1.7" />
        </svg>
        <span>Drag to spin sphere &middot; hover an issue</span>
      </div>
    </div>
  );
}
