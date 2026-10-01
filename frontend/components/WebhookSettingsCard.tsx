'use client';

import React, { useState, useEffect } from 'react';
import {
  WebhookConfig,
  getWebhookConfig,
  saveWebhookConfig,
  detectPlatform,
  testWebhookPing,
} from '@/lib/webhook-dispatcher';
import { BellRing, Send, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface WebhookSettingsCardProps {
  projectId: string;
  projectKey: string;
  projectName: string;
  canManage: boolean;
}

export function WebhookSettingsCard({
  projectId,
  projectKey,
  projectName,
  canManage,
}: WebhookSettingsCardProps) {
  const [config, setConfig] = useState<WebhookConfig>(() => getWebhookConfig(projectId));
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setConfig(getWebhookConfig(projectId));
  }, [projectId]);

  const handleUrlChange = (url: string) => {
    const detected = detectPlatform(url);
    setConfig((prev) => ({
      ...prev,
      url,
      platform: detected !== 'custom' ? detected : prev.platform,
    }));
  };

  const handleSave = () => {
    saveWebhookConfig(projectId, config);
    setSaved(true);
    toast.success('Webhook notification settings saved');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestPing = async () => {
    if (!config.url.trim()) {
      toast.error('Enter a valid webhook URL first');
      return;
    }

    try {
      setTesting(true);
      const res = await testWebhookPing(config.url, config.platform);
      if (res.success) {
        toast.success(`Test ping sent to ${config.platform.toUpperCase()}! Check your channel.`);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Failed to send webhook test ping');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="linear-card rounded-2xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Team Notifications (Webhooks)</h3>
            <p className="text-xs text-zinc-400">
              Dispatch real-time alerts for {projectName} ({projectKey}) to Discord or Slack channels for issue and engineering events.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig((prev) => ({ ...prev, enabled: e.target.checked }))}
              disabled={!canManage}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
            <span className="ml-2 text-xs font-mono text-zinc-300">
              {config.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        {/* Webhook URL Input */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Webhook URL <span className="text-zinc-500 font-mono">(Discord or Slack Webhook)</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={config.url}
              onChange={(e) => handleUrlChange(e.target.value)}
              disabled={!canManage}
              placeholder="https://discord.com/api/webhooks/... or https://hooks.slack.com/services/..."
              className="flex-1 h-9 bg-zinc-950 border border-white/[0.08] rounded-lg px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/[0.25] font-mono transition-colors disabled:opacity-50"
            />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, platform: 'discord' }))}
                className={`px-3 py-1.5 text-xs rounded-lg border font-mono transition-all cursor-pointer ${
                  config.platform === 'discord'
                    ? 'bg-[#5865F2]/20 border-[#5865F2]/50 text-indigo-300 font-semibold'
                    : 'bg-zinc-900 border-white/[0.08] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Discord
              </button>
              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, platform: 'slack' }))}
                className={`px-3 py-1.5 text-xs rounded-lg border font-mono transition-all cursor-pointer ${
                  config.platform === 'slack'
                    ? 'bg-[#4A154B]/30 border-[#E01E5A]/50 text-pink-300 font-semibold'
                    : 'bg-zinc-900 border-white/[0.08] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Slack
              </button>
            </div>
          </div>
        </div>

        {/* Trigger Matrix */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-2">Notification Triggers</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-950/60 border border-white/[0.06] hover:border-white/[0.12] transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={config.triggers.criticalHighCreated}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    triggers: { ...prev.triggers, criticalHighCreated: e.target.checked },
                  }))
                }
                disabled={!canManage}
                className="mt-0.5 rounded bg-zinc-900 border-zinc-700 text-sky-500 focus:ring-sky-500/20"
              />
              <div className="text-xs">
                <span className="font-medium text-zinc-200 block">Critical / High Issues</span>
                <span className="text-[11px] text-zinc-500 block">
                  Alert when urgent priority tasks are opened
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-950/60 border border-white/[0.06] hover:border-white/[0.12] transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={config.triggers.issueCompleted}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    triggers: { ...prev.triggers, issueCompleted: e.target.checked },
                  }))
                }
                disabled={!canManage}
                className="mt-0.5 rounded bg-zinc-900 border-zinc-700 text-sky-500 focus:ring-sky-500/20"
              />
              <div className="text-xs">
                <span className="font-medium text-zinc-200 block">Status: DONE</span>
                <span className="text-[11px] text-zinc-500 block">
                  Broadcast whenever an issue is closed
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-950/60 border border-white/[0.06] hover:border-white/[0.12] transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={config.triggers.commentAdded}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    triggers: { ...prev.triggers, commentAdded: e.target.checked },
                  }))
                }
                disabled={!canManage}
                className="mt-0.5 rounded bg-zinc-900 border-zinc-700 text-sky-500 focus:ring-sky-500/20"
              />
              <div className="text-xs">
                <span className="font-medium text-zinc-200 block">Discussion Comments</span>
                <span className="text-[11px] text-zinc-500 block">
                  Relay engineer comments to team channel
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
          <div className="text-[11px] text-zinc-500 font-mono">
            Format: {config.platform === 'discord' ? 'Discord Rich Embed (Cyan/Rose)' : 'Slack Block Kit (Header & Sections)'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestPing}
              disabled={testing || !config.url.trim()}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {testing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
              ) : (
                <Send className="w-3.5 h-3.5 text-sky-400" />
              )}
              <span>Send Test Ping</span>
            </button>

            {canManage && (
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-zinc-200 text-zinc-950 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,255,255,0.1)] cursor-pointer"
              >
                {saved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
                <span>{saved ? 'Saved' : 'Save Webhook'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
