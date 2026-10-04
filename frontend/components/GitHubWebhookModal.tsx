'use client';

import React, { useState } from 'react';
import {
  X,
  GitBranch,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface GitHubWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  projectKey: string;
}

export function GitHubWebhookModal({
  isOpen,
  onClose,
  projectName,
  projectKey,
}: GitHubWebhookModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const webhookUrl = 'https://devflow-api-zz68.onrender.com/api/webhooks/github';
  const secretKey = 'devflow_gh_' + projectKey.toLowerCase() + '_sec256';

  const handleCopy = (val: string, field: string) => {
    navigator.clipboard.writeText(val);
    setCopiedField(field);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-150 select-text">
      <div className="bg-[#0c0d10] border border-white/[0.14] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-zinc-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-heading font-bold text-white">
                GitHub Inbound Webhook Setup
              </h2>
              <p className="text-xs text-zinc-400">
                Connect {projectName} ({projectKey}) with real-time Git commits &amp; PRs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Payload URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300">Payload URL</label>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/60 border border-white/[0.08] font-mono text-xs">
            <span className="text-zinc-300 truncate mr-2">{webhookUrl}</span>
            <button
              onClick={() => handleCopy(webhookUrl, 'url')}
              className="flex items-center gap-1 text-sky-400 hover:text-sky-300 shrink-0 cursor-pointer"
            >
              {copiedField === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{copiedField === 'url' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Secret & Content Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Content Type</label>
            <div className="p-2.5 rounded-xl bg-black/60 border border-white/[0.08] font-mono text-xs text-emerald-400">
              application/json
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Secret (X-Hub-Signature-256)</label>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/60 border border-white/[0.08] font-mono text-xs">
              <span className="text-zinc-300 truncate mr-2">{secretKey}</span>
              <button
                onClick={() => handleCopy(secretKey, 'secret')}
                className="text-sky-400 hover:text-sky-300 shrink-0 cursor-pointer"
              >
                {copiedField === 'secret' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Automation Triggers Guide */}
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2 text-xs">
          <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Automatic Issue Keyword Linking:</span>
          </span>
          <ul className="text-zinc-400 space-y-1 list-disc list-inside font-mono text-[11px]">
            <li>Include issue key in commit: <code className="text-sky-300">git commit -m &quot;[{projectKey}-101] Add auth filter&quot;</code></li>
            <li>Auto-close issue: <code className="text-emerald-300">&quot;Fixes {projectKey}-101&quot;</code> or <code className="text-emerald-300">&quot;Closes {projectKey}-101&quot;</code></li>
          </ul>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
          <span className="text-xs text-zinc-500">Events: push, pull_request, commit_comment</span>
          <button
            onClick={onClose}
            className="btn-orb sm solid text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
