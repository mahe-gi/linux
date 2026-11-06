'use client';

import React from 'react';
import { COURSE_LEVELS } from '@/data/levels';
import { ALL_COURSE_MODULES, getModulesByLevel } from '@/data/modules';
import { UserProgress, CourseModule } from '@/types/course';
import { CheckCircle2, Circle, ArrowRight, Clock, Award, Terminal, Zap, Shield, Cpu, Server, BookOpen } from 'lucide-react';

interface RoadmapViewProps {
  progress: UserProgress;
  onSelectModule: (module: CourseModule) => void;
  onOpenSandbox: () => void;
}

export function RoadmapView({ progress, onSelectModule, onOpenSandbox }: RoadmapViewProps) {
  const totalModules = ALL_COURSE_MODULES.length;
  const completedCount = progress.completedModules.length;
  const progressPct = Math.round((completedCount / totalModules) * 100);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Terminal': return <Terminal className="w-5 h-5" />;
      case 'Cpu': return <Cpu className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'Server': return <Server className="w-5 h-5" />;
      case 'ShieldCheck': return <Shield className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero LMS Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Terminal className="w-3.5 h-3.5" />
            <span>Interactive Hands-On Linux LMS Platform</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Master Linux from Absolute Basics to Production SRE Specialist
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Zero sign-up required. Step-by-step interactive theory, battle-tested terminal commands,
            and real-time in-browser sandbox labs with automated grading for every single module.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              onClick={() => onSelectModule(ALL_COURSE_MODULES[0])}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-900/40 flex items-center gap-2 cursor-pointer"
            >
              <span>Start Course (Module 1)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSandbox}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Open Free Sandbox Terminal</span>
            </button>
          </div>
        </div>

        {/* Global Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-800/80 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Progress</span>
            <span className="text-base font-bold text-emerald-400">{completedCount} / {totalModules} Modules ({progressPct}%)</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Hands-on Labs</span>
            <span className="text-base font-bold text-cyan-400">{progress.completedLabs.length} Labs Passed</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Curriculum Levels</span>
            <span className="text-base font-bold text-purple-400">5 Progression Tiers</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Terminal Engine</span>
            <span className="text-base font-bold text-amber-400">POSIX in Browser</span>
          </div>
        </div>
      </div>

      {/* Levels and Modules Roadmap */}
      <div className="space-y-10">
        {COURSE_LEVELS.map((level) => {
          const modules = getModulesByLevel(level.id);
          const levelCompletedCount = modules.filter((m) =>
            progress.completedModules.includes(m.id)
          ).length;

          return (
            <div key={level.id} className="space-y-4">
              {/* Level Header Card */}
              <div
                className={`p-6 rounded-2xl border transition ${level.color.bg} ${level.color.border}`}
              >
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl border ${level.color.border} ${level.color.text} bg-slate-950/80`}
                    >
                      {getIcon(level.iconName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${level.color.border} ${level.color.text}`}
                        >
                          Level {level.levelNumber}
                        </span>
                        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {level.estimatedHours}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800/80 rounded text-slate-300">
                          {level.badge}
                        </span>
                      </div>

                      <h2 className="text-xl md:text-2xl font-bold text-slate-100 mt-1">
                        {level.title}: {level.subtitle}
                      </h2>
                      <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                        {level.description}
                      </p>
                    </div>
                  </div>

                  {/* Level Progress */}
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-mono">
                      Completed: {levelCompletedCount} / {modules.length}
                    </span>
                    <div className="w-32 h-2 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${(levelCompletedCount / modules.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-2 md:pl-4 border-l-2 border-slate-800">
                {modules.map((mod) => {
                  const isCompleted = progress.completedModules.includes(mod.id);
                  const isLabPassed = progress.completedLabs.includes(mod.lab.id);
                  const quizScore = progress.passedQuizzes[mod.id];

                  return (
                    <div
                      key={mod.id}
                      onClick={() => onSelectModule(mod)}
                      className={`group p-5 bg-slate-900/60 border rounded-xl space-y-3 cursor-pointer transition hover:scale-[1.01] hover:bg-slate-900/90 ${
                        isCompleted
                          ? 'border-emerald-500/30 hover:border-emerald-500/50'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          Module {mod.moduleNumber}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition" />
                          )}
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition line-clamp-1">
                        {mod.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {mod.shortDescription}
                      </p>

                      {/* Commands tags */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {mod.coreCommands.slice(0, 4).map((c) => (
                          <span
                            key={c}
                            className="font-mono text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-cyan-300 border border-slate-800"
                          >
                            {c}
                          </span>
                        ))}
                      </div>

                      {/* Footer indicators */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {mod.durationMinutes}m
                        </span>

                        <div className="flex items-center gap-2">
                          {isLabPassed && (
                            <span className="text-[10px] text-emerald-400 font-semibold">
                              Lab Done
                            </span>
                          )}
                          {quizScore !== undefined && (
                            <span className="text-[10px] text-cyan-400 font-semibold">
                              Quiz {quizScore}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
