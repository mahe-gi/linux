'use client';

import React, { useState } from 'react';
import { CourseModule } from '@/types/course';
import { TerminalEngine } from '@/lib/terminal-engine';
import { Terminal } from './Terminal';
import { LabVerifier } from './LabVerifier';
import { QuizCard } from './QuizCard';
import { getNextModule, getPreviousModule } from '@/data/modules';
import { markModuleComplete } from '@/lib/course-store';
import {
  BookOpen,
  Terminal as TerminalIcon,
  HelpCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lightbulb,
  Building,
  Copy,
  Check,
  Maximize2,
  Play
} from 'lucide-react';

interface ModuleViewProps {
  module: CourseModule;
  engine: TerminalEngine;
  onSelectModule: (mod: CourseModule) => void;
  onBackToRoadmap: () => void;
  onExploreVfs: () => void;
  isCompleted: boolean;
  onModuleCompleted: () => void;
}

export function ModuleView({
  module,
  engine,
  onSelectModule,
  onBackToRoadmap,
  onExploreVfs,
  isCompleted,
  onModuleCompleted,
}: ModuleViewProps) {
  const [activeTab, setActiveTab] = useState<'theory' | 'lab' | 'quiz' | 'cheatsheet'>('theory');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [showTerminalDrawer, setShowTerminalDrawer] = useState(true);

  const prevMod = getPreviousModule(module.id);
  const nextMod = getNextModule(module.id);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleRunInTerminal = (cmd: string) => {
    engine.execute(cmd);
    // Force re-render if needed
  };

  const markComplete = () => {
    markModuleComplete(module.id);
    onModuleCompleted();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button
              onClick={onBackToRoadmap}
              className="hover:text-emerald-400 transition flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Roadmap</span>
            </button>
            <span>/</span>
            <span className="capitalize">{module.levelId.replace('-', ' ')}</span>
            <span>/</span>
            <span className="text-slate-200 font-semibold font-mono">Module {module.moduleNumber}</span>
          </div>

          <h1 className="text-xl md:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <span>{module.title}</span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
              </span>
            )}
          </h1>
        </div>

        {/* Prev / Next Controls */}
        <div className="flex items-center gap-2">
          {prevMod && (
            <button
              onClick={() => onSelectModule(prevMod)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 transition"
              title={prevMod.title}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>
          )}

          {!isCompleted && (
            <button
              onClick={markComplete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium hover:bg-emerald-600/30 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Complete</span>
            </button>
          )}

          {nextMod && (
            <button
              onClick={() => onSelectModule(nextMod)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 transition"
              title={nextMod.title}
            >
              <span className="hidden sm:inline">Next Module</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab('theory')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'theory'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>1. Theory & Deep-Dive</span>
        </button>

        <button
          onClick={() => setActiveTab('lab')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'lab'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TerminalIcon className="w-4 h-4" />
          <span>2. Hands-on Lab Challenge</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'quiz'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>3. Knowledge Check Quiz</span>
        </button>

        <button
          onClick={() => setActiveTab('cheatsheet')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'cheatsheet'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>4. Cheat Sheet & Flags</span>
        </button>
      </div>

      {/* Tab 1: Detailed Theory Content */}
      {activeTab === 'theory' && (
        <div className="space-y-8 max-w-4xl">
          {/* Overview Section */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-emerald-400">
              Module Overview
            </span>
            <p className="text-sm md:text-base text-slate-200 leading-relaxed">
              {module.theory.overview}
            </p>

            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <span className="text-xs text-slate-400 font-mono">Core Commands:</span>
              {module.coreCommands.map((c) => (
                <span
                  key={c}
                  className="font-mono text-xs px-2 py-0.5 bg-slate-950 rounded text-emerald-400 border border-slate-800"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Key Concepts Deep-Dive */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <span>Core Architectural Concepts</span>
            </h3>

            {module.theory.keyConcepts.map((kc, idx) => (
              <div
                key={idx}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4"
              >
                <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <span>{kc.title}</span>
                </h4>

                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {kc.content}
                </div>

                {kc.diagramAscii && (
                  <div className="mt-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Mental Model & Architecture Diagram:
                    </span>
                    <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed shadow-inner">
                      {kc.diagramAscii}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Real World Production Scenario */}
          {module.theory.realWorldScenario && (
            <div className="bg-gradient-to-r from-blue-950/30 to-slate-900 border border-blue-500/30 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-blue-400">
                <Building className="w-5 h-5" />
                <h4 className="text-base font-bold">
                  Real-World Scenario: {module.theory.realWorldScenario.title}
                </h4>
              </div>
              <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <p>
                  <strong className="text-slate-100">The Problem:</strong>{' '}
                  {module.theory.realWorldScenario.situation}
                </p>
                <p>
                  <strong className="text-emerald-400">How Linux Engineering Solves It:</strong>{' '}
                  {module.theory.realWorldScenario.howLinuxHelps}
                </p>
              </div>
            </div>
          )}

          {/* Best Practices vs Pitfalls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Best Practices */}
            <div className="bg-slate-900/50 border border-emerald-500/20 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Production SRE Best Practices</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 list-disc pl-5 leading-relaxed">
                {module.theory.productionBestPractices.map((bp, i) => (
                  <li key={i}>{bp}</li>
                ))}
              </ul>
            </div>

            {/* Common Pitfalls */}
            <div className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Common Gotchas & Pitfalls to Avoid</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 list-disc pl-5 leading-relaxed">
                {module.theory.commonPitfalls.map((pf, i) => (
                  <li key={i}>{pf}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Jump to Lab Banner */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between flex-wrap gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-100">Ready to put theory into practice?</h4>
              <p className="text-xs text-slate-400">
                Switch to the hands-on lab sandbox to practice these commands with automated verification.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('lab')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/30"
            >
              <span>Launch Module Lab</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Hands-on Lab Sandbox */}
      {activeTab === 'lab' && (
        <div className="space-y-6">
          <LabVerifier
            lab={module.lab}
            engine={engine}
            onSuccess={() => {
              markComplete();
            }}
            onRunSnippet={(cmd) => {
              handleRunInTerminal(cmd);
            }}
          />

          {/* Integrated Interactive Sandbox Terminal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <TerminalIcon className="w-4 h-4 text-emerald-400" />
                <span>Live Virtual Sandbox Terminal</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">Run commands to solve the lab above</span>
            </div>

            <Terminal
              engine={engine}
              height="380px"
              title={`${module.title} Lab Sandbox`}
              onExploreVfs={onExploreVfs}
            />
          </div>
        </div>
      )}

      {/* Tab 3: Knowledge Check Quiz */}
      {activeTab === 'quiz' && (
        <div className="max-w-3xl">
          <QuizCard
            moduleId={module.id}
            questions={module.quiz}
            onQuizComplete={(score) => {
              if (score >= 80) markComplete();
            }}
          />
        </div>
      )}

      {/* Tab 4: Cheat Sheet */}
      {activeTab === 'cheatsheet' && (
        <div className="space-y-4 max-w-4xl">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-emerald-400" />
              <span>Command Quick Reference: {module.title}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Direct copyable syntax and battle-tested flags for everyday operations
            </p>
          </div>

          <div className="space-y-4">
            {module.cheatSheet.map((cmd) => (
              <div
                key={cmd.name}
                className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400 text-sm bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                      {cmd.name}
                    </span>
                    <span className="text-xs text-slate-300">{cmd.description}</span>
                  </div>

                  <button
                    onClick={() => handleCopy(cmd.syntax)}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                    title="Copy Syntax"
                  >
                    {copiedCmd === cmd.syntax ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300">
                  {cmd.syntax}
                </pre>

                {/* Flags table */}
                {cmd.commonFlags.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Common Flags:
                    </span>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      {cmd.commonFlags.map((f, i) => (
                        <div key={i} className="flex items-baseline gap-2">
                          <code className="font-mono text-emerald-300 font-bold shrink-0">{f.flag}</code>
                          <span className="text-slate-400 text-[11px]">{f.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Real world usage */}
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Real World Example:
                  </span>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-950 font-mono text-xs text-emerald-300 border border-slate-800">
                    <code>{cmd.realWorldExample}</code>
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
      )}
    </div>
  );
}
