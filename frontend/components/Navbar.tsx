'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Workspace } from '@/types';
import { api } from '@/lib/api';
import { Layers, LogOut, Settings, Plus, ChevronDown, Check } from 'lucide-react';

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

  // Hide Navbar on login/register pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  // Find active workspace from path if present: /workspaces/[id] or /projects/[id]
  const currentWorkspaceId = workspaces.find((ws) => pathname.includes(ws.id))?.id;
  const currentWorkspace = workspaces.find((ws) => ws.id === currentWorkspaceId) || workspaces[0];

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-40 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Brand & Workspace Selector */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-mono font-bold tracking-tight text-sm text-zinc-100 hover:text-white">
            <span className="w-5 h-5 rounded bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold text-xs">D</span>
            <span>DEVFLOW</span>
          </Link>

          <span className="text-zinc-700">/</span>

          {/* Workspace Switcher */}
          <div className="relative">
            <button
              onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-200"
            >
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              <span className="max-w-[140px] truncate">{currentWorkspace ? currentWorkspace.name : 'Select Workspace'}</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {wsDropdownOpen && (
              <div className="absolute left-0 mt-1 w-56 bg-zinc-900 border border-zinc-800 rounded-md shadow-xl py-1 z-50">
                <div className="px-3 py-1.5 text-[10px] uppercase font-mono text-zinc-500 tracking-wider">
                  Workspaces
                </div>
                {workspaces.map((ws) => (
                  <Link
                    key={ws.id}
                    href={`/workspaces/${ws.id}`}
                    onClick={() => setWsDropdownOpen(false)}
                    className="flex items-center justify-between px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    <span className="truncate">{ws.name}</span>
                    {ws.id === currentWorkspace?.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </Link>
                ))}
                <div className="border-t border-zinc-800 my-1" />
                <Link
                  href="/dashboard"
                  onClick={() => setWsDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                >
                  <Plus className="w-3 h-3" />
                  <span>Create Workspace</span>
                </Link>
              </div>
            )}
          </div>

          {/* Main Links */}
          <nav className="hidden md:flex items-center gap-4 text-xs font-medium text-zinc-400">
            <Link
              href="/dashboard"
              className={`hover:text-zinc-200 transition ${pathname === '/dashboard' ? 'text-zinc-100 font-semibold' : ''}`}
            >
              Dashboard
            </Link>
            {currentWorkspace && (
              <Link
                href={`/workspaces/${currentWorkspace.id}`}
                className={`hover:text-zinc-200 transition ${pathname.startsWith('/workspaces') ? 'text-zinc-100 font-semibold' : ''}`}
              >
                Projects & Team
              </Link>
            )}
          </nav>
        </div>

        {/* Right: User Menu */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/settings"
                className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded hover:bg-zinc-900 transition"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>

              <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono font-medium text-zinc-300">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-zinc-300 hidden sm:inline max-w-[120px] truncate">
                  {user.fullName}
                </span>
                <button
                  onClick={logout}
                  className="text-zinc-500 hover:text-rose-400 p-1 rounded hover:bg-zinc-900 transition"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-xs">
              <Link href="/login" className="text-zinc-400 hover:text-zinc-200">
                Log In
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 bg-zinc-100 text-zinc-950 font-medium rounded hover:bg-white transition"
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
