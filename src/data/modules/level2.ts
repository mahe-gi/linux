import { CourseModule } from '@/types/course';

export const LEVEL_2_MODULES: CourseModule[] = [
  {
    id: 'mod-6',
    slug: 'io-streams-redirection-and-pipelines',
    levelId: 'level-2',
    moduleNumber: 6,
    title: 'Standard I/O Streams, Redirection & Pipeline Power',
    shortDescription:
      'Unlock the true superpower of Linux: stdin (0), stdout (1), stderr (2), >, >>, 2>&1, pipes (|), tee, and redirecting to /dev/null.',
    durationMinutes: 35,
    coreCommands: ['echo', 'cat', 'tee', 'grep'],
    theory: {
      overview:
        'In Linux, every process is launched with three default file descriptors: Standard Input (stdin, FD 0), Standard Output (stdout, FD 1), and Standard Error (stderr, FD 2). By default, stdin reads from your keyboard, while stdout and stderr write to your terminal screen. By redirecting these streams or piping stdout from one command into stdin of another, you can construct sophisticated data processing systems with zero programming.',
      keyConcepts: [
        {
          title: 'The Three Standard Streams',
          content:
            '- File Descriptor 0 (stdin): Accepts text input from the keyboard, files, or pipes.\n- File Descriptor 1 (stdout): Streams the primary normal output of a command.\n- File Descriptor 2 (stderr): Streams error messages and diagnostics separately from normal data, so errors are not accidentally consumed by pipelines.',
          diagramAscii: `           [ Keyboard / File / Pipe ]
                       |
                   (stdin: 0)
                       v
               +---------------+
               | Linux Process |
               +---------------+
                   /        \\
        (stdout: 1)          (stderr: 2)
             v                    v
      [ Terminal / File ]   [ Error Log / /dev/null ]`,
        },
        {
          title: 'Redirection Operators: >, >>, 2>, and 2>&1',
          content:
            '1. `command > file`: Overwrite standard output to `file`. If `file` exists, its previous content is wiped!\n2. `command >> file`: Append standard output to the end of `file` without erasing existing data.\n3. `command 2> error.log`: Redirect ONLY error messages (stderr) to `error.log` while letting stdout print to the terminal.\n4. `command > output.log 2>&1`: Combine both stdout and stderr into the same file.\n5. `command &> output.log`: Modern Bash shortcut for redirecting both stdout and stderr to `output.log`.\n6. `command < input.txt`: Feed the contents of `input.txt` into the stdin of `command`.',
        },
        {
          title: 'The Unix Pipeline (|) & tee',
          content:
            'The pipe character (`|`) connects the standard output (FD 1) of the command on the left directly to the standard input (FD 0) of the command on the right in memory via a kernel buffer, without writing temporary files to disk.\n\n`tee`: Takes standard input and writes it to BOTH the terminal display AND one or more files simultaneously:\n`uptime | tee server_status.txt`',
        },
      ],
      productionBestPractices: [
        'Be extremely careful with single `>` redirection! It truncates files instantly. If you intend to add a log entry, always use `>>`.',
        'When running cron jobs or background scripts, redirect noise to `/dev/null` or log files: `0 3 * * * /backup.sh > /var/log/backup.log 2>&1`.',
        'Use `tee -a` with `sudo` when appending to protected system files: `echo "192.168.1.50 api.local" | sudo tee -a /etc/hosts`. (Standard `sudo echo ... >> /etc/hosts` fails because the shell performs redirection before elevating privileges!).',
      ],
      commonPitfalls: [
        'Attempting `sudo echo "text" > /etc/protected_file`: This causes a "Permission denied" error because the redirection `>` is handled by your unprivileged shell, NOT by `sudo`!',
        'Accidentally wiping an important config file by typing `cat file > file`: The shell truncates the file to 0 bytes before `cat` even starts reading it!',
      ],
      realWorldScenario: {
        title: 'Production Log Filter & Incident Report Generation',
        situation:
          'A security audit requires extracting all failed authentication attempts from the last 24 hours and archiving them into a security report.',
        howLinuxHelps:
          'The security engineer executes: `cat /var/log/auth.log | grep "Failed password" | sort | uniq -c > /home/student/failed_logins_report.txt`. The entire analysis completes in a single line.',
      },
    },
    lab: {
      id: 'lab-6',
      title: 'Lab 6: Mastering Redirection & Pipelines',
      scenario:
        'You need to aggregate system host information into an inventory file, append additional services, and filter error logs using pipelines.',
      objective:
        'Create `/home/student/inventory.txt` using `echo` and `>`, append hostname info with `>>`, and pipeline `/etc/passwd` through `grep` to extract users.',
      tasks: [
        {
          id: 't1',
          instruction: 'Write "SYSTEM_ROLE=web-edge-proxy" into `/home/student/inventory.txt` using `>` redirection.',
          hint: 'Run: echo "SYSTEM_ROLE=web-edge-proxy" > inventory.txt',
          solutionCommand: 'echo "SYSTEM_ROLE=web-edge-proxy" > inventory.txt',
        },
        {
          id: 't2',
          instruction: 'Append "PRIMARY_ENV=production" to `/home/student/inventory.txt` using `>>`.',
          hint: 'Run: echo "PRIMARY_ENV=production" >> inventory.txt',
          solutionCommand: 'echo "PRIMARY_ENV=production" >> inventory.txt',
        },
        {
          id: 't3',
          instruction: 'Filter `/etc/passwd` for the keyword "student" and redirect the output to `/home/student/student_account.txt`.',
          hint: 'Run: grep "student" /etc/passwd > student_account.txt',
          solutionCommand: 'grep "student" /etc/passwd > student_account.txt',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'inventory.txt exists and contains both appended lines',
          checkType: 'file_content_contains',
          targetPath: '/home/student/inventory.txt',
          expectedValue: 'PRIMARY_ENV=production',
          failureMessage: 'File /home/student/inventory.txt does not contain PRIMARY_ENV=production.',
        },
        {
          id: 'v2',
          description: 'student_account.txt contains student account entry',
          checkType: 'file_content_contains',
          targetPath: '/home/student/student_account.txt',
          expectedValue: 'student:x:1000:1000',
          failureMessage: 'File /home/student/student_account.txt was not created or lacks student entry.',
        },
      ],
    },
    quiz: [
      {
        id: 'q6-1',
        question: 'Which file descriptor number corresponds to standard error (stderr)?',
        options: ['0', '1', '2', '3'],
        correctIndex: 2,
        explanation: '0 is stdin, 1 is stdout, and 2 is stderr.',
      },
      {
        id: 'q6-2',
        question: 'What is the crucial difference between `>` and `>>`?',
        options: [
          '`>` overwrites the destination file, while `>>` appends to the end of the file.',
          '`>` is for binary files, while `>>` is for text files.',
          '`>` runs in root mode, while `>>` runs in user mode.',
          '`>` prints to the screen, while `>>` deletes the source file.',
        ],
        correctIndex: 0,
        explanation: '`>` truncates/replaces existing content, whereas `>>` appends data without deleting existing lines.',
      },
      {
        id: 'q6-3',
        question: 'Why does `sudo echo "data" > /etc/protected` fail even if the user has sudo permissions?',
        options: [
          'Because echo is not a supported Linux command.',
          'Because the shell evaluates and opens the redirection target with current user privileges before running sudo.',
          'Because /etc files cannot contain the word "data".',
          'Because sudo is disabled for all echo commands.',
        ],
        correctIndex: 1,
        explanation:
          'The shell opens the redirection target `/etc/protected` as the current unprivileged user before passing execution to `sudo`. The solution is using `tee -a` with `sudo`.',
      },
    ],
    cheatSheet: [
      {
        name: '>',
        syntax: 'command > output.txt',
        description: 'Redirect standard output to a file (overwrites existing content).',
        commonFlags: [],
        realWorldExample: 'uptime > system_uptime.log',
        category: 'file-ops',
      },
      {
        name: '>>',
        syntax: 'command >> output.txt',
        description: 'Redirect standard output to a file (appends to end).',
        commonFlags: [],
        realWorldExample: 'echo "APP_VERSION=2.4.1" >> .env',
        category: 'file-ops',
      },
      {
        name: '2>&1',
        syntax: 'command > output.log 2>&1',
        description: 'Redirect standard error (2) into standard output (1) stream.',
        commonFlags: [],
        realWorldExample: './deploy.sh > deploy.log 2>&1',
        category: 'file-ops',
      },
      {
        name: '| (Pipe)',
        syntax: 'cmd1 | cmd2',
        description: 'Connect standard output of cmd1 to standard input of cmd2.',
        commonFlags: [],
        realWorldExample: 'cat /var/log/syslog | grep "ERROR" | wc -l',
        category: 'file-ops',
      },
    ],
  },
  {
    id: 'mod-7',
    slug: 'permissions-ownership-and-security',
    levelId: 'level-2',
    moduleNumber: 7,
    title: 'Linux Permissions, Ownership & Security Modes',
    shortDescription:
      'Demystify Linux security: read (4), write (2), execute (1), octal (755, 644, 600) vs symbolic (chmod u+x), chown, chgrp, umask, and special bits (SUID, SGID, Sticky bit).',
    durationMinutes: 40,
    coreCommands: ['chmod', 'chown', 'chgrp', 'umask', 'id'],
    theory: {
      overview:
        'Linux is a multi-user operating system engineered for isolation and security. Every file and directory on disk has an assigned owner, group, and access permission mode. Understanding permissions is vital for securing credentials, running web servers safely, and preventing unauthorized tampering.',
      keyConcepts: [
        {
          title: 'The Permission Triad: User, Group, and Others',
          content:
            'When you run `ls -l`, each file displays a 10-character string like `-rwxr-xr--`:\n- Character 1: File type (`-` regular file, `d` directory, `l` symlink).\n- Characters 2-4: Owner (User `u`) permissions.\n- Characters 5-7: Group (`g`) permissions.\n- Characters 8-10: Others (`o`) permissions (everyone else on the system).\n\nEach triplet contains:\n- `r` (Read): File content can be viewed; directory contents can be listed.\n- `w` (Write): File can be edited or deleted; directory can have files added/removed.\n- `x` (Execute): File can be run as a program/script; directory can be entered (`cd`).',
          diagramAscii: `  -   r w x   r - x   r - -
  |   |---|   |---|   |---|
Type  User    Group   Others
      (u)     (g)     (o)
     (4+2+1) (4+0+1) (4+0+0)
     = 7     = 5     = 4     => Mode: 754`,
        },
        {
          title: 'Numeric (Octal) Modes',
          content:
            'Each permission character has an exact numeric value:\n- Read (`r`) = 4\n- Write (`w`) = 2\n- Execute (`x`) = 1\n- None (`-`) = 0\n\nCommon production permission modes:\n- `755` (`rwxr-xr-x`): Standard for scripts, binaries, and public directories (Owner has full access, others can read/execute).\n- `644` (`rw-r--r--`): Standard for web files, HTML, configs (Owner can edit, others can read).\n- `600` (`rw-------`): Private files! Required for SSH private keys (`id_ed25519`) and database passwords.\n- `700` (`rwx------`): Private directory! Required for `~/.ssh/`.',
        },
        {
          title: 'Changing Permissions & Ownership',
          content:
            '- `chmod 600 config.env`: Set octal permissions.\n- `chmod u+x script.sh`: Add execute permission for the user owner.\n- `chmod -R 755 /var/www/html`: Recursively change permissions.\n- `chown student:www-data file.txt`: Change owner to `student` and group to `www-data`.\n- `chown -R www-data:www-data /var/www`: Recursively change directory ownership.',
        },
        {
          title: 'Special Bits: SUID, SGID, and the Sticky Bit',
          content:
            '- SUID (`chmod 4755`): Executes binary with permissions of file owner (e.g. `/usr/bin/passwd`).\n- SGID (`chmod 2755`): In directories, newly created files inherit the parent directory\'s group.\n- Sticky Bit (`chmod 1777`): On directories like `/tmp`, prevents users from deleting or renaming files owned by other users!',
        },
      ],
      productionBestPractices: [
        'NEVER run `chmod 777` in production! It allows any local user or compromised service to overwrite or execute malicious code.',
        'SSH strictly rejects private keys with permissive permissions: `chmod 600 ~/.ssh/id_rsa` and `chmod 700 ~/.ssh` are mandatory.',
        'Always verify user and group context with `id` before modifying system ownership.',
      ],
      commonPitfalls: [
        'Removing execute (`x`) permission from a directory: users cannot `cd` into or access files inside a directory without execute permissions, even if read (`r`) is enabled!',
        'Changing ownership recursively on system directories like `/` or `/usr`: this breaks the OS immediately.',
      ],
      realWorldScenario: {
        title: 'Securing Sensitive API Keys in Production',
        situation:
          'A developer commits an application `.env` file containing database credentials to a shared multi-tenant server. The file currently has permissions `666` (readable and writable by anyone).',
        howLinuxHelps:
          'The security engineer locks down the file immediately: `chmod 600 /home/student/projects/config.env` and sets `chown student:student /home/student/projects/config.env`. Now only the application process running as `student` can read the secret credentials.',
      },
    },
    lab: {
      id: 'lab-7',
      title: 'Lab 7: Hardening Sensitive File Permissions',
      scenario:
        'A security audit has flagged `/home/student/projects/config.env` because it contains production database passwords and must be locked down to owner-only read/write access (mode 600). Also, a deployment script `/home/student/scripts/healthcheck.sh` needs executable rights (mode 755).',
      objective:
        'Change `config.env` permissions to 600 using `chmod 600`, and make `healthcheck.sh` executable using `chmod 755`.',
      tasks: [
        {
          id: 't1',
          instruction: 'Run `ls -l projects/config.env` to inspect current permissions.',
          hint: 'Run: ls -l projects/config.env',
          solutionCommand: 'ls -l projects/config.env',
        },
        {
          id: 't2',
          instruction: 'Set `projects/config.env` permissions to 600 (read/write for owner only).',
          hint: 'Run: chmod 600 projects/config.env',
          solutionCommand: 'chmod 600 projects/config.env',
        },
        {
          id: 't3',
          instruction: 'Ensure `scripts/healthcheck.sh` has executable permissions using `chmod 755 scripts/healthcheck.sh`.',
          hint: 'Run: chmod 755 scripts/healthcheck.sh',
          solutionCommand: 'chmod 755 scripts/healthcheck.sh',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'config.env has 600 permissions',
          checkType: 'file_mode_equals',
          targetPath: '/home/student/projects/config.env',
          expectedValue: 0o600,
          failureMessage: 'File /home/student/projects/config.env does not have 600 permissions.',
        },
        {
          id: 'v2',
          description: 'healthcheck.sh has 755 permissions',
          checkType: 'file_mode_equals',
          targetPath: '/home/student/scripts/healthcheck.sh',
          expectedValue: 0o755,
          failureMessage: 'File /home/student/scripts/healthcheck.sh does not have 755 permissions.',
        },
      ],
    },
    quiz: [
      {
        id: 'q7-1',
        question: 'What numeric mode corresponds to `rwxr-xr-x`?',
        options: ['644', '755', '777', '600'],
        correctIndex: 1,
        explanation: 'User: 4+2+1=7; Group: 4+0+1=5; Others: 4+0+1=5 => 755.',
      },
      {
        id: 'q7-2',
        question: 'Why does SSH reject a private key if its permissions are set to `644`?',
        options: [
          'Because SSH only works with files starting with letter A.',
          'Because mode 644 allows others on the server to read your private key, creating a critical security vulnerability.',
          'Because private keys must have execute permissions.',
          'Because SSH keys can only be owned by root.',
        ],
        correctIndex: 1,
        explanation: 'SSH enforces strict file safety: private keys must be readable ONLY by the owner (mode 600).',
      },
      {
        id: 'q7-3',
        question: 'What happens if you remove execute (`x`) permission from a directory?',
        options: [
          'The directory becomes read-only.',
          'Users can no longer enter (`cd`) the directory or access files inside it.',
          'The directory is hidden from `ls`.',
          'The directory is automatically compressed.',
        ],
        correctIndex: 1,
        explanation: 'Execute permission on a directory governs traversal. Without `x`, you cannot `cd` into it.',
      },
    ],
    cheatSheet: [
      {
        name: 'chmod',
        syntax: 'chmod [OPTIONS] MODE FILE...',
        description: 'Change file mode bits (permissions).',
        commonFlags: [
          { flag: '-R', description: 'Change files and directories recursively' },
        ],
        realWorldExample: 'chmod 600 ~/.ssh/id_ed25519',
        category: 'security',
      },
      {
        name: 'chown',
        syntax: 'chown [OPTIONS] USER[:GROUP] FILE...',
        description: 'Change file owner and group.',
        commonFlags: [
          { flag: '-R', description: 'Operate on files and directories recursively' },
        ],
        realWorldExample: 'chown -R www-data:www-data /var/www/html',
        category: 'security',
      },
      {
        name: 'id',
        syntax: 'id [USER]',
        description: 'Print user and group IDs and groups for the effective user.',
        commonFlags: [
          { flag: '-u', description: 'Print only the effective user ID' },
          { flag: '-g', description: 'Print only the effective group ID' },
        ],
        realWorldExample: 'id student',
        category: 'security',
      },
    ],
  },
  {
    id: 'mod-8',
    slug: 'process-management-signals-and-jobs',
    levelId: 'level-2',
    moduleNumber: 8,
    title: 'Process Architecture, Signals & Job Control',
    shortDescription:
      'Manage running processes: ps aux, top/htop, background jobs (&, ctrl+z, bg, fg, jobs), signals (SIGTERM 15, SIGKILL 9, SIGHUP 1), and terminating rogue programs with kill.',
    durationMinutes: 35,
    coreCommands: ['ps', 'top', 'kill', 'uptime'],
    theory: {
      overview:
        'In Linux, everything that executes is a process with a unique Process Identifier (PID). The Linux kernel schedules processes across CPU cores, manages priority (nice values), and coordinates inter-process communication using signals. Being able to inspect process trees, monitor resource consumption, and gracefully terminate or reload services is central to systems operations.',
      keyConcepts: [
        {
          title: 'The Process Tree & PID 1',
          content:
            'When the Linux kernel boots, it initializes hardware and mounts the root filesystem, then spawns Process ID 1: `/sbin/init` (in modern systems, `systemd`). All subsequent processes are descendants (children) spawned via `fork()` and `exec()` system calls, forming a hierarchical tree.',
          diagramAscii: `                     systemd (PID 1)
                            |
         +------------------+------------------+
         |                  |                  |
      sshd (840)       nginx (1205)       cron (512)
         |
      bash (1840)
         |
    python3 (2104)`,
        },
        {
          title: 'Inspecting Processes with ps and top',
          content:
            '- `ps aux`: Snapshot of all running processes across all users:\n  * `a`: Show processes for all users.\n  * `u`: Display user/owner column, CPU%, and Memory%.\n  * `x`: Include processes without a controlling TTY (daemons and background services).\n- `top`: Real-time interactive dashboard displaying CPU load averages, memory utilization, and the top resource-consuming processes.\n- Process states in `ps`: `R` (Running), `S` (Sleeping), `D` (Uninterruptible sleep/disk I/O wait), `Z` (Zombie/defunct), `T` (Stopped).',
        },
        {
          title: 'Linux Signals & Terminating Processes',
          content:
            'Processes communicate using signals sent via the `kill` command:\n- `SIGTERM (15)`: Graceful termination request. The process can catch this signal, save state, flush open database connections, and exit cleanly. (Always try this first: `kill 2104` or `kill -15 2104`).\n- `SIGKILL (9)`: Immediate uncatchable kill! The kernel immediately frees process memory. Use only when a process hangs and ignores SIGTERM: `kill -9 2104`.\n- `SIGHUP (1)`: Hangup signal. Conventionally used by daemons (like nginx, sshd) to reload configuration files without restarting.',
        },
        {
          title: 'Job Control: Foreground vs Background',
          content:
            '- Append `&` to run a command in the background immediately: `python3 server.py &`.\n- Press `Ctrl + Z` to suspend a currently running foreground process.\n- Type `bg` to resume suspended job in background.\n- Type `fg` to bring background job back to foreground.\n- Type `jobs` to list jobs in the current shell session.',
        },
      ],
      productionBestPractices: [
        'Always attempt `kill -15` (SIGTERM) before `kill -9` (SIGKILL). Forcefully killing a database or write-heavy process with `-9` can corrupt database tables or leave stale lock files!',
        'Check load average using `uptime`: if load average exceeds the number of CPU cores, processes are queuing for CPU or waiting on slow disk I/O.',
        'Beware of Zombie (`Z`) processes: zombies have terminated but their parent process has not read their exit code with `wait()`. You cannot kill a zombie with `kill -9`; you must kill the parent process.',
      ],
      commonPitfalls: [
        'Confusing memory utilization with memory starvation: Linux aggressively uses free RAM as page cache (`buff/cache`). This is normal and good! Look at "available" memory, not "free" memory.',
        'Using `killall` blindly: `killall python` kills ALL python processes on the machine, including system background daemons!',
      ],
      realWorldScenario: {
        title: 'Triage and Terminate Runaway CPU Process',
        situation:
          'A web server CPU jumps to 100%. Web requests are timing out. The on-call engineer needs to identify the runaway process PID and stop it.',
        howLinuxHelps:
          'The engineer runs `ps aux | grep python` to locate the PID (`2104`), checks its CPU usage, and terminates it cleanly with `kill -15 2104`.',
      },
    },
    lab: {
      id: 'lab-8',
      title: 'Lab 8: Process Inspection & Termination',
      scenario:
        'A background Python web service with PID 2104 is running on port 8080. You need to inspect all running processes, verify its resource usage, and terminate the process gracefully.',
      objective:
        'Run `ps aux` to list processes, inspect the python3 service, and terminate PID 2104 using `kill`.',
      tasks: [
        {
          id: 't1',
          instruction: 'Execute `ps aux` to list all running processes on the system.',
          hint: 'Run: ps aux',
          solutionCommand: 'ps aux',
        },
        {
          id: 't2',
          instruction: 'Filter running processes for "python3" using `ps aux | grep python3`.',
          hint: 'Run: ps aux | grep python3',
          solutionCommand: 'ps aux | grep python3',
        },
        {
          id: 't3',
          instruction: 'Terminate the python3 process (PID 2104) using `kill 2104`.',
          hint: 'Run: kill 2104',
          solutionCommand: 'kill 2104',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'User inspected processes with ps',
          checkType: 'command_executed_match',
          expectedValue: 'ps',
          failureMessage: 'Run `ps aux` to inspect processes.',
        },
        {
          id: 'v2',
          description: 'User killed process 2104',
          checkType: 'command_executed_match',
          expectedValue: 'kill',
          failureMessage: 'Execute `kill 2104` to terminate the process.',
        },
      ],
    },
    quiz: [
      {
        id: 'q8-1',
        question: 'Which signal should always be sent first when stopping a process to allow it to clean up gracefully?',
        options: ['SIGKILL (Signal 9)', 'SIGTERM (Signal 15)', 'SIGSTOP (Signal 19)', 'SIGINT (Signal 2)'],
        correctIndex: 1,
        explanation: 'SIGTERM (15) asks the process to exit gracefully, flush buffers, and close open database sockets.',
      },
      {
        id: 'q8-2',
        question: 'What is the role of PID 1 in a Linux operating system?',
        options: [
          'It is the web browser process.',
          'It is the root/init process (systemd) that is the ancestor of all other processes.',
          'It is a backup copy of the kernel.',
          'It is the process that formats the hard drive.',
        ],
        correctIndex: 1,
        explanation: 'PID 1 (init/systemd) is the first user-space process started by the kernel, responsible for launching and supervising all services.',
      },
      {
        id: 'q8-3',
        question: 'How do you resume a suspended (`Ctrl+Z`) job in the background?',
        options: ['resume', 'bg', 'fg', 'start'],
        correctIndex: 1,
        explanation: 'The `bg` command resumes suspended jobs in the background.',
      },
    ],
    cheatSheet: [
      {
        name: 'ps',
        syntax: 'ps [OPTIONS]',
        description: 'Report a snapshot of the current processes.',
        commonFlags: [
          { flag: 'aux', description: 'Show all running processes with user, CPU%, memory%, and command' },
          { flag: '-ef', description: 'Standard full format listing of all processes' },
        ],
        realWorldExample: 'ps aux | grep nginx',
        category: 'system',
      },
      {
        name: 'kill',
        syntax: 'kill [OPTIONS] PID...',
        description: 'Send a signal to specified process IDs.',
        commonFlags: [
          { flag: '-15', description: 'Send SIGTERM (graceful termination)' },
          { flag: '-9', description: 'Send SIGKILL (immediate force kill)' },
          { flag: '-1', description: 'Send SIGHUP (reload configuration)' },
        ],
        realWorldExample: 'kill -15 1205',
        category: 'system',
      },
      {
        name: 'uptime',
        syntax: 'uptime',
        description: 'Tell how long the system has been running and show 1, 5, 15 minute load averages.',
        commonFlags: [],
        realWorldExample: 'uptime',
        category: 'system',
      },
    ],
  },
  {
    id: 'mod-9',
    slug: 'environment-variables-and-shell-profiles',
    levelId: 'level-2',
    moduleNumber: 9,
    title: 'Environment Variables, Shell Config & Customization',
    shortDescription:
      'Configure shell runtime: export, env, printenv, $PATH resolution mechanics, ~/.bashrc, ~/.profile, custom aliases, and persistent system configuration.',
    durationMinutes: 30,
    coreCommands: ['export', 'env', 'printenv'],
    theory: {
      overview:
        'Environment variables are dynamic key-value pairs stored in memory that influence the behavior of running processes and child commands. From locating executable programs via `$PATH` to determining database endpoints via `$DATABASE_URL`, managing the Linux shell environment is foundational to 12-factor application architecture and cloud engineering.',
      keyConcepts: [
        {
          title: 'Shell Variables vs Environment Variables',
          content:
            '- Local Shell Variable: `MY_VAR="hello"` is visible ONLY to the current shell process. Child processes spawned by the shell do NOT inherit it.\n- Exported Environment Variable: `export MY_VAR="hello"` marks the variable for export. All child processes, scripts, and programs launched from this shell inherit a copy of the variable.',
        },
        {
          title: 'The Critical $PATH Variable',
          content:
            'When you type `python3` or `ls`, Linux does not search the entire disk. It scans the colon-separated directory list in `$PATH` from left to right:\n`/usr/local/bin:/usr/bin:/bin`\n\nThe first directory containing an executable matching the command name wins! To add a custom scripts directory to `$PATH` permanently, append this to `~/.bashrc`:\n`export PATH="$HOME/scripts:$PATH"`',
        },
        {
          title: 'Login vs Non-Login Shell Startup Files',
          content:
            '- Login Shell (SSH login, console login): Executes `/etc/profile`, then `~/.bash_profile` or `~/.profile` once upon logging in.\n- Interactive Non-Login Shell (new terminal window, tmux pane): Executes `~/.bashrc`.\n\nBest practice: Put environment variables in `~/.profile` and interactive shortcuts, aliases, and prompt settings in `~/.bashrc`.',
        },
        {
          title: 'Aliases for Productivity',
          content:
            'Aliases create custom shortcuts for long or dangerous commands:\n- `alias ll="ls -lah --color=auto"`\n- `alias rm="rm -i"` (prompts before deleting)\n- `alias ports="ss -tulnp"`',
        },
      ],
      productionBestPractices: [
        'Always prepend, rather than append, your custom paths to `$PATH` if you want local versions to override system defaults: `export PATH="/opt/node/bin:$PATH"`.',
        'Do not store plain-text secrets directly inside git-tracked dotfiles (`.bashrc`). Use environment file managers like `direnv` or secrets managers (HashiCorp Vault, AWS Secrets Manager).',
        'Reload shell configurations without logging out using `source ~/.bashrc`.',
      ],
      commonPitfalls: [
        'Overwriting `$PATH` by forgetting `$PATH` in the assignment: running `export PATH=/my/bin` wipes out `/usr/bin` and `/bin`, immediately breaking commands like `ls`, `cat`, and `sudo`!',
        'Putting spaces around `=` when assigning variables in Bash.',
      ],
      realWorldScenario: {
        title: 'Microservice Database Configuration via 12-Factor Env',
        situation:
          'A containerized web service needs to switch from local development to production database without modifying code.',
        howLinuxHelps:
          'The engineer defines `export DATABASE_URL="postgres://prod_user:secret@10.0.1.5:5432/orders"` and launches the app. The service reads the connection string directly from its environment.',
      },
    },
    lab: {
      id: 'lab-9',
      title: 'Lab 9: Environment Configuration & Variables',
      scenario:
        'You need to configure an application runtime environment by exporting a custom environment variable, verifying active variables, and testing path resolution.',
      objective:
        'Export `APP_ENV=production` using `export`, verify with `env`, and inspect the current `$PATH`.',
      tasks: [
        {
          id: 't1',
          instruction: 'Export the environment variable `APP_ENV` with value `production`.',
          hint: 'Run: export APP_ENV=production',
          solutionCommand: 'export APP_ENV=production',
        },
        {
          id: 't2',
          instruction: 'Print the value of `APP_ENV` to the terminal using `echo $APP_ENV`.',
          hint: 'Run: echo $APP_ENV',
          solutionCommand: 'echo $APP_ENV',
        },
        {
          id: 't3',
          instruction: 'Display the system search path using `echo $PATH`.',
          hint: 'Run: echo $PATH',
          solutionCommand: 'echo $PATH',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'User ran export command',
          checkType: 'command_executed_match',
          expectedValue: 'export',
          failureMessage: 'Execute `export APP_ENV=production` to set the environment variable.',
        },
      ],
    },
    quiz: [
      {
        id: 'q9-1',
        question: 'What is the purpose of the `export` command in Bash?',
        options: [
          'It sends files to an external cloud server.',
          'It makes a shell variable available to child processes and subshells.',
          'It compresses variables to save RAM.',
          'It deletes old variables from ~/.bashrc.',
        ],
        correctIndex: 1,
        explanation: '`export` marks a shell variable so that it is inherited by any child processes spawned by that shell.',
      },
      {
        id: 'q9-2',
        question: 'What does the `$PATH` environment variable store?',
        options: [
          'A list of recently visited websites.',
          'A colon-separated list of directories searched by the shell to find executable binaries.',
          'The location of the user\'s desktop wallpaper.',
          'The file path to the Linux kernel image.',
        ],
        correctIndex: 1,
        explanation: '`$PATH` contains the colon-separated directory paths that the shell searches when resolving command names.',
      },
      {
        id: 'q9-3',
        question: 'Which file is executed every time a new interactive non-login Bash shell is opened?',
        options: ['~/.bashrc', '/etc/shadow', '~/.ssh/config', '/boot/grub/grub.cfg'],
        correctIndex: 0,
        explanation: '`~/.bashrc` is the per-user configuration file executed for interactive non-login shells.',
      },
    ],
    cheatSheet: [
      {
        name: 'export',
        syntax: 'export VAR=value',
        description: 'Set an environment variable and mark it for export to child processes.',
        commonFlags: [],
        realWorldExample: 'export NODE_ENV=production',
        category: 'system',
      },
      {
        name: 'env',
        syntax: 'env',
        description: 'Print all exported environment variables.',
        commonFlags: [],
        realWorldExample: 'env | grep -i path',
        category: 'system',
      },
      {
        name: 'source',
        syntax: 'source ~/.bashrc (or . ~/.bashrc)',
        description: 'Execute commands from a file in the current shell environment.',
        commonFlags: [],
        realWorldExample: 'source ~/.bashrc',
        category: 'system',
      },
    ],
  },
  {
    id: 'mod-10',
    slug: 'archive-packaging-and-compression',
    levelId: 'level-2',
    moduleNumber: 10,
    title: 'Archive Packaging & Compression Mastery',
    shortDescription:
      'Bundle and compress data: tar (Tape Archive) flags -czvf and -xzvf, gzip, gunzip, zip, unzip, and creating reliable backups.',
    durationMinutes: 30,
    coreCommands: ['tar', 'gzip'],
    theory: {
      overview:
        'Archiving bundles multiple files and directory structures into a single file while preserving permissions and timestamps. Compression reduces the size of that archive using mathematical algorithms (DEFLATE, bzip2, xz). In Linux, the standard tool is `tar` (Tape Archive), paired with compression utilities like `gzip`.',
      keyConcepts: [
        {
          title: 'Archiving vs Compression',
          content:
            '- Archiving: Takes a directory with 10,000 files and packs them into a single `archive.tar` file. The file size is roughly the same as the sum of all individual files.\n- Compression: Takes a file and shrinks its byte size. Gzip compresses a single file into `file.gz`.\n- The Standard Combo (.tar.gz or .tgz): Tar bundles the directory tree, and gzip compresses the resulting stream into a compact `.tar.gz` archive.',
        },
        {
          title: 'The Essential tar Flags',
          content:
            '- Create Archive (`-c`):\n  `tar -czvf backup.tar.gz /home/student/projects/`\n  * `c`: Create a new archive.\n  * `z`: Compress using gzip.\n  * `v`: Verbose (list files as they are archived).\n  * `f`: File name of the archive (MUST be immediately followed by the filename!).\n\n- Extract Archive (`-x`):\n  `tar -xzvf backup.tar.gz -C /opt/restore/`\n  * `x`: Extract files from archive.\n  * `-C <dir>`: Change to specified directory before extracting.\n\n- List Archive Contents without extracting (`-t`):\n  `tar -tzvf backup.tar.gz`',
          diagramAscii: `  [ File 1 ] + [ File 2 ] + [ Directory ]
                     |
                 (tar -cf)
                     v
             [ Combined .tar ]
                     |
                (gzip / -z)
                     v
        [ Compressed .tar.gz / .tgz ]`,
        },
        {
          title: 'Modern Compression Formats Compared',
          content:
            '- gzip (`.gz`): Fast compression and decompression speed; industry standard for logs and web traffic.\n- bzip2 (`.bz2`, `-j` flag in tar): Slower, higher compression ratio.\n- xz (`.xz`, `-J` flag in tar): Highest compression ratio; standard for Linux kernel sources and OS ISO packages.',
        },
      ],
      productionBestPractices: [
        'Always place the `f` flag last in the option cluster before the archive name: `tar -czvf backup.tar.gz` (never `tar -cfzv backup.tar.gz`, because `tar` would interpret `z` as the filename!).',
        'Inspect an unfamiliar archive before extracting it using `tar -tf archive.tar.gz` to ensure it doesn\'t extract thousands of loose files into your current directory (a "tar bomb").',
        'Use `-p` with tar when backing up system directories to preserve exact permissions and ACLs.',
      ],
      commonPitfalls: [
        'Extracting an archive with relative paths into the wrong working directory.',
        'Using `gzip` directly on a directory: `gzip` can only compress individual files; use `tar -czf` for directories.',
      ],
      realWorldScenario: {
        title: 'Nightly Disaster Recovery Backup Automation',
        situation:
          'Before applying database schema changes, an engineer must create an immutable compressed snapshot of the application codebase.',
        howLinuxHelps:
          'The engineer runs `tar -czvf /mnt/storage/app_backup_$(date +%F).tar.gz /home/student/projects`. The entire codebase is safely archived in seconds.',
      },
    },
    lab: {
      id: 'lab-10',
      title: 'Lab 10: Creating and Extracting Backups',
      scenario:
        'You need to create a compressed backup archive of `/home/student/projects` named `/home/student/backup.tar.gz`.',
      objective:
        'Create a gzip-compressed tar archive using `tar -czf backup.tar.gz projects`, and verify the archive exists.',
      tasks: [
        {
          id: 't1',
          instruction: 'Ensure you are in `/home/student` by running `cd ~`.',
          hint: 'Run: cd ~',
          solutionCommand: 'cd ~',
        },
        {
          id: 't2',
          instruction: 'Create a compressed tar archive of `projects` named `backup.tar.gz` using `tar -czf backup.tar.gz projects`.',
          hint: 'Run: tar -czf backup.tar.gz projects',
          solutionCommand: 'tar -czf backup.tar.gz projects',
        },
        {
          id: 't3',
          instruction: 'Verify that `backup.tar.gz` exists in your home directory using `ls -lh backup.tar.gz`.',
          hint: 'Run: ls -lh backup.tar.gz',
          solutionCommand: 'ls -lh backup.tar.gz',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'backup.tar.gz exists in /home/student',
          checkType: 'file_exists',
          targetPath: '/home/student/backup.tar.gz',
          failureMessage: 'File /home/student/backup.tar.gz was not created.',
        },
      ],
    },
    quiz: [
      {
        id: 'q10-1',
        question: 'Which flag combination creates a gzip-compressed tar archive with verbose output?',
        options: ['-xzvf', '-czvf', '-tzvf', '-rzvf'],
        correctIndex: 1,
        explanation: '`-c` creates, `-z` compresses with gzip, `-v` is verbose, and `-f` specifies the archive file.',
      },
      {
        id: 'q10-2',
        question: 'How do you extract a `.tar.gz` archive into a specific target directory `/opt/app`?',
        options: [
          'tar -xzvf archive.tar.gz --to /opt/app',
          'tar -xzvf archive.tar.gz -C /opt/app',
          'tar -extract archive.tar.gz /opt/app',
          'untar archive.tar.gz > /opt/app',
        ],
        correctIndex: 1,
        explanation: '`-C <directory>` instructs tar to change to that directory before performing extraction.',
      },
      {
        id: 'q10-3',
        question: 'What is a "tar bomb"?',
        options: [
          'An archive containing a virus.',
          'An archive that extracts hundreds of files directly into the current directory without containing them in a parent folder.',
          'An archive that deletes files upon extraction.',
          'A corrupted gzip header.',
        ],
        correctIndex: 1,
        explanation: 'A tar bomb refers to an archive created without a root directory wrapper, littering the destination folder with files.',
      },
    ],
    cheatSheet: [
      {
        name: 'tar -czvf',
        syntax: 'tar -czvf archive.tar.gz /path/to/dir',
        description: 'Create a new gzip-compressed tar archive.',
        commonFlags: [
          { flag: '-c', description: 'Create archive' },
          { flag: '-z', description: 'Filter archive through gzip' },
          { flag: '-v', description: 'Verbosely list files processed' },
          { flag: '-f FILE', description: 'Use archive file FILE' },
        ],
        realWorldExample: 'tar -czvf site_backup.tar.gz /var/www/html',
        category: 'file-ops',
      },
      {
        name: 'tar -xzvf',
        syntax: 'tar -xzvf archive.tar.gz [-C /dest]',
        description: 'Extract files from a gzip-compressed tar archive.',
        commonFlags: [
          { flag: '-x', description: 'Extract files from archive' },
          { flag: '-C DIR', description: 'Change to DIR before performing any operations' },
        ],
        realWorldExample: 'tar -xzvf site_backup.tar.gz -C /var/www/html',
        category: 'file-ops',
      },
      {
        name: 'gzip',
        syntax: 'gzip [OPTIONS] FILE...',
        description: 'Compress individual files with the Lempel-Ziv coding (LZ77).',
        commonFlags: [
          { flag: '-d', description: 'Decompress (equivalent to gunzip)' },
        ],
        realWorldExample: 'gzip access.log',
        category: 'file-ops',
      },
    ],
  },
];
