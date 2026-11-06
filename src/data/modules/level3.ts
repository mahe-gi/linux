import { CourseModule } from '@/types/course';

export const LEVEL_3_MODULES: CourseModule[] = [
  {
    id: 'mod-11',
    slug: 'finding-files-with-find-which-and-whereis',
    levelId: 'level-3',
    moduleNumber: 11,
    title: 'High-Performance File Finding with find',
    shortDescription:
      'Locate files across millions of inodes: find by name, size (+100M), modification time (-mtime -7), type (-type f / -type d), permissions (-perm), and execute commands with -exec.',
    durationMinutes: 35,
    coreCommands: ['find', 'which', 'whereis'],
    theory: {
      overview:
        '`find` is one of the most powerful and flexible utilities in the Unix ecosystem. Instead of relying on a pre-built static database, `find` dynamically traverses directory trees in real time, evaluating expressions against file metadata (inodes, size, timestamps, permissions, ownership).',
      keyConcepts: [
        {
          title: 'Syntax and Common Criteria of find',
          content:
            '`find [START_PATH...] [EXPRESSION...]`\n\n1. By Name: `find /etc -name "*.conf"` (case-sensitive) or `-iname "*.conf"` (case-insensitive).\n2. By Type: `-type f` (regular files), `-type d` (directories), `-type l` (symlinks).\n3. By Size: `-size +100M` (files greater than 100 megabytes), `-size -10k` (less than 10 kilobytes), `-size +1G` (greater than 1 gigabyte).\n4. By Modification Time: `-mtime -7` (modified in the last 7 days), `-mtime +30` (older than 30 days).\n5. By Ownership & Permissions: `-user student`, `-group www-data`, `-perm 644`.',
          diagramAscii: `  find   /var/log   -name "*.log"   -size +10M   -mtime -7
         |--------| |------------|  |----------| |--------|
          Starting      Pattern         Size        Age
         Directory     Matching      Threshold    Filter`,
        },
        {
          title: 'Executing Actions with -exec and -delete',
          content:
            '- Execute command on each match:\n  `find /var/log -name "*.log" -exec rm -f {} \\;`\n  * `{}`: Placeholder replaced by the pathname of each matched file.\n  * `\\;`: Terminates the command for each file individual invocation.\n  * `+`: Optimizes execution by batching multiple files into a single command invocation (like xargs): `find . -name "*.py" -exec chmod 644 {} +`.\n- Built-in Delete Action: `find /tmp -name "*.tmp" -delete`.',
        },
        {
          title: 'which vs whereis vs find',
          content:
            '- `which <cmd>`: Searches only the directories listed in `$PATH` to tell you which binary executes when you type `<cmd>`.\n- `whereis <cmd>`: Searches standard binary, manual, and source directories.\n- `find`: Searches real filesystems exhaustively matching arbitrary attributes.',
        },
      ],
      productionBestPractices: [
        'Always test your `find` command without `-delete` or `-exec rm` first! Inspect the printed list to verify that only the expected files match before executing destructive actions.',
        'Quote wildcard expressions passed to `-name`: `find . -name "*.log"` (if you forget quotes, the shell expands `*.log` in the current directory before passing it to find!).',
        'When searching root (`/`), redirect stderr to `/dev/null` to suppress "Permission denied" warnings: `find / -name "nginx.conf" 2>/dev/null`.',
      ],
      commonPitfalls: [
        'Forgetting the terminating `\\;` or `+` in `-exec`: find will throw `find: missing argument to -exec`.',
        'Using `-mtime 7` instead of `-mtime -7`: `7` means modified EXACTLY 7 days ago, whereas `-7` means modified within the last 7 days.',
      ],
      realWorldScenario: {
        title: 'Emergency Disk Cleanup of Stale Core Dumps',
        situation:
          'A crashed Java process generated 50GB of core memory dump files across random subdirectories, triggering a critical disk space alert.',
        howLinuxHelps:
          'The engineer runs: `find /var/app -name "core.*" -size +50M -mtime -2 -exec rm -v {} \\;`. The disk is restored immediately without touching active log files.',
      },
    },
    lab: {
      id: 'lab-11',
      title: 'Lab 11: Finding Files Across the Filesystem',
      scenario:
        'You need to locate all `.py` Python files under `/home/student`, find all `.conf` files in `/etc`, and discover the executable path for the python interpreter.',
      objective:
        'Run `find /home/student -name "*.py"` to locate Python scripts, and search for the Python binary with `which python3`.',
      tasks: [
        {
          id: 't1',
          instruction: 'Search for all files ending with `.py` in `/home/student` using `find /home/student -name "*.py"`.',
          hint: 'Run: find /home/student -name "*.py"',
          solutionCommand: 'find /home/student -name "*.py"',
        },
        {
          id: 't2',
          instruction: 'Find the executable path of `python3` using `which python3`.',
          hint: 'Run: which python3',
          solutionCommand: 'which python3',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'User executed find command',
          checkType: 'command_executed_match',
          expectedValue: 'find',
          failureMessage: 'Run `find /home/student -name "*.py"` to search for Python files.',
        },
      ],
    },
    quiz: [
      {
        id: 'q11-1',
        question: 'Why should wildcards passed to `find -name` be enclosed in quotes (e.g. `find . -name "*.log"`)?',
        options: [
          'Because find only supports uppercase letters.',
          'To prevent the shell from expanding the wildcard before passing the pattern argument to find.',
          'Because quotes encrypt the search query.',
          'To make the search run in the background.',
        ],
        correctIndex: 1,
        explanation: 'Quoting prevents the shell from expanding `*.log` into filenames from the current directory.',
      },
      {
        id: 'q11-2',
        question: 'What does the placeholder `{}` represent in `find ... -exec rm {} \\;`?',
        options: [
          'An empty string.',
          'The current working directory.',
          'The pathname of the currently matched file.',
          'A list of all users on the system.',
        ],
        correctIndex: 2,
        explanation: 'In `-exec`, `{}` is replaced by the pathname of the file currently being processed.',
      },
      {
        id: 'q11-3',
        question: 'Which flag instructs `find` to match only regular files and skip directories?',
        options: ['-type f', '-file only', '-f', '-type file'],
        correctIndex: 0,
        explanation: '`-type f` restricts matches strictly to regular files.',
      },
    ],
    cheatSheet: [
      {
        name: 'find',
        syntax: 'find [PATH] [OPTIONS]',
        description: 'Search for files in a directory hierarchy.',
        commonFlags: [
          { flag: '-name PATTERN', description: 'Match base filename pattern (case-sensitive)' },
          { flag: '-iname PATTERN', description: 'Match base filename pattern (case-insensitive)' },
          { flag: '-type [f|d|l]', description: 'Filter by type: f (file), d (dir), l (symlink)' },
          { flag: '-size [+|-]N[k|M|G]', description: 'File uses more/less than N units of space' },
          { flag: '-mtime [+|-]N', description: 'File data was last modified N*24 hours ago' },
          { flag: '-exec CMD {} \\;', description: 'Execute CMD on each matched file' },
        ],
        realWorldExample: 'find /var/log -name "*.log" -size +100M',
        category: 'file-ops',
      },
    ],
  },
  {
    id: 'mod-12',
    slug: 'pattern-searching-with-grep-and-regex',
    levelId: 'level-3',
    moduleNumber: 12,
    title: 'Text Wrangling & Pattern Matching with grep',
    shortDescription:
      'Master grep and regular expressions: case-insensitivity (-i), invert match (-v), line numbers (-n), extended regex (-E), line anchors (^, $), character classes, and counting matches (-c).',
    durationMinutes: 35,
    coreCommands: ['grep'],
    theory: {
      overview:
        '`grep` (Global Regular Expression Print) is the indisputable king of command-line text searching. It scans lines of text, tests them against a pattern or regular expression, and outputs matching lines. From searching gigabytes of access logs to scanning source code for security vulnerabilities, `grep` is an engineer’s everyday magnifying glass.',
      keyConcepts: [
        {
          title: 'The Essential grep Flags',
          content:
            '- `-i`: Ignore case distinctions (e.g. matches "error", "Error", "ERROR").\n- `-v`: Invert match (prints lines that DO NOT match the pattern).\n- `-n`: Print 1-based line numbers alongside matched lines.\n- `-c`: Output ONLY the count of matching lines.\n- `-r` or `-R`: Search recursively through all subdirectories.\n- `-l`: Print only the names of files containing matches (suppress line contents).\n- `-E`: Extended Regular Expressions (supports `+`, `?`, `|`, and `()` without backslash escaping).',
          diagramAscii: `  cat /var/log/syslog | grep -i "failed" | wc -l
       [Log File]     -> [Filtered Matches] -> [Count]`,
        },
        {
          title: 'Regular Expression (Regex) Fundamentals',
          content:
            'Regex is a formal language for pattern description:\n- Anchors:\n  * `^`: Anchors pattern to start of line (e.g. `^root` matches lines starting with "root").\n  * `$`: Anchors pattern to end of line (e.g. `bash$` matches lines ending with "bash").\n  * `^$`: Matches completely empty lines!\n- Character Sets:\n  * `.`: Matches any single character except newline.\n  * `[0-9]`: Matches any digit.\n  * `[^a-z]`: Negated set; matches anything that is NOT a lowercase letter.\n- Quantifiers (with `grep -E`):\n  * `*`: 0 or more occurrences.\n  * `+`: 1 or more occurrences.\n  * `?`: 0 or 1 occurrence.\n  * `(error|fail|crit)`: Alternation / OR logic.',
        },
        {
          title: 'Common grep Recipes',
          content:
            '- Strip empty lines and comments from a config:\n  `grep -v -E "^#|^$" /etc/ssh/sshd_config`\n- Find all failed SSH logins:\n  `grep "Failed password" /var/log/auth.log`\n- Find IP addresses in a log:\n  `grep -E -o "[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}" /var/log/nginx/access.log`',
        },
      ],
      productionBestPractices: [
        'Always use single quotes around regex patterns to prevent the shell from interpreting special characters: `grep \'^user.*bash$\' file` (without quotes, `$` would be interpreted as a shell variable!).',
        'Use `grep -m 10` on large files to stop searching after finding 10 matches instead of scanning the remaining 50 gigabytes.',
        'Combine `grep -v` to filter out benign health-check traffic when analyzing production web logs: `grep -v "healthcheck" access.log`.',
      ],
      commonPitfalls: [
        'Forgetting the `-E` flag when using extended operators like `+`, `|`, or `()`: basic grep treats `+` as a literal plus sign!',
        'Grepping for a pattern that matches the grep process itself in `ps aux`: e.g. `ps aux | grep nginx` often matches `grep nginx`. (Pro tip: use `grep [n]ginx` so the grep process pattern doesn\'t match its own command line!).',
      ],
      realWorldScenario: {
        title: 'Auditing Brute-Force SSH Attacks',
        situation:
          'A security analyst is notified of potential brute force login attempts against a bastion jump box.',
        howLinuxHelps:
          'The analyst runs: `grep "Failed password" /var/log/auth.log | grep -oE "from [0-9.]+" | sort | uniq -c | sort -nr`. The output instantly reveals the attacker IP address and exact count of failed attempts.',
      },
    },
    lab: {
      id: 'lab-12',
      title: 'Lab 12: Advanced Pattern Search with grep',
      scenario:
        'You need to audit system logs and user accounts. Extract all system users assigned to `/bin/bash` in `/etc/passwd`, search `/var/log/nginx/access.log` for HTTP 404 errors, and count total matching lines.',
      objective:
        'Use `grep` with line anchors and options to search `/etc/passwd` and `/var/log/nginx/access.log`.',
      tasks: [
        {
          id: 't1',
          instruction: 'Search `/etc/passwd` for lines ending with "bash" using `grep "bash$" /etc/passwd`.',
          hint: 'Run: grep "bash$" /etc/passwd',
          solutionCommand: 'grep "bash$" /etc/passwd',
        },
        {
          id: 't2',
          instruction: 'Search `/var/log/nginx/access.log` for requests that returned a 404 status code.',
          hint: 'Run: grep "404" /var/log/nginx/access.log',
          solutionCommand: 'grep "404" /var/log/nginx/access.log',
        },
        {
          id: 't3',
          instruction: 'Count the total number of lines in `/var/log/syslog` containing "systemd" using `grep -c "systemd" /var/log/syslog`.',
          hint: 'Run: grep -c "systemd" /var/log/syslog',
          solutionCommand: 'grep -c "systemd" /var/log/syslog',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'User executed grep on passwd',
          checkType: 'command_executed_match',
          expectedValue: 'grep',
          failureMessage: 'Run `grep` to search the files.',
        },
      ],
    },
    quiz: [
      {
        id: 'q12-1',
        question: 'Which regular expression matches lines that start with "Error" and end with "exit"?',
        options: ['^Error.*exit$', 'Error+exit', '.*Error.*exit.*', '$Error.*exit^'],
        correctIndex: 0,
        explanation: '`^` asserts the start of the line, `.*` matches any characters in between, and `$` asserts the end of the line.',
      },
      {
        id: 'q12-2',
        question: 'What does the `-v` flag in `grep` do?',
        options: [
          'Enables verbose mode.',
          'Inverts the match, returning only lines that do NOT match the pattern.',
          'Verifies file checksums.',
          'Translates letters to lowercase.',
        ],
        correctIndex: 1,
        explanation: '`-v` (invert-match) selects non-matching lines.',
      },
      {
        id: 'q12-3',
        question: 'How do you strip comments (`#`) and blank lines from a configuration file?',
        options: [
          'grep -v -E "^#|^$" file.conf',
          'cat file.conf | clean',
          'sed "delete comments"',
          'grep -c "#" file.conf',
        ],
        correctIndex: 0,
        explanation: '`-v` inverts match, and `^#|^$` matches lines beginning with `#` OR empty lines.',
      },
    ],
    cheatSheet: [
      {
        name: 'grep',
        syntax: 'grep [OPTIONS] PATTERN [FILE...]',
        description: 'Print lines that match patterns.',
        commonFlags: [
          { flag: '-i', description: 'Ignore case distinctions in patterns and input' },
          { flag: '-v', description: 'Invert the sense of matching (select non-matching lines)' },
          { flag: '-c', description: 'Suppress normal output; print a count of matching lines' },
          { flag: '-n', description: 'Prefix each line of output with its line number' },
          { flag: '-E', description: 'Interpret PATTERNS as extended regular expressions (ERE)' },
          { flag: '-r', description: 'Read all files under each directory recursively' },
        ],
        realWorldExample: 'grep -E -i "error|exception|fatal" /var/log/syslog',
        category: 'text-processing',
      },
    ],
  },
  {
    id: 'mod-13',
    slug: 'stream-filtering-with-cut-sort-uniq-and-tr',
    levelId: 'level-3',
    moduleNumber: 13,
    title: 'Data Extraction & Filtering: cut, sort, uniq & tr',
    shortDescription:
      'Wrangle delimited tables and logs: column extraction with cut (-d, -f), sorting alphabetically and numerically (sort -n, -r), deduplication (uniq -c), and character transliteration (tr).',
    durationMinutes: 30,
    coreCommands: ['cut', 'sort', 'uniq', 'tr'],
    theory: {
      overview:
        'Linux system files and logs are formatted as delimited records: `/etc/passwd` is colon-delimited (`:`), web logs are space-delimited, and CSVs are comma-delimited. By mastering `cut`, `sort`, `uniq`, and `tr`, you can parse, extract columns, sort values, and aggregate frequency distributions in real time directly on the command line.',
      keyConcepts: [
        {
          title: 'Extracting Columns with cut',
          content:
            '- `cut -d: -f1 /etc/passwd`: Use `:` as delimiter (`-d:`) and extract field 1 (`-f1`, usernames).\n- `cut -d: -f1,7 /etc/passwd`: Extract fields 1 and 7 (username and default shell).\n- `cut -c1-10 file.txt`: Extract character positions 1 through 10 of each line.',
        },
        {
          title: 'Ordering Lines with sort',
          content:
            '- `sort file.txt`: Standard lexicographical (alphabetical) sort.\n- `sort -n`: Numerical sort (sorts `10` AFTER `2`, unlike alphabetical sort which puts `10` before `2`!).\n- `sort -r`: Reverse sorting order (descending).\n- `sort -u`: Sort and remove duplicates in one step.',
        },
        {
          title: 'Counting and Deduplicating with uniq',
          content:
            'CRITICAL RULE: `uniq` ONLY removes or counts adjacent duplicate lines! Therefore, you must ALWAYS sort your input before passing it into `uniq`:\n`sort file.txt | uniq -c`\n\n- `uniq -c`: Prefix lines by the number of occurrences.\n- `uniq -d`: Output only duplicate lines.',
          diagramAscii: `  [ Unsorted Stream ]
            |
         (sort)
            v
  [ Sorted / Clustered ]
            |
        (uniq -c)
            v
  [ Count of Occurrences ]`,
        },
        {
          title: 'Character Transliteration with tr',
          content:
            '`tr` (Translate) reads strictly from stdin and replaces or deletes characters:\n- Convert to uppercase: `cat file.txt | tr \'[:lower:]\' \'[:upper:]\'`\n- Replace colons with tabs: `cat /etc/passwd | tr \':\' \'\\t\'`\n- Delete digits: `cat data.txt | tr -d \'0-9\'`',
        },
      ],
      productionBestPractices: [
        'Never run `uniq -c` without running `sort` first! Unsorted duplicate lines will be counted as separate individual groups.',
        'When sorting large files, sort numerically using `sort -n` or human-readable sizes using `sort -h` (e.g. `du -sh * | sort -h`).',
        'Sort frequency counts descending using `sort -nr` after `uniq -c` to show top offenders at the top.',
      ],
      commonPitfalls: [
        'Attempting `cut -d" "`: Multiple consecutive spaces count as separate empty delimiters. For whitespace-separated tables with variable spacing (like `ps aux` or `df -h`), use `awk` instead of `cut`.',
        'Passing a filename argument to `tr`: `tr` does NOT take filename arguments; it reads only from standard input via pipe or `<`.',
      ],
      realWorldScenario: {
        title: 'Top 10 IP Addresses Hitting Production API',
        situation:
          'A DDoS spike hits a web gateway. The infrastructure team needs a live breakdown of the top client IP addresses making requests.',
        howLinuxHelps:
          'The engineer runs: `cut -d" " -f1 /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -n 10`. The top attacking IPs appear within 3 seconds, ready to be blocked on the firewall.',
      },
    },
    lab: {
      id: 'lab-13',
      title: 'Lab 13: Parsing System Users and Logs',
      scenario:
        'Extract all usernames from `/etc/passwd`, sort them alphabetically, and count unique web client IPs from `/var/log/nginx/access.log`.',
      objective:
        'Use `cut` to extract field 1 from `/etc/passwd`, pipe through `sort`, and extract IP frequencies from `/var/log/nginx/access.log`.',
      tasks: [
        {
          id: 't1',
          instruction: 'Extract all usernames (field 1) from `/etc/passwd` using `cut -d: -f1 /etc/passwd`.',
          hint: 'Run: cut -d: -f1 /etc/passwd',
          solutionCommand: 'cut -d: -f1 /etc/passwd',
        },
        {
          id: 't2',
          instruction: 'Extract usernames, sort them alphabetically, and save them to `/home/student/sorted_users.txt`.',
          hint: 'Run: cut -d: -f1 /etc/passwd | sort > sorted_users.txt',
          solutionCommand: 'cut -d: -f1 /etc/passwd | sort > sorted_users.txt',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'sorted_users.txt exists',
          checkType: 'file_exists',
          targetPath: '/home/student/sorted_users.txt',
          failureMessage: 'File /home/student/sorted_users.txt was not created.',
        },
        {
          id: 'v2',
          description: 'sorted_users.txt contains root and student',
          checkType: 'file_content_contains',
          targetPath: '/home/student/sorted_users.txt',
          expectedValue: 'student',
          failureMessage: 'File sorted_users.txt does not contain expected usernames.',
        },
      ],
    },
    quiz: [
      {
        id: 'q13-1',
        question: 'Why must input always be sorted before running `uniq`?',
        options: [
          'Because uniq fails with an error if input is not alphabetical.',
          'Because uniq only compares adjacent lines; non-adjacent identical lines will not be grouped.',
          'Because sort encrypts the text for uniq.',
          'Because uniq reverses the file order.',
        ],
        correctIndex: 1,
        explanation: '`uniq` compares consecutive adjacent lines. If duplicates are scattered across the file, `sort` is required to cluster them.',
      },
      {
        id: 'q13-2',
        question: 'How do you extract the 3rd column of a CSV file (comma-delimited)?',
        options: ['cut -d, -f3 data.csv', 'grep -c 3 data.csv', 'split -3 data.csv', 'sort -f3 data.csv'],
        correctIndex: 0,
        explanation: '`-d,` sets the delimiter to comma, and `-f3` selects field 3.',
      },
      {
        id: 'q13-3',
        question: 'Which sort flag sorts numbers correctly according to mathematical value rather than alphabetical order?',
        options: ['-a', '-n', '-m', '-d'],
        correctIndex: 1,
        explanation: '`-n` performs numerical string comparison.',
      },
    ],
    cheatSheet: [
      {
        name: 'cut',
        syntax: 'cut -d DELIM -f FIELDS [FILE]',
        description: 'Remove sections from each line of files.',
        commonFlags: [
          { flag: '-d DELIM', description: 'Use DELIM instead of TAB for field delimiter' },
          { flag: '-f LIST', description: 'Select only these fields' },
        ],
        realWorldExample: 'cut -d: -f1,7 /etc/passwd',
        category: 'text-processing',
      },
      {
        name: 'sort',
        syntax: 'sort [OPTIONS] [FILE]',
        description: 'Sort lines of text files.',
        commonFlags: [
          { flag: '-n', description: 'Compare according to string numerical value' },
          { flag: '-r', description: 'Reverse the result of comparisons' },
          { flag: '-u', description: 'Output only the first of an equal run (unique)' },
        ],
        realWorldExample: 'sort -nr ip_counts.txt',
        category: 'text-processing',
      },
      {
        name: 'uniq',
        syntax: 'uniq [OPTIONS] [INPUT [OUTPUT]]',
        description: 'Report or omit repeated lines.',
        commonFlags: [
          { flag: '-c', description: 'Prefix lines by the number of occurrences' },
          { flag: '-d', description: 'Only print duplicate lines' },
        ],
        realWorldExample: 'sort file.txt | uniq -c',
        category: 'text-processing',
      },
    ],
  },
  {
    id: 'mod-14',
    slug: 'stream-editing-with-sed',
    levelId: 'level-3',
    moduleNumber: 14,
    title: 'Stream Editing & Automated Transformation with sed',
    shortDescription:
      'Master sed (Stream Editor): global find-and-replace (s/old/new/g), in-place file modifications (-i), line addressing, deleting lines (d), and automated config templating.',
    durationMinutes: 35,
    coreCommands: ['sed'],
    theory: {
      overview:
        '`sed` is a stream editor that transforms text streams on-the-fly. Unlike interactive text editors (nano, vim) that require a human to manually open a buffer and press keys, `sed` processes lines according to scripted rules, making it indispensable for automated Docker builds, server provisioning, and CI/CD config injection.',
      keyConcepts: [
        {
          title: 'The Substitution Command: s/find/replace/flags',
          content:
            'The core syntax of sed is:\n`sed \'s/search_pattern/replacement_text/flags\' input.txt`\n\n- `s`: Substitution command.\n- `/`: Delimiter (can be changed to `#` or `|` if your text contains forward slashes, e.g. paths!).\n- Flags:\n  * `g` (Global): Replace ALL occurrences on each line (without `g`, sed only replaces the FIRST occurrence on each line!).\n  * `i`: Case-insensitive match.\n  * `p`: Print only modified lines.',
          diagramAscii: `   sed 's / 8080 / 443 / g' config.env
        |    |      |    |
      Subst Find Replace Global`,
        },
        {
          title: 'In-Place Editing with -i',
          content:
            'By default, `sed` outputs the modified stream to stdout without altering the original file on disk. To modify the file directly in-place, pass the `-i` flag:\n`sed -i \'s/PORT=8080/PORT=3000/\' /home/student/projects/config.env`\n\nTo make a backup before modifying in-place:\n`sed -i.bak \'s/old/new/g\' app.conf` (creates `app.conf.bak`).',
        },
        {
          title: 'Line Addressing & Deletion',
          content:
            '- Delete matching lines:\n  `sed \'/DEBUG/d\' config.env` (deletes any line containing "DEBUG").\n- Delete line 3 specifically:\n  `sed \'3d\' file.txt`\n- Replace only on line 1:\n  `sed \'1s/old/new/\' file.txt`\n- Process a line range (lines 10 to 20):\n  `sed \'10,20s/HTTP/HTTPS/g\' file.txt`',
        },
      ],
      productionBestPractices: [
        'When replacing file paths or URLs, use a different delimiter like `#` instead of `/` to avoid the "leaning toothpick syndrome": `sed \'s#/var/www/html#/srv/site#g\' config.conf`.',
        'Always test your sed expression WITHOUT `-i` first to verify the output on your terminal screen before writing changes permanently to disk.',
        'In macOS BSD sed vs Linux GNU sed: GNU sed allows `sed -i \'s/a/b/\'`, while macOS BSD sed requires an explicit backup extension argument: `sed -i "" \'s/a/b/\'`. In Linux production environments, GNU sed is standard.',
      ],
      commonPitfalls: [
        'Forgetting the `g` flag: `sed \'s/foo/bar/\'` will leave the second and third "foo" on the same line untouched!',
        'Modifying symlinked files with `sed -i`: By default, sed unlinks and replaces the file with a new inode, breaking the symlink!',
      ],
      realWorldScenario: {
        title: 'Automated Deployment Environment Tuning',
        situation:
          'During an automated container startup phase, a configuration template has placeholder `__DB_HOST__` that must be replaced with the current dynamic IP.',
        howLinuxHelps:
          'The container entrypoint script runs: `sed -i "s#__DB_HOST__#$DATABASE_HOST#g" /etc/app/database.conf`. The config is rendered dynamically in milliseconds.',
      },
    },
    lab: {
      id: 'lab-14',
      title: 'Lab 14: Automated File Editing with sed',
      scenario:
        'You need to update `/home/student/projects/config.env` to change `PORT=8080` to `PORT=9000` using sed substitution.',
      objective:
        'Execute a `sed` substitution to replace `PORT=8080` with `PORT=9000` in `projects/config.env`.',
      tasks: [
        {
          id: 't1',
          instruction: 'Inspect the contents of `projects/config.env` with `cat projects/config.env`.',
          hint: 'Run: cat projects/config.env',
          solutionCommand: 'cat projects/config.env',
        },
        {
          id: 't2',
          instruction: 'Use `sed` to replace "PORT=8080" with "PORT=9000" in `projects/config.env`.',
          hint: 'Run: sed "s/PORT=8080/PORT=9000/g" projects/config.env > projects/config.env.tmp && mv projects/config.env.tmp projects/config.env',
          solutionCommand: 'sed "s/PORT=8080/PORT=9000/g" projects/config.env',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'User executed sed command',
          checkType: 'command_executed_match',
          expectedValue: 'sed',
          failureMessage: 'Execute `sed` to perform the stream substitution.',
        },
      ],
    },
    quiz: [
      {
        id: 'q14-1',
        question: 'What does the `g` flag at the end of `sed \'s/foo/bar/g\'` specify?',
        options: [
          'Generate a graph.',
          'Replace all occurrences of "foo" on each line, not just the first one.',
          'Run with root/god privileges.',
          'Group matching lines together.',
        ],
        correctIndex: 1,
        explanation: 'Without `g` (global), sed only replaces the first occurrence on each line.',
      },
      {
        id: 'q14-2',
        question: 'Which flag instructs GNU `sed` to modify the file directly in-place rather than writing to stdout?',
        options: ['-w', '-i', '-f', '-p'],
        correctIndex: 1,
        explanation: '`-i` (in-place) rewrites the source file directly with the modified output.',
      },
      {
        id: 'q14-3',
        question: 'If you want to substitute a path containing slashes (e.g. `/usr/bin`), what is the cleanest approach?',
        options: [
          'Escape every slash with three backslashes.',
          'Use an alternative delimiter such as `#` or `|` in the sed expression (e.g. `s#/usr/bin#/usr/local/bin#g`).',
          'sed cannot process slashes.',
          'Reboot the system.',
        ],
        correctIndex: 1,
        explanation: 'sed allows any character immediately following `s` to serve as the custom delimiter.',
      },
    ],
    cheatSheet: [
      {
        name: 'sed',
        syntax: 'sed [OPTIONS] [SCRIPT] [FILE...]',
        description: 'Stream editor for filtering and transforming text.',
        commonFlags: [
          { flag: '-i', description: 'Edit files in place (directly on disk)' },
          { flag: '-e SCRIPT', description: 'Add script to the commands to be executed' },
          { flag: '-n', description: 'Suppress automatic printing of pattern space' },
        ],
        realWorldExample: 'sed -i "s#DEBUG=true#DEBUG=false#g" app.env',
        category: 'text-processing',
      },
    ],
  },
  {
    id: 'mod-15',
    slug: 'column-data-and-reporting-with-awk',
    levelId: 'level-3',
    moduleNumber: 15,
    title: 'Column Data & Report Processing with awk',
    shortDescription:
      'Master awk for structured reporting: field variables ($1, $2, $NF, $0), custom field separators (-F:), conditional filtering, arithmetic aggregations, and formatting tabular reports.',
    durationMinutes: 40,
    coreCommands: ['awk'],
    theory: {
      overview:
        '`awk` (named after creators Aho, Weinberger, and Kernighan) is a full-fledged data-driven programming language designed for processing column-formatted text. Where `cut` struggles with irregular whitespace and cannot perform calculations, `awk` excels: it parses fields automatically, performs math, maintains running sums, and formats professional reports.',
      keyConcepts: [
        {
          title: 'The Structure of an awk Program',
          content:
            'An awk program consists of pattern-action pairs:\n`awk \'pattern { action }\' input_file`\n\nIf pattern is omitted, action executes on EVERY line. If action is omitted, matching lines are printed.\n\n- `$0`: The entire line.\n- `$1, $2, ... $N`: Field 1, Field 2, etc.\n- `$NF`: The LAST field on the line (NF stands for Number of Fields!).\n- `NR`: The current record (line) number.',
          diagramAscii: `  Line:  "192.168.1.10  GET  /index.html  200  4096"
  Fields:     $1          $2        $3       $4    $5 ($NF)`,
        },
        {
          title: 'Custom Delimiters with -F',
          content:
            'By default, `awk` splits lines on one or more whitespace characters (spaces or tabs), handling variable spacing seamlessly. To process colon-delimited files like `/etc/passwd`:\n`awk -F: \'{print $1, $7}\' /etc/passwd`\nPrints the username and login shell for every user account.',
        },
        {
          title: 'Conditionals and Math Calculations',
          content:
            '- Filter by numeric condition:\n  `awk \'$4 == 200 {print $1, $3}\' access.log` (print IP and URL only for HTTP 200 requests).\n- Summing a column (e.g. total bandwidth bytes):\n  `awk \'{sum += $5} END {print "Total Bytes:", sum}\' access.log`\n- Formatting with printf:\n  `awk \'{printf "%-15s %s\\n", $1, $3}\' access.log`',
        },
      ],
      productionBestPractices: [
        'Prefer `awk` over `cut` whenever tabular data has irregular spacing (such as `ps aux`, `df -h`, or `netstat`).',
        'Always enclose awk scripts in single quotes `\'...\'` to prevent the shell from expanding `$1`, `$2`, etc. as empty shell variables!',
        'Use `$NF` when processing files where line items have variable column counts but you need the final column.',
      ],
      commonPitfalls: [
        'Confusing `NR` with `NF`: `NR` is the current Line Number; `NF` is the Number of Fields on the current line.',
        'Using double quotes around the script: `" {print $1} "` causes Bash to replace `$1` with the script\'s first argument before awk even sees it!',
      ],
      realWorldScenario: {
        title: 'Parsing Production Load & Memory Stats',
        situation:
          'A site reliability engineer needs to calculate total memory consumed by all running Nginx worker processes.',
        howLinuxHelps:
          'The engineer runs: `ps aux | grep nginx | awk \'{sum += $6} END {print "Total RAM Used (KB):", sum}\'`. In one command, exact memory usage is computed and summarized.',
      },
    },
    lab: {
      id: 'lab-15',
      title: 'Lab 15: Column Extraction & Reports with awk',
      scenario:
        'Extract usernames and default shells from `/etc/passwd` using `awk`, and print the client IP and requested URL from `/var/log/nginx/access.log`.',
      objective:
        'Use `awk` with `-F:` to extract fields from `/etc/passwd`, and parse column data from `/var/log/nginx/access.log`.',
      tasks: [
        {
          id: 't1',
          instruction: 'Extract the username ($1) and shell ($7) from `/etc/passwd` using `awk -F: \'{print $1, $7}\' /etc/passwd`.',
          hint: 'Run: awk -F: \'{print $1, $7}\' /etc/passwd',
          solutionCommand: 'awk -F: \'{print $1, $7}\' /etc/passwd',
        },
        {
          id: 't2',
          instruction: 'Extract the client IP ($1) and HTTP method ($6 or first field) from `/var/log/nginx/access.log`.',
          hint: 'Run: awk \'{print $1, $6}\' /var/log/nginx/access.log',
          solutionCommand: 'awk \'{print $1, $6}\' /var/log/nginx/access.log',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'User executed awk command',
          checkType: 'command_executed_match',
          expectedValue: 'awk',
          failureMessage: 'Execute `awk` to extract columns.',
        },
      ],
    },
    quiz: [
      {
        id: 'q15-1',
        question: 'In awk, what does the special variable `$NF` evaluate to?',
        options: [
          'The number of files on the system.',
          'The value of the very last column/field on the current line.',
          'The next file in the list.',
          'The line number.',
        ],
        correctIndex: 1,
        explanation: '`NF` holds the number of fields on the line, so `$NF` accesses the contents of the final field.',
      },
      {
        id: 'q15-2',
        question: 'How do you tell awk to use a colon (`:`) as the field delimiter?',
        options: ['-d:', '-F:', '--delim=:', '-s:'],
        correctIndex: 1,
        explanation: '`-F` sets the input Field Separator in awk.',
      },
      {
        id: 'q15-3',
        question: 'What does the block `END { ... }` in an awk program do?',
        options: [
          'Executes immediately when an error occurs.',
          'Executes exactly once after all input lines have been processed.',
          'Terminates the shell session.',
          'Deletes the processed file.',
        ],
        correctIndex: 1,
        explanation: 'The `END` block runs once after all input records have been read, ideal for printing totals and averages.',
      },
    ],
    cheatSheet: [
      {
        name: 'awk',
        syntax: 'awk [OPTIONS] \'SCRIPT\' [FILE...]',
        description: 'Pattern scanning and text processing language.',
        commonFlags: [
          { flag: '-F FS', description: 'Use FS as the input field separator' },
          { flag: '-v VAR=val', description: 'Assign variable before program execution' },
        ],
        realWorldExample: 'awk \'{print $1, $NF}\' /var/log/nginx/access.log',
        category: 'text-processing',
      },
    ],
  },
];
