import { CourseModule, LevelId } from '@/types/course';
import { LEVEL_1_MODULES } from './level1';
import { LEVEL_2_MODULES } from './level2';
import { LEVEL_3_MODULES } from './level3';
import { LEVEL_4_MODULES } from './level4';
import { LEVEL_5_MODULES } from './level5';

export const ALL_COURSE_MODULES: CourseModule[] = [
  ...LEVEL_1_MODULES,
  ...LEVEL_2_MODULES,
  ...LEVEL_3_MODULES,
  ...LEVEL_4_MODULES,
  ...LEVEL_5_MODULES,
];

export function getModulesByLevel(levelId: LevelId): CourseModule[] {
  return ALL_COURSE_MODULES.filter((m) => m.levelId === levelId);
}

export function getModuleById(id: string): CourseModule | undefined {
  return ALL_COURSE_MODULES.find((m) => m.id === id);
}

export function getModuleBySlug(slug: string): CourseModule | undefined {
  return ALL_COURSE_MODULES.find((m) => m.slug === slug);
}

export function getNextModule(currentId: string): CourseModule | undefined {
  const index = ALL_COURSE_MODULES.findIndex((m) => m.id === currentId);
  if (index !== -1 && index < ALL_COURSE_MODULES.length - 1) {
    return ALL_COURSE_MODULES[index + 1];
  }
  return undefined;
}

export function getPreviousModule(currentId: string): CourseModule | undefined {
  const index = ALL_COURSE_MODULES.findIndex((m) => m.id === currentId);
  if (index > 0) {
    return ALL_COURSE_MODULES[index - 1];
  }
  return undefined;
}
