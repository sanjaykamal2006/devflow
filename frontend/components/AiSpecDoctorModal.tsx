'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Check,
  Copy,
  Wand2,
  RefreshCw,
  Settings2,
  Cpu,
  FileCode,
  Bug,
  ListChecks,
  Network,
  ListOrdered,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  SpecMode,
  AiProvider,
  AiConfig,
  getStoredAiConfig,
  setStoredAiConfig,
  generateAiIssueSpec,
} from '@/lib/ai-issue-doctor';
import { MarkdownContent } from '@/components/MarkdownContent';

interface AiSpecDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (specMarkdown: string) => void;
  initialTitle?: string;
  initialDescription?: string;
  issueType?: 'TASK' | 'BUG' | 'FEATURE';
}

const SPEC_MODES: { id: SpecMode; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'PRD', label: 'Product PRD', icon: FileCode, desc: 'Problem statement, functional scope, verification & acceptance criteria' },
  { id: 'BUG_REPORT', label: 'Bug RCA', icon: Bug, desc: 'Reproduction steps, error signatures, root cause & regression checklist' },
  { id: 'CHECKLIST', label: 'Acceptance Checklist', icon: ListChecks, desc: 'Granular checkbox list of verifiable engineering deliverables' },
  { id: 'ARCHITECTURE', label: 'Technical RFC', icon: Network, desc: 'Subsystem architecture, data contracts, and security/rollback plans' },
  { id: 'SUBTASKS', label: 'Subtasks Breakdown', icon: ListOrdered, desc: 'Sequential engineering implementation tasks & milestones' },
];

const AI_PROVIDERS: { id: AiProvider; label: string; badge: string; free: boolean }[] = [
  { id: 'builtin', label: 'Built-in Neural Synthesizer', badge: '100% Free • Zero-Cost', free: true },
  { id: 'gemini', label: 'Google Gemini', badge: 'Gemini 1.5 Flash (Free Tier)', free: true },
  { id: 'groq', label: 'Groq Cloud', badge: 'Llama 3.3 70B (Ultra-fast)', free: true },
  { id: 'openrouter', label: 'OpenRouter', badge: 'Multi-model API', free: false },
  { id: 'openai', label: 'OpenAI', badge: 'GPT-4o mini', free: false },
  { id: 'anthropic', label: 'Anthropic Claude', badge: 'Claude 3.5 Sonnet', free: false },
];

export function AiSpecDoctorModal({
  isOpen,
  onClose,
  onApply,
  initialTitle = '',
  initialDescription = '',
  issueType = 'FEATURE',
}: AiSpecDoctorModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [rawNotes, setRawNotes] = useState(initialDescription);
  const [selectedMode, setSelectedMode] = useState<SpecMode>(
    issueType === 'BUG' ? 'BUG_REPORT' : 'PRD'
  );
  const [customInstructions, setCustomInstructions] = useState('');
  const [generatedSpec, setGeneratedSpec] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<AiConfig>({ provider: 'builtin' });
  const [tempApiKey, setTempApiKey] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'source'>('preview');

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setRawNotes(initialDescription);
      setSelectedMode(issueType === 'BUG' ? 'BUG_REPORT' : 'PRD');
      const loaded = getStoredAiConfig();
      setConfig(loaded);
      setTempApiKey(loaded.apiKey || '');
      setGeneratedSpec('');
    }
  }, [isOpen, initialTitle, initialDescription, issueType]);

  const handleGenerate = async () => {
    if (!title.trim() && !rawNotes.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generateAiIssueSpec({
        title: title.trim() || 'Engineering Task',
        description: rawNotes.trim(),
        issueType,
        mode: selectedMode,
        customInstructions: customInstructions.trim() || undefined,
        config,
      });
      setGeneratedSpec(result);
    } catch {
      // Fallback in case of unexpected failure
      const fallback = await generateAiIssueSpec({
        title: title.trim() || 'Engineering Task',
        description: rawNotes.trim(),
        issueType,
        mode: selectedMode,
        customInstructions: customInstructions.trim() || undefined,
        config: { provider: 'builtin' },
      });
      setGeneratedSpec(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveConfig = () => {
    const updated: AiConfig = {
      ...config,
      apiKey: tempApiKey.trim() || undefined,
    };
    setConfig(updated);
    setStoredAiConfig(updated);
    setShowConfig(false);
  };

  const handleCopy = () => {
    if (!generatedSpec) return;
    navigator.clipboard.writeText(generatedSpec);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!generatedSpec) return;
    onApply(generatedSpec);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="spec-doctor-title"
        className="bg-[#0b0c0f] border border-white/[0.14] rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl relative text-zinc-100 overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500/20 via-indigo-500/20 to-emerald-500/20 border border-white/[0.1] flex items-center justify-center text-sky-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="spec-doctor-title" className="text-sm font-bold font-mono text-white">
                  DevFlow AI Spec Doctor Studio
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                  {config.provider.toUpperCase()} ENGINE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Transform rough notes, error traces, and user intents into production-grade engineering specifications.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                showConfig
                  ? 'bg-white/[0.15] text-white border border-white/[0.2]'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.06]'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>AI Provider</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Provider Config Drawer */}
        {showConfig && (
          <div className="px-6 py-4 bg-zinc-900/90 border-b border-white/[0.1] animate-in slide-in-from-top-2 duration-150">
            <div className="max-w-3xl space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-zinc-300 mb-2">
                  Select AI Engine / Provider:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {AI_PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setConfig({ ...config, provider: p.id })}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        config.provider === p.id
                          ? 'bg-sky-500/10 border-sky-500/40 text-white shadow-sm'
                          : 'bg-zinc-950/60 border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold">{p.label}</span>
                        {config.provider === p.id && <Check className="w-3.5 h-3.5 text-sky-400" />}
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">{p.badge}</span>
                    </button>
                  ))}
                </div>
              </div>

              {config.provider !== 'builtin' && (
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <div className="flex-1 w-full">
                    <input
                      type="password"
                      placeholder={`Enter your ${config.provider.toUpperCase()} API Key (Stored securely in local browser)`}
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      className="w-full h-8 bg-zinc-950 border border-white/[0.1] rounded-lg px-3 text-xs text-zinc-100 placeholder-zinc-500 font-mono focus:border-sky-500/50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveConfig}
                    className="h-8 px-4 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer"
                  >
                    Save Key
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main 2-Column Studio Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
          {/* Left Panel: Inputs & Directives (5 cols) */}
          <div className="lg:col-span-5 p-5 flex flex-col gap-4 overflow-y-auto bg-[#0d0e12]/60">
            {/* Mode Selector */}
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>Spec Generation Mode</span>
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {SPEC_MODES.map((m) => {
                  const Icon = m.icon;
                  const isSelected = selectedMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMode(m.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white/[0.08] border-white/[0.2] text-white shadow-sm'
                          : 'bg-zinc-950/40 border-white/[0.04] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950/80'
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                          isSelected ? 'bg-sky-500/20 text-sky-300' : 'bg-zinc-900 text-zinc-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{m.label}</span>
                          {isSelected && <ChevronRight className="w-3.5 h-3.5 text-sky-400" />}
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-snug mt-0.5">{m.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input: Title */}
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                Issue Title / Goal
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Implement Discord webhook signature verification"
                className="w-full h-9 bg-zinc-950 border border-white/[0.08] rounded-xl px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-sky-500/50 transition-colors"
              />
            </div>

            {/* Input: Raw Developer Notes */}
            <div className="flex-1 flex flex-col min-h-[140px]">
              <label className="block text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                Raw Context / Developer Notes
              </label>
              <textarea
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                placeholder="Paste endpoint URLs, error stack traces, edge cases, tech stack constraints..."
                className="flex-1 w-full bg-zinc-950 border border-white/[0.08] rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-sky-500/50 resize-none font-mono transition-colors"
              />
            </div>

            {/* Input: Special Directives */}
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                Custom Directives (Optional)
              </label>
              <input
                type="text"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Include Safari iOS touch quirks, keep DB migration backward compatible"
                className="w-full h-8 bg-zinc-950 border border-white/[0.08] rounded-xl px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-sky-500/50 transition-colors"
              />
            </div>

            {/* Synthesize Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || (!title.trim() && !rawNotes.trim())}
              className="w-full h-10 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-98 transition-all disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-800" />
                  <span>Synthesizing Deep Contextual Spec...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-zinc-900" />
                  <span>Generate Specification ({selectedMode})</span>
                </>
              )}
            </button>
          </div>

          {/* Right Panel: Live Synthesized Output & Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col min-h-0 bg-[#08090b]">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-zinc-950/40">
              <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    activeTab === 'preview' ? 'bg-white/[0.1] text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Rich Preview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('source')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    activeTab === 'source' ? 'bg-white/[0.1] text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Raw Markdown
                </button>
              </div>

              {generatedSpec && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApply}
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(52,211,153,0.3)] active:scale-95 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Insert into Issue</span>
                  </button>
                </div>
              )}
            </div>

            {/* Spec Output Body */}
            <div className="flex-1 p-6 overflow-y-auto">
              {!generatedSpec && !isGenerating && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/[0.06] rounded-2xl bg-zinc-950/30">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-zinc-500 mb-3">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-300">No specification generated yet</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mt-1">
                    Enter your issue title and rough developer notes on the left, then click{' '}
                    <span className="text-zinc-300 font-mono">Generate Specification</span> to synthesize deep acceptance criteria and architecture specs.
                  </p>
                </div>
              )}

              {isGenerating && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-10 h-10 rounded-full border-2 border-sky-400/30 border-t-sky-400 animate-spin" />
                  <div className="text-xs font-mono text-zinc-300">Extracting AST tokens & entities...</div>
                  <div className="text-[11px] text-zinc-500 font-mono">Synthesizing test cases, reproduction steps & criteria</div>
                </div>
              )}

              {generatedSpec && !isGenerating && (
                <>
                  {activeTab === 'preview' ? (
                    <div className="space-y-4">
                      <MarkdownContent content={generatedSpec} />
                    </div>
                  ) : (
                    <textarea
                      value={generatedSpec}
                      onChange={(e) => setGeneratedSpec(e.target.value)}
                      className="w-full h-full min-h-[400px] bg-zinc-950 border border-white/[0.08] rounded-xl p-4 font-mono text-xs text-zinc-200 focus:border-sky-500/50 resize-none"
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
