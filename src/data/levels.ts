import { LevelInfo } from '@/types/course';

export const COURSE_LEVELS: LevelInfo[] = [
  {
    id: 'level-1',
    levelNumber: 1,
    title: 'Absolute Beginner',
    subtitle: 'Foundations & Core Shell Navigation',
    description:
      'Demystify the Unix philosophy, master the command line syntax, understand the Filesystem Hierarchy Standard, and navigate directories with total confidence.',
    iconName: 'Terminal',
    badge: 'Novice SysAdmin',
    estimatedHours: '3-4 hrs',
    color: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      accent: '#10b981',
    },
  },
  {
    id: 'level-2',
    levelNumber: 2,
    title: 'Intermediate',
    subtitle: 'Streams, Permissions & Processes',
    description:
      'Harness standard I/O redirection and pipelines, demystify Linux octal and symbolic permissions, manipulate running processes, and configure shell profiles.',
    iconName: 'Cpu',
    badge: 'Shell Practitioner',
    estimatedHours: '4-5 hrs',
    color: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      accent: '#06b6d4',
    },
  },
  {
    id: 'level-3',
    levelNumber: 3,
    title: 'Power User',
    subtitle: 'Search, Regex & Text Processing',
    description:
      'Master the holy trinity of Linux data wrangling: grep, sed, and awk. Navigate complex directory trees with find and automate data transformations.',
    iconName: 'Zap',
    badge: 'Command-Line Ninja',
    estimatedHours: '5-6 hrs',
    color: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      accent: '#3b82f6',
    },
  },
  {
    id: 'level-4',
    levelNumber: 4,
    title: 'SysAdmin Specialist',
    subtitle: 'Storage, Systemd & Networking',
    description:
      'Inspect block devices, mount filesystems, orchestrate services with systemd, inspect logs with journalctl, and diagnose complex network socket issues.',
    iconName: 'Server',
    badge: 'Certified SysAdmin',
    estimatedHours: '6-7 hrs',
    color: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      accent: '#a855f7',
    },
  },
  {
    id: 'level-5',
    levelNumber: 5,
    title: 'DevOps & SRE Pro',
    subtitle: 'Automation, Hardening & War Rooms',
    description:
      'Write robust defensive bash scripts, manage automated cron jobs, diagnose real-world production outages, and harden servers for enterprise security.',
    iconName: 'ShieldCheck',
    badge: 'Linux SRE Specialist',
    estimatedHours: '7-8 hrs',
    color: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      accent: '#f59e0b',
    },
  },
];
