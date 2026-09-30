'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, getToken } from '@/lib/api';
import { User as UserIcon, Key, Copy, Check, LogOut, Loader2, Save, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

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
      const msg = 'Profile updated successfully';
      setSuccess(msg);
      toast.success(msg);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopiedToken(true);
      toast.success('API JWT Token copied to clipboard');
      setTimeout(() => setCopiedToken(false), 2000);
    } else {
      toast.error('No token available');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 mb-1 text-xs font-mono text-zinc-500 uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          <span>Security &amp; Preferences</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Developer Settings</h1>
        <p className="text-xs text-zinc-400 mt-1">Manage your developer profile and cloud API credentials.</p>
      </div>

      {success && (
        <div role="status" className="p-3.5 rounded-lg bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs font-mono">
          {success}
        </div>
      )}

      {error && (
        <div role="alert" className="p-3.5 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Profile Section */}
      <div className="linear-card rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
          <UserIcon className="w-4 h-4 text-zinc-400" aria-hidden="true" />
          <span>Profile Information</span>
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
          <div>
            <label htmlFor="settings-email" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Email (Read-only)
            </label>
            <input
              id="settings-email"
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full bg-zinc-950/60 border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-zinc-500 font-mono cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="settings-name" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Full Name
            </label>
            <input
              id="settings-name"
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Taylor Dev"
              className="w-full bg-zinc-950 border border-white/[0.08] focus:border-white/[0.25] rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="settings-avatar" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Avatar Image URL
            </label>
            <input
              id="settings-avatar"
              type="url"
              autoComplete="off"
              spellCheck={false}
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://github.com/username.png"
              className="w-full bg-zinc-950 border border-white/[0.08] focus:border-white/[0.25] rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shadow-[0_0_12px_rgba(255,255,255,0.1)] disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Save className="w-3.5 h-3.5" aria-hidden="true" />}
            <span>Save Profile</span>
          </button>
        </form>
      </div>

      {/* Developer API Token Section */}
      <div className="linear-card rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
            <Key className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span>Active Session JWT Bearer Token</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Authenticate automated tools, CI/CD webhooks, or test DevFlow REST API endpoints via <code className="font-mono text-zinc-300">curl</code> or Postman.
          </p>
        </div>

        {token ? (
          <div className="space-y-3">
            <div className="relative">
              <pre className="p-3.5 rounded-xl bg-zinc-950 border border-white/[0.08] text-[11px] font-mono text-zinc-400 overflow-x-auto whitespace-pre-wrap break-all max-h-32">
                {token}
              </pre>
            </div>
            <button
              type="button"
              onClick={handleCopyToken}
              className="px-3.5 py-1.5 bg-zinc-900/90 hover:bg-zinc-850 border border-white/[0.08] hover:border-white/[0.16] rounded-lg text-xs font-mono text-zinc-200 flex items-center gap-2 transition-all cursor-pointer"
            >
              {copiedToken ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span className="text-emerald-400">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                  <span>Copy Bearer Token</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 font-mono">No active token found in this session.</p>
        )}
      </div>

      {/* Sign Out Section */}
      <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-zinc-200 font-mono uppercase tracking-wider">Session Logout</div>
          <div className="text-xs text-zinc-500 mt-0.5">End your active authenticated session on this browser.</div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="px-4 py-2 rounded-lg bg-zinc-900/80 border border-white/[0.08] hover:border-rose-900 text-zinc-400 hover:text-rose-400 text-xs font-medium transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
