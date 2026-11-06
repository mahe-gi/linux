'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { VirtualFileSystem } from '@/lib/vfs';
import { TerminalEngine } from '@/lib/terminal-engine';
import { CourseModule, UserProgress } from '@/types/course';
import { ALL_COURSE_MODULES, getModuleById } from '@/data/modules';
import { getStoredProgress, setStudentName } from '@/lib/course-store';
import { Navbar } from '@/components/Navbar';
import { RoadmapView } from '@/components/RoadmapView';
import { ModuleView } from '@/components/ModuleView';
import { Terminal } from '@/components/Terminal';
import { LexiconView } from '@/components/LexiconView';
import { CertificateView } from '@/components/CertificateView';
import { VfsExplorerModal } from '@/components/VfsExplorerModal';
import {
  Terminal as TerminalIcon,
  HardDrive,
  BookOpen,
  Award,
  Zap,
  FolderTree,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function Home() {
  // Initialize VFS and Terminal Engine once on client
  const vfs = useMemo(() => new VirtualFileSystem(), []);
  const engine = useMemo(() => new TerminalEngine(vfs), [vfs]);

  const [progress, setProgress] = useState<UserProgress>({
    completedModules: ['mod-1'],
    completedLabs: [],
    passedQuizzes: {},
    currentModuleId: 'mod-1',
    userName: 'Student Engineer',
  });

  const [currentTab, setCurrentTab] = useState<'roadmap' | 'module' | 'sandbox' | 'lexicon' | 'certificate'>('roadmap');
  const [selectedModule, setSelectedModule] = useState<CourseModule>(ALL_COURSE_MODULES[0]);
  const [isVfsModalOpen, setIsVfsModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Sync progress from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    const stored = getStoredProgress();
    setProgress(stored);
    if (stored.currentModuleId) {
      const mod = getModuleById(stored.currentModuleId);
      if (mod) setSelectedModule(mod);
    }
  }, []);

  const handleSelectModule = (mod: CourseModule) => {
    setSelectedModule(mod);
    setCurrentTab('module');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModuleCompleted = () => {
    const updated = getStoredProgress();
    setProgress(updated);
  };

  const handleRunCommandInSandbox = (cmd: string) => {
    setCurrentTab('sandbox');
    engine.execute(cmd);
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-sm">
        <div className="flex items-center gap-3">
          <TerminalIcon className="w-5 h-5 text-emerald-400 animate-pulse" />
          <span>Booting Linux POSIX Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Global Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        progress={progress}
        onOpenVfsModal={() => setIsVfsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'roadmap' && (
          <RoadmapView
            progress={progress}
            onSelectModule={handleSelectModule}
            onOpenSandbox={() => setCurrentTab('sandbox')}
          />
        )}

        {currentTab === 'module' && (
          <ModuleView
            module={selectedModule}
            engine={engine}
            onSelectModule={handleSelectModule}
            onBackToRoadmap={() => setCurrentTab('roadmap')}
            onExploreVfs={() => setIsVfsModalOpen(true)}
            isCompleted={progress.completedModules.includes(selectedModule.id)}
            onModuleCompleted={handleModuleCompleted}
          />
        )}

        {currentTab === 'sandbox' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <TerminalIcon className="w-6 h-6" />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Standalone Linux Sandbox Terminal</h2>
                  <p className="text-xs text-slate-400">
                    Full in-memory POSIX environment with persistent virtual filesystem, pipelines, redirection, and real utilities
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsVfsModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 transition"
                >
                  <FolderTree className="w-4 h-4" />
                  <span>Inspect VFS Tree</span>
                </button>
              </div>
            </div>

            {/* Terminal Window */}
            <Terminal
              engine={engine}
              height="550px"
              title="Linux Engineering Sandbox (student@linux-box)"
              onExploreVfs={() => setIsVfsModalOpen(true)}
            />

            {/* Quick Suggestions Bar */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Quick Command Recipes to Try:
              </span>
              <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                {[
                  'cat /etc/os-release',
                  'ps aux | grep nginx',
                  'df -h',
                  'free -m',
                  'cat /var/log/nginx/access.log | wc -l',
                  'cat /etc/passwd | cut -d: -f1,7',
                  'cat welcome.txt',
                  'ip addr',
                  'ss -tulnp',
                  'uptime',
                ].map((recipe) => (
                  <button
                    key={recipe}
                    onClick={() => engine.execute(recipe)}
                    className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition cursor-pointer"
                  >
                    {recipe}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'lexicon' && (
          <LexiconView onRunSnippet={handleRunCommandInSandbox} />
        )}

        {currentTab === 'certificate' && (
          <CertificateView
            progress={progress}
            onNameUpdated={(newName) => {
              setProgress((prev) => ({ ...prev, userName: newName }));
            }}
          />
        )}
      </main>

      {/* VFS Tree Explorer Modal */}
      <VfsExplorerModal
        vfs={vfs}
        isOpen={isVfsModalOpen}
        onClose={() => setIsVfsModalOpen(false)}
        onSelectPath={(cmd) => {
          engine.execute(cmd);
          setIsVfsModalOpen(false);
          setCurrentTab('sandbox');
        }}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <p className="font-semibold text-slate-300">
              LinuxMastery LMS • Department of Computing Inspired Curriculum
            </p>
            <p className="text-[11px] text-slate-600">
              Complete interactive Linux operating system engineering course with in-browser POSIX terminal. Zero server tracking or sign-up.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-emerald-400">● 25 Modules</span>
            <span className="text-cyan-400">● 5 Levels</span>
            <span className="text-amber-400">● Live Sandbox</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
