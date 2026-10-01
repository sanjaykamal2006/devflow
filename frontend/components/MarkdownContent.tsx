'use client';

import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Bold, Italic, Code, List, Link as LinkIcon } from 'lucide-react';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  if (!content || !content.trim()) {
    return <span className="text-zinc-600 italic">No content provided.</span>;
  }

  // Parse markdown into structured blocks
  const parseMarkdown = (raw: string) => {
    const lines = raw.split(/\r?\n/);
    const blocks: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // 1. Fenced Code Block (```lang)
      if (line.trim().startsWith('```')) {
        const lang = line.trim().slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```
        const codeString = codeLines.join('\n');
        blocks.push(<CodeBlock key={`code-${i}`} code={codeString} lang={lang} />);
        continue;
      }

      // 2. Headings (#, ##, ###)
      if (line.startsWith('### ')) {
        blocks.push(
          <h3 key={`h3-${i}`} className="text-sm font-bold text-white mt-3 mb-1 font-mono tracking-tight">
            {renderInline(line.slice(4))}
          </h3>
        );
        i++;
        continue;
      }
      if (line.startsWith('## ')) {
        blocks.push(
          <h2 key={`h2-${i}`} className="text-base font-bold text-white mt-4 mb-1.5 font-sans tracking-tight">
            {renderInline(line.slice(3))}
          </h2>
        );
        i++;
        continue;
      }
      if (line.startsWith('# ')) {
        blocks.push(
          <h1 key={`h1-${i}`} className="text-lg font-extrabold text-white mt-4 mb-2 font-sans tracking-tight">
            {renderInline(line.slice(2))}
          </h1>
        );
        i++;
        continue;
      }

      // 3. Blockquotes (> text)
      if (line.startsWith('> ')) {
        const quoteLines: string[] = [line.slice(2)];
        i++;
        while (i < lines.length && lines[i].startsWith('> ')) {
          quoteLines.push(lines[i].slice(2));
          i++;
        }
        blocks.push(
          <blockquote
            key={`quote-${i}`}
            className="border-l-2 border-sky-500/60 pl-3 py-1 my-2 bg-sky-950/20 text-zinc-300 text-xs italic rounded-r"
          >
            {quoteLines.map((ql, qidx) => (
              <p key={qidx}>{renderInline(ql)}</p>
            ))}
          </blockquote>
        );
        continue;
      }

      // 4. Task lists (- [ ] or - [x])
      if (/^[-*]\s+\[([ xX])\]\s+/.test(line)) {
        const isChecked = /^[-*]\s+\[[xX]\]/.test(line);
        const taskText = line.replace(/^[-*]\s+\[([ xX])\]\s+/, '');
        blocks.push(
          <div key={`task-${i}`} className="flex items-center gap-2 my-1 text-xs text-zinc-200">
            <input
              type="checkbox"
              readOnly
              checked={isChecked}
              className="w-3.5 h-3.5 rounded bg-zinc-900 border-zinc-700 text-sky-500 pointer-events-none"
            />
            <span className={isChecked ? 'line-through text-zinc-500' : ''}>
              {renderInline(taskText)}
            </span>
          </div>
        );
        i++;
        continue;
      }

      // 5. Bullet lists (- or *)
      if (/^[-*]\s+/.test(line)) {
        const listItems: string[] = [line.replace(/^[-*]\s+/, '')];
        i++;
        while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
          listItems.push(lines[i].replace(/^[-*]\s+/, ''));
          i++;
        }
        blocks.push(
          <ul key={`ul-${i}`} className="list-disc list-inside space-y-1 my-2 text-xs text-zinc-300">
            {listItems.map((li, lidx) => (
              <li key={lidx}>{renderInline(li)}</li>
            ))}
          </ul>
        );
        continue;
      }

      // 6. Numbered lists (1. text)
      if (/^\d+\.\s+/.test(line)) {
        const listItems: string[] = [line.replace(/^\d+\.\s+/, '')];
        i++;
        while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
          listItems.push(lines[i].replace(/^\d+\.\s+/, ''));
          i++;
        }
        blocks.push(
          <ol key={`ol-${i}`} className="list-decimal list-inside space-y-1 my-2 text-xs text-zinc-300">
            {listItems.map((li, lidx) => (
              <li key={lidx}>{renderInline(li)}</li>
            ))}
          </ol>
        );
        continue;
      }

      // 7. Empty line
      if (!line.trim()) {
        i++;
        continue;
      }

      // 8. Normal paragraph
      blocks.push(
        <p key={`p-${i}`} className="my-1.5 leading-relaxed text-zinc-300 text-xs">
          {renderInline(line)}
        </p>
      );
      i++;
    }

    return blocks;
  };

  // Helper for inline markdown: bold, italic, code, links, user mentions
  const renderInline = (text: string): React.ReactNode[] => {
    // Regex matches inline code `...`, bold **...**, italic *...*, links [text](url), mentions @name
    const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\)|@[a-zA-Z0-9._-]+)/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      // Inline code
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/[0.08] text-sky-300 font-mono text-[11px]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      // Bold
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={index} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Italic
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return (
          <em key={index} className="italic text-zinc-200">
            {part.slice(1, -1)}
          </em>
        );
      }

      // Links: [text](url)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={index}
            href={linkMatch[2]}
            target="_blank"
            rel="noreferrer"
            className="text-sky-400 hover:text-sky-300 underline underline-offset-2 inline-flex items-center gap-0.5"
          >
            <span>{linkMatch[1]}</span>
            <ExternalLink className="w-2.5 h-2.5 inline" />
          </a>
        );
      }

      // Mention: @user
      if (part.startsWith('@') && part.length > 1) {
        return (
          <span
            key={index}
            className="px-1 py-0.5 rounded bg-sky-950/50 text-sky-400 font-mono text-[11px] font-medium border border-sky-800/40"
          >
            {part}
          </span>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  return <div className={`space-y-1 text-xs ${className}`}>{parseMarkdown(content)}</div>;
}

// Code block with copy button
function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl border border-white/[0.08] bg-[#0c0c0e] overflow-hidden group">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.06] bg-zinc-950/70 text-[10px] font-mono text-zinc-500">
        <span>{lang || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-zinc-200 transition-colors p-1 rounded"
          title="Copy code"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3 text-[11px] font-mono text-zinc-200 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Tabbed Markdown Editor (Write / Preview)
interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  label?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write in Markdown...',
  minRows = 5,
  label,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');

  const insertSnippet = (prefix: string, suffix: string = '') => {
    onChange(`${value}${prefix}${suffix}`);
  };

  return (
    <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-zinc-950/80 focus-within:border-white/[0.2] transition-colors">
      {/* Editor Header: Tabs + Formatting shortcuts */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06] bg-zinc-900/40 text-xs">
        <div className="flex items-center gap-1">
          {label && <span className="font-mono text-[11px] text-zinc-400 mr-2 uppercase">{label}</span>}
          <button
            type="button"
            onClick={() => setTab('write')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              tab === 'write' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              tab === 'preview' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Preview
          </button>
        </div>

        {tab === 'write' && (
          <div className="flex items-center gap-1 text-zinc-500">
            <button
              type="button"
              onClick={() => insertSnippet('**bold**')}
              className="p-1 hover:text-white hover:bg-zinc-800 rounded transition-colors"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('*italic*')}
              className="p-1 hover:text-white hover:bg-zinc-800 rounded transition-colors"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('`code`')}
              className="p-1 hover:text-white hover:bg-zinc-800 rounded transition-colors"
              title="Inline Code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('\n- ')}
              className="p-1 hover:text-white hover:bg-zinc-800 rounded transition-colors"
              title="Bulleted List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('[link](https://)')}
              className="p-1 hover:text-white hover:bg-zinc-800 rounded transition-colors"
              title="Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Editor Body */}
      {tab === 'write' ? (
        <textarea
          rows={minRows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none resize-y font-mono leading-relaxed"
        />
      ) : (
        <div className="p-3 min-h-[120px] max-h-[300px] overflow-y-auto bg-zinc-950/40">
          <MarkdownContent content={value} />
        </div>
      )}
    </div>
  );
}
