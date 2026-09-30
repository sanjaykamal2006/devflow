'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Workspace } from '@/types';
import { api } from '@/lib/api';
import { BrandLogo } from './BrandLogo';
import { Layers, LogOut, Settings, Plus, ChevronDown, Check, Search } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);

  useEffect(() => {
    if (user) {
      api.workspaces.list()
        .then(setWorkspaces)
        .catch(() => {});
    }
  }, [user]);

  // Hide global app navbar on public landing, login, and register pages
  if (pathname === '/' || pathname === '/login' || pathname === '/register') {
    return null;
  }

  // Find active workspace from path if present: /workspaces/[id] or /projects/[id]
  const currentWorkspaceId = workspaces.find((ws) => pathname.includes(ws.id))?.id;
  const currentWorkspace = workspaces.find((ws) => ws.id === currentWorkspaceId) || workspaces[0];

  const handleOpenCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('devflow:open-command-palette'));
  };

  return (
    <header className="border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-40 text-zinc-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand & Workspace Selector */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link href="/dashboard" className="hover:opacity-90 transition">
            <BrandLogo size="md" showText={true} />
          </Link>

          <span className="text-zinc-700 select-none hidden sm:inline">/</span>

          {/* Workspace Switcher */}
          <div className="relative">
            <button
              onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
              aria-haspopup="true"
              aria-expanded={wsDropdownOpen}
              aria-label="Select workspace"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900/80 border border-white/[0.08] hover:border-white/[0.16] hover:bg-zinc-850 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 text-xs font-medium text-zinc-200 transition-all duration-150"
            >
              <Layers className="w-3.5 h-3.5 text-zinc-400 shrink-0" aria-hidden="true" />
              <span className="max-w-[120px] sm:max-w-[150px] truncate">
                {currentWorkspace ? currentWorkspace.name : 'Select Workspace'}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" aria-hidden="true" />
            </button>

            {wsDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-60 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] uppercase font-mono text-zinc-400 tracking-wider">
                  Workspaces
                </div>
                {workspaces.map((ws) => (
                  <Link
                    key={ws.id}
                    href={`/workspaces/${ws.id}`}
                    onClick={() => setWsDropdownOpen(false)}
                    className="flex items-center justify-between px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:bg-zinc-800 transition-colors duration-150"
                  >
                    <span className="truncate">{ws.name}</span>
                    {ws.id === currentWorkspace?.id && <Check className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />}
                  </Link>
                ))}
                <div className="border-t border-zinc-800 my-1" />
                <Link
                  href="/dashboard"
                  onClick={() => setWsDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 focus-visible:outline-none focus-visible:bg-zinc-800 transition-colors duration-150"
                >
                  <Plus className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
                  <span>Create Workspace</span>
                </Link>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-4 text-xs font-medium text-zinc-400 ml-2">
            <Link
              href="/dashboard"
              className={`hover:text-zinc-100 px-2 py-1 rounded transition-colors duration-150 ${
                pathname === '/dashboard' ? 'text-zinc-100 font-semibold bg-zinc-850/50' : ''
              }`}
            >
              Dashboard
            </Link>
            {currentWorkspace && (
              <Link
                href={`/workspaces/${currentWorkspace.id}`}
                className={`hover:text-zinc-100 px-2 py-1 rounded transition-colors duration-150 ${
                  pathname.startsWith('/workspaces') ? 'text-zinc-100 font-semibold bg-zinc-850/50' : ''
                }`}
              >
                Projects
              </Link>
            )}
          </nav>
        </div>

        {/* Center: Command Palette Trigger Button (⌘K) */}
        <div className="flex-1 max-w-sm hidden sm:block">
          <button
            type="button"
            onClick={handleOpenCommandPalette}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-zinc-400 bg-zinc-900/60 hover:bg-zinc-900 border border-white/[0.08] hover:border-white/[0.16] rounded-lg transition-all duration-150 shadow-inner group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-300" aria-hidden="true" />
              <span className="text-zinc-400 group-hover:text-zinc-300">Quick search or command...</span>
            </div>
            <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-850 border border-zinc-700/60 rounded">
              <span>⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile search trigger icon */}
          <button
            type="button"
            onClick={handleOpenCommandPalette}
            className="sm:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-white/[0.06]"
            aria-label="Open command palette"
          >
            <Search className="w-4 h-4" />
          </button>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/settings"
                className="text-zinc-400 hover:text-zinc-200 p-2 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-white/[0.06] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 transition-all duration-150"
                aria-label="Settings"
                title="Settings"
              >
                <Settings className="w-4 h-4" aria-hidden="true" />
              </Link>

              <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-zinc-800">
                <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono font-medium text-zinc-200 tabular-nums">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-zinc-200 hidden md:inline max-w-[120px] truncate">
                  {user.fullName}
                </span>
                <button
                  onClick={logout}
                  className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500 transition-colors duration-150"
                  aria-label="Log out"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-xs">
              <Link
                href="/login"
                className="text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded transition-colors duration-150"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 bg-white text-zinc-950 font-medium rounded-lg hover:bg-zinc-200 transition-colors duration-150"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
