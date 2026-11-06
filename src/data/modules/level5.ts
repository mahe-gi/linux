import { CourseModule } from '@/types/course';

export const LEVEL_5_MODULES: CourseModule[] = [
  {
    id: 'mod-21',
    slug: 'production-bash-shell-scripting-mastery',
    levelId: 'level-5',
    moduleNumber: 21,
    title: 'Production Bash Scripting & Defensive Programming',
    shortDescription:
      'Write rock-solid automation: shebang (#!/bin/bash), defensive strict mode (set -euo pipefail), positional arguments ($1, $@, $#), modern conditionals ([[ ]]), loops, functions, and trap exit handlers.',
    durationMinutes: 45,
    coreCommands: ['echo', 'chmod', 'cat'],
    theory: {
      overview:
        'Bash scripting is the glue of the modern cloud, powering container entrypoints, CI/CD stages, automated backups, and orchestration hooks. Writing amateur bash scripts leads to silent failures, race conditions, and catastrophic unintended data loss. Writing production-grade Bash requires defensive programming principles, strict error handling, and robust cleanup traps.',
      keyConcepts: [
        {
          title: 'The Production Shebang & Strict Mode',
          content:
            'Every professional script must start with:\n\n```bash\n#!/usr/bin/env bash\nset -euo pipefail\nIFS=$\'\\n\\t\'\n```\n\nWhat `set -euo pipefail` actually does:\n- `-e` (errexit): Exit immediately if any command exits with a non-zero status (no more silent failures!).\n- `-u` (nounset): Treat unset variables as an error and exit immediately (prevents accidental disasters like `rm -rf /tmp/$UNSET_VAR/*` which would execute `rm -rf /tmp/*`!).\n- `-o pipefail`: If any command in a pipeline (`cmd1 | cmd2 | cmd3`) fails, the entire pipeline returns that non-zero exit code (by default, Bash only reports the exit code of the final command!).\n- `IFS=$"\\n\\t"`: Internal Field Separator set to newlines and tabs to prevent spaces in filenames from splitting words.',
          diagramAscii: `  Without pipefail:   [FAIL cmd1] | [PASS cmd2] -> Returns 0 (Silent bug!)
  With pipefail:      [FAIL cmd1] | [PASS cmd2] -> Returns 1 (Properly caught!)`,
        },
        {
          title: 'Defensive Conditionals: [[ vs [',
          content:
            'Always use `[[ ... ]]` (Bash keyword) instead of `[ ... ]` (POSIX test):\n- `[[ -f "$file" ]]`: Check if file exists.\n- `[[ -d "$dir" ]]`: Check if directory exists.\n- `[[ -z "$var" ]]`: Check if string is empty.\n- `[[ -n "$var" ]]`: Check if string is NOT empty.\n- `[[ "$str" == *"pattern"* ]]`: Pattern matching without external tools.\n- `[[ "$a" == "$b" && "$c" == "$d" ]]`: Safe boolean AND/OR operators.',
        },
        {
          title: 'Positional Parameters & Functions',
          content:
            '- `$0`: Script name.\n- `$1, $2, ... $9`: Arguments passed to script or function.\n- `$#`: Number of arguments.\n- `"$@"`: All arguments individually quoted (always use `"$@"`, never `$*`!).\n- Clean Functions with local variables:\n\n```bash\nlog_info() {\n    local msg="$1"\n    echo "[INFO] $(date +\'%Y-%m-%dT%H:%M:%S\') - $msg"\n}\n```',
        },
        {
          title: 'Automated Cleanup with trap',
          content:
            'Production scripts create temporary files in `/tmp`. If the script is aborted by `Ctrl+C` or crashes, leftover temp files must not clutter disk. Use `trap`:\n\n```bash\nTMP_DIR=$(mktemp -d)\ntrap \'rm -rf "$TMP_DIR"\' EXIT INT TERM\n```\nThe cleanup command executes guaranteed whenever the script exits, crashes, or is killed.',
        },
      ],
      productionBestPractices: [
        'Always quote your variable expansions: `"$MY_VAR"`! Unquoted variables undergo word splitting and glob expansion, causing script bugs when filenames contain spaces.',
        'Use `shellcheck` (linter) on all bash scripts before committing them to production code repositories.',
        'Always provide a helpful `--help` flag or usage message when expected arguments are missing (`[[ $# -lt 1 ]] && usage`).',
      ],
      commonPitfalls: [
        'Forgetting `local` in function variables: all variables in Bash are global by default! A loop counter `i` inside a function will overwrite a global loop counter `i`!',
        'Testing strings with single `[ ... ]` without quotes: `[ $var = "foo" ]` crashes with syntax error if `$var` is empty!',
      ],
      realWorldScenario: {
        title: 'Zero-Downtime Container Initialization Script',
        situation:
          'A Docker container launches a web application, checks database readiness, runs migrations, and handles SIGTERM graceful shutdown.',
        howLinuxHelps:
          'The engineer writes an `entrypoint.sh` using `set -euo pipefail` that loops polling the database port using `nc -z db 5432` until ready, applies migrations, and executes `exec "$@"` to replace the shell with the application process so signals pass directly to the container runtime.',
      },
    },
    lab: {
      id: 'lab-21',
      title: 'Lab 21: Inspecting & Executing Defensive Scripts',
      scenario:
        'Inspect `/home/student/scripts/healthcheck.sh`, verify its defensive `set -euo pipefail` header, and execute the script to verify system metrics.',
      objective:
        'Read `/home/student/scripts/healthcheck.sh` using `cat`, ensure execute permissions, and run the script.',
      tasks: [
        {
          id: 't1',
          instruction: 'Display the contents of `/home/student/scripts/healthcheck.sh` using `cat scripts/healthcheck.sh`.',
          hint: 'Run: cat scripts/healthcheck.sh',
          solutionCommand: 'cat scripts/healthcheck.sh',
        },
        {
          id: 't2',
          instruction: 'Execute the healthcheck script using `./scripts/healthcheck.sh`.',
          hint: 'Run: ./scripts/healthcheck.sh',
          solutionCommand: './scripts/healthcheck.sh',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'User inspected script contents',
          checkType: 'command_executed_match',
          expectedValue: 'healthcheck',
          failureMessage: 'Run `cat scripts/healthcheck.sh` to inspect the script.',
        },
      ],
    },
    quiz: [
      {
        id: 'q21-1',
        question: 'What does the `-u` flag in `set -euo pipefail` do?',
        options: [
          'Uncompresses files automatically.',
          'Treats unset variables as errors and exits immediately, preventing unintended disasters with uninitialized variables.',
          'Forces the script to run as unprivileged user.',
          'Updates package repositories.',
        ],
        correctIndex: 1,
        explanation: '`-u` (nounset) prevents catastrophic bugs like `rm -rf "$TARGET/"` when `$TARGET` is unset.',
      },
      {
        id: 'q21-2',
        question: 'Why should function variables in Bash always be declared with `local`?',
        options: [
          'Because global variables are deleted automatically.',
          'Because variables in Bash are global by default, which can cause functions to accidentally overwrite caller variables.',
          'To make the function run 10x faster.',
          'Because local variables are encrypted in RAM.',
        ],
        correctIndex: 1,
        explanation: 'In Bash, all variables are global unless explicitly declared with the `local` keyword.',
      },
      {
        id: 'q21-3',
        question: 'What is the purpose of the `trap` command in production Bash scripts?',
        options: [
          'To catch intruders on the network.',
          'To register cleanup actions that run automatically when the script exits, crashes, or receives interrupt signals.',
          'To pause script execution for 10 minutes.',
          'To compile the script into C code.',
        ],
        correctIndex: 1,
        explanation: '`trap` guarantees resource cleanup (removing temp files, unlocking files) even if the script aborts unexpectedly.',
      },
    ],
    cheatSheet: [
      {
        name: 'set -euo pipefail',
        syntax: 'set -euo pipefail',
        description: 'Bash strict mode: exit on error (-e), exit on unset variable (-u), inherit pipeline error (-o pipefail).',
        commonFlags: [],
        realWorldExample: '#!/usr/bin/env bash\nset -euo pipefail',
        category: 'devops',
      },
      {
        name: 'trap',
        syntax: 'trap \'CLEANUP_COMMAND\' SIGNALS...',
        description: 'Execute cleanup command when the shell receives signal(s) or exits.',
        commonFlags: [],
        realWorldExample: 'trap \'rm -rf "$TMP_DIR"\' EXIT',
        category: 'devops',
      },
    ],
  },
  {
    id: 'mod-22',
    slug: 'cron-jobs-and-automated-scheduling',
    levelId: 'level-5',
    moduleNumber: 22,
    title: 'Cron Jobs, Automated Scheduling & Log Rotation',
    shortDescription:
      'Automate background tasks: crontab syntax (* * * * *), crontab -e / -l, cron environment caveats, systemd timers, and automated log management with logrotate.',
    durationMinutes: 35,
    coreCommands: ['cat'],
    theory: {
      overview:
        'Automated background job execution is fundamental to keeping systems healthy: backing up databases nightly, purging stale temporary files, renewing SSL certificates with Certbot, and rotating multi-gigabyte log files. Understanding cron schedules, environment pitfalls, and logrotate prevents silent script failures and disk overflow outages.',
      keyConcepts: [
        {
          title: 'The Five-Star Cron Syntax',
          content:
            'Cron schedules jobs according to 5 space-separated time fields:\n`* * * * * command_to_execute`\n\n1. Minute (0 - 59)\n2. Hour (0 - 23, 24-hr clock)\n3. Day of Month (1 - 31)\n4. Month (1 - 12)\n5. Day of Week (0 - 6, where 0 is Sunday)\n\nCommon Cron Patterns:\n- `0 2 * * * /backup.sh`: Every night at 2:00 AM.\n- `*/15 * * * * /check.sh`: Every 15 minutes.\n- `0 0 * * 0 /weekly.sh`: Every Sunday at midnight.\n- `0 9-17 * * 1-5 /biz.sh`: Every hour on the hour during business hours Monday through Friday.',
          diagramAscii: `  *    *    *    *    *   /path/to/script.sh
  |    |    |    |    |
  Min Hour Day Month Day
(0-59)(0-23)(1-31)(1-12)(0-6)
                         0=Sun`,
        },
        {
          title: 'Managing Crontabs',
          content:
            '- `crontab -e`: Edit the current user\'s crontab safely with file locking.\n- `crontab -l`: Display (list) the current user\'s scheduled cron jobs.\n- `crontab -r`: Remove/wipe all current user cron jobs (caution!).\n- System crontab: `/etc/crontab` and directory drop-ins `/etc/cron.hourly/`, `/etc/cron.daily/`, `/etc/cron.weekly/`.',
        },
        {
          title: 'The #1 Cron Gotcha: The Minimal Environment',
          content:
            'Why does a script work perfectly when run manually in your terminal, but fail silently when run by Cron?\nBecause Cron executes with a stripped-down, minimal environment!\n- Cron does NOT load your `~/.bashrc` or `~/.profile`.\n- `$PATH` in cron is often only `/usr/bin:/bin` (custom paths like `/usr/local/bin` or `$HOME/bin` are missing!).\n\nBest practice for cron entries:\n1. Always specify absolute paths for all commands: `/usr/bin/python3`, `/usr/bin/curl`.\n2. Always redirect stdout and stderr: `0 3 * * * /opt/backup.sh >> /var/log/backup.log 2>&1`.',
        },
        {
          title: 'Automated Log Rotation with logrotate',
          content:
            'Without log rotation, `/var/log/nginx/access.log` will grow until the disk is 100% full. `logrotate` runs daily via cron/systemd-timer to compress, archive, and truncate logs based on rules in `/etc/logrotate.d/nginx`:\n- `daily`: Rotate once per day.\n- `rotate 14`: Keep 14 days of back logs, deleting older.\n- `compress`: Compress rotated logs with gzip (`access.log.1.gz`).\n- `delaycompress`: Wait until next cycle to compress so open descriptors aren\'t disrupted.\n- `notifempty`: Don\'t rotate if file is empty.',
        },
      ],
      productionBestPractices: [
        'Always redirect cron job output to a log file or `/dev/null`: `* * * * * /script.sh >> /var/log/cron.log 2>&1`. If unredirected, cron attempts to send an internal email via `/usr/sbin/sendmail` which can clog the local mail spool.',
        'Use lock files (`flock`) to prevent cron jobs from overlapping if a previous run takes longer than the interval: `* * * * * /usr/bin/flock -n /tmp/job.lock /opt/job.sh`.',
        'Modern alternative: Consider systemd timers (`.timer` units) which provide built-in logging via journalctl, randomized delay, and dependency management.',
      ],
      commonPitfalls: [
        'Using relative paths in crontabs: `python3 my_script.py` fails because cron\'s working directory is the user\'s home directory.',
        'Unescaped `%` percent signs in crontab commands: cron treats `%` as a newline character! (Escape with `\\%`, e.g. `$(date +\\%F)`).',
      ],
      realWorldScenario: {
        title: 'SSL Certificate Auto-Renewal & Log Truncation',
        situation:
          'Let\'s Encrypt SSL certificates expire every 90 days. Forgetting to renew breaks HTTPS and causes browser security warnings for all customers.',
        howLinuxHelps:
          'A systemd timer runs `certbot renew --quiet` twice daily. When certificates have 30 days remaining, it automatically renews them and reloads Nginx with zero human intervention.',
      },
    },
    lab: {
      id: 'lab-22',
      title: 'Lab 22: Cron Configuration & Schedule Parsing',
      scenario:
        'Inspect system log entries in `/var/log/syslog` to identify automated cron executions, and examine system cron files in `/etc/hosts` and `/etc/resolv.conf`.',
      objective:
        'Filter `/var/log/syslog` for CRON entries and verify system schedule execution.',
      tasks: [
        {
          id: 't1',
          instruction: 'Search `/var/log/syslog` for recent cron executions using `grep "CRON" /var/log/syslog`.',
          hint: 'Run: grep "CRON" /var/log/syslog',
          solutionCommand: 'grep "CRON" /var/log/syslog',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'User inspected cron logs with grep',
          checkType: 'command_executed_match',
          expectedValue: 'CRON',
          failureMessage: 'Run `grep "CRON" /var/log/syslog` to audit scheduled task execution.',
        },
      ],
    },
    quiz: [
      {
        id: 'q22-1',
        question: 'What does the cron schedule `0 3 * * 1` represent?',
        options: [
          'Every 3 hours on the first day of every month.',
          'Every Monday at 3:00 AM.',
          'Every 1 minute after 3:00 PM.',
          'Every 3 minutes every day.',
        ],
        correctIndex: 1,
        explanation: 'Minute 0, Hour 3 (3 AM), Any day of month, Any month, Day of week 1 (Monday).',
      },
      {
        id: 'q22-2',
        question: 'Why do scripts frequently fail in Cron even when they work in your interactive terminal?',
        options: [
          'Because Cron can only execute files written in Python.',
          'Because Cron runs with a bare, minimal environment where $PATH does not include custom binary directories, and ~/.bashrc is not loaded.',
          'Because Cron runs in reverse order.',
          'Because Cron deletes the script after one execution.',
        ],
        correctIndex: 1,
        explanation: 'Cron runs non-interactively with a stripped-down environment and minimal default `$PATH`.',
      },
      {
        id: 'q22-3',
        question: 'What is the primary function of `logrotate` in Linux systems administration?',
        options: [
          'It translates logs into different languages.',
          'It automatically compresses, archives, and removes old log files to prevent logs from filling the hard drive.',
          'It displays logs in 3D.',
          'It deletes the operating system kernel.',
        ],
        correctIndex: 1,
        explanation: '`logrotate` manages disk growth by cycling, compressing, and pruning log files automatically.',
      },
    ],
    cheatSheet: [
      {
        name: 'crontab',
        syntax: 'crontab [-e | -l | -r]',
        description: 'Maintain crontab files for individual users.',
        commonFlags: [
          { flag: '-l', description: 'Display current crontab to stdout' },
          { flag: '-e', description: 'Edit current crontab using default editor' },
          { flag: '-r', description: 'Remove current crontab entirely' },
        ],
        realWorldExample: 'crontab -l',
        category: 'devops',
      },
    ],
  },
  {
    id: 'mod-23',
    slug: 'performance-monitoring-and-resource-triage',
    levelId: 'level-5',
    moduleNumber: 23,
    title: 'System Performance Monitoring & Resource Triage',
    shortDescription:
      'Diagnose server bottlenecks: understanding Load Averages (1, 5, 15 min), CPU saturation vs I/O wait, free -m (Buffers/Cache vs Available), top/htop triage, and Out-Of-Memory (OOM) killer mechanics.',
    durationMinutes: 40,
    coreCommands: ['uptime', 'free', 'top'],
    theory: {
      overview:
        'When an infrastructure alert fires or user response times spike, a Site Reliability Engineer must triage the system within seconds. Is the bottleneck CPU saturation? Slow NVMe/disk I/O wait? Memory exhaustion triggering Linux kernel Out-Of-Memory (OOM) killer? Or network socket exhaustion? Understanding system metrics and load averages is crucial.',
      keyConcepts: [
        {
          title: 'Understanding Load Averages',
          content:
            'When you run `uptime`, you see three numbers:\n`load average: 0.14, 0.22, 0.18` (1-min, 5-min, 15-min averages).\n\nWhat is Load Average?\nLoad average measures the average number of processes that are either:\n1. Actively running on a CPU core (`R` state).\n2. Waiting in the run queue for CPU time (`R` state).\n3. Blocked waiting for uninterruptible disk I/O (`D` state)!\n\nRule of Thumb:\n- Divide the load average by the number of CPU cores (`nproc`).\n- If Load / Cores < 1.0: System is healthy with spare capacity.\n- If Load / Cores = 1.0: System is running at 100% capacity.\n- If Load / Cores > 2.0: Significant queuing; requests are delayed.\n- High Load + Low CPU% = Disk I/O bottleneck (processes blocked on slow storage)!',
          diagramAscii: `  Load Average vs CPU Cores (4 Cores):
  [ 0.8 ] -> ~20% capacity  (Healthy)
  [ 4.0 ] -> 100% capacity (Saturated)
  [ 12.0] -> 300% overload (Severe queueing)`,
        },
        {
          title: 'Demystifying Memory: free -m',
          content:
            'When you run `free -m`, you see:\n\n```text\n              total        used        free      shared  buff/cache   available\nMem:          16384        4210        8421         184        3753       12104\n```\n\n- `used`: Memory currently consumed by user applications.\n- `buff/cache`: Disk caching! The Linux kernel borrows unused RAM to cache files and directory structures in memory for extreme read performance. If an application suddenly needs RAM, the kernel frees buff/cache instantly.\n- `available`: The TRUE metric of health! How much RAM can be given to new processes without swapping.',
        },
        {
          title: 'The Linux Out-Of-Memory (OOM) Killer',
          content:
            'Linux allows memory overcommit (promising more virtual RAM than physical RAM available). When physical RAM and swap are completely exhausted, the kernel activates the OOM Killer: it scores running processes (`oom_score`) and immediately sends `SIGKILL` to the most memory-hungry non-essential process to save the kernel from crashing!\n\nInspect OOM events:\n`dmesg -T | grep -i "oom"` or `grep -i "killed process" /var/log/syslog`.',
        },
      ],
      productionBestPractices: [
        'Always configure alert thresholds on `available` memory, NOT `free` memory, because healthy Linux servers naturally keep `free` RAM low by caching disks.',
        'Protect critical daemons (like SSH or database primaries) from being killed by the OOM killer by adjusting `oom_score_adj`: `echo -1000 > /proc/<PID>/oom_score_adj`.',
        'Use `vmstat 1` to watch context switches, CPU user vs system time, and block in/out (bi/bo) during incidents.',
      ],
      commonPitfalls: [
        'Assuming a server with 100MB "free" RAM is running out of memory: check `available` memory first! If `available` is 10GB, the machine is completely fine.',
        'Adding massive swap space on slow cloud disks: when a system swaps aggressively, disk latency increases from microseconds to milliseconds ("thrashing"), causing entire services to freeze.',
      ],
      realWorldScenario: {
        title: 'Triage Production Database Latency Spike',
        situation:
          'API latency jumps from 20ms to 8,000ms. CPU usage is only 15%, but load average has skyrocketed to 32 on an 8-core host.',
        howLinuxHelps:
          'The engineer inspects `top` and observes CPU `%wa` (I/O wait) at 78%! The bottleneck is not CPU capacity, but disk write contention. Running `iostat -x 1` pinpoints an unindexed database query performing massive disk reads. Adding the missing database index drops load average back to 0.4.',
      },
    },
    lab: {
      id: 'lab-23',
      title: 'Lab 23: Triaging System Performance',
      scenario:
        'A performance audit requires inspecting the current system load average, memory distribution, and process utilization.',
      objective:
        'Run `uptime` to check load averages, inspect RAM breakdown with `free -m`, and check process resource ranking with `top`.',
      tasks: [
        {
          id: 't1',
          instruction: 'Execute `uptime` to view the 1, 5, and 15 minute system load averages.',
          hint: 'Run: uptime',
          solutionCommand: 'uptime',
        },
        {
          id: 't2',
          instruction: 'Display memory usage in megabytes using `free -m`.',
          hint: 'Run: free -m',
          solutionCommand: 'free -m',
        },
        {
          id: 't3',
          instruction: 'Inspect top resource-consuming processes by executing `top`.',
          hint: 'Run: top',
          solutionCommand: 'top',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'User checked uptime',
          checkType: 'command_executed_match',
          expectedValue: 'uptime',
          failureMessage: 'Run `uptime` to inspect load averages.',
        },
        {
          id: 'v2',
          description: 'User inspected memory with free',
          checkType: 'command_executed_match',
          expectedValue: 'free',
          failureMessage: 'Run `free -m` to inspect memory metrics.',
        },
      ],
    },
    quiz: [
      {
        id: 'q23-1',
        question: 'If a 4-core Linux server displays a 15-minute load average of 8.0, what does this indicate?',
        options: [
          'The CPU is operating at 25% capacity.',
          'The system is under heavy overload with on average 4 processes constantly waiting in queue for CPU or disk I/O.',
          'The internet connection is severed.',
          'The server is completely idle.',
        ],
        correctIndex: 1,
        explanation: 'A load of 8.0 on a 4-core machine represents 200% load, meaning processes are queuing and delayed.',
      },
      {
        id: 'q23-2',
        question: 'Which value in `free -m` reflects the true amount of memory that can be allocated to applications without swapping?',
        options: ['free', 'shared', 'available', 'buff/cache'],
        correctIndex: 2,
        explanation: '`available` represents memory that can be immediately allocated, including reclaimable page caches.',
      },
      {
        id: 'q23-3',
        question: 'If CPU usage is low (10%) but Load Average is very high (20.0), what is typically the bottleneck?',
        options: ['High Disk I/O wait (processes in D state waiting for disk reads/writes)', 'RAM speed is too fast', 'The monitor resolution is too high', 'Keyboard buffer overflow'],
        correctIndex: 0,
        explanation: 'Load average includes processes in uninterruptible sleep (`D` state), which occurs during heavy disk I/O waits.',
      },
    ],
    cheatSheet: [
      {
        name: 'free',
        syntax: 'free [OPTIONS]',
        description: 'Display amount of free and used memory in the system.',
        commonFlags: [
          { flag: '-m', description: 'Show output in mebibytes (MB)' },
          { flag: '-h', description: 'Show human-readable scaling (MB, GB)' },
        ],
        realWorldExample: 'free -h',
        category: 'system',
      },
      {
        name: 'top',
        syntax: 'top',
        description: 'Display Linux processes and dynamic real-time view of running system.',
        commonFlags: [],
        realWorldExample: 'top',
        category: 'system',
      },
    ],
  },
  {
    id: 'mod-24',
    slug: 'security-hardening-firewalls-and-auditing',
    levelId: 'level-5',
    moduleNumber: 24,
    title: 'Security Hardening, Firewalls & Audit Trails',
    shortDescription:
      'Fortify Linux servers: host firewalls (ufw, iptables), security limits (/etc/security/limits.conf), file auditing, SSH hardening, and analyzing /var/log/auth.log security trails.',
    durationMinutes: 40,
    coreCommands: ['cat', 'grep', 'whoami'],
    theory: {
      overview:
        'A default Linux installation is not hardened for public internet exposure. Within minutes of provisioning a public IP, bots scan for open ports, default passwords, and unpatched CVEs. A systems engineer must establish Defense-in-Depth: configure host-based packet filtering firewalls (UFW / Netfilter), enforce file descriptor and memory limits, and audit authentication logs.',
      keyConcepts: [
        {
          title: 'Host-Based Firewalls: UFW & Netfilter',
          content:
            'The Linux kernel includes Netfilter, an in-kernel packet filtering framework. Tools like `iptables` and `ufw` (Uncomplicated Firewall) provide user-space control:\n\n- Basic UFW Production Rules:\n  1. `ufw default deny incoming`: Block all unrequested incoming traffic by default!\n  2. `ufw default allow outgoing`: Allow server to reach external APIs.\n  3. `ufw allow 22/tcp`: Allow SSH access (CRITICAL: do this before enabling ufw!).\n  4. `ufw allow 80,443/tcp`: Allow HTTP/HTTPS traffic.\n  5. `ufw allow from 192.168.1.0/24 to any port 5432`: Allow internal database access only from private subnet.\n  6. `ufw enable`: Turn on the firewall.',
          diagramAscii: `  [ Incoming Network Packet ]
                 |
        (UFW / Netfilter Firewall)
            /                 \\
   Port 22/80/443        Port 23 / Unknown
     [ ALLOW ]               [ DROP / REJECT ]
         v                          v
   [ Application ]          (Logged to syslog)`,
        },
        {
          title: 'System Limits: /etc/security/limits.conf',
          content:
            'Linux restricts resource consumption per user process to prevent denial-of-service from fork bombs or file handle exhaustion:\n- `nofile`: Maximum number of open file descriptors (sockets and files). Production web servers (Nginx, Node, Go) handling high concurrency require `65535` or higher (default is often 1024!).\n- `nproc`: Maximum number of processes.\n- Inspect current limits: `ulimit -n` (open files), `ulimit -u` (processes).',
        },
        {
          title: 'Auditing Authentication in /var/log/auth.log',
          content:
            'All authentication events (`sudo`, `ssh`, console logins) are recorded in `/var/log/auth.log` (or `/var/log/secure` on RHEL):\n- Failed passwords: `grep "Failed password" /var/log/auth.log`\n- Sudo command history: `grep "sudo:" /var/log/auth.log` reveals exact commands executed with elevated rights, who ran them, and timestamp.',
        },
      ],
      productionBestPractices: [
        'ALWAYS run `ufw allow 22/tcp` BEFORE running `ufw enable`! If you enable the firewall without an allow rule for SSH, you will instantly lock yourself out of your remote cloud server!',
        'Install `fail2ban` on internet-facing hosts to automatically ban IP addresses that exhibit repeated failed password attempts.',
        'Disable root login and password authentication in `/etc/ssh/sshd_config`.',
      ],
      commonPitfalls: [
        'Assuming a cloud security group replaces host-based firewalls: defense-in-depth requires both perimeter security groups AND local host firewalls.',
        'Exhausting file descriptors: an application handling 5,000 simultaneous WebSocket connections will crash with "Too many open files" if `nofile` is kept at default 1024.',
      ],
      realWorldScenario: {
        title: 'Neutralizing Port Scanning & SSH Attack Botnet',
        situation:
          'Security alerts indicate an external IP is scanning open ports and attempting dictionary attacks against internal database ports.',
        howLinuxHelps:
          'The engineer runs `ufw deny from 203.0.113.195` to drop all traffic from the malicious IP at the kernel Netfilter level. The packets are dropped with zero CPU overhead.',
      },
    },
    lab: {
      id: 'lab-24',
      title: 'Lab 24: Security Audit & Log Analysis',
      scenario:
        'Perform a security audit of `/var/log/auth.log` to investigate unauthorized sudo executions and failed SSH connection attempts.',
      objective:
        'Search `/var/log/auth.log` for sudo commands and failed password attempts using `grep`.',
      tasks: [
        {
          id: 't1',
          instruction: 'Search `/var/log/auth.log` for all sudo commands executed on the system.',
          hint: 'Run: grep "sudo:" /var/log/auth.log',
          solutionCommand: 'grep "sudo:" /var/log/auth.log',
        },
        {
          id: 't2',
          instruction: 'Search `/var/log/auth.log` for failed password attempts.',
          hint: 'Run: grep "Failed password" /var/log/auth.log',
          solutionCommand: 'grep "Failed password" /var/log/auth.log',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'User audited auth log with grep',
          checkType: 'command_executed_match',
          expectedValue: 'auth.log',
          failureMessage: 'Run `grep` against `/var/log/auth.log` to audit security events.',
        },
      ],
    },
    quiz: [
      {
        id: 'q24-1',
        question: 'What catastrophic mistake happens if you run `ufw default deny incoming && ufw enable` over SSH without an allow rule for port 22?',
        options: [
          'The server automatically shuts down.',
          'You are instantly locked out of your remote SSH session because all incoming traffic, including SSH, is blocked.',
          'The firewall disables itself.',
          'All user files are encrypted.',
        ],
        correctIndex: 1,
        explanation: 'Blocking all incoming connections without an exception for port 22 immediately severs your SSH connection.',
      },
      {
        id: 'q24-2',
        question: 'Which log file records all `sudo` command executions and SSH authentication attempts on Debian/Ubuntu systems?',
        options: ['/var/log/auth.log', '/var/log/boot.log', '/var/log/dpkg.log', '/var/log/cron'],
        correctIndex: 0,
        explanation: '`/var/log/auth.log` (or `/var/log/secure` on RHEL) logs all authentication and authorization actions.',
      },
      {
        id: 'q24-3',
        question: 'If a high-concurrency web server crashes with "Too many open files", what system configuration limit must be increased?',
        options: ['The monitor refresh rate', 'The `nofile` (number of open file descriptors) limit in `/etc/security/limits.conf` and systemd unit', 'The swap partition size', 'The kernel version'],
        correctIndex: 1,
        explanation: 'Linux limits open file descriptors per process; increasing `nofile` allows high numbers of concurrent network sockets.',
      },
    ],
    cheatSheet: [
      {
        name: 'UFW Firewall',
        syntax: 'ufw [COMMAND]',
        description: 'Manage uncomplicated firewall.',
        commonFlags: [
          { flag: 'status', description: 'Show status of the firewall and its rules' },
          { flag: 'allow PORT', description: 'Allow traffic on specified port' },
          { flag: 'deny IP', description: 'Deny all traffic from specific IP' },
        ],
        realWorldExample: 'ufw allow 22/tcp && ufw enable',
        category: 'security',
      },
    ],
  },
  {
    id: 'mod-25',
    slug: 'production-incidents-and-sre-war-rooms',
    levelId: 'level-5',
    moduleNumber: 25,
    title: 'Production Incident War Room & Triage Scenarios',
    shortDescription:
      'The Capstone SRE War Room: Diagnose and resolve real-world outages—Disk 100% full panic, rogue CPU runaway process, misconfigured permission lockdowns, and network socket exhaustion.',
    durationMinutes: 50,
    coreCommands: ['ps', 'kill', 'df', 'chmod', 'systemctl'],
    theory: {
      overview:
        'In production engineering and Site Reliability Engineering (SRE), theoretical knowledge is put to the test during live outages. When PagerDuty alerts fire at 2:00 AM, there is no time to browse manuals. You need a structured mental diagnostic framework: Scope the impact, isolate the subsystem (CPU, RAM, Disk, Network, Permissions), identify the offending process, execute targeted remediation, and verify service recovery.',
      keyConcepts: [
        {
          title: 'The SRE Outage Triage Framework',
          content:
            'When a server experiences degradation, follow the 5-step triage framework:\n\n1. Check System Vital Signs:\n   - `uptime`: Is Load Average elevated? How long has the machine been up?\n   - `dmesg -T | tail -n 30`: Are there kernel panics, hardware errors, or OOM killer events?\n\n2. Storage Subsystem:\n   - `df -h`: Is any filesystem at 100% capacity?\n   - `df -i`: Are inodes exhausted?\n\n3. Memory & Swapping:\n   - `free -m`: Is `available` memory near zero? Is swap constantly active?\n\n4. CPU & Process Runaways:\n   - `top -b -n 1 | head -n 20`: Which process PID is consuming the most CPU% or Memory%?\n\n5. Networking & Sockets:\n   - `ss -tulnp`: Are target ports listening? Are queues full?',
          diagramAscii: `           [ PAGERDUTY ALERT: Web Service Down ]
                             |
         +-------------------+-------------------+
         |                   |                   |
    [ uptime ]           [ df -h ]           [ free -m ]
  (Load & CPU)         (Disk Space)           (Memory)
         |                   |                   |
    [ ps aux ]          [ du -sh ]          [ ss -tulnp ]
  (Offender PID)       (Large files)        (Open Ports)
         |                   |                   |
  [ kill / restart ]   [ truncate ]         [ rebind ]`,
        },
        {
          title: 'Common Incident Scenarios & Remediation',
          content:
            '- Scenario A: Disk 100% Full:\n  Identify largest files: `du -sh /var/log/* | sort -h`.\n  Never `rm` active logs without reloading: truncate with `> /var/log/app.log` so space is freed immediately!\n\n- Scenario B: Runaway Loop / CPU Spike:\n  Find PID: `ps aux --sort=-%cpu | head -n 5`.\n  Terminate gracefully: `kill -15 <PID>`.\n\n- Scenario C: Permission Lockdown Outage:\n  Web app fails with HTTP 403 Forbidden. Audit directory permissions: `ls -ld /var/www/html`. If permissions were set to 700 owned by root, restore with `chmod 755` and `chown -R www-data:www-data`.',
        },
        {
          title: 'Post-Mortem & Preventative Engineering',
          content:
            'Every production outage ends with a blameless post-mortem:\n- What was the root cause?\n- What was the Time To Detection (TTD) and Time To Recovery (TTR)?\n- What automated guardrails (logrotate, systemd Restart, alerts) can be installed so this incident can never happen again?',
        },
      ],
      productionBestPractices: [
        'Never truncate an active log file by deleting it with `rm` while the application is running: the space will NOT be reclaimed until the daemon exits! Always truncate using `: > file.log` or `truncate -s 0 file.log`.',
        'Record all commands executed during an incident in your incident response Slack channel or document for post-mortem auditing.',
        'Always verify service recovery end-to-end using `curl -Iv` from an external network before marking the incident resolved.',
      ],
      commonPitfalls: [
        'Rebooting the server immediately during an incident: while rebooting may temporarily clear memory, it wipes volatile `/proc`, memory dumps, and logs, making it impossible to determine root cause and preventing future recurrence.',
        'Fixing symptoms without addressing root causes.',
      ],
      realWorldScenario: {
        title: 'Full Production War Room Remediation',
        situation:
          'A multi-tiered outage strikes: a runaway python process is consuming resources, permissions on the environment config were corrupted, and web services are degraded.',
        howLinuxHelps:
          'The engineer systematically inspects the system, terminates the rogue PID (`kill 2104`), restores proper `600` permissions on `projects/config.env`, and validates the service recovery using `curl -I http://localhost:8080`. All operations complete cleanly.',
      },
    },
    lab: {
      id: 'lab-25',
      title: 'Lab 25: The SRE Production Outage War Room',
      scenario:
        'EMERGENCY: You are on-call. A rogue background Python process is running, sensitive configuration permissions must be verified, and system health must be audited before declaring the incident resolved.',
      objective:
        'Locate and terminate the rogue python process (PID 2104), ensure `projects/config.env` has secure 600 permissions, and verify disk space with `df -h`.',
      tasks: [
        {
          id: 't1',
          instruction: 'Inspect the running processes with `ps aux` and terminate the python3 process (PID 2104) with `kill 2104`.',
          hint: 'Run: kill 2104',
          solutionCommand: 'kill 2104',
        },
        {
          id: 't2',
          instruction: 'Ensure `projects/config.env` has locked-down permissions of 600 using `chmod 600 projects/config.env`.',
          hint: 'Run: chmod 600 projects/config.env',
          solutionCommand: 'chmod 600 projects/config.env',
        },
        {
          id: 't3',
          instruction: 'Audit system storage capacity using `df -h` to verify no filesystems are full.',
          hint: 'Run: df -h',
          solutionCommand: 'df -h',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'config.env has secure mode 600',
          checkType: 'file_mode_equals',
          targetPath: '/home/student/projects/config.env',
          expectedValue: 0o600,
          failureMessage: 'File projects/config.env does not have 600 permissions.',
        },
        {
          id: 'v2',
          description: 'User executed df to verify storage',
          checkType: 'command_executed_match',
          expectedValue: 'df',
          failureMessage: 'Run `df -h` to verify storage health.',
        },
      ],
    },
    quiz: [
      {
        id: 'q25-1',
        question: 'Why should you avoid immediately rebooting a production server when an unexplained performance degradation strikes?',
        options: [
          'Because reboots permanently damage SSD storage.',
          'Because rebooting wipes in-memory process diagnostics, open file descriptors, and volatile memory, preventing engineers from discovering the true root cause.',
          'Because Linux cannot reboot without a CD-ROM.',
          'Because reboots change the server IP address automatically.',
        ],
        correctIndex: 1,
        explanation: 'Rebooting destroys diagnostic evidence (running states, memory maps, /proc metrics), ensuring the outage will recur.',
      },
      {
        id: 'q25-2',
        question: 'If an active log file is deleted with `rm` while an application continues writing to it, why doesn\'t `df -h` show free space?',
        options: [
          'The kernel keeps the file inode and disk blocks allocated as long as a running process holds an open file descriptor to it.',
          'The hard drive must be re-partitioned.',
          'Linux disks only update space once a month.',
          'The file was sent to the Windows recycle bin.',
        ],
        correctIndex: 0,
        explanation: 'Linux does not deallocate storage blocks until all open file handles are closed.',
      },
      {
        id: 'q25-3',
        question: 'What is the recommended method to safely truncate a live log file to 0 bytes without disrupting running processes?',
        options: [
          'rm -rf /var/log/app.log',
          ': > /var/log/app.log (or truncate -s 0 /var/log/app.log)',
          'mv /var/log/app.log /dev/null',
          'sed -i "delete all" /var/log/app.log',
        ],
        correctIndex: 1,
        explanation: 'Truncating the file preserves the open file descriptor while immediately reclaiming disk blocks.',
      },
    ],
    cheatSheet: [
      {
        name: 'SRE Triage Checklist',
        syntax: 'uptime && free -h && df -h && top',
        description: 'Instant 4-step server vital health check.',
        commonFlags: [],
        realWorldExample: 'uptime && df -h',
        category: 'devops',
      },
    ],
  },
];
