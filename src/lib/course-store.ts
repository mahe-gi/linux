'use client';

import { UserProgress } from '@/types/course';

const STORAGE_KEY = 'linux_mastery_progress_v1';

const defaultProgress: UserProgress = {
  completedModules: ['mod-1'], // Start with first unlocked
  completedLabs: [],
  passedQuizzes: {},
  currentModuleId: 'mod-1',
  userName: 'Student Engineer',
};

export function getStoredProgress(): UserProgress {
  if (typeof window === 'undefined') return defaultProgress;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    return { ...defaultProgress, ...JSON.parse(raw) };
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress to localStorage', e);
  }
}

export function markModuleComplete(moduleId: string): UserProgress {
  const current = getStoredProgress();
  const set = new Set(current.completedModules);
  set.add(moduleId);
  const updated: UserProgress = {
    ...current,
    completedModules: Array.from(set),
  };
  saveProgress(updated);
  return updated;
}

export function markLabComplete(labId: string): UserProgress {
  const current = getStoredProgress();
  const set = new Set(current.completedLabs);
  set.add(labId);
  const updated: UserProgress = {
    ...current,
    completedLabs: Array.from(set),
  };
  saveProgress(updated);
  return updated;
}

export function saveQuizScore(moduleId: string, scorePercent: number): UserProgress {
  const current = getStoredProgress();
  const updated: UserProgress = {
    ...current,
    passedQuizzes: {
      ...current.passedQuizzes,
      [moduleId]: scorePercent,
    },
  };
  saveProgress(updated);
  return updated;
}

export function setStudentName(name: string): UserProgress {
  const current = getStoredProgress();
  const updated: UserProgress = {
    ...current,
    userName: name,
  };
  saveProgress(updated);
  return updated;
}

export function resetAllProgress(): UserProgress {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return defaultProgress;
}
