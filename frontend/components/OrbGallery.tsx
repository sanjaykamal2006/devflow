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
  { key: 'QE-105', title: 'Row-level locking on sequence generator', status: 'IN_REVIEW', priority: 'CRITICAL', tag: 'Database', assignee: 'AL' },
  { key: 'DS-201', title: 'Liquid-glass token system for cmdk palette', status: 'DONE', priority: 'MEDIUM', tag: 'Design', assignee: 'EM' },
  { key: 'DS-202', title: 'Vim keymap bindings: j/k navigation & x delete', status: 'DONE', priority: 'HIGH', tag: 'Frontend', assignee: 'SK' },
  { key: 'HSC-88', title: 'Sub-millisecond query cache for Neon postgres', status: 'IN_PROGRESS', priority: 'CRITICAL', tag: 'Infra', assignee: 'JD' },
  { key: 'HSC-89', title: 'Stateless JWT refresh rotation & revoked tokens', status: 'DONE', priority: 'HIGH', tag: 'Security', assignee: 'AL' },
  { key: 'MOB-12', title: 'Offline sync queue with optimistic rollback', status: 'TODO', priority: 'HIGH', tag: 'Mobile', assignee: 'JD' },
  { key: 'QE-106', title: 'WebSocket push notification channel for updates', status: 'IN_PROGRESS', priority: 'MEDIUM', tag: 'Backend', assignee: 'SK' },
  { key: 'DS-203', title: 'Spring animation curves on drag-and-drop board', status: 'DONE', priority: 'MEDIUM', tag: 'Frontend', assignee: 'SK' },
  { key: 'HSC-90', title: 'Distributed tracing via OpenTelemetry collector', status: 'TODO', priority: 'LOW', tag: 'Infra', assignee: 'AL' },
  { key: 'QE-107', title: 'Atomic issue key allocation: HSC-1, HSC-2', status: 'DONE', priority: 'CRITICAL', tag: 'Database', assignee: 'SK' },
  { key: 'MOB-13', title: 'Haptic feedback on gesture status transitions', status: 'TODO', priority: 'LOW', tag: 'Mobile', assignee: 'JD' },
  { key: 'HSC-91', title: 'Neon database branch instant ephemeral preview', status: 'DONE', priority: 'HIGH', tag: 'DevOps', assignee: 'AL' },
  { key: 'DS-204', title: 'Linear obsidian theme palette with #1f1f21 tone', status: 'DONE', priority: 'MEDIUM', tag: 'Design', assignee: 'SK' },
];

function drawCardCanvas(data: CardData): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 440;
  canvas.height = 270;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const w = 440;
  const h = 270;
  const r = 20;

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

  // Gradient fill (charcoal matte glass)
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#2a2a2f');
  grad.addColorStop(1, '#1b1b1e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Border highlight
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.stroke();
  ctx.restore();

  // Key badge
  ctx.fillStyle = '#f4f3f0';
  ctx.font = 'bold 24px Inter, system-ui, sans-serif';
  ctx.fillText(data.key, 28, 48);

  // Status badge pill
  let statusColor = '#38bdf8';
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

  const pillText = data.status.replace('_', ' ');
  ctx.font = '600 16px Inter, system-ui, sans-serif';
  const pillWidth = ctx.measureText(pillText).width + 32;
  const pillX = w - pillWidth - 28;
  const pillY = 28;
  const pillHeight = 28;
  const pillR = 14;

  ctx.beginPath();
  ctx.fillStyle = statusBg;
  ctx.roundRect(pillX, pillY, pillWidth, pillHeight, pillR);
  ctx.fill();
  ctx.strokeStyle = statusColor;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Status dot
  ctx.beginPath();
  ctx.arc(pillX + 14, pillY + 14, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = statusColor;
  ctx.fill();

  ctx.fillStyle = statusColor;
  ctx.fillText(pillText, pillX + 24, pillY + 20);

  // Title text (wrap)
  ctx.fillStyle = '#f4f3f0';
  ctx.font = '600 24px Inter, system-ui, sans-serif';
  const words = data.title.split(' ');
  let line = '';
  let lineY = 105;
  const maxWidth = w - 56;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, 28, lineY);
      line = words[n] + ' ';
      lineY += 34;
      if (lineY > 175) {
        line = line + '...';
        break;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 28, lineY);

  // Bottom row divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(28, 205);
  ctx.lineTo(w - 28, 205);
  ctx.stroke();

  // Bottom tag & priority
  ctx.font = '500 16px Inter, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(244, 243, 240, 0.6)';
  ctx.fillText('#' + data.tag, 28, 240);

  let prioColor = '#94a3b8';
  if (data.priority === 'CRITICAL') prioColor = '#f43f5e';
  else if (data.priority === 'HIGH') prioColor = '#fb923c';
  ctx.fillStyle = prioColor;
  ctx.font = '600 15px Inter, system-ui, sans-serif';
  ctx.fillText(data.priority, 150, 240);

  // Assignee badge circle
  ctx.beginPath();
  ctx.arc(w - 44, 238, 16, 0, Math.PI * 2);
  ctx.fillStyle = '#3a3a40';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(data.assignee, w - 44, 238);

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

    // Three.js Scene Setup
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      36,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    // Camera placed at comfortable distance so the ball is elegantly sized
    camera.position.z = 8.5;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Group for rotating sphere - elevated so it stays clear of bottom text
    const sphereGroup = new THREE.Group();
    // Lift sphere slightly above center (y = +0.55) to give full breathing room to bottom headlines
    sphereGroup.position.y = 0.55;
    scene.add(sphereGroup);

    // Opaque dark core sphere to occlude back-facing cards
    const radius = 1.85; // Clean, proportional sphere radius (not oversized)
    const coreGeo = new THREE.SphereGeometry(radius * 0.96, 48, 48);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x1a1a1d,
      transparent: false,
    });
    const coreSphere = new THREE.Mesh(coreGeo, coreMat);
    sphereGroup.add(coreSphere);

    // Delicate wireframe ambient ring
    const ringGeo = new THREE.SphereGeometry(radius * 0.97, 24, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.03,
    });
    const ringSphere = new THREE.Mesh(ringGeo, ringMat);
    sphereGroup.add(ringSphere);

    // Generate Card Meshes
    const totalCards = 24; // Clean quantity of cards on the sphere
    const cardMeshes: THREE.Mesh[] = [];
    const cardGeom = new THREE.PlaneGeometry(0.68, 0.42);

    for (let i = 0; i < totalCards; i++) {
      const data = CARDS_DATA[i % CARDS_DATA.length];
      const cardCanvas = drawCardCanvas(data);
      const texture = new THREE.CanvasTexture(cardCanvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      // FrontSide ONLY so back of cards is culled and never shows reversed/mirrored text
      const cardMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.FrontSide,
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

      sphereGroup.add(mesh);
      cardMeshes.push(mesh);
    }

    // Pointer Drag & Velocity Interaction
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let velX = 0;
    let velY = 0;
    const baseRotationSpeed = 0.001; // Gentle, relaxed rotation

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

        sphereGroup.rotation.y += deltaX * 0.004;
        sphereGroup.rotation.x += deltaY * 0.004;

        velX = deltaX * 0.004;
        velY = deltaY * 0.004;
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

    // Responsive Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      if (width < 768) {
        camera.position.z = 10.5;
        sphereGroup.position.y = 0.8;
      } else if (width < 1100) {
        camera.position.z = 9.2;
        sphereGroup.position.y = 0.65;
      } else {
        camera.position.z = 8.5;
        sphereGroup.position.y = 0.55;
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
      time += 0.008;

      if (!isDragging) {
        velX *= 0.95;
        velY *= 0.95;
        sphereGroup.rotation.y += velX + baseRotationSpeed;
        sphereGroup.rotation.x += velY;

        // Very subtle resting wobble
        sphereGroup.rotation.z = Math.sin(time * 0.4) * 0.02;
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
        <span>Drag to rotate &middot; real-time task globe</span>
      </div>
    </div>
  );
}
