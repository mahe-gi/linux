'use client';

import React, { useState } from 'react';
import { LabConfig } from '@/types/course';
import { TerminalEngine } from '@/lib/terminal-engine';
import { markLabComplete } from '@/lib/course-store';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, Play, HelpCircle, Eye, EyeOff, Award, ArrowRight, ShieldCheck, TerminalSquare } from 'lucide-react';

interface LabVerifierProps {
  lab: LabConfig;
  engine: TerminalEngine;
  onSuccess?: () => void;
  onRunSnippet?: (cmd: string) => void;
}

export function LabVerifier({ lab, engine, onSuccess, onRunSnippet }: LabVerifierProps) {
  const [verificationResult, setVerificationResult] = useState<{
    tested: boolean;
    passed: boolean;
    failures: string[];
  }>({
    tested: false,
    passed: false,
    failures: [],
  });

  const [activeHintIndex, setActiveHintIndex] = useState<number | null>(null);
  const [showSolutions, setShowSolutions] = useState(false);

  const runVerification = () => {
    const vfs = engine.getVfs();
    const failures: string[] = [];
    const history = engine.getHistory();

    for (const rule of lab.verificationRules) {
      if (rule.checkType === 'file_exists' && rule.targetPath) {
        if (!vfs.fileExists(rule.targetPath)) {
          failures.push(rule.failureMessage);
        }
      } else if (rule.checkType === 'dir_exists' && rule.targetPath) {
        if (!vfs.dirExists(rule.targetPath)) {
          failures.push(rule.failureMessage);
        }
      } else if (rule.checkType === 'file_not_exists' && rule.targetPath) {
        if (vfs.exists(rule.targetPath)) {
          failures.push(rule.failureMessage);
        }
      } else if (rule.checkType === 'file_content_contains' && rule.targetPath) {
        const content = vfs.readFile(rule.targetPath);
        if (content === null || !content.includes(String(rule.expectedValue || ''))) {
          failures.push(rule.failureMessage);
        }
      } else if (rule.checkType === 'file_mode_equals' && rule.targetPath) {
        const node = vfs.getNode(vfs.resolvePath(rule.targetPath));
        if (!node || node.mode !== Number(rule.expectedValue)) {
          failures.push(rule.failureMessage);
        }
      } else if (rule.checkType === 'command_executed_match' && rule.expectedValue) {
        const match = history.some((h) => h.includes(String(rule.expectedValue)));
        if (!match) {
          failures.push(rule.failureMessage);
        }
      }
    }

    const passed = failures.length === 0;

    setVerificationResult({
      tested: true,
      passed,
      failures,
    });

    if (passed) {
      // Trigger confetti celebration!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b'],
        });
      } catch {
        // Fallback gracefully if confetti fails
      }

      markLabComplete(lab.id);
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-6">
      {/* Header & Scenario Context */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-100">{lab.title}</h3>
              <p className="text-xs text-slate-400">Automated Live Sandbox Challenge</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSolutions(!showSolutions)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
            >
              {showSolutions ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{showSolutions ? 'Hide Solutions' : 'Reveal Solutions'}</span>
            </button>
          </div>
        </div>

        {/* Real World Scenario Box */}
        <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs leading-relaxed text-slate-300">
          <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px] block mb-1">
            Production Context:
          </span>
          {lab.scenario}
        </div>
      </div>

      {/* Lab Tasks List */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Lab Instructions & Tasks:
        </h4>

        {lab.tasks.map((task, idx) => (
          <div
            key={task.id}
            className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-lg space-y-2.5 transition hover:border-slate-700"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs font-medium text-slate-200 leading-normal">{task.instruction}</p>
              </div>

              {onRunSnippet && (
                <button
                  onClick={() => onRunSnippet(task.solutionCommand)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium transition shrink-0"
                  title="Insert into Terminal"
                >
                  <Play className="w-3 h-3 fill-emerald-400" />
                  <span className="hidden sm:inline">Try in Sandbox</span>
                </button>
              )}
            </div>

            {/* Hint & Solution Area */}
            <div className="flex items-center gap-3 pt-1 text-[11px]">
              <button
                onClick={() => setActiveHintIndex(activeHintIndex === idx ? null : idx)}
                className="text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 font-medium"
              >
                <HelpCircle className="w-3 h-3" />
                <span>{activeHintIndex === idx ? 'Hide Hint' : 'Show Hint'}</span>
              </button>

              {showSolutions && (
                <div className="flex items-center gap-1.5 font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">
                  <TerminalSquare className="w-3 h-3" />
                  <span>{task.solutionCommand}</span>
                </div>
              )}
            </div>

            {activeHintIndex === idx && (
              <div className="p-2.5 bg-cyan-950/20 border border-cyan-500/20 rounded text-xs text-cyan-200">
                💡 <span className="font-semibold">Hint:</span> {task.hint}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Verification Feedback Banner */}
      {verificationResult.tested && (
        <div
          className={`p-4 rounded-xl border ${
            verificationResult.passed
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/40 border-red-500/40 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {verificationResult.passed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <h5 className="font-bold text-sm">
              {verificationResult.passed
                ? 'Lab Verification Passed! Outstanding Work.'
                : 'Lab Verification Needs Attention:'}
            </h5>
          </div>

          {verificationResult.passed ? (
            <p className="text-xs text-emerald-300 mt-1 pl-7">
              All filesystem checks and command executions matched the expected state. Your lab completion badge is recorded.
            </p>
          ) : (
            <ul className="text-xs space-y-1 mt-2 pl-7 list-disc">
              {verificationResult.failures.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Verification Trigger Button */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-400">
          Ready to test? Execute your commands in the sandbox terminal below, then verify.
        </p>
        <button
          onClick={runVerification}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition shadow-lg shadow-emerald-900/30 font-sans cursor-pointer"
        >
          <Award className="w-4 h-4" />
          <span>Verify Lab Solution</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
