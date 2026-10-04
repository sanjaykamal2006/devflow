'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Workspace } from '@/types';
import { api } from '@/lib/api';
import { BrandLogo } from './BrandLogo';
import {
  Layers,
  LogOut,
  Settings,
  Plus,
  ChevronDown,
  Check,
  Search,
  Keyboard,
  Zap,
} from 'lucide-react';
import { ShortcutsModal } from './ShortcutsModal';
import { NotificationCenter } from './NotificationCenter';

export function Navbar() {
  const { user, logout, isDemo, exitDemoSandbox } = useAuth();
  const pathname = usePathname();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      api.workspaces.list()
        .then(setWorkspaces)
        .catch(() => {});
    }
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setWsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for shortcuts modal events
  useEffect(() => {
    const handleOpenShortcuts = () => setShortcutsOpen(true);
    window.addEventListener('devflow:open-shortcuts', handleOpenShortcuts);
    return () => window.removeEventListener('devflow:open-shortcuts', handleOpenShortcuts);
  }, []);

  // Hide global app navbar on public landing, login, register, and dedicated dashboard pages
  if (pathname === '/' || pathname === '/login' || pathname === '/register' || pathname === '/dashboard') {
    return null;
  }

  // Find active workspace from path if present: /workspaces/[id] or /projects/[id]
  const currentWorkspaceId = workspaces.find((ws) => pathname.includes(ws.id))?.id;
  const currentWorkspace = workspaces.find((ws) => ws.id === currentWorkspaceId) || workspaces[0];

  const handleOpenCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('devflow:open-command-palette'));
  };

  return (
    <>
      <header className="sticky top-3 sm:top-4 z-40 px-3 sm:px-6 w-full max-w-7xl mx-auto flex flex-col gap-2 pointer-events-none">
        {/* Floating Pinterest-Style Amber Sandbox Pill */}
        {isDemo && (
          <div className="pointer-events-auto mx-auto inline-flex items-center justify-between gap-3 px-4 py-1.5 rounded-full bg-[#141008]/90 backdrop-blur-2xl border border-amber-500/35 text-amber-200 text-xs shadow-[0_4px_24px_rgba(245,158,11,0.22),inset_0_1px_0_rgba(251,191,36,0.2)] max-w-full sm:max-w-fit animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse shrink-0" />
              <span className="font-semibold text-amber-300 shrink-0 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Demo Sandbox</span>
              </span>
              <span className="text-zinc-400 hidden md:inline truncate">• Local in-browser storage</span>
            </div>
            <button
              type="button"
              onClick={exitDemoSandbox}
              className="shrink-0 px-3 py-0.5 rounded-full bg-amber-500/25 hover:bg-amber-500/40 border border-amber-500/45 text-amber-100 font-semibold text-[11px] transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-sm"
            >
              <span>Exit Demo</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        )}

        {/* Main Floating Frosted Capsule Dock */}
        <div className="pointer-events-auto w-full pinterest-dock rounded-full px-3 sm:px-5 h-14 flex items-center justify-between gap-2 sm:gap-4 text-zinc-100 transition-all">
          {/* Left: Brand & Workspace Pill Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/dashboard"
              className="hover:opacity-90 transition-opacity p-1.5 rounded-full hover:bg-white/[0.06] flex items-center"
              title="DevFlow Dashboard"
            >
              <BrandLogo size="md" showText={true} />
            </Link>

            <span className="text-zinc-700 select-none hidden sm:inline font-mono text-xs">/</span>

            {/* Workspace Switcher Pill */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
                aria-haspopup="true"
                aria-expanded={wsDropdownOpen}
                aria-label="Select workspace"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.09] active:scale-97 border border-white/[0.08] hover:border-white/[0.16] text-xs font-medium text-zinc-200 transition-all cursor-pointer shadow-inner"
              >
                <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" aria-hidden="true" />
                <span className="max-w-[100px] sm:max-w-[140px] truncate">
                  {currentWorkspace ? currentWorkspace.name : 'Select Workspace'}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-zinc-400 shrink-0 transition-transform duration-200 ${
                    wsDropdownOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {wsDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-[#0c0d10]/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-mono text-zinc-400 tracking-wider flex items-center justify-between">
                    <span>Workspaces</span>
                    <span className="text-zinc-400 font-normal">{workspaces.length} total</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-0.5 space-y-0.5">
                    {workspaces.map((ws) => (
                      <Link
                        key={ws.id}
                        href={`/workspaces/${ws.id}`}
                        onClick={() => setWsDropdownOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all ${
                          ws.id === currentWorkspace?.id
                            ? 'bg-white/[0.1] text-white font-medium shadow-inner'
                            : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                        }`}
                      >
                        <span className="truncate">{ws.name}</span>
                        {ws.id === currentWorkspace?.id && (
                          <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" aria-hidden="true" />
                        )}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-white/[0.08] my-1" />
                  <Link
                    href="/dashboard"
                    onClick={() => setWsDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded-xl transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Create New Workspace</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Segmented Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-1 bg-white/[0.03] p-1 rounded-full border border-white/[0.05]">
              <Link
                href="/dashboard"
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  pathname === '/dashboard'
                    ? 'bg-white/[0.12] text-white shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                Dashboard
              </Link>
              {currentWorkspace && (
                <Link
                  href={`/workspaces/${currentWorkspace.id}`}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    pathname.startsWith('/workspaces')
                      ? 'bg-white/[0.12] text-white shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                  }`}
                >
                  Projects
                </Link>
              )}
            </nav>
          </div>

          {/* Center: Pinterest-Style Command Search Capsule (⌘K) */}
          <div className="flex-1 max-w-sm hidden sm:block">
            <button
              type="button"
              onClick={handleOpenCommandPalette}
              className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-zinc-400 bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.99] border border-white/[0.08] hover:border-white/[0.18] rounded-full transition-all duration-150 shadow-inner group cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-sky-400 transition-colors shrink-0" aria-hidden="true" />
                <span className="text-zinc-400 group-hover:text-zinc-200 truncate">Search or jump to...</span>
              </div>
              <kbd className="flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-zinc-400 group-hover:text-zinc-300 bg-white/[0.08] border border-white/[0.08] rounded-full shadow-sm shrink-0">
                <span>⌘</span>K
              </kbd>
            </button>
          </div>

          {/* Right: Tactile Status, Shortcuts, Profile & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile search trigger pill */}
            <button
              type="button"
              onClick={handleOpenCommandPalette}
              className="sm:hidden p-2 rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08] active:scale-95 border border-transparent hover:border-white/[0.08] cursor-pointer transition-all"
              aria-label="Open command palette"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Live Sync Pulse Pill */}
            <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-300 select-none shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse" />
              <span>Live</span>
            </div>

            {/* Notification Center */}
            <NotificationCenter />

            {/* Keyboard Shortcuts Trigger Button */}
            <button
              type="button"
              onClick={() => setShortcutsOpen(true)}
              className="p-2 rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08] active:scale-95 transition-all cursor-pointer hidden md:flex items-center justify-center"
              aria-label="Keyboard Shortcuts"
              title="Keyboard Shortcuts (?)"
            >
              <Keyboard className="w-4 h-4" aria-hidden="true" />
            </button>

            {user ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/settings"
                  className="text-zinc-400 hover:text-zinc-200 p-2 rounded-full hover:bg-white/[0.08] active:scale-95 transition-all"
                  aria-label="Settings"
                  title="Workspace Settings"
                >
                  <Settings className="w-4 h-4" aria-hidden="true" />
                </Link>

                <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-white/[0.08]">
                  <div
                    className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500/25 via-zinc-800 to-indigo-500/25 ring-1 ring-white/[0.14] hover:ring-sky-400/50 flex items-center justify-center text-xs font-mono font-semibold text-zinc-200 tabular-nums shadow-inner select-none transition-all"
                    title={user.fullName}
                  >
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-zinc-200 hidden xl:inline max-w-[110px] truncate">
                    {user.fullName}
                  </span>
                  <button
                    onClick={logout}
                    className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-full hover:bg-rose-500/10 active:scale-95 transition-all cursor-pointer"
                    aria-label="Log out"
                    title="Log out"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <Link
                  href="/login"
                  className="text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-full hover:bg-white/[0.06] transition-all"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 bg-white text-zinc-950 font-semibold rounded-full hover:bg-zinc-200 active:scale-95 transition-all shadow-[0_0_16px_rgba(255,255,255,0.15)]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Keyboard Shortcuts Modal */}
      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </>
  );
}
