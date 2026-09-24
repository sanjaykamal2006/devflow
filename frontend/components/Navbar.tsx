'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Workspace } from '@/types';
import { api, isDemoMode } from '@/lib/api';
import { BrandLogo } from './BrandLogo';
import { Layers, LogOut, Settings, Plus, ChevronDown, Check, Zap } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const isDemo = isDemoMode();

  useEffect(() => {
    if (user) {
      api.workspaces.list()
        .then(setWorkspaces)
        .catch(() => {});
    }
  }, [user]);

  // Hide Navbar on login/register pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  // Find active workspace from path if present: /workspaces/[id] or /projects/[id]
  const currentWorkspaceId = workspaces.find((ws) => pathname.includes(ws.id))?.id;
  const currentWorkspace = workspaces.find((ws) => ws.id === currentWorkspaceId) || workspaces[0];

  return (
    <header className="border-b border-white/10 bg-black/85 backdrop-blur sticky top-0 z-40 text-white">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Brand & Workspace Selector */}
        <div className="flex items-center gap-5">
          <Link href="/dashboard" className="hover:opacity-90 transition">
            <BrandLogo size="sm" showText={true} />
          </Link>

          <span className="text-white/20 select-none">/</span>

          {/* Workspace Switcher */}
          <div className="relative">
            <button
              onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 text-xs font-bold text-zinc-200 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              <span className="max-w-[140px] truncate">{currentWorkspace ? currentWorkspace.name : 'Select Workspace'}</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {wsDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-60 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl py-1.5 z-50">
                <div className="px-3.5 py-1.5 text-[9px] uppercase font-black text-zinc-500 tracking-[0.2em]">
                  Workspaces
                </div>
                {workspaces.map((ws) => (
                  <Link
                    key={ws.id}
                    href={`/workspaces/${ws.id}`}
                    onClick={() => setWsDropdownOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <span className="truncate">{ws.name}</span>
                    {ws.id === currentWorkspace?.id && <Check className="w-3.5 h-3.5 text-[#FFC554]" />}
                  </Link>
                ))}
                <div className="border-t border-white/10 my-1" />
                <Link
                  href="/dashboard"
                  onClick={() => setWsDropdownOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Workspace</span>
                </Link>
              </div>
            )}
          </div>

          {/* Main Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Link
              href="/dashboard"
              className={`hover:text-white transition-colors ${pathname === '/dashboard' ? 'text-white' : ''}`}
            >
              Dashboard
            </Link>
            {currentWorkspace && (
              <Link
                href={`/workspaces/${currentWorkspace.id}`}
                className={`hover:text-white transition-colors ${pathname.startsWith('/workspaces') ? 'text-white' : ''}`}
              >
                Projects
              </Link>
            )}
          </nav>
        </div>

        {/* Right: User Menu */}
        <div className="flex items-center gap-3">
          {isDemo && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFC554]/10 text-[#FFC554] border border-[#FFC554]/25">
              <Zap className="w-3 h-3 text-[#FFC554]" />
              <span>Preview Mode</span>
            </span>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/settings"
                className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>

              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xs font-black text-white">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-zinc-200 hidden sm:inline max-w-[120px] truncate">
                  {user.fullName}
                </span>
                <button
                  onClick={logout}
                  className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-xs">
              <Link href="/login" className="text-zinc-400 hover:text-white font-bold uppercase tracking-wider text-[11px]">
                Log In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 bg-[#FFC554] text-black font-black text-[11px] uppercase tracking-wider rounded-xl hover:bg-[#ffd166] transition-colors"
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
