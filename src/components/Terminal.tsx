'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TerminalEngine, CommandOutput } from '@/lib/terminal-engine';
import { VirtualFileSystem } from '@/lib/vfs';
import { Terminal as TerminalIcon, Maximize2, Minimize2, Trash2, RefreshCw, FolderTree, CornerDownLeft, Sparkles } from 'lucide-react';

interface TerminalProps {
  engine: TerminalEngine;
  onCommandExecuted?: (cmd: string, output: CommandOutput) => void;
  height?: string;
  className?: string;
  initialPromptMessage?: string;
  title?: string;
  onExploreVfs?: () => void;
}

interface HistoryEntry {
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  cwd: string;
  user: string;
  timestamp: string;
}

export function Terminal({
  engine,
  onCommandExecuted,
  height = '420px',
  className = '',
  initialPromptMessage,
  title = 'Interactive Linux Sandbox',
  onExploreVfs,
}: TerminalProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new output
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input on click anywhere in terminal
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const executeCommand = (cmdToRun?: string) => {
    const command = (cmdToRun !== undefined ? cmdToRun : inputVal).trim();
    if (!command) return;

    const cwd = engine.getCwd();
    const user = engine.getCurrentUser();
    const timestamp = new Date().toLocaleTimeString();

    if (command === 'clear') {
      setHistory([]);
      setInputVal('');
      setHistoryIndex(-1);
      engine.execute('clear');
      return;
    }

    const output = engine.execute(command);

    setHistory((prev) => [
      ...prev,
      {
        command,
        stdout: output.stdout,
        stderr: output.stderr,
        exitCode: output.exitCode,
        cwd,
        user,
        timestamp,
      },
    ]);

    setInputVal('');
    setHistoryIndex(-1);

    if (onCommandExecuted) {
      onCommandExecuted(command, output);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const rawHistory = engine.getHistory();

    if (e.key === 'Enter') {
      executeCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rawHistory.length === 0) return;
      const nextIdx = historyIndex === -1 ? rawHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInputVal(rawHistory[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= rawHistory.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIdx);
        setInputVal(rawHistory[nextIdx]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Auto-complete commands and files
      handleTabCompletion();
    } else if (e.key === 'c' && e.ctrlKey) {
      // Ctrl+C
      e.preventDefault();
      setHistory((prev) => [
        ...prev,
        {
          command: `${inputVal}^C`,
          stdout: '',
          stderr: '',
          exitCode: 130,
          cwd: engine.getCwd(),
          user: engine.getCurrentUser(),
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setInputVal('');
      setHistoryIndex(-1);
    } else if (e.key === 'l' && e.ctrlKey) {
      // Ctrl+L (clear)
      e.preventDefault();
      setHistory([]);
      setInputVal('');
    }
  };

  const handleTabCompletion = () => {
    const tokens = inputVal.trimStart().split(/\s+/);
    if (tokens.length === 1) {
      // Complete command
      const partial = tokens[0];
      const commands = [
        'ls', 'cd', 'pwd', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'cat', 'head', 'tail',
        'grep', 'wc', 'sort', 'uniq', 'cut', 'sed', 'awk', 'find', 'which', 'chmod',
        'chown', 'df', 'du', 'free', 'uname', 'uptime', 'whoami', 'id', 'ps', 'top',
        'kill', 'systemctl', 'journalctl', 'ip', 'ping', 'ss', 'curl', 'tar', 'gzip',
        'export', 'env', 'history', 'clear', 'help', 'man'
      ];
      const matches = commands.filter((c) => c.startsWith(partial));
      if (matches.length === 1) {
        setInputVal(matches[0] + ' ');
      }
    } else {
      // Complete filename in cwd
      const lastToken = tokens[tokens.length - 1];
      const items = engine.getVfs().listDirectory() || [];
      const matches = items
        .filter((item) => item.name.startsWith(lastToken))
        .map((item) => (item.type === 'dir' ? `${item.name}/` : item.name));

      if (matches.length === 1) {
        tokens[tokens.length - 1] = matches[0];
        setInputVal(tokens.join(' '));
      }
    }
  };

  const handleResetVfs = () => {
    if (window.confirm('Reset virtual filesystem to default state?')) {
      engine.getVfs().reset();
      setHistory([]);
      setInputVal('');
    }
  };

  const formatCwdDisplay = (path: string) => {
    if (path.startsWith('/home/student')) {
      return path.replace('/home/student', '~') || '~';
    }
    return path;
  };

  return (
    <div
      className={`flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-mono text-sm ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl border-emerald-500/40' : className
      }`}
      style={{ height: isFullscreen ? 'calc(100vh - 2rem)' : height }}
      onClick={handleTerminalClick}
    >
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800/80 select-none">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block hover:opacity-80 transition cursor-pointer" onClick={() => setHistory([])} title="Clear terminal"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block hover:opacity-80 transition cursor-pointer" onClick={handleResetVfs} title="Reset VFS"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block hover:opacity-80 transition cursor-pointer" onClick={() => setIsFullscreen(!isFullscreen)} title="Toggle fullscreen"></span>
          </div>
          <div className="flex items-center gap-2 ml-3 text-slate-300 font-sans text-xs font-medium">
            <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>{title}</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20">
              Live Sandbox
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onExploreVfs && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExploreVfs();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Inspect Virtual Filesystem Tree"
            >
              <FolderTree className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline font-sans">VFS Tree</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleResetVfs();
            }}
            className="p-1.5 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
            title="Reset Filesystem"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setHistory([]);
            }}
            className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
            title="Clear Buffer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(!isFullscreen);
            }}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Screen / Output Body */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs leading-relaxed"
      >
        {/* Welcome / Header Banner */}
        <div className="text-slate-500 select-none pb-2 border-b border-slate-900">
          <p className="text-emerald-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Linux Kernel 6.8.0-40-generic (Ubuntu 24.04 LTS x86_64)
          </p>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Full virtual POSIX environment active. Type <span className="text-emerald-300 font-bold">help</span> or <span className="text-emerald-300 font-bold">ls -la</span> to begin.
          </p>
          {initialPromptMessage && (
            <div className="mt-2 p-2 bg-emerald-950/40 border border-emerald-500/30 rounded text-emerald-200 text-xs">
              {initialPromptMessage}
            </div>
          )}
        </div>

        {/* History stream */}
        {history.map((entry, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-emerald-400 font-bold">student@linux-box</span>
              <span className="text-slate-500">:</span>
              <span className="text-cyan-400 font-medium">{formatCwdDisplay(entry.cwd)}</span>
              <span className="text-slate-400 font-bold">$</span>
              <span className="text-slate-100 font-semibold">{entry.command}</span>
            </div>

            {entry.stdout && (
              <pre className="text-slate-200 whitespace-pre-wrap pl-1 font-mono">{entry.stdout}</pre>
            )}

            {entry.stderr && (
              <pre className="text-red-400 whitespace-pre-wrap pl-1 font-mono font-medium">{entry.stderr}</pre>
            )}
          </div>
        ))}

        {/* Active Command Line Input */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-emerald-400 font-bold">student@linux-box</span>
          <span className="text-slate-500">:</span>
          <span className="text-cyan-400 font-medium">{formatCwdDisplay(engine.getCwd())}</span>
          <span className="text-slate-400 font-bold">$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-[200px] bg-transparent outline-none text-slate-100 font-mono caret-emerald-400 placeholder:text-slate-700"
            placeholder="Type command... (try 'ls -la' or 'cat welcome.txt')"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            autoFocus
          />
        </div>
      </div>

      {/* Terminal Footer Quick Bar */}
      <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 hidden sm:inline">Shortcuts:</span>
          <span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">Tab</span> Auto-complete
          <span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">↑ / ↓</span> History
          <span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">Ctrl+C</span> Cancel
        </div>
        <button
          onClick={() => executeCommand()}
          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition font-medium"
        >
          <span>Run</span>
          <CornerDownLeft className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
