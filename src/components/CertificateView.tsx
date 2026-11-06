'use client';

import React, { useState } from 'react';
import { UserProgress } from '@/types/course';
import { ALL_COURSE_MODULES } from '@/data/modules';
import { setStudentName } from '@/lib/course-store';
import { Award, ShieldCheck, Printer, CheckCircle2, Terminal, Sparkles, UserCheck } from 'lucide-react';

interface CertificateViewProps {
  progress: UserProgress;
  onNameUpdated: (name: string) => void;
}

export function CertificateView({ progress, onNameUpdated }: CertificateViewProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(progress.userName || 'Student Engineer');

  const totalModules = ALL_COURSE_MODULES.length;
  const completedCount = progress.completedModules.length;
  const completionPercentage = Math.round((completedCount / totalModules) * 100);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setStudentName(nameInput.trim());
      onNameUpdated(nameInput.trim());
      setEditingName(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const [issueDate, setIssueDate] = useState('November 5, 2026');

  React.useEffect(() => {
    setIssueDate(
      new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Controls Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl flex-wrap gap-3 print:hidden">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Linux Engineering Certification</span>
          </h2>
          <p className="text-xs text-slate-400">
            Progress: {completedCount} of {totalModules} modules finished ({completionPercentage}%)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {editingName ? (
            <form onSubmit={handleSaveName} className="flex items-center gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                placeholder="Enter your full name"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium"
              >
                Save
              </button>
            </form>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Change Name: {progress.userName}</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-lg shadow-emerald-900/30"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Certificate Frame */}
      <div className="relative bg-slate-950 border-4 border-double border-emerald-500/40 rounded-2xl p-10 md:p-14 text-center shadow-2xl space-y-8 overflow-hidden print:border-black print:text-black print:bg-white print:p-8">
        {/* Background Watermark Accent */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
          <Terminal className="w-96 h-96 text-emerald-400" />
        </div>

        {/* Certificate Header */}
        <div className="space-y-2 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto mb-2">
            <Award className="w-8 h-8" />
          </div>
          <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-bold block">
            CERTIFICATE OF ACHIEVEMENT
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100 font-sans print:text-black">
            Linux Systems & SRE Specialist
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            VERIFIED COMPLETION • LINUX ARCHITECTURE, SHELL MASTERY & PRODUCTION DEVOPS
          </p>
        </div>

        {/* Recipient */}
        <div className="space-y-2 relative">
          <p className="text-xs uppercase tracking-wider text-slate-400">This certifies that</p>
          <div className="text-2xl md:text-3xl font-serif italic font-bold text-cyan-300 print:text-black border-b border-slate-800 pb-2 max-w-md mx-auto">
            {progress.userName || 'Student Engineer'}
          </div>
          <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed pt-2">
            has demonstrated mastery in Linux kernel architecture, the Filesystem Hierarchy Standard,
            advanced pipeline redirection, octal permissions, process orchestration with systemd,
            text wrangling with grep/sed/awk, networking socket diagnostics, defensive Bash scripting,
            and real-world production incident triage.
          </p>
        </div>

        {/* Milestone Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto pt-4 relative text-xs">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 print:border-gray-300">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Curriculum</span>
            <span className="font-bold text-slate-200 print:text-black">25 Modules</span>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 print:border-gray-300">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hands-on Labs</span>
            <span className="font-bold text-emerald-400 print:text-black">{progress.completedLabs.length} Passed</span>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 print:border-gray-300">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Verified Sandbox</span>
            <span className="font-bold text-cyan-400 print:text-black">POSIX Engine</span>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 print:border-gray-300">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status</span>
            <span className="font-bold text-amber-400 print:text-black">Certified</span>
          </div>
        </div>

        {/* Signatures & Verification Stamp */}
        <div className="flex items-end justify-between pt-8 border-t border-slate-800/80 text-xs text-slate-400 relative flex-wrap gap-4 print:border-gray-300">
          <div className="text-left space-y-1">
            <span className="font-mono text-slate-200 block font-semibold print:text-black">William Knottenbelt & LinuxMastery Board</span>
            <span className="text-[10px] text-slate-500">Department of Computing • Systems Group</span>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="text-left font-mono text-[10px] space-y-0.5">
              <span className="text-slate-300 block font-semibold">ID: LNX-{(Math.abs(progress.userName.length * 1337 + 421)).toString(16).toUpperCase()}-2026</span>
              <span className="text-slate-500">Issued on {issueDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
