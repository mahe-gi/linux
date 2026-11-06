import { CourseModule } from '@/types/course';

export const LEVEL_1_MODULES: CourseModule[] = [
  {
    id: 'mod-1',
    slug: 'unix-linux-architecture-and-philosophy',
    levelId: 'level-1',
    moduleNumber: 1,
    title: 'Linux Architecture & The Unix Philosophy',
    shortDescription:
      'Understand the OS hierarchy from kernel to user space, the Unix philosophy of small composable tools, and how modern distributions (Ubuntu, Debian, RHEL) differ.',
    durationMinutes: 25,
    coreCommands: ['uname', 'whoami', 'hostname', 'clear'],
    theory: {
      overview:
        'Linux is the bedrock of modern software engineering, powering over 90% of the world’s top 1 million servers, cloud infrastructure, Android devices, and supercomputers. At its core, Linux adheres to Unix principles formulated in 1969: write programs that do one thing and do it well, write programs that work together, and treat everything as a stream of bytes or a file.',
      keyConcepts: [
        {
          title: 'The Operating System Layers',
          content:
            'A modern Linux operating system consists of four distinct layers:\n1. Hardware: The physical CPU, memory, storage devices, and network interfaces.\n2. Linux Kernel: The core heart of the OS. It manages memory, schedules CPU threads, interacts with device drivers, and enforces security boundaries.\n3. The Shell & System Libraries (glibc): The interface that interprets your commands and provides standard POSIX system calls (like open(), read(), write(), fork()).\n4. User Applications & Daemons: Web servers (nginx), databases (postgres), command-line utilities (ls, grep), and user processes.',
          diagramAscii: `+---------------------------------------------------+
|     User Space: Applications, CLI Tools, Daemons  |
|          (bash, nginx, git, python3, ssh)         |
+---------------------------------------------------+
|     System Calls Interface & Standard C Library   |
+---------------------------------------------------+
|                   LINUX KERNEL                    |
|   [Process Mgmt]  [Memory Mgmt]  [VFS & Storage]  |
|   [Network Stack] [Device Drivers]  [Security]    |
+---------------------------------------------------+
|               PHYSICAL HARDWARE                   |
|       (CPU, RAM, NVMe/SSD, NIC, GPU)              |
+---------------------------------------------------+`,
        },
        {
          title: 'The Three Golden Tenets of Unix Philosophy',
          content:
            '1. "Do One Thing Well": Rather than building monolithic programs, write small, focused utilities. (e.g. `grep` searches, `wc` counts, `sort` orders).\n2. "Composable via Text Streams": Programs read plain text from standard input and write plain text to standard output. By piping stdout into stdin (`|`), you can assemble complex data pipelines in seconds without compiling code.\n3. "Everything is a File": Hard drives, terminal windows, network sockets, running process statistics (`/proc`), and hardware devices (`/dev/sda`) are all exposed as file descriptors.',
        },
        {
          title: 'Distributions (Distros) Ecosystem',
          content:
            'The Linux kernel is open-source. Companies and communities bundle the kernel with package managers, system tools, and default configs to create distributions:\n- Debian Family (Debian, Ubuntu, Linux Mint): Uses `apt` and `.deb` packages. Dominates cloud deployments and container base images.\n- Red Hat Family (RHEL, Fedora, Rocky, Alma): Uses `dnf`/`rpm` packages and enforces SELinux. Ubiquitous in enterprise data centers and banking.\n- SUSE Family (SLES, openSUSE): Uses `zypper` and YaST.\n- Lightweight/Specialized (Alpine Linux, Arch): Alpine uses `musl` and `apk` for minimal 5MB Docker containers; Arch uses rolling-release `pacman`.',
        },
      ],
      productionBestPractices: [
        'Always check the kernel version and OS release using `uname -r` and `cat /etc/os-release` when logging into an unfamiliar production machine.',
        'Never run day-to-day administrative tasks directly as the `root` superuser; always use `sudo` with dedicated audit logging.',
        'Prefer long-term support (LTS) distributions for production workloads (e.g., Ubuntu 24.04 LTS or RHEL 9) to ensure stability and security patches.',
      ],
      commonPitfalls: [
        'Confusing Linux with Unix: Linux is a Unix-like operating system written from scratch by Linus Torvalds in 1991, not a direct descendant of the original AT&T Unix source code.',
        'Assuming all Linux distros have identical file paths: while the Filesystem Hierarchy Standard (FHS) aligns them closely, system configuration files can differ between Debian and RHEL.',
      ],
      realWorldScenario: {
        title: 'Cloud Instance Provisioning & Kernel Verification',
        situation:
          'A site reliability engineer provisions an automated cloud instance to run a low-latency trading microservice requiring eBPF tracing capabilities.',
        howLinuxHelps:
          'The engineer inspects the OS release with `uname -a` and verifies kernel 6.x+ is loaded to confirm that advanced eBPF ring buffers and modern socket options are supported before deploying the container cluster.',
      },
    },
    lab: {
      id: 'lab-1',
      title: 'Lab 1: System Inspection & Shell Basics',
      scenario:
        'You have logged into a remote Linux server via SSH for the first time. Your lead engineer asks you to audit the operating system version, verify the current user context, and record the machine hostname.',
      objective:
        'Run `uname -a` to inspect the kernel, verify who you are with `whoami`, check the server hostname with `hostname`, and inspect the OS distribution info.',
      tasks: [
        {
          id: 't1',
          instruction: 'Execute `uname -a` in the terminal to inspect the complete kernel architecture and release info.',
          hint: 'Type "uname -a" and press Enter.',
          solutionCommand: 'uname -a',
        },
        {
          id: 't2',
          instruction: 'Run `whoami` to check the current username you are operating under.',
          hint: 'Type "whoami" and press Enter.',
          solutionCommand: 'whoami',
        },
        {
          id: 't3',
          instruction: 'Run `hostname` to verify the system network name.',
          hint: 'Type "hostname" and press Enter.',
          solutionCommand: 'hostname',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'User executed uname -a',
          checkType: 'command_executed_match',
          expectedValue: 'uname',
          failureMessage: 'Please run the uname command (e.g. `uname -a`) to inspect the kernel.',
        },
        {
          id: 'v2',
          description: 'User verified identity with whoami',
          checkType: 'command_executed_match',
          expectedValue: 'whoami',
          failureMessage: 'Run `whoami` in the terminal to verify your user identity.',
        },
      ],
    },
    quiz: [
      {
        id: 'q1-1',
        question: 'Which of the following describes the relationship between the Linux kernel and the Shell?',
        options: [
          'The Shell runs inside the CPU microcode and controls the kernel directly.',
          'The kernel manages hardware and processes, while the Shell is a user-space program that translates user commands into kernel system calls.',
          'The kernel is an optional graphical interface for the Shell.',
          'The Shell and the kernel are identical programs compiled into a single binary.',
        ],
        correctIndex: 1,
        explanation:
          'The Linux kernel operates in privileged supervisor mode managing memory and hardware, while the Shell runs in user space interpreting user input and invoking kernel system calls.',
      },
      {
        id: 'q1-2',
        question: 'Which core tenet of the Unix philosophy enables complex command line automation?',
        options: [
          'Monolithic design where one command performs every task.',
          'Binary proprietary IPC protocol between commands.',
          'Composable tools that read text from stdin and write text to stdout.',
          'Requiring an X11 graphical display server for all utilities.',
        ],
        correctIndex: 2,
        explanation:
          'Unix tools are designed to do one thing well and communicate via universal plain-text byte streams using pipes (`|`).',
      },
      {
        id: 'q1-3',
        question: 'What command displays the operating system kernel name, hostname, kernel release version, and machine architecture all in one line?',
        options: ['uname -a', 'os -all', 'kernel --show', 'sysinfo -v'],
        correctIndex: 0,
        explanation:
          '`uname -a` prints all system information including kernel name, network nodename, kernel release, kernel version, machine architecture, and operating system.',
      },
    ],
    cheatSheet: [
      {
        name: 'uname',
        syntax: 'uname [OPTIONS]',
        description: 'Print operating system name and system information.',
        commonFlags: [
          { flag: '-a', description: 'Print all system info (kernel, hostname, architecture)' },
          { flag: '-r', description: 'Print the kernel release version (e.g. 6.8.0-40-generic)' },
          { flag: '-m', description: 'Print the hardware architecture (e.g. x86_64, aarch64)' },
        ],
        realWorldExample: 'uname -r',
        category: 'system',
      },
      {
        name: 'whoami',
        syntax: 'whoami',
        description: 'Print the effective username of the currently logged-in user.',
        commonFlags: [],
        realWorldExample: 'whoami',
        category: 'security',
      },
      {
        name: 'hostname',
        syntax: 'hostname [OPTIONS]',
        description: 'Show or configure the system host name.',
        commonFlags: [
          { flag: '-I', description: 'Display all network IP addresses assigned to the host' },
        ],
        realWorldExample: 'hostname -I',
        category: 'networking',
      },
      {
        name: 'clear',
        syntax: 'clear',
        description: 'Clear the terminal screen buffer.',
        commonFlags: [],
        realWorldExample: 'clear',
        category: 'system',
      },
    ],
  },
  {
    id: 'mod-2',
    slug: 'shell-environment-and-command-anatomy',
    levelId: 'level-1',
    moduleNumber: 2,
    title: 'The Shell Environment & Command Anatomy',
    shortDescription:
      'Master command syntax (command, options, arguments), understand exit status codes ($?), navigate history with reverse search, and leverage tab auto-completion.',
    durationMinutes: 30,
    coreCommands: ['echo', 'history', 'type', 'which'],
    theory: {
      overview:
        'When you open a terminal in Linux, you are interacting with a Command Line Interpreter (typically GNU Bash or Zsh). Mastering the exact mechanics of command execution—how the shell splits tokens, distinguishes flags from targets, evaluates variables, and reports success or failure via exit codes—is the foundation of becoming a high-velocity engineer.',
      keyConcepts: [
        {
          title: 'The Anatomy of a Linux Command',
          content:
            'Every standard Linux command adheres to this structure:\n`command [OPTIONS...] [ARGUMENTS...]`\n\n- Command: The executable program or shell builtin (e.g., `ls`, `grep`, `cd`).\n- Options (Flags / Switches): Modify the behavior of the command.\n  * Short options: Single hyphen with a single letter (e.g., `ls -l`, `ls -a`, or combined `ls -la`).\n  * Long options: Double hyphens with descriptive words (e.g., `ls --all`, `ls --human-readable`).\n- Arguments (Operands): The targets on which the command acts, such as files, directories, text strings, or network addresses.',
          diagramAscii: `        ls       -l   -a       /var/log
       |---|    |-------|     |--------|
      Command    Options       Argument
     (Program)   (Flags)       (Target)`,
        },
        {
          title: 'Exit Status Codes ($?)',
          content:
            'Every program executed in Linux returns an integer exit code (from 0 to 255) to the operating system upon termination:\n- `0`: Success (Zero errors).\n- `1 - 255`: Failure or specific error state (e.g., `1` for general errors, `2` for misuse of shell builtins, `126` for command cannot execute, `127` for command not found).\n\nYou can inspect the exit code of the immediately preceding command by reading the special variable `$?` using `echo $?`. In CI/CD pipelines (GitHub Actions, GitLab CI), an exit code other than 0 immediately fails the build.',
        },
        {
          title: 'Shell Builtins vs External Binaries',
          content:
            'Commands fall into two main categories:\n1. Builtin commands: Implemented directly inside the shell process itself for speed and environment control (e.g. `cd`, `echo`, `pwd`, `export`, `exit`). Running `cd` must be a builtin because an external process cannot change the working directory of its parent shell.\n2. External binaries: Compiled executable files located on disk in directories listed in `$PATH` (e.g., `/usr/bin/python3`, `/bin/ls`, `/usr/bin/curl`).\n\nUse `type <command>` to find out whether a command is a builtin, alias, or file path.',
        },
      ],
      productionBestPractices: [
        'In automation scripts, always chain dependent commands with `&&` (logical AND) rather than `;` so execution halts if a prerequisite fails (e.g. `cd /app && ./start.sh`).',
        'Learn the essential Bash shortcut keys: `Ctrl + C` (kill current process), `Ctrl + L` (clear screen), `Ctrl + R` (reverse history search), and `Tab` (auto-complete).',
        'Never write passwords or API secrets directly into interactive terminal commands, as they are recorded in `~/.bash_history` in plain text.',
      ],
      commonPitfalls: [
        'Spaces around the equals sign in variable assignments: in Bash, `FOO=bar` sets a variable, but `FOO = bar` tries to run a command named `FOO` with arguments `=` and `bar`!',
        'Assuming a command succeeded without verifying its exit code in scripts.',
      ],
      realWorldScenario: {
        title: 'CI/CD Deployment Pipeline Validation',
        situation:
          'A deployment script executes a database migration before restarting web containers. If the migration fails, the container restart must NOT proceed.',
        howLinuxHelps:
          'The engineer uses `npm run migrate && systemctl restart webapp`. If the migration binary returns exit code `1`, the shell does not execute the restart, preventing a severe database schema mismatch outage.',
      },
    },
    lab: {
      id: 'lab-2',
      title: 'Lab 2: Command Anatomy & Exit Codes',
      scenario:
        'You are tasked with debugging a script failure on an application server. You need to inspect environment variables, run commands with combined flags, and verify command exit codes using `$?`.',
      objective:
        'Print a custom message with `echo`, check the exit status `$?`, run `history` to review commands, and use `type` to identify command types.',
      tasks: [
        {
          id: 't1',
          instruction: 'Use `echo` to print the string "Deploying Linux Box v1" to stdout.',
          hint: 'Type: echo "Deploying Linux Box v1"',
          solutionCommand: 'echo "Deploying Linux Box v1"',
        },
        {
          id: 't2',
          instruction: 'Inspect the exit code of your last command using `echo $?`. It should return 0 for success.',
          hint: 'Type: echo $?',
          solutionCommand: 'echo $?',
        },
        {
          id: 't3',
          instruction: 'Run `history` to inspect the list of commands entered so far.',
          hint: 'Type: history',
          solutionCommand: 'history',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'User tested echo command',
          checkType: 'command_executed_match',
          expectedValue: 'echo',
          failureMessage: 'Run the echo command to print output.',
        },
        {
          id: 'v2',
          description: 'User checked history',
          checkType: 'command_executed_match',
          expectedValue: 'history',
          failureMessage: 'Execute `history` to view the list of recorded terminal commands.',
        },
      ],
    },
    quiz: [
      {
        id: 'q2-1',
        question: 'What does an exit status code of 0 mean in Linux?',
        options: [
          'The command timed out.',
          'The command completed successfully without errors.',
          'The command was cancelled by the user.',
          'The command returned zero bytes of data.',
        ],
        correctIndex: 1,
        explanation: 'In Unix conventions, an exit code of 0 strictly denotes successful termination.',
      },
      {
        id: 'q2-2',
        question: 'Why is `cd` built directly into the shell rather than existing as an external binary file in /usr/bin/cd?',
        options: [
          'Because disk access would make changing directories too slow.',
          'Because an external child process cannot modify the current working directory of its parent shell.',
          'Because external binaries cannot take directory arguments.',
          'Because the Linux kernel forbids external programs from reading directory names.',
        ],
        correctIndex: 1,
        explanation:
          'When an external binary executes, it runs in a child process. A child process cannot alter the environment or working directory of its parent shell process.',
      },
      {
        id: 'q2-3',
        question: 'What special shell variable stores the exit code of the most recently executed command?',
        options: ['$#', '$$', '$?', '$!'],
        correctIndex: 2,
        explanation:
          '`$?` holds the exit status of the most recently executed foreground pipeline or command.',
      },
    ],
    cheatSheet: [
      {
        name: 'echo',
        syntax: 'echo [OPTIONS] [STRING...]',
        description: 'Display a line of text to standard output.',
        commonFlags: [
          { flag: '-n', description: 'Do not output the trailing newline' },
          { flag: '-e', description: 'Enable interpretation of backslash escapes (e.g. \\n, \\t)' },
        ],
        realWorldExample: 'echo "DATABASE_PORT=5432" >> .env',
        category: 'file-ops',
      },
      {
        name: 'history',
        syntax: 'history [n]',
        description: 'Display the command history list with line numbers.',
        commonFlags: [
          { flag: '-c', description: 'Clear the history list' },
          { flag: '-w', description: 'Write current history to the history file (~/.bash_history)' },
        ],
        realWorldExample: 'history | grep docker',
        category: 'system',
      },
      {
        name: 'which',
        syntax: 'which [COMMAND...]',
        description: 'Locate a command and print the full path of the executable binary found in $PATH.',
        commonFlags: [
          { flag: '-a', description: 'Print all matching pathnames of each argument in $PATH' },
        ],
        realWorldExample: 'which python3',
        category: 'system',
      },
    ],
  },
  {
    id: 'mod-3',
    slug: 'filesystem-hierarchy-standard-fhs',
    levelId: 'level-1',
    moduleNumber: 3,
    title: 'The Filesystem Hierarchy Standard (FHS)',
    shortDescription:
      'Explore the standardized Linux directory tree from root (/): understand /etc for configs, /var for logs/data, /home, /dev, /proc virtual filesystem, and /tmp.',
    durationMinutes: 30,
    coreCommands: ['ls', 'cd', 'cat'],
    theory: {
      overview:
        'Unlike Windows, which organizes disks with separate drive letters (`C:\\`, `D:\\`), Linux organizes all physical partitions, network mounts, and virtual memory interfaces into a single unified inverted tree structure starting at the root directory (`/`). The Linux Foundation maintains the Filesystem Hierarchy Standard (FHS) to guarantee consistent directory layouts across distributions.',
      keyConcepts: [
        {
          title: 'The Linux FHS Map',
          content:
            'Every directory directly under `/` serves an explicit system purpose:\n- `/` (Root): The top-level root of the entire filesystem tree.\n- `/bin` & `/sbin`: Essential user binaries (`ls`, `cat`) and system administrative binaries (`reboot`, `iptables`). In modern distros, symlinked to `/usr/bin`.\n- `/etc`: Host-specific system configuration files (`/etc/passwd`, `/etc/hosts`, `/etc/nginx/`). No binaries belong here.\n- `/var`: Variable data that changes as the system runs (logs in `/var/log`, databases in `/var/lib`, mail spools).\n- `/home`: Personal user home directories (`/home/student`, `/home/deploy`).\n- `/root`: The home directory of the superuser (`root`), kept off `/home` in case `/home` is on a separate unmounted partition.\n- `/tmp`: Temporary files accessible by all users, typically cleared upon reboot or via systemd tmpfiles.\n- `/dev`: Special device files representing hardware (`/dev/sda` for disk, `/dev/null` for blackhole, `/dev/urandom` for randomness).\n- `/proc` & `/sys`: Virtual pseudofilesystems generated dynamically in-memory by the kernel to expose process states and hardware tuneables.',
          diagramAscii: `                          / (Root)
                             |
   +-------+-------+---------+--------+--------+--------+
   |       |       |         |        |        |        |
 /bin    /etc    /home     /var     /proc    /dev     /tmp
(Tools) (Config) (Users)   (Logs)  (Kernel) (Devices)(Scratch)
                   |         |
               student     nginx/access.log`,
        },
        {
          title: 'The Magic of /proc and /sys',
          content:
            'Files in `/proc` consume 0 bytes of physical disk space. They are live kernel instrumentation hooks:\n- `/proc/cpuinfo`: Hardware details of CPU cores, frequency, and flags.\n- `/proc/meminfo`: Real-time RAM statistics (Total, Free, Cached, Buffers).\n- `/proc/uptime`: Seconds elapsed since system boot.\n- `/proc/<PID>/`: Contains file descriptors, memory maps, and status of any running process by ID!',
        },
        {
          title: 'The Special /dev/null Device',
          content:
            '`/dev/null` is known as the "black hole" or bit bucket. Any data written to `/dev/null` is discarded instantly by the kernel. Reading from `/dev/null` immediately returns an End-of-File (EOF). It is frequently used in production to silence noisy scripts: `command > /dev/null 2>&1`.',
        },
      ],
      productionBestPractices: [
        'Always check available space in `/var` and `/` because runaway application logs in `/var/log` can fill the root disk and crash the entire server.',
        'Never store permanent files in `/tmp` because cleanup jobs (`tmpwatch` / systemd-tmpfiles) will prune old files automatically.',
        'Back up `/etc` before upgrading packages or modifying system daemon configs (e.g., `cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak`).',
      ],
      commonPitfalls: [
        'Attempting to edit `/proc` files like normal text files: many `/proc` entries are read-only interfaces to the kernel or require specific numeric syntax (e.g. `echo 1 > /proc/sys/net/ipv4/ip_forward`).',
        'Confusing `/root` (the root user\'s private home directory) with `/` (the root of the whole filesystem).',
      ],
      realWorldScenario: {
        title: 'Production Incident: Server Disk Full (100% Inodes)',
        situation:
          'A production web cluster stops accepting HTTP connections. Monitoring alerts trigger: "Disk 100% full on /".',
        howLinuxHelps:
          'Knowing the FHS, the on-call engineer immediately investigates `/var/log` and discovers an uncompressed 40GB application debug log file. Truncating the log in `/var/log` immediately restores the web application.',
      },
    },
    lab: {
      id: 'lab-3',
      title: 'Lab 3: Exploring the Filesystem Hierarchy',
      scenario:
        'You need to verify the server configuration and inspect system resources directly through the Linux FHS without third-party monitoring tools.',
      objective:
        'Navigate to `/etc`, inspect system configuration files, read memory statistics from `/proc/meminfo`, and verify `/var/log` entries.',
      tasks: [
        {
          id: 't1',
          instruction: 'Change directory to `/etc` using `cd /etc` and run `ls` to list the configuration files.',
          hint: 'Run: cd /etc && ls',
          solutionCommand: 'cd /etc',
        },
        {
          id: 't2',
          instruction: 'Read the first 5 lines of `/proc/meminfo` using `head -n 5 /proc/meminfo`.',
          hint: 'Run: head -n 5 /proc/meminfo',
          solutionCommand: 'head -n 5 /proc/meminfo',
        },
        {
          id: 't3',
          instruction: 'Navigate back to your home directory using `cd ~` or `cd /home/student`.',
          hint: 'Run: cd ~',
          solutionCommand: 'cd ~',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'User inspected /proc/meminfo',
          checkType: 'command_executed_match',
          expectedValue: 'meminfo',
          failureMessage: 'Run `head -n 5 /proc/meminfo` or `cat /proc/meminfo` to inspect virtual memory info.',
        },
      ],
    },
    quiz: [
      {
        id: 'q3-1',
        question: 'Which directory in the Linux FHS is designated for system-wide configuration files?',
        options: ['/bin', '/etc', '/var', '/usr'],
        correctIndex: 1,
        explanation: '`/etc` holds host-specific system configurations for software, network, and daemons.',
      },
      {
        id: 'q3-2',
        question: 'What is unique about the files inside the `/proc` directory?',
        options: [
          'They are encrypted using RSA-4096 keys.',
          'They do not exist on physical storage; they are generated in RAM by the kernel.',
          'They can only be read on Sundays during system maintenance.',
          'They hold permanent backup snapshots of the system.',
        ],
        correctIndex: 1,
        explanation:
          '`/proc` is a pseudofilesystem generated on-the-fly by the kernel to expose runtime metrics and process states.',
      },
      {
        id: 'q3-3',
        question: 'What happens to data sent to `/dev/null`?',
        options: [
          'It is saved to a compressed hidden zip file in `/tmp`.',
          'It is broadcast over the local network.',
          'It is discarded completely by the kernel.',
          'It raises a kernel panic.',
        ],
        correctIndex: 2,
        explanation: '`/dev/null` acts as a data sink; all bytes written to it are discarded.',
      },
    ],
    cheatSheet: [
      {
        name: 'FHS: /etc',
        syntax: 'cd /etc',
        description: 'Contains host-wide system configuration files (hosts, passwd, resolv.conf, nginx).',
        commonFlags: [],
        realWorldExample: 'cat /etc/hosts',
        category: 'system',
      },
      {
        name: 'FHS: /var/log',
        syntax: 'cd /var/log',
        description: 'Contains system and service log files (syslog, auth.log, nginx/access.log).',
        commonFlags: [],
        realWorldExample: 'tail -f /var/log/syslog',
        category: 'system',
      },
      {
        name: 'FHS: /proc',
        syntax: 'cat /proc/[cpuinfo|meminfo|uptime]',
        description: 'Virtual filesystem reflecting the current kernel runtime and process state.',
        commonFlags: [],
        realWorldExample: 'cat /proc/cpuinfo',
        category: 'system',
      },
    ],
  },
  {
    id: 'mod-4',
    slug: 'file-and-directory-manipulation',
    levelId: 'level-1',
    moduleNumber: 4,
    title: 'File & Directory Manipulation Mastery',
    shortDescription:
      'Master the everyday file commands: pwd, cd, ls -lah, mkdir -p, touch, cp -r, mv, rm -rf, and shell wildcards (*, ?, []).',
    durationMinutes: 35,
    coreCommands: ['pwd', 'cd', 'ls', 'mkdir', 'touch', 'cp', 'mv', 'rm'],
    theory: {
      overview:
        'Navigating and manipulating files and directories from the command line is the most frequent activity in systems administration. Doing this fluently requires understanding path resolution (absolute vs relative), directory shortcuts (`.`, `..`, `~`, `-`), and pattern matching with shell wildcards (globbing).',
      keyConcepts: [
        {
          title: 'Absolute vs Relative Paths',
          content:
            '- Absolute Path: Begins with a forward slash (`/`). Specifies the unambiguous route starting from the root of the filesystem tree regardless of your current location (e.g. `/var/log/nginx/access.log`).\n- Relative Path: Does NOT start with `/`. Resolves relative to your Current Working Directory (`pwd`).\n  * `.` represents the current directory.\n  * `..` represents the immediate parent directory.\n  * `~` represents the logged-in user\'s home directory (`/home/student`).\n  * `-` represents the previous working directory (`cd -`).',
        },
        {
          title: 'Core CRUD Commands for Files and Folders',
          content:
            '1. `pwd`: Print Working Directory.\n2. `mkdir -p a/b/c`: Create directory and any missing parent directories without erroring if they already exist.\n3. `touch filename`: Create an empty file if it doesn\'t exist, or update its modification timestamp if it does.\n4. `cp -r source dest`: Copy files or directories recursively.\n5. `mv source dest`: Move or rename a file or directory.\n6. `rm -rf target`: Remove files or directories recursively and forcefully.',
          diagramAscii: `  mkdir -p backend/api/v1      touch app.py      cp -r backend/ backup/
       [Directory Tree]           [File]             [Duplicate]`,
        },
        {
          title: 'Shell Wildcards (Globbing)',
          content:
            'Before a command receives arguments, the shell expands wildcard patterns:\n- `*`: Matches zero or more characters (e.g., `*.log` matches all files ending in .log).\n- `?`: Matches exactly one character (e.g., `file?.txt` matches file1.txt, fileA.txt).\n- `[abc]`: Matches any one character inside the brackets (e.g., `test[1-3].py` matches test1.py, test2.py, test3.py).',
        },
      ],
      productionBestPractices: [
        'Always double-check your path before executing `rm -rf`! A typo like `rm -rf / tmp/test` (with an accidental space after `/`) would attempt to delete the entire operating system!',
        'Use `mkdir -p` in automation scripts to ensure idempotent directory creation.',
        'Use `cp -p` or `cp -a` when copying configuration files or system backups to preserve exact file permissions, timestamps, and ownership.',
      ],
      commonPitfalls: [
        'Attempting to delete a non-empty directory with `rmdir`: `rmdir` only deletes empty directories; use `rm -r` for directories containing files.',
        'Forgetting the `-r` (recursive) flag when copying or removing directory trees.',
      ],
      realWorldScenario: {
        title: 'Application Release Staging Workflow',
        situation:
          'A release engineer prepares an application staging release folder, creates configuration subdirectories, copies production templates, and prunes stale artifacts.',
        howLinuxHelps:
          'The engineer uses `mkdir -p releases/v2.4/{conf,logs,bin}`, copies assets with `cp -r src/* releases/v2.4/bin/`, and removes build caches using `rm -rf build/*.cache`.',
      },
    },
    lab: {
      id: 'lab-4',
      title: 'Lab 4: Building a Project Workspace',
      scenario:
        'You need to initialize a clean project structure in your home directory. Create a new directory tree for a web service, generate configuration and index files, and make a backup copy.',
      objective:
        'Create `~/workspace/site/assets` using `mkdir -p`, create `~/workspace/site/index.html` with content using `echo`, and duplicate the `site` folder to `~/workspace/site-backup` using `cp -r`.',
      tasks: [
        {
          id: 't1',
          instruction: 'Create the nested directories `workspace/site/assets` using `mkdir -p workspace/site/assets`.',
          hint: 'Run: mkdir -p workspace/site/assets',
          solutionCommand: 'mkdir -p workspace/site/assets',
        },
        {
          id: 't2',
          instruction: 'Create an `index.html` file inside `workspace/site/` containing "<h1>Hello Linux</h1>".',
          hint: 'Run: echo "<h1>Hello Linux</h1>" > workspace/site/index.html',
          solutionCommand: 'echo "<h1>Hello Linux</h1>" > workspace/site/index.html',
        },
        {
          id: 't3',
          instruction: 'Make a full backup copy of `workspace/site` to `workspace/site-backup` using `cp -r`.',
          hint: 'Run: cp -r workspace/site workspace/site-backup',
          solutionCommand: 'cp -r workspace/site workspace/site-backup',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'Directory workspace/site/assets exists',
          checkType: 'dir_exists',
          targetPath: '/home/student/workspace/site/assets',
          failureMessage: 'Directory /home/student/workspace/site/assets was not found.',
        },
        {
          id: 'v2',
          description: 'File workspace/site/index.html exists',
          checkType: 'file_exists',
          targetPath: '/home/student/workspace/site/index.html',
          failureMessage: 'File /home/student/workspace/site/index.html was not found.',
        },
        {
          id: 'v3',
          description: 'Backup directory workspace/site-backup exists',
          checkType: 'dir_exists',
          targetPath: '/home/student/workspace/site-backup',
          failureMessage: 'Backup directory /home/student/workspace/site-backup was not created.',
        },
      ],
    },
    quiz: [
      {
        id: 'q4-1',
        question: 'What flag must be passed to `mkdir` to create parent directories without erroring if they already exist?',
        options: ['-r', '-p', '-f', '-a'],
        correctIndex: 1,
        explanation: '`-p` (or `--parents`) creates parent directories as needed and does not error if the target directory already exists.',
      },
      {
        id: 'q4-2',
        question: 'If your current directory is `/home/student/projects/web`, where does `cd ../..` take you?',
        options: ['/home', '/home/student', '/', '/home/student/projects'],
        correctIndex: 1,
        explanation: 'Each `..` steps up one directory level. From `/home/student/projects/web`, stepping up twice lands in `/home/student`.',
      },
      {
        id: 'q4-3',
        question: 'What command copies an entire directory structure and all its nested files?',
        options: ['cp -r src dest', 'mv -c src dest', 'copy src dest', 'dup -a src dest'],
        correctIndex: 0,
        explanation: 'The `-r` (recursive) flag causes `cp` to copy directories and all of their contents recursively.',
      },
    ],
    cheatSheet: [
      {
        name: 'ls',
        syntax: 'ls [OPTIONS] [PATH]',
        description: 'List directory contents.',
        commonFlags: [
          { flag: '-l', description: 'Use long listing format (permissions, owner, size, date)' },
          { flag: '-a', description: 'Include hidden files (starting with .)' },
          { flag: '-h', description: 'With -l, display human-readable file sizes (K, M, G)' },
          { flag: '-t', description: 'Sort entries by modification time, newest first' },
        ],
        realWorldExample: 'ls -lah /var/log',
        category: 'file-ops',
      },
      {
        name: 'mkdir',
        syntax: 'mkdir [OPTIONS] DIRECTORY...',
        description: 'Create directory or directories.',
        commonFlags: [
          { flag: '-p', description: 'Create parent directories as needed; no error if existing' },
        ],
        realWorldExample: 'mkdir -p /opt/app/{config,data,logs}',
        category: 'file-ops',
      },
      {
        name: 'cp',
        syntax: 'cp [OPTIONS] SOURCE DEST',
        description: 'Copy files and directories.',
        commonFlags: [
          { flag: '-r', description: 'Copy directories recursively' },
          { flag: '-p', description: 'Preserve mode, ownership, and timestamps' },
        ],
        realWorldExample: 'cp -rp /etc/nginx /etc/nginx.bak',
        category: 'file-ops',
      },
      {
        name: 'rm',
        syntax: 'rm [OPTIONS] FILE...',
        description: 'Remove files or directories.',
        commonFlags: [
          { flag: '-r', description: 'Remove directories and their contents recursively' },
          { flag: '-f', description: 'Ignore nonexistent files, never prompt before removing' },
        ],
        realWorldExample: 'rm -rf /tmp/cache/*',
        category: 'file-ops',
      },
    ],
  },
  {
    id: 'mod-5',
    slug: 'viewing-and-inspecting-file-contents',
    levelId: 'level-1',
    moduleNumber: 5,
    title: 'Viewing, Inspecting & Paging File Contents',
    shortDescription:
      'Inspect files without opening heavy editors: cat -n, less, more, head -n, tail -f, word/line counts with wc, and determining file types with file and stat.',
    durationMinutes: 30,
    coreCommands: ['cat', 'head', 'tail', 'wc', 'file'],
    theory: {
      overview:
        'In production environments, servers frequently do not have graphical user interfaces or IDEs installed. When diagnosing an outage or verifying configuration files, an engineer must quickly view, scroll, follow, and count file contents using lightweight, battle-tested terminal utilities.',
      keyConcepts: [
        {
          title: 'The Inspection Toolkit: cat, head, and tail',
          content:
            '- `cat` (Concatenate): Dumps the entire contents of one or more files to stdout. Best for short files (e.g. `cat config.env`). Use `cat -n` to display line numbers.\n- `head -n 20 file`: Prints the first 20 lines of a file (default is 10 lines).\n- `tail -n 20 file`: Prints the last 20 lines of a file.\n- `tail -f file`: The "follow" mode! Keeps the file open and streams newly appended lines to your terminal in real time. Essential for monitoring live web server or application logs.',
          diagramAscii: `    [--- File Top ---]   <- head -n 10 (First 10 lines)
    |                |
    |  Middle lines  |   <- less (interactive scrolling)
    |                |
    [-- File Bottom -]   <- tail -n 10 (Last 10 lines)
         ||
         \\/              <- tail -f (Streams new logs live!)`,
        },
        {
          title: 'Interactive Paging with less',
          content:
            'For files with hundreds or thousands of lines, dumping them with `cat` floods your screen. `less` opens an interactive pager that loads files chunk by chunk without reading the entire file into memory:\n- `Space` or `Page Down`: Scroll down one screen.\n- `b` or `Page Up`: Scroll up one screen.\n- `/pattern`: Search forward for text.\n- `n` / `N`: Jump to next / previous search match.\n- `G`: Jump to end of file; `1G` or `g`: Jump to start of file.\n- `q`: Quit less.',
        },
        {
          title: 'Line, Word & Byte Counting with wc',
          content:
            '`wc` (Word Count) reads files or standard input and outputs statistics:\n- `wc -l`: Count lines only.\n- `wc -w`: Count words only.\n- `wc -c`: Count bytes/characters only.\n\nIn automation, `wc -l` is constantly paired with pipes to count matching events: `grep "ERROR" app.log | wc -l`.',
        },
      ],
      productionBestPractices: [
        'Never run `cat` on multi-gigabyte log files: it can overload the terminal buffer and freeze your SSH session. Use `less`, `head`, or `tail` instead.',
        'Use `tail -n 100 -f /var/log/nginx/error.log` when debugging live HTTP 500 errors to see the latest errors without scrolling.',
        'Check file types with `file <filename>` before attempting to cat or edit binary archives or compiled objects.',
      ],
      commonPitfalls: [
        'Running `cat` on a binary file (e.g. `cat /bin/bash`): this emits binary escape sequences that scramble your terminal font! (Fix it by typing `reset` and pressing Enter).',
        'Confusing `head` (top of file) with `tail` (bottom of file).',
      ],
      realWorldScenario: {
        title: 'Real-Time Web Application Error Triage',
        situation:
          'Users report intermittent 502 Bad Gateway errors on an e-commerce checkout page. The on-call engineer needs to monitor live incoming errors.',
        howLinuxHelps:
          'The engineer opens an SSH terminal and runs `tail -f /var/log/nginx/access.log | grep "502"`. Every time a user encounters the error, the exact request URL, user IP, and timestamp are displayed in real time.',
      },
    },
    lab: {
      id: 'lab-5',
      title: 'Lab 5: Log Inspection & Line Counting',
      scenario:
        'A web application server has recorded access events in `/var/log/nginx/access.log`. You are tasked with analyzing the log file, inspecting the top and bottom records, and counting total entries.',
      objective:
        'Inspect the first 3 lines of `/var/log/nginx/access.log` using `head`, count total lines using `wc -l`, and view the auth log with `cat -n`.',
      tasks: [
        {
          id: 't1',
          instruction: 'Use `head -n 3 /var/log/nginx/access.log` to print the first three HTTP requests in the access log.',
          hint: 'Run: head -n 3 /var/log/nginx/access.log',
          solutionCommand: 'head -n 3 /var/log/nginx/access.log',
        },
        {
          id: 't2',
          instruction: 'Use `tail -n 2 /var/log/nginx/access.log` to print the last two requests in the log file.',
          hint: 'Run: tail -n 2 /var/log/nginx/access.log',
          solutionCommand: 'tail -n 2 /var/log/nginx/access.log',
        },
        {
          id: 't3',
          instruction: 'Count the total number of lines in `/var/log/nginx/access.log` using `wc -l`.',
          hint: 'Run: wc -l /var/log/nginx/access.log',
          solutionCommand: 'wc -l /var/log/nginx/access.log',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'User executed head command',
          checkType: 'command_executed_match',
          expectedValue: 'head',
          failureMessage: 'Run `head -n 3 /var/log/nginx/access.log` to inspect the top lines.',
        },
        {
          id: 'v2',
          description: 'User executed wc -l',
          checkType: 'command_executed_match',
          expectedValue: 'wc',
          failureMessage: 'Run `wc -l /var/log/nginx/access.log` to count lines.',
        },
      ],
    },
    quiz: [
      {
        id: 'q5-1',
        question: 'Which command and flag streams new lines appended to a log file in real time?',
        options: ['cat -s file.log', 'tail -f file.log', 'head -live file.log', 'less --follow-all file.log'],
        correctIndex: 1,
        explanation: '`tail -f` (follow) monitors a file and prints new content as it is written by processes.',
      },
      {
        id: 'q5-2',
        question: 'What is the key advantage of using `less` rather than `cat` for viewing large 1GB files?',
        options: [
          'less automatically translates foreign languages.',
          'less does not load the entire file into memory before displaying it, allowing instant paging.',
          'less can edit and recompile files.',
          'less runs in background mode automatically.',
        ],
        correctIndex: 1,
        explanation: '`less` pages through files lazily without loading the entire file into RAM, making it fast even on huge files.',
      },
      {
        id: 'q5-3',
        question: 'What does `wc -l /etc/passwd` output?',
        options: [
          'The number of characters in /etc/passwd.',
          'The number of lines (user accounts) in /etc/passwd.',
          'The size of /etc/passwd in kilobytes.',
          'The number of words in /etc/passwd.',
        ],
        correctIndex: 1,
        explanation: 'The `-l` flag tells `wc` to count newline characters (lines).',
      },
    ],
    cheatSheet: [
      {
        name: 'cat',
        syntax: 'cat [OPTIONS] [FILE...]',
        description: 'Concatenate files and print on the standard output.',
        commonFlags: [
          { flag: '-n', description: 'Number all output lines' },
          { flag: '-b', description: 'Number non-empty output lines' },
        ],
        realWorldExample: 'cat -n /etc/hosts',
        category: 'file-ops',
      },
      {
        name: 'head',
        syntax: 'head [OPTIONS] [FILE...]',
        description: 'Output the first part of files (default 10 lines).',
        commonFlags: [
          { flag: '-n NUM', description: 'Print the first NUM lines instead of 10' },
        ],
        realWorldExample: 'head -n 25 /var/log/syslog',
        category: 'file-ops',
      },
      {
        name: 'tail',
        syntax: 'tail [OPTIONS] [FILE...]',
        description: 'Output the last part of files (default 10 lines).',
        commonFlags: [
          { flag: '-n NUM', description: 'Output the last NUM lines instead of 10' },
          { flag: '-f', description: 'Output appended data as the file grows (follow mode)' },
        ],
        realWorldExample: 'tail -n 50 -f /var/log/nginx/access.log',
        category: 'file-ops',
      },
      {
        name: 'wc',
        syntax: 'wc [OPTIONS] [FILE...]',
        description: 'Print newline, word, and byte counts for each file.',
        commonFlags: [
          { flag: '-l', description: 'Print line count' },
          { flag: '-w', description: 'Print word count' },
          { flag: '-c', description: 'Print byte count' },
        ],
        realWorldExample: 'wc -l /etc/passwd',
        category: 'file-ops',
      },
    ],
  },
];
