'use client';

import React, { useState } from 'react';
import { COMMANDS_LEXICON } from '@/data/commands-lexicon';
import { CommandRef } from '@/types/course';
import { Search, Terminal, Copy, Check, Filter, BookOpen, Play } from 'lucide-react';

interface LexiconViewProps {
  onRunSnippet?: (cmd: string) => void;
}

export function LexiconView({ onRunSnippet }: LexiconViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Commands' },
    { id: 'file-ops', label: 'File Operations' },
    { id: 'text-processing', label: 'Text Processing' },
    { id: 'system', label: 'System & Processes' },
    { id: 'networking', label: 'Networking' },
    { id: 'security', label: 'Security & Auth' },
  ];

  const filteredCommands = COMMANDS_LEXICON.filter((cmd) => {
    const matchesCategory = selectedCategory === 'all' || cmd.category === selectedCategory;
    const matchesSearch =
      cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.syntax.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BookOpen className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Interactive Linux Command Lexicon</h2>
            <p className="text-xs text-slate-400">
              Master 60+ fundamental and advanced utilities with flags, syntaxes, and real-world examples
            </p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search commands, flags, or descriptions (e.g. 'grep', 'permissions', 'ps aux', 'inodes')..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Commands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCommands.map((cmd) => (
          <div
            key={cmd.name}
            className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4 hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                    {cmd.name}
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {cmd.category}
                  </span>
                </div>

                {onRunSnippet && (
                  <button
                    onClick={() => onRunSnippet(cmd.realWorldExample)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-medium transition"
                    title="Run example in Sandbox Terminal"
                  >
                    <Play className="w-3 h-3 fill-cyan-400" />
                    <span>Run in Sandbox</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{cmd.description}</p>

              {/* Syntax */}
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80 font-mono text-xs text-slate-400 flex items-center justify-between">
                <code>{cmd.syntax}</code>
                <button
                  onClick={() => handleCopy(cmd.syntax)}
                  className="text-slate-500 hover:text-slate-300 transition"
                  title="Copy Syntax"
                >
                  {copiedCmd === cmd.syntax ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Common Flags */}
              {cmd.commonFlags.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                    Key Flags:
                  </span>
                  <div className="space-y-1">
                    {cmd.commonFlags.slice(0, 3).map((f, fi) => (
                      <div key={fi} className="flex items-baseline gap-2 text-xs">
                        <span className="font-mono text-cyan-300 font-semibold shrink-0">{f.flag}</span>
                        <span className="text-slate-400 text-[11px] leading-snug">{f.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Real World Snippet */}
            <div className="pt-2 border-t border-slate-800/60">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Real-World Usage:
              </span>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 font-mono text-xs text-emerald-300 border border-slate-800">
                <code className="truncate">{cmd.realWorldExample}</code>
                <button
                  onClick={() => handleCopy(cmd.realWorldExample)}
                  className="text-slate-500 hover:text-slate-300 transition shrink-0 ml-2"
                >
                  {copiedCmd === cmd.realWorldExample ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
