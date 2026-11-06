import { VirtualFileSystem, VFSNode } from './vfs';

export interface CommandOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface ProcessItem {
  pid: number;
  user: string;
  cpu: number;
  mem: number;
  vsz: number;
  rss: number;
  tty: string;
  stat: string;
  start: string;
  time: string;
  command: string;
}

export class TerminalEngine {
  private vfs: VirtualFileSystem;
  private env: Record<string, string>;
  private history: string[] = [];
  private previousDir: string = '/home/student';
  private currentUser: string = 'student';
  private processes: ProcessItem[] = [
    { pid: 1, user: 'root', cpu: 0.0, mem: 0.1, vsz: 168440, rss: 12420, tty: '?', stat: 'Ss', start: '10:00', time: '0:03', command: '/sbin/init' },
    { pid: 284, user: 'root', cpu: 0.0, mem: 0.1, vsz: 72100, rss: 6240, tty: '?', stat: 'Ss', start: '10:00', time: '0:00', command: '/lib/systemd/systemd-journald' },
    { pid: 312, user: 'root', cpu: 0.0, mem: 0.0, vsz: 34100, rss: 3100, tty: '?', stat: 'Ss', start: '10:00', time: '0:00', command: '/lib/systemd/systemd-udevd' },
    { pid: 489, user: 'root', cpu: 0.1, mem: 0.2, vsz: 112400, rss: 9800, tty: '?', stat: 'Ssl', start: '10:01', time: '0:01', command: '/usr/sbin/rsyslogd -n' },
    { pid: 512, user: 'root', cpu: 0.0, mem: 0.1, vsz: 15400, rss: 5200, tty: '?', stat: 'Ss', start: '10:01', time: '0:00', command: 'cron -f' },
    { pid: 840, user: 'root', cpu: 0.0, mem: 0.2, vsz: 12450, rss: 7100, tty: '?', stat: 'Ss', start: '10:02', time: '0:00', command: 'sshd: /usr/sbin/sshd -D [listener]' },
    { pid: 1205, user: 'www-data', cpu: 0.2, mem: 0.5, vsz: 182400, rss: 24100, tty: '?', stat: 'S', start: '10:05', time: '0:04', command: 'nginx: worker process' },
    { pid: 1840, user: 'student', cpu: 0.0, mem: 0.1, vsz: 22400, rss: 5800, tty: 'pts/0', stat: 'Ss', start: '10:15', time: '0:01', command: '-bash' },
    { pid: 2104, user: 'student', cpu: 0.5, mem: 1.2, vsz: 320400, rss: 48900, tty: 'pts/0', stat: 'S', start: '10:16', time: '0:02', command: 'python3 /home/student/projects/server.py' },
  ];

  constructor(vfs: VirtualFileSystem) {
    this.vfs = vfs;
    this.env = {
      USER: 'student',
      HOME: '/home/student',
      SHELL: '/bin/bash',
      PATH: '/home/student/bin:/home/student/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
      TERM: 'xterm-256color',
      LANG: 'en_US.UTF-8',
      PWD: '/home/student',
      HOSTNAME: 'linux-box',
    };
  }

  public getVfs(): VirtualFileSystem {
    return this.vfs;
  }

  public getEnv(): Record<string, string> {
    return { ...this.env };
  }

  public getCurrentUser(): string {
    return this.currentUser;
  }

  public getCwd(): string {
    return this.vfs.getCwd();
  }

  public getHistory(): string[] {
    return [...this.history];
  }

  public execute(cmdLine: string): CommandOutput {
    const raw = cmdLine.trim();
    if (!raw) {
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    this.history.push(raw);

    // Check for comments
    if (raw.startsWith('#')) {
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    // Split pipelines (cmd1 | cmd2)
    const pipelineSegments = this.splitPipeline(raw);
    if (pipelineSegments.length > 1) {
      return this.executePipeline(pipelineSegments);
    }

    // Single command execution with redirection handling
    return this.executeSingleCommandLine(raw);
  }

  private splitPipeline(cmdLine: string): string[] {
    // Regex aware split on | (not inside quotes)
    const segments: string[] = [];
    let current = '';
    let inSingle = false;
    let inDouble = false;

    for (let i = 0; i < cmdLine.length; i++) {
      const char = cmdLine[i];
      if (char === "'" && !inDouble) {
        inSingle = !inSingle;
        current += char;
      } else if (char === '"' && !inSingle) {
        inDouble = !inDouble;
        current += char;
      } else if (char === '|' && !inSingle && !inDouble) {
        segments.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) {
      segments.push(current.trim());
    }
    return segments;
  }

  private executePipeline(stages: string[]): CommandOutput {
    let pipeInput = '';
    let lastOutput: CommandOutput = { stdout: '', stderr: '', exitCode: 0 };

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      lastOutput = this.executeSingleCommandLine(stage, pipeInput);
      if (lastOutput.exitCode !== 0 && i < stages.length - 1) {
        // Pipeline broken
        return lastOutput;
      }
      pipeInput = lastOutput.stdout;
    }

    return lastOutput;
  }

  private executeSingleCommandLine(cmdString: string, pipeStdin: string = ''): CommandOutput {
    // Check for redirection: >, >>, 2>&1, 2>, <
    const { cleanCommand, redirectOut, appendOut, redirectIn, redirectErr } =
      this.parseRedirection(cmdString);

    let effectiveStdin = pipeStdin;
    if (redirectIn) {
      const content = this.vfs.readFile(redirectIn);
      if (content === null) {
        return {
          stdout: '',
          stderr: `bash: ${redirectIn}: No such file or directory\n`,
          exitCode: 1,
        };
      }
      effectiveStdin = content;
    }

    const output = this.runCommand(cleanCommand, effectiveStdin);

    // Handle stderr redirection
    if (redirectErr === '/dev/null') {
      output.stderr = '';
    }

    // Handle stdout redirection
    if (redirectOut) {
      if (redirectOut === '/dev/null') {
        output.stdout = '';
      } else {
        const res = this.vfs.writeFile(redirectOut, output.stdout, appendOut);
        if (!res.success) {
          return {
            stdout: '',
            stderr: `bash: ${res.error}\n`,
            exitCode: 1,
          };
        }
        output.stdout = '';
      }
    }

    return output;
  }

  private parseRedirection(cmd: string): {
    cleanCommand: string;
    redirectOut?: string;
    appendOut: boolean;
    redirectIn?: string;
    redirectErr?: string;
  } {
    let command = cmd;
    let redirectOut: string | undefined;
    let appendOut = false;
    let redirectIn: string | undefined;
    let redirectErr: string | undefined;

    // Check 2>&1
    if (command.includes('2>&1')) {
      command = command.replace('2>&1', '');
    }

    // Check 2>
    const errMatch = command.match(/2>\s*([^\s]+)/);
    if (errMatch) {
      redirectErr = errMatch[1];
      command = command.replace(errMatch[0], '');
    }

    // Check >>
    const appendMatch = command.match(/>>\s*([^\s]+)/);
    if (appendMatch) {
      redirectOut = appendMatch[1];
      appendOut = true;
      command = command.replace(appendMatch[0], '');
    } else {
      // Check >
      const outMatch = command.match(/>\s*([^\s]+)/);
      if (outMatch) {
        redirectOut = outMatch[1];
        appendOut = false;
        command = command.replace(outMatch[0], '');
      }
    }

    // Check <
    const inMatch = command.match(/<\s*([^\s]+)/);
    if (inMatch) {
      redirectIn = inMatch[1];
      command = command.replace(inMatch[0], '');
    }

    return {
      cleanCommand: command.trim(),
      redirectOut,
      appendOut,
      redirectIn,
      redirectErr,
    };
  }

  private tokenize(line: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inSingle = false;
    let inDouble = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === "'" && !inDouble) {
        inSingle = !inSingle;
      } else if (char === '"' && !inSingle) {
        inDouble = !inDouble;
      } else if (/\s/.test(char) && !inSingle && !inDouble) {
        if (current.length > 0) {
          tokens.push(this.interpolateEnv(current));
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current.length > 0) {
      tokens.push(this.interpolateEnv(current));
    }

    return tokens;
  }

  private interpolateEnv(text: string): string {
    return text.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*|\?)/g, (_, varName) => {
      if (varName === '?') return '0';
      return this.env[varName] || '';
    });
  }

  private runCommand(cmdString: string, stdin: string): CommandOutput {
    const tokens = this.tokenize(cmdString);
    if (tokens.length === 0) {
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    let cmd = tokens[0];
    let args = tokens.slice(1);

    // Handle 'sudo'
    let isSudo = false;
    if (cmd === 'sudo') {
      isSudo = true;
      if (tokens.length === 1) {
        return {
          stdout: '',
          stderr: 'usage: sudo command\n',
          exitCode: 1,
        };
      }
      cmd = tokens[1];
      args = tokens.slice(2);
    }

    switch (cmd) {
      case 'pwd':
        return { stdout: `${this.vfs.getCwd()}\n`, stderr: '', exitCode: 0 };

      case 'cd': {
        const target = args[0] || '~';
        if (target === '-') {
          const prev = this.previousDir;
          this.previousDir = this.vfs.getCwd();
          const ok = this.vfs.setCwd(prev);
          if (ok) {
            this.env.PWD = this.vfs.getCwd();
            return { stdout: `${this.vfs.getCwd()}\n`, stderr: '', exitCode: 0 };
          }
          return { stdout: '', stderr: 'bash: cd: OLDPWD not set\n', exitCode: 1 };
        }

        const old = this.vfs.getCwd();
        const ok = this.vfs.setCwd(target);
        if (ok) {
          this.previousDir = old;
          this.env.PWD = this.vfs.getCwd();
          return { stdout: '', stderr: '', exitCode: 0 };
        } else {
          return { stdout: '', stderr: `bash: cd: ${target}: No such file or directory\n`, exitCode: 1 };
        }
      }

      case 'ls':
        return this.cmdLs(args);

      case 'cat':
        return this.cmdCat(args, stdin);

      case 'head':
        return this.cmdHead(args, stdin);

      case 'tail':
        return this.cmdTail(args, stdin);

      case 'touch':
        return this.cmdTouch(args);

      case 'mkdir':
        return this.cmdMkdir(args);

      case 'cp':
        return this.cmdCp(args);

      case 'mv':
        return this.cmdMv(args);

      case 'rm':
        return this.cmdRm(args);

      case 'rmdir':
        return this.cmdRmdir(args);

      case 'grep':
        return this.cmdGrep(args, stdin);

      case 'wc':
        return this.cmdWc(args, stdin);

      case 'sort':
        return this.cmdSort(args, stdin);

      case 'uniq':
        return this.cmdUniq(args, stdin);

      case 'cut':
        return this.cmdCut(args, stdin);

      case 'tr':
        return this.cmdTr(args, stdin);

      case 'sed':
        return this.cmdSed(args, stdin);

      case 'awk':
        return this.cmdAwk(args, stdin);

      case 'find':
        return this.cmdFind(args);

      case 'which':
      case 'whereis':
        return this.cmdWhich(args);

      case 'echo':
        return this.cmdEcho(args);

      case 'chmod':
        return this.cmdChmod(args);

      case 'chown':
        return this.cmdChown(args);

      case 'df':
        return this.cmdDf(args);

      case 'du':
        return this.cmdDu(args);

      case 'free':
        return this.cmdFree(args);

      case 'uname':
        return this.cmdUname(args);

      case 'uptime':
        return {
          stdout: ' 10:28:40 up 3 days,  4:12,  2 users,  load average: 0.14, 0.22, 0.18\n',
          stderr: '',
          exitCode: 0,
        };

      case 'whoami':
        return { stdout: `${isSudo ? 'root' : this.currentUser}\n`, stderr: '', exitCode: 0 };

      case 'id':
        return {
          stdout: isSudo
            ? 'uid=0(root) gid=0(root) groups=0(root)\n'
            : 'uid=1000(student) gid=1000(student) groups=1000(student),4(adm),27(sudo),999(docker)\n',
          stderr: '',
          exitCode: 0,
        };

      case 'groups':
        return {
          stdout: isSudo ? 'root\n' : 'student adm sudo docker\n',
          stderr: '',
          exitCode: 0,
        };

      case 'ps':
        return this.cmdPs(args);

      case 'top':
      case 'htop':
        return this.cmdTop();

      case 'kill':
        return this.cmdKill(args);

      case 'systemctl':
        return this.cmdSystemctl(args);

      case 'journalctl':
        return this.cmdJournalctl(args);

      case 'ip':
        return this.cmdIp(args);

      case 'ping':
        return this.cmdPing(args);

      case 'ss':
      case 'netstat':
        return this.cmdSs(args);

      case 'curl':
        return this.cmdCurl(args);

      case 'tar':
        return this.cmdTar(args);

      case 'gzip':
      case 'gunzip':
      case 'zip':
      case 'unzip':
        return this.cmdZip(cmd, args);

      case 'export': {
        if (args.length === 0) {
          const list = Object.entries(this.env)
            .map(([k, v]) => `declare -x ${k}="${v}"`)
            .join('\n');
          return { stdout: `${list}\n`, stderr: '', exitCode: 0 };
        }
        for (const arg of args) {
          const [key, val] = arg.split('=');
          if (key && val !== undefined) {
            this.env[key] = val;
          }
        }
        return { stdout: '', stderr: '', exitCode: 0 };
      }

      case 'env':
      case 'printenv': {
        const list = Object.entries(this.env)
          .map(([k, v]) => `${k}=${v}`)
          .join('\n');
        return { stdout: `${list}\n`, stderr: '', exitCode: 0 };
      }

      case 'history': {
        const hist = this.history.map((h, i) => `  ${(i + 1).toString().padStart(4, ' ')}  ${h}`).join('\n');
        return { stdout: `${hist}\n`, stderr: '', exitCode: 0 };
      }

      case 'clear':
        return { stdout: '\x1b[2J\x1b[0;0H', stderr: '', exitCode: 0 };

      case 'date':
        return { stdout: `${new Date().toUTCString()}\n`, stderr: '', exitCode: 0 };

      case 'hostname':
        return { stdout: `${this.env.HOSTNAME || 'linux-box'}\n`, stderr: '', exitCode: 0 };

      case 'help':
        return this.cmdHelp();

      case 'man': {
        if (args.length === 0) {
          return { stdout: '', stderr: 'What manual page do you want?\n', exitCode: 1 };
        }
        return this.cmdMan(args[0]);
      }

      default:
        // Check if executable file in current dir
        if (cmd.startsWith('./') || cmd.startsWith('/')) {
          const file = this.vfs.readFile(cmd);
          if (file !== null) {
            return {
              stdout: `[Executed script: ${cmd}]\n${file.slice(0, 300)}\n`,
              stderr: '',
              exitCode: 0,
            };
          }
        }
        return {
          stdout: '',
          stderr: `bash: ${cmd}: command not found\n`,
          exitCode: 127,
        };
    }
  }

  // --- Subcommand Implementations ---

  private cmdLs(args: string[]): CommandOutput {
    let showAll = false;
    let longFormat = false;
    let targetPath = '';

    for (const arg of args) {
      if (arg.startsWith('-')) {
        if (arg.includes('a')) showAll = true;
        if (arg.includes('l')) longFormat = true;
      } else {
        targetPath = arg;
      }
    }

    const absPath = this.vfs.resolvePath(targetPath || this.vfs.getCwd());
    const targetNode = this.vfs.getNode(absPath);

    if (!targetNode) {
      return {
        stdout: '',
        stderr: `ls: cannot access '${targetPath}': No such file or directory\n`,
        exitCode: 2,
      };
    }

    if (targetNode.type === 'file') {
      if (longFormat) {
        const modeStr = VirtualFileSystem.modeToString(targetNode.mode, false);
        const dateStr = new Date(targetNode.mtime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        return {
          stdout: `${modeStr} 1 ${targetNode.owner} ${targetNode.group} ${targetNode.content.length.toString().padStart(6)} ${dateStr} ${targetNode.name}\n`,
          stderr: '',
          exitCode: 0,
        };
      }
      return { stdout: `${targetNode.name}\n`, stderr: '', exitCode: 0 };
    }

    const items = this.vfs.listDirectory(absPath);
    if (!items) return { stdout: '', stderr: '', exitCode: 0 };

    const filtered = showAll ? items : items.filter((item) => !item.name.startsWith('.'));

    if (longFormat) {
      let output = `total ${filtered.length * 4}\n`;
      if (showAll) {
        output += `drwxr-xr-x 4 ${targetNode.owner} ${targetNode.group} 4096 Nov  5 10:00 .\n`;
        output += `drwxr-xr-x 8 root root 4096 Nov  5 09:00 ..\n`;
      }
      for (const item of filtered) {
        const isDir = item.type === 'dir';
        const modeStr = VirtualFileSystem.modeToString(item.mode, isDir);
        const size = isDir ? 4096 : item.content.length;
        const dateStr = new Date(item.mtime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const nameDisplay = isDir ? `\x1b[1;34m${item.name}\x1b[0m` : item.name;
        output += `${modeStr} 1 ${item.owner} ${item.group} ${size.toString().padStart(6)} ${dateStr} ${nameDisplay}\n`;
      }
      return { stdout: output, stderr: '', exitCode: 0 };
    }

    const names = filtered.map((item) => (item.type === 'dir' ? `${item.name}/` : item.name));
    return { stdout: names.length > 0 ? `${names.join('  ')}\n` : '', stderr: '', exitCode: 0 };
  }

  private cmdCat(args: string[], stdin: string): CommandOutput {
    let showLineNumbers = false;
    const files: string[] = [];

    for (const arg of args) {
      if (arg === '-n') showLineNumbers = true;
      else files.push(arg);
    }

    let result = '';
    if (files.length === 0) {
      result = stdin;
    } else {
      for (const file of files) {
        const content = this.vfs.readFile(file);
        if (content === null) {
          return {
            stdout: result,
            stderr: `cat: ${file}: No such file or directory\n`,
            exitCode: 1,
          };
        }
        result += content + (content.endsWith('\n') ? '' : '\n');
      }
    }

    if (showLineNumbers) {
      const lines = result.split('\n');
      if (lines[lines.length - 1] === '') lines.pop();
      result = lines.map((l, i) => `     ${(i + 1).toString().padStart(2, ' ')}  ${l}`).join('\n') + '\n';
    }

    return { stdout: result, stderr: '', exitCode: 0 };
  }

  private cmdHead(args: string[], stdin: string): CommandOutput {
    let count = 10;
    let target = '';

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n' && args[i + 1]) {
        count = parseInt(args[i + 1], 10) || 10;
        i++;
      } else if (args[i].startsWith('-') && /^\d+$/.test(args[i].slice(1))) {
        count = parseInt(args[i].slice(1), 10) || 10;
      } else {
        target = args[i];
      }
    }

    const text = target ? this.vfs.readFile(target) : stdin;
    if (text === null) {
      return { stdout: '', stderr: `head: cannot open '${target}' for reading: No such file or directory\n`, exitCode: 1 };
    }

    const lines = text.split('\n').slice(0, count);
    return { stdout: lines.join('\n') + '\n', stderr: '', exitCode: 0 };
  }

  private cmdTail(args: string[], stdin: string): CommandOutput {
    let count = 10;
    let target = '';

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n' && args[i + 1]) {
        count = parseInt(args[i + 1], 10) || 10;
        i++;
      } else if (args[i].startsWith('-') && /^\d+$/.test(args[i].slice(1))) {
        count = parseInt(args[i].slice(1), 10) || 10;
      } else {
        target = args[i];
      }
    }

    const text = target ? this.vfs.readFile(target) : stdin;
    if (text === null) {
      return { stdout: '', stderr: `tail: cannot open '${target}' for reading: No such file or directory\n`, exitCode: 1 };
    }

    const allLines = text.split('\n');
    if (allLines[allLines.length - 1] === '') allLines.pop();
    const lines = allLines.slice(-count);
    return { stdout: lines.join('\n') + '\n', stderr: '', exitCode: 0 };
  }

  private cmdTouch(args: string[]): CommandOutput {
    if (args.length === 0) {
      return { stdout: '', stderr: 'touch: missing file operand\n', exitCode: 1 };
    }
    for (const file of args) {
      if (this.vfs.fileExists(file)) {
        const node = this.vfs.getNode(this.vfs.resolvePath(file));
        if (node) node.mtime = Date.now();
      } else {
        this.vfs.writeFile(file, '');
      }
    }
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdMkdir(args: string[]): CommandOutput {
    let recursive = false;
    const paths: string[] = [];

    for (const arg of args) {
      if (arg === '-p' || arg === '--parents') recursive = true;
      else paths.push(arg);
    }

    if (paths.length === 0) {
      return { stdout: '', stderr: 'mkdir: missing operand\n', exitCode: 1 };
    }

    for (const p of paths) {
      const res = this.vfs.mkdir(p, recursive);
      if (!res.success) {
        return { stdout: '', stderr: `mkdir: ${res.error}\n`, exitCode: 1 };
      }
    }
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdCp(args: string[]): CommandOutput {
    let recursive = false;
    const targets: string[] = [];

    for (const arg of args) {
      if (arg === '-r' || arg === '-R' || arg === '-a') recursive = true;
      else targets.push(arg);
    }

    if (targets.length < 2) {
      return { stdout: '', stderr: 'cp: missing destination file operand\n', exitCode: 1 };
    }

    const dest = targets.pop()!;
    for (const src of targets) {
      const res = this.vfs.copy(src, dest, recursive);
      if (!res.success) {
        return { stdout: '', stderr: `cp: ${res.error}\n`, exitCode: 1 };
      }
    }
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdMv(args: string[]): CommandOutput {
    if (args.length < 2) {
      return { stdout: '', stderr: 'mv: missing destination file operand\n', exitCode: 1 };
    }
    const src = args[0];
    const dest = args[1];
    const res = this.vfs.move(src, dest);
    if (!res.success) {
      return { stdout: '', stderr: `mv: ${res.error}\n`, exitCode: 1 };
    }
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdRm(args: string[]): CommandOutput {
    let recursive = false;
    let force = false;
    const paths: string[] = [];

    for (const arg of args) {
      if (arg.startsWith('-')) {
        if (arg.includes('r') || arg.includes('R')) recursive = true;
        if (arg.includes('f')) force = true;
      } else {
        paths.push(arg);
      }
    }

    if (paths.length === 0 && !force) {
      return { stdout: '', stderr: 'rm: missing operand\n', exitCode: 1 };
    }

    for (const p of paths) {
      const res = this.vfs.remove(p, recursive, force);
      if (!res.success && !force) {
        return { stdout: '', stderr: `rm: ${res.error}\n`, exitCode: 1 };
      }
    }
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdRmdir(args: string[]): CommandOutput {
    if (args.length === 0) {
      return { stdout: '', stderr: 'rmdir: missing operand\n', exitCode: 1 };
    }
    for (const p of args) {
      const node = this.vfs.getNode(this.vfs.resolvePath(p));
      if (!node) {
        return { stdout: '', stderr: `rmdir: failed to remove '${p}': No such file or directory\n`, exitCode: 1 };
      }
      if (node.type !== 'dir') {
        return { stdout: '', stderr: `rmdir: failed to remove '${p}': Not a directory\n`, exitCode: 1 };
      }
      if (node.children && node.children.size > 0) {
        return { stdout: '', stderr: `rmdir: failed to remove '${p}': Directory not empty\n`, exitCode: 1 };
      }
      this.vfs.remove(p, false, true);
    }
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdGrep(args: string[], stdin: string): CommandOutput {
    let ignoreCase = false;
    let invertMatch = false;
    let showLineNum = false;
    let countOnly = false;
    let pattern = '';
    const files: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a.startsWith('-') && a !== '-') {
        if (a.includes('i')) ignoreCase = true;
        if (a.includes('v')) invertMatch = true;
        if (a.includes('n')) showLineNum = true;
        if (a.includes('c')) countOnly = true;
      } else if (!pattern) {
        pattern = a;
      } else {
        files.push(a);
      }
    }

    if (!pattern) {
      return { stdout: '', stderr: 'grep: missing pattern\n', exitCode: 2 };
    }

    let regex: RegExp;
    try {
      regex = new RegExp(pattern, ignoreCase ? 'i' : '');
    } catch {
      return { stdout: '', stderr: `grep: invalid regular expression\n`, exitCode: 2 };
    }

    let inputData = '';
    if (files.length === 0) {
      inputData = stdin;
    } else {
      for (const f of files) {
        const c = this.vfs.readFile(f);
        if (c !== null) inputData += c + '\n';
      }
    }

    const lines = inputData.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();

    const matched: string[] = [];
    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      const match = regex.test(line);
      const keep = invertMatch ? !match : match;
      if (keep) {
        matched.push(showLineNum ? `${idx + 1}:${line}` : line);
      }
    }

    if (countOnly) {
      return { stdout: `${matched.length}\n`, stderr: '', exitCode: matched.length > 0 ? 0 : 1 };
    }

    if (matched.length === 0) {
      return { stdout: '', stderr: '', exitCode: 1 };
    }

    return { stdout: matched.join('\n') + '\n', stderr: '', exitCode: 0 };
  }

  private cmdWc(args: string[], stdin: string): CommandOutput {
    let countLines = false;
    let countWords = false;
    let countChars = false;
    const files: string[] = [];

    for (const a of args) {
      if (a.startsWith('-')) {
        if (a.includes('l')) countLines = true;
        if (a.includes('w')) countWords = true;
        if (a.includes('c') || a.includes('m')) countChars = true;
      } else {
        files.push(a);
      }
    }

    if (!countLines && !countWords && !countChars) {
      countLines = true;
      countWords = true;
      countChars = true;
    }

    const processText = (text: string, label: string = '') => {
      const lines = text.split('\n');
      const numLines = lines.length > 0 && lines[lines.length - 1] === '' ? lines.length - 1 : lines.length;
      const numWords = text.trim() ? text.trim().split(/\s+/).length : 0;
      const numBytes = text.length;

      const parts: string[] = [];
      if (countLines) parts.push(numLines.toString().padStart(7));
      if (countWords) parts.push(numWords.toString().padStart(7));
      if (countChars) parts.push(numBytes.toString().padStart(7));
      if (label) parts.push(` ${label}`);
      return parts.join(' ');
    };

    if (files.length === 0) {
      return { stdout: `${processText(stdin)}\n`, stderr: '', exitCode: 0 };
    }

    const outputRows = files.map((f) => {
      const content = this.vfs.readFile(f);
      if (content === null) return `wc: ${f}: No such file or directory`;
      return processText(content, f);
    });

    return { stdout: outputRows.join('\n') + '\n', stderr: '', exitCode: 0 };
  }

  private cmdSort(args: string[], stdin: string): CommandOutput {
    let reverse = false;
    let numeric = false;
    let unique = false;
    let target = '';

    for (const a of args) {
      if (a.startsWith('-')) {
        if (a.includes('r')) reverse = true;
        if (a.includes('n')) numeric = true;
        if (a.includes('u')) unique = true;
      } else {
        target = a;
      }
    }

    const text = target ? this.vfs.readFile(target) : stdin;
    if (text === null) {
      return { stdout: '', stderr: `sort: cannot read: ${target}\n`, exitCode: 2 };
    }

    let lines = text.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();

    lines.sort((a, b) => {
      if (numeric) {
        const na = parseFloat(a) || 0;
        const nb = parseFloat(b) || 0;
        return reverse ? nb - na : na - nb;
      }
      return reverse ? b.localeCompare(a) : a.localeCompare(b);
    });

    if (unique) {
      lines = Array.from(new Set(lines));
    }

    return { stdout: lines.join('\n') + '\n', stderr: '', exitCode: 0 };
  }

  private cmdUniq(args: string[], stdin: string): CommandOutput {
    let countOnly = false;
    let duplicatesOnly = false;
    let target = '';

    for (const a of args) {
      if (a.startsWith('-')) {
        if (a.includes('c')) countOnly = true;
        if (a.includes('d')) duplicatesOnly = true;
      } else {
        target = a;
      }
    }

    const text = target ? this.vfs.readFile(target) : stdin;
    if (text === null) {
      return { stdout: '', stderr: `uniq: '${target}': No such file or directory\n`, exitCode: 1 };
    }

    const lines = text.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();

    const result: string[] = [];
    let currentLine = '';
    let currentCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (i === 0) {
        currentLine = line;
        currentCount = 1;
      } else if (line === currentLine) {
        currentCount++;
      } else {
        if (!duplicatesOnly || currentCount > 1) {
          result.push(countOnly ? `${currentCount.toString().padStart(7)} ${currentLine}` : currentLine);
        }
        currentLine = line;
        currentCount = 1;
      }
    }
    if (currentCount > 0) {
      if (!duplicatesOnly || currentCount > 1) {
        result.push(countOnly ? `${currentCount.toString().padStart(7)} ${currentLine}` : currentLine);
      }
    }

    return { stdout: result.join('\n') + '\n', stderr: '', exitCode: 0 };
  }

  private cmdCut(args: string[], stdin: string): CommandOutput {
    let delimiter = '\t';
    let fields: number[] = [1];
    let target = '';

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a.startsWith('-d')) {
        delimiter = a.slice(2) || args[++i] || '\t';
      } else if (a.startsWith('-f')) {
        const fStr = a.slice(2) || args[++i] || '1';
        fields = fStr.split(',').map((n) => parseInt(n, 10)).filter(Boolean);
      } else {
        target = a;
      }
    }

    const text = target ? this.vfs.readFile(target) : stdin;
    if (text === null) {
      return { stdout: '', stderr: `cut: ${target}: No such file or directory\n`, exitCode: 1 };
    }

    const lines = text.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();

    const output = lines.map((l) => {
      const parts = l.split(delimiter);
      return fields.map((f) => parts[f - 1] || '').join(delimiter);
    });

    return { stdout: output.join('\n') + '\n', stderr: '', exitCode: 0 };
  }

  private cmdTr(args: string[], stdin: string): CommandOutput {
    if (args.length < 2) {
      return { stdout: stdin, stderr: '', exitCode: 0 };
    }
    const set1 = args[0].replace(/\[:lower:\]/g, 'abcdefghijklmnopqrstuvwxyz').replace(/\[:upper:\]/g, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    const set2 = args[1].replace(/\[:lower:\]/g, 'abcdefghijklmnopqrstuvwxyz').replace(/\[:upper:\]/g, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');

    let res = '';
    for (const ch of stdin) {
      const idx = set1.indexOf(ch);
      if (idx !== -1 && idx < set2.length) {
        res += set2[idx];
      } else {
        res += ch;
      }
    }
    return { stdout: res, stderr: '', exitCode: 0 };
  }

  private cmdSed(args: string[], stdin: string): CommandOutput {
    let expr = '';
    let target = '';

    for (const a of args) {
      if (a.startsWith('s/')) {
        expr = a;
      } else if (!a.startsWith('-')) {
        target = a;
      }
    }

    const text = target ? this.vfs.readFile(target) : stdin;
    if (text === null) {
      return { stdout: '', stderr: `sed: can't read ${target}: No such file or directory\n`, exitCode: 2 };
    }

    if (expr) {
      const parts = expr.split('/');
      if (parts.length >= 3) {
        const find = parts[1];
        const replace = parts[2];
        const flags = parts[3] || 'g';
        const regex = new RegExp(find, flags);
        const replaced = text.replace(regex, replace);
        return { stdout: replaced, stderr: '', exitCode: 0 };
      }
    }

    return { stdout: text, stderr: '', exitCode: 0 };
  }

  private cmdAwk(args: string[], stdin: string): CommandOutput {
    let script = '';
    let delimiter = /\s+/;
    let target = '';

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '-F' && args[i + 1]) {
        delimiter = new RegExp(args[++i]);
      } else if (a.startsWith('-F')) {
        delimiter = new RegExp(a.slice(2));
      } else if (!script) {
        script = a;
      } else {
        target = a;
      }
    }

    const text = target ? this.vfs.readFile(target) : stdin;
    if (text === null) {
      return { stdout: '', stderr: `awk: cannot open file ${target}\n`, exitCode: 2 };
    }

    const lines = text.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();

    const outputLines: string[] = [];

    // Simple awk interpreter supporting {print $1, $2, $NF}
    for (const line of lines) {
      const tokens = line.trim().split(delimiter);
      if (script.includes('{print')) {
        const inside = script.replace(/.*\{print\s*(.*)\}.*/, '$1');
        const fields = inside.split(/[, ]+/).filter(Boolean);
        const vals = fields.map((f) => {
          if (f === '$0') return line;
          if (f === '$NF') return tokens[tokens.length - 1] || '';
          if (f.startsWith('$')) {
            const idx = parseInt(f.slice(1), 10);
            return tokens[idx - 1] || '';
          }
          return f.replace(/['"]/g, '');
        });
        outputLines.push(vals.join(' '));
      } else {
        outputLines.push(line);
      }
    }

    return { stdout: outputLines.join('\n') + '\n', stderr: '', exitCode: 0 };
  }

  private cmdFind(args: string[]): CommandOutput {
    let startPath = '.';
    let namePattern: string | undefined;
    let typeFilter: 'file' | 'dir' | undefined;

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '-name' && args[i + 1]) {
        namePattern = args[++i];
      } else if (a === '-type' && args[i + 1]) {
        const t = args[++i];
        if (t === 'f') typeFilter = 'file';
        if (t === 'd') typeFilter = 'dir';
      } else if (!a.startsWith('-')) {
        startPath = a;
      }
    }

    const allPaths = this.vfs.getAllPaths(startPath);
    const filtered = allPaths.filter((p) => {
      const node = this.vfs.getNode(p);
      if (!node) return false;
      if (typeFilter && node.type !== typeFilter) return false;
      if (namePattern) {
        const regexStr = namePattern.replace(/\./g, '\\.').replace(/\*/g, '.*');
        const reg = new RegExp(`^${regexStr}$`);
        if (!reg.test(node.name)) return false;
      }
      return true;
    });

    return { stdout: filtered.join('\n') + (filtered.length > 0 ? '\n' : ''), stderr: '', exitCode: 0 };
  }

  private cmdWhich(args: string[]): CommandOutput {
    if (args.length === 0) return { stdout: '', stderr: '', exitCode: 1 };
    const name = args[0];
    const standardBinaries = [
      'bash', 'sh', 'ls', 'cat', 'pwd', 'mkdir', 'rm', 'cp', 'mv', 'grep',
      'awk', 'sed', 'cut', 'sort', 'uniq', 'find', 'tar', 'gzip', 'chmod',
      'chown', 'ps', 'top', 'uptime', 'systemctl', 'journalctl', 'ip', 'ping',
      'ss', 'curl', 'ssh', 'python3', 'nano', 'vim'
    ];
    if (standardBinaries.includes(name)) {
      return { stdout: `/usr/bin/${name}\n`, stderr: '', exitCode: 0 };
    }
    return { stdout: '', stderr: `${name} not found\n`, exitCode: 1 };
  }

  private cmdEcho(args: string[]): CommandOutput {
    let noNewline = false;
    const words: string[] = [];
    for (const a of args) {
      if (a === '-n') noNewline = true;
      else words.push(a);
    }
    const res = words.join(' ');
    return { stdout: noNewline ? res : `${res}\n`, stderr: '', exitCode: 0 };
  }

  private cmdChmod(args: string[]): CommandOutput {
    if (args.length < 2) {
      return { stdout: '', stderr: 'chmod: missing operand\n', exitCode: 1 };
    }
    const modeStr = args[0];
    const target = args[1];

    let mode = 0o644;
    if (/^[0-7]{3,4}$/.test(modeStr)) {
      mode = parseInt(modeStr, 8);
    } else if (modeStr === '+x' || modeStr === 'u+x') {
      const node = this.vfs.getNode(this.vfs.resolvePath(target));
      if (node) mode = node.mode | 0o111;
    }

    const res = this.vfs.chmod(target, mode);
    if (!res.success) {
      return { stdout: '', stderr: `chmod: ${res.error}\n`, exitCode: 1 };
    }
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdChown(args: string[]): CommandOutput {
    if (args.length < 2) {
      return { stdout: '', stderr: 'chown: missing operand\n', exitCode: 1 };
    }
    const [user, group] = args[0].split(':');
    const target = args[1];

    const res = this.vfs.chown(target, user, group);
    if (!res.success) {
      return { stdout: '', stderr: `chown: ${res.error}\n`, exitCode: 1 };
    }
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdDf(args: string[]): CommandOutput {
    return {
      stdout: `Filesystem     1K-blocks     Used Available Use% Mounted on
udev             8176524        0   8176524   0% /dev
tmpfs            1638400     1840   1636560   1% /run
/dev/sda1       49182048 14210400  32451248  31% /
tmpfs            8192000        0   8192000   0% /dev/shm
/dev/sdb1      104857600 24102000  75412000  25% /mnt/storage\n`,
      stderr: '',
      exitCode: 0,
    };
  }

  private cmdDu(args: string[]): CommandOutput {
    const cwd = this.vfs.getCwd();
    const items = this.vfs.listDirectory(cwd) || [];
    let lines = items.map((it) => {
      const sizeK = Math.max(4, Math.ceil(it.content.length / 1024) * 4);
      return `${sizeK}K\t${it.name}`;
    });
    lines.push(`48K\t.`);
    return { stdout: lines.join('\n') + '\n', stderr: '', exitCode: 0 };
  }

  private cmdFree(args: string[]): CommandOutput {
    return {
      stdout: `               total        used        free      shared  buff/cache   available
Mem:           16384        4210        8421         184        3753       12104
Swap:           2048           0        2048\n`,
      stderr: '',
      exitCode: 0,
    };
  }

  private cmdUname(args: string[]): CommandOutput {
    const full = args.includes('-a');
    if (full) {
      return {
        stdout: 'Linux linux-box 6.8.0-40-generic #40-Ubuntu SMP PREEMPT_DYNAMIC x86_64 x86_64 x86_64 GNU/Linux\n',
        stderr: '',
        exitCode: 0,
      };
    }
    return { stdout: 'Linux\n', stderr: '', exitCode: 0 };
  }

  private cmdPs(args: string[]): CommandOutput {
    let out = 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\n';
    for (const p of this.processes) {
      out += `${p.user.padEnd(8)} ${p.pid.toString().padStart(5)} ${p.cpu.toFixed(1).padStart(4)} ${p.mem.toFixed(1).padStart(4)} ${p.vsz.toString().padStart(6)} ${p.rss.toString().padStart(5)} ${p.tty.padEnd(8)} ${p.stat.padEnd(4)} ${p.start.padEnd(7)} ${p.time.padEnd(6)} ${p.command}\n`;
    }
    return { stdout: out, stderr: '', exitCode: 0 };
  }

  private cmdTop(): CommandOutput {
    return {
      stdout: `top - 10:35:12 up 3 days,  4:12,  2 users,  load average: 0.14, 0.22, 0.18
Tasks: 184 total,   1 running, 183 sleeping,   0 stopped,   0 zombie
%Cpu(s):  1.2 us,  0.8 sy,  0.0 ni, 97.8 id,  0.1 wa,  0.0 hi,  0.1 si,  0.0 st
MiB Mem :  16000.0 total,   8223.7 free,   4111.4 used,   3664.9 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.  11804.2 avail Mem 

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
   2104 student   20   0  320400  48900  18400 S   0.5   1.2   0:02.14 python3
   1205 www-data  20   0  182400  24100  12100 S   0.2   0.5   0:04.22 nginx
    489 root      20   0  112400   9800   5200 S   0.1   0.2   0:01.05 rsyslogd
   1840 student   20   0   22400   5800   3200 S   0.0   0.1   0:01.20 bash\n`,
      stderr: '',
      exitCode: 0,
    };
  }

  private cmdKill(args: string[]): CommandOutput {
    if (args.length === 0) {
      return { stdout: '', stderr: 'kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]\n', exitCode: 1 };
    }
    const pidStr = args[args.length - 1];
    const pid = parseInt(pidStr, 10);
    const idx = this.processes.findIndex((p) => p.pid === pid);
    if (idx !== -1) {
      const removed = this.processes.splice(idx, 1)[0];
      return { stdout: `[1]+  Terminated              ${removed.command}\n`, stderr: '', exitCode: 0 };
    }
    return { stdout: '', stderr: `bash: kill: (${pidStr}) - No such process\n`, exitCode: 1 };
  }

  private cmdSystemctl(args: string[]): CommandOutput {
    if (args.length === 0) {
      return {
        stdout: `  UNIT                        LOAD   ACTIVE SUB     DESCRIPTION
  cron.service                loaded active running Regular background program processing daemon
  nginx.service               loaded active running A high performance web server and a reverse proxy server
  ssh.service                 loaded active running OpenBSD Secure Shell server
  systemd-journald.service    loaded active running Journal Service\n`,
        stderr: '',
        exitCode: 0,
      };
    }

    const action = args[0];
    const service = args[1] || 'nginx';

    if (action === 'status') {
      return {
        stdout: `● ${service}.service - High performance web server
     Loaded: loaded (/lib/systemd/system/${service}.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2026-11-05 10:00:15 UTC; 42min ago
   Main PID: 1205 (nginx)
      Tasks: 2 (limit: 18432)
     Memory: 24.1M
     CGroup: /system.slice/${service}.service
             ├─1204 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;
             └─1205 nginx: worker process\n`,
        stderr: '',
        exitCode: 0,
      };
    }

    if (['start', 'stop', 'restart', 'reload', 'enable', 'disable'].includes(action)) {
      return { stdout: ``, stderr: '', exitCode: 0 };
    }

    return { stdout: '', stderr: `systemctl: unknown command ${action}\n`, exitCode: 1 };
  }

  private cmdJournalctl(args: string[]): CommandOutput {
    return {
      stdout: `-- Logs begin at Wed 2026-11-05 08:00:00 UTC, end at Wed 2026-11-05 10:40:00 UTC. --
Nov 05 10:00:12 linux-box systemd[1]: Starting A high performance web server...
Nov 05 10:00:15 linux-box systemd[1]: Started A high performance web server.
Nov 05 10:15:10 linux-box sshd[2841]: Accepted publickey for student from 192.168.1.42 port 54320 ssh2
Nov 05 10:25:01 linux-box CRON[3102]: (root) CMD (test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.daily; })\n`,
      stderr: '',
      exitCode: 0,
    };
  }

  private cmdIp(args: string[]): CommandOutput {
    const sub = args[0] || 'addr';
    if (sub === 'addr' || sub === 'a') {
      return {
        stdout: `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether 00:16:3e:2b:8f:1a brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.10/24 brd 192.168.1.255 scope global dynamic eth0
       valid_lft 86320sec preferred_lft 86320sec\n`,
        stderr: '',
        exitCode: 0,
      };
    }
    if (sub === 'route' || sub === 'r') {
      return {
        stdout: `default via 192.168.1.1 dev eth0 proto dhcp src 192.168.1.10 metric 100
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.10\n`,
        stderr: '',
        exitCode: 0,
      };
    }
    return { stdout: '', stderr: `ip: unknown subcommand ${sub}\n`, exitCode: 1 };
  }

  private cmdPing(args: string[]): CommandOutput {
    const host = args.find((a) => !a.startsWith('-')) || '8.8.8.8';
    return {
      stdout: `PING ${host} (${host}) 56(84) bytes of data.
64 bytes from ${host}: icmp_seq=1 ttl=118 time=12.4 ms
64 bytes from ${host}: icmp_seq=2 ttl=118 time=11.9 ms
64 bytes from ${host}: icmp_seq=3 ttl=118 time=12.1 ms

--- ${host} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2003ms
rtt min/avg/max/mdev = 11.912/12.138/12.420/0.210 ms\n`,
      stderr: '',
      exitCode: 0,
    };
  }

  private cmdSs(args: string[]): CommandOutput {
    return {
      stdout: `Netid  State   Recv-Q  Send-Q   Local Address:Port   Peer Address:Port  Process
tcp    LISTEN  0       128            0.0.0.0:22          0.0.0.0:*      users:(("sshd",pid=840,fd=3))
tcp    LISTEN  0       511            0.0.0.0:80          0.0.0.0:*      users:(("nginx",pid=1205,fd=6))
tcp    LISTEN  0       5              0.0.0.0:8080        0.0.0.0:*      users:(("python3",pid=2104,fd=4))
tcp    LISTEN  0       128               [::]:22             [::]:*      users:(("sshd",pid=840,fd=4))\n`,
      stderr: '',
      exitCode: 0,
    };
  }

  private cmdCurl(args: string[]): CommandOutput {
    const url = args.find((a) => !a.startsWith('-')) || 'http://localhost:8080';
    if (args.includes('-I') || args.includes('--head')) {
      return {
        stdout: `HTTP/1.1 200 OK
Server: Python/3.12 SimpleHTTP/0.6
Date: ${new Date().toUTCString()}
Content-Type: text/html; charset=utf-8
Content-Length: 312
Connection: close\n`,
        stderr: '',
        exitCode: 0,
      };
    }
    return {
      stdout: `<!DOCTYPE html>
<html>
<head><title>Linux Web Service</title></head>
<body>
  <h1>Server Running OK</h1>
  <p>Response from internal service at ${url}</p>
</body>
</html>\n`,
      stderr: '',
      exitCode: 0,
    };
  }

  private cmdTar(args: string[]): CommandOutput {
    const flags = args[0] || '';
    const archiveName = args[1];
    const source = args[2];

    if (flags.includes('c')) {
      // Create archive
      if (!archiveName || !source) {
        return { stdout: '', stderr: 'tar: missing archive or source operand\n', exitCode: 1 };
      }
      this.vfs.writeFile(archiveName, `[TAR ARCHIVE BINARY OF ${source}]`, false, 0o644);
      return { stdout: flags.includes('v') ? `${source}\n` : '', stderr: '', exitCode: 0 };
    }

    if (flags.includes('x')) {
      // Extract archive
      if (!archiveName) {
        return { stdout: '', stderr: 'tar: missing archive file\n', exitCode: 1 };
      }
      if (!this.vfs.fileExists(archiveName)) {
        return { stdout: '', stderr: `tar: ${archiveName}: Cannot open: No such file or directory\n`, exitCode: 2 };
      }
      return { stdout: flags.includes('v') ? `extracted files from ${archiveName}\n` : '', stderr: '', exitCode: 0 };
    }

    return { stdout: '', stderr: 'tar: specify -c (create) or -x (extract)\n', exitCode: 1 };
  }

  private cmdZip(cmd: string, args: string[]): CommandOutput {
    if (args.length === 0) {
      return { stdout: '', stderr: `${cmd}: missing file operand\n`, exitCode: 1 };
    }
    const target = args[0];
    if (cmd === 'gzip') {
      const content = this.vfs.readFile(target);
      if (content !== null) {
        this.vfs.writeFile(`${target}.gz`, `[GZIP COMPRESSED: ${content.length} bytes]`);
        this.vfs.remove(target);
        return { stdout: '', stderr: '', exitCode: 0 };
      }
      return { stdout: '', stderr: `gzip: ${target}: No such file or directory\n`, exitCode: 1 };
    }
    return { stdout: `Processed ${target}\n`, stderr: '', exitCode: 0 };
  }

  private cmdHelp(): CommandOutput {
    return {
      stdout: `GNU bash, version 5.2.21-release (x86_64-pc-linux-gnu)
These shell commands are defined internally or simulated in this LMS sandbox:

  File Operations:     ls, cd, pwd, mkdir, touch, cp, mv, rm, rmdir, cat, head, tail
  Text Processing:     grep, wc, sort, uniq, cut, tr, sed, awk
  Filesystem & Search: find, which, whereis, df, du
  Permissions & Users: chmod, chown, whoami, id, groups, sudo
  Process & Control:   ps, top, htop, kill, uptime
  Systemd & Logs:      systemctl, journalctl
  Networking:          ip, ping, ss, netstat, curl
  Archives:            tar, gzip, gunzip
  Environment & Shell: export, env, printenv, history, clear, date, hostname, echo
  Pipelines & I/O:     cmd1 | cmd2, > out.txt, >> append.txt, 2>&1

Type 'man <command>' for manual pages.
`,
      stderr: '',
      exitCode: 0,
    };
  }

  private cmdMan(topic: string): CommandOutput {
    const manuals: Record<string, string> = {
      ls: `NAME
       ls - list directory contents
SYNOPSIS
       ls [OPTION]... [FILE]...
DESCRIPTION
       List information about the FILEs (the current directory by default).
       -a, --all
              do not ignore entries starting with .
       -l
              use a long listing format
       -h, --human-readable
              with -l, print sizes like 1K 234M 2G etc.`,
      grep: `NAME
       grep - print lines that match patterns
SYNOPSIS
       grep [OPTION...] PATTERNS [FILE...]
DESCRIPTION
       grep searches for PATTERNS in each FILE.
       -i, --ignore-case
              ignore case distinctions in patterns and input data
       -v, --invert-match
              select non-matching lines
       -n, --line-number
              prefix each line of output with line number`,
      chmod: `NAME
       chmod - change file mode bits
SYNOPSIS
       chmod [OPTION]... MODE[,MODE]... FILE...
DESCRIPTION
       chmod changes the file mode bits of each given file according to MODE.
       Numeric modes are from one to four octal digits (0-7), derived by adding
       up the bits with values 4 (read), 2 (write), and 1 (execute).`,
      find: `NAME
       find - search for files in a directory hierarchy
SYNOPSIS
       find [path...] [expression]
DESCRIPTION
       find searches the directory tree rooted at each given file name.
       -name pattern
              Base of file name matches shell pattern.
       -type c
              File is of type c: f for regular file, d for directory.`,
    };

    const text = manuals[topic];
    if (text) {
      return { stdout: `${text}\n`, stderr: '', exitCode: 0 };
    }
    return {
      stdout: `${topic.toUpperCase()}(1)                    User Commands                   ${topic.toUpperCase()}(1)

NAME
       ${topic} - command utility

SYNOPSIS
       ${topic} [OPTIONS] [ARGUMENTS]

DESCRIPTION
       Standard Linux POSIX utility for ${topic}. Refer to course modules for interactive practice.
`,
      stderr: '',
      exitCode: 0,
    };
  }
}
