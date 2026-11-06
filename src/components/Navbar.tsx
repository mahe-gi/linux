'use client';

import React from 'react';
import { UserProgress } from '@/types/course';
import { ALL_COURSE_MODULES } from '@/data/modules';
import { Terminal, Map, BookOpen, Award, HardDrive, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentTab: 'roadmap' | 'module' | 'sandbox' | 'lexicon' | 'certificate';
  onSelectTab: (tab: 'roadmap' | 'sandbox' | 'lexicon' | 'certificate') => void;
  progress: UserProgress;
  onOpenVfsModal: () => void;
}

export function Navbar({ currentTab, onSelectTab, progress, onOpenVfsModal }: NavbarProps) {
  const total = ALL_COURSE_MODULES.length;
  const completed = progress.completedModules.length;
  const percentage = Math.round((completed / total) * 100);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div
          onClick={() => onSelectTab('roadmap')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:bg-emerald-500/20 transition shadow-lg shadow-emerald-950/50">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm md:text-base tracking-tight font-sans">
                LinuxMastery
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold hidden sm:inline">
                LMS v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden md:block">
              Interactive Systems & SRE Engineering
            </p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('roadmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              currentTab === 'roadmap' || currentTab === 'module'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Curriculum</span>
          </button>

          <button
            onClick={() => onSelectTab('sandbox')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              currentTab === 'sandbox'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Sandbox</span>
          </button>

          <button
            onClick={() => onSelectTab('lexicon')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              currentTab === 'lexicon'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Command</span> Lexicon
          </button>

          <button
            onClick={() => onSelectTab('certificate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              currentTab === 'certificate'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Certificate</span>
          </button>
        </nav>

        {/* Right Info: VFS button & Progress */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenVfsModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 text-xs border border-slate-800 transition font-mono"
            title="Inspect Virtual Filesystem Tree"
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">VFS Tree</span>
          </button>

          {/* Progress pill */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-mono block">
                {completed}/{total} Done
              </span>
              <span className="text-xs font-bold text-emerald-400">{percentage}%</span>
            </div>
            <div className="w-12 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
