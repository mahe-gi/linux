export type LevelId = 'level-1' | 'level-2' | 'level-3' | 'level-4' | 'level-5';

export interface LevelInfo {
  id: LevelId;
  levelNumber: number;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  badge: string;
  estimatedHours: string;
  color: {
    bg: string;
    border: string;
    text: string;
    accent: string;
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LabTask {
  id: string;
  instruction: string;
  hint: string;
  solutionCommand: string;
}

export interface LabVerificationContext {
  cwd: string;
  env: Record<string, string>;
  fileExists: (path: string) => boolean;
  dirExists: (path: string) => boolean;
  getFileContent: (path: string) => string | null;
  getFileMode: (path: string) => number | null;
  getFileOwner: (path: string) => string | null;
  lastCommand: string;
  commandHistory: string[];
}

export interface LabConfig {
  id: string;
  title: string;
  scenario: string;
  objective: string;
  initialFiles?: Array<{
    path: string;
    content: string;
    mode?: number;
    owner?: string;
  }>;
  tasks: LabTask[];
  // Function representation for verification: test rules serialized or executed
  verificationRules: Array<{
    id: string;
    description: string;
    checkType:
      | 'file_exists'
      | 'dir_exists'
      | 'file_content_contains'
      | 'file_mode_equals'
      | 'file_not_exists'
      | 'command_executed_match'
      | 'file_owner_equals';
    targetPath?: string;
    expectedValue?: string | number;
    failureMessage: string;
  }>;
}

export interface CommandRef {
  name: string;
  syntax: string;
  description: string;
  commonFlags: Array<{ flag: string; description: string; example?: string }>;
  realWorldExample: string;
  category: 'file-ops' | 'text-processing' | 'system' | 'networking' | 'security' | 'devops';
}

export interface CourseModule {
  id: string;
  slug: string;
  levelId: LevelId;
  moduleNumber: number;
  title: string;
  shortDescription: string;
  durationMinutes: number;
  prerequisites?: string[];
  coreCommands: string[];
  
  // Section 1: Detailed Theory & Deep-Dive
  theory: {
    overview: string;
    keyConcepts: Array<{
      title: string;
      content: string;
      diagramAscii?: string;
      codeExample?: {
        command: string;
        output: string;
        explanation: string;
      };
    }>;
    productionBestPractices: string[];
    commonPitfalls: string[];
    realWorldScenario: {
      title: string;
      situation: string;
      howLinuxHelps: string;
    };
  };

  // Section 2: Interactive Hands-On Lab
  lab: LabConfig;

  // Section 3: Knowledge Check Quiz
  quiz: QuizQuestion[];

  // Section 4: Cheat Sheet / Command Quick Reference
  cheatSheet: CommandRef[];
}

export interface UserProgress {
  completedModules: string[]; // module ids
  completedLabs: string[];    // lab ids
  passedQuizzes: Record<string, number>; // moduleId -> score %
  currentModuleId: string;
  userName: string;
  completedAt?: string;
}
