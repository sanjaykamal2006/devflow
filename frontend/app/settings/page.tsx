'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, getToken } from '@/lib/api';
import { User as UserIcon, Key, Copy, Check, LogOut, Loader2, Save } from 'lucide-react';

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [saving, setSaving] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = getToken();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setSaving(true);
    setSuccess(null);
    setError(null);

    try {
      await api.auth.updateProfile({
        fullName: fullName.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
      });
      await refreshUser();
      setSuccess('Profile updated successfully');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-xl font-bold tracking-tight text-white font-mono">Developer Settings</h1>
        <p className="text-xs text-zinc-400 mt-1">Manage your account profile and API credentials.</p>
      </div>

      {success && (
        <div role="status" className="p-3 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono">
          {success}
        </div>
      )}

      {error && (
        <div role="alert" className="p-3 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-zinc-400" aria-hidden="true" />
          <span>Profile Information</span>
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="settings-email" className="block text-xs font-medium text-zinc-300 mb-1">Email (Read-only)</label>
            <input
              id="settings-email"
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-500 font-mono cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="settings-name" className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
            <input
              id="settings-name"
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Taylor Dev"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 rounded px-3 py-1.5 text-xs text-zinc-100 transition-colors duration-150"
            />
          </div>

          <div>
            <label htmlFor="settings-avatar" className="block text-xs font-medium text-zinc-300 mb-1">Avatar Image URL</label>
            <input
              id="settings-avatar"
              type="url"
              autoComplete="off"
              spellCheck={false}
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://github.com/username.png"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 rounded px-3 py-1.5 text-xs text-zinc-100 font-mono transition-colors duration-150"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-3.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 transition-colors duration-150 flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Save className="w-3.5 h-3.5" aria-hidden="true" />}
            <span>Save Profile</span>
          </button>
        </form>
      </div>

      {/* Developer API Token Section */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <Key className="w-4 h-4 text-zinc-400" aria-hidden="true" />
          <span>Active Session JWT Token</span>
        </h2>
        <p className="text-xs text-zinc-400 mb-4">
          Use this Bearer token to test DevFlow REST API endpoints directly via <code className="font-mono text-zinc-300">curl</code> or Postman.
        </p>

        {token ? (
          <div className="space-y-2">
            <div className="relative">
              <pre className="p-3 rounded bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400 overflow-x-auto whitespace-pre-wrap break-all max-h-28">
                {token}
              </pre>
            </div>
            <button
              type="button"
              onClick={handleCopyToken}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-xs font-mono text-zinc-300 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 transition-colors duration-150"
            >
              {copiedToken ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span className="text-emerald-400">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copy Bearer Token</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <p className="text-xs text-zinc-600 font-mono">No active token found.</p>
        )}
      </div>

      {/* Sign Out */}
      <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
        <div>
          <div className="text-xs font-semibold text-zinc-200">Log Out</div>
          <div className="text-[11px] text-zinc-500">Sign out of this browser session.</div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-rose-900 text-zinc-400 hover:text-rose-400 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500 transition-colors duration-150 flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
