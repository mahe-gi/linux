import { CourseModule } from '@/types/course';

export const LEVEL_4_MODULES: CourseModule[] = [
  {
    id: 'mod-16',
    slug: 'disks-filesystems-and-mounts',
    levelId: 'level-4',
    moduleNumber: 16,
    title: 'Disks, Partitions, Filesystems & Inodes',
    shortDescription:
      'Manage physical storage: df -h, du -sh, block devices (lsblk), mounting filesystems (mount, umount, /etc/fstab), understanding inodes, and hard vs symbolic links (ln -s).',
    durationMinutes: 40,
    coreCommands: ['df', 'du', 'lsblk', 'mount', 'umount'],
    theory: {
      overview:
        'In Linux, physical storage devices (NVMe drives, SATA disks, USB keys, cloud EBS volumes) are exposed as raw block devices under `/dev/` (e.g. `/dev/sda`, `/dev/nvme0n1`). Before data can be stored, block devices are partitioned, formatted with a filesystem (ext4, XFS, Btrfs), and attached to the directory tree at a designated Mount Point.',
      keyConcepts: [
        {
          title: 'Storage Architecture: From Silicon to Directory',
          content:
            '1. Block Device: Physical drive detected by kernel (`/dev/sda`).\n2. Partition: Subdivision of disk (`/dev/sda1`, `/dev/sda2`).\n3. Filesystem: Data structure organizing files (ext4, XFS).\n4. Mount Point: The directory where the filesystem is attached into the unified root tree (`/mnt/storage`, `/var`).',
          diagramAscii: `  [ Hardware: NVMe / SSD ]
             |
       [ /dev/nvme0n1 ] (Raw Block Device)
             |
       [ /dev/nvme0n1p1 ] (Partition formatted as ext4)
             |
           (mount)
             v
       [ /var/log/ ] (Mount Point in FHS)`,
        },
        {
          title: 'Storage Inspection: df vs du',
          content:
            '- `df -h`: (Disk Free) Reports filesystem disk space usage, total capacity, used space, and mount points across all mounted filesystems in human-readable units (GB, MB).\n- `du -sh <path>`: (Disk Usage) Summarizes the exact disk space consumed by a specific directory and all its files.\n- Find the largest folders consuming disk space:\n  `du -sh /var/* | sort -h`',
        },
        {
          title: 'Inodes & Link Types (Hard vs Symbolic)',
          content:
            'Every file in Linux is represented by an Inode (Index Node) that stores file metadata (size, owner, permissions, pointers to disk data blocks), but NOT the filename!\n\n- Symbolic (Soft) Link (`ln -s target linkname`):\n  * A pointer file that stores the path of another file (like a shortcut).\n  * If the target is deleted, the symlink breaks (dangling link).\n  * Can cross different filesystems and link directories.\n- Hard Link (`ln target linkname`):\n  * Creates another directory entry pointing to the EXACT same inode.\n  * Deleting the original file does NOT delete the data; data is freed only when the inode link count drops to 0!\n  * Cannot cross filesystem boundaries or link directories.',
        },
        {
          title: 'Persistent Mounts via /etc/fstab',
          content:
            'Temporary mounts created with `mount /dev/sdb1 /mnt/data` disappear when the server reboots! To make mounts permanent across reboots, add an entry to `/etc/fstab` specifying UUID, mount point, filesystem type, mount options, and fsck pass order.',
        },
      ],
      productionBestPractices: [
        'Always check inode exhaustion with `df -i`! A disk can show 50% free disk space but still fail with "No space left on device" if millions of tiny files have exhausted all available inodes.',
        'Always test new `/etc/fstab` entries with `mount -a` immediately! A syntax error in `/etc/fstab` can cause the operating system to fail to boot and drop into emergency maintenance mode on the next reboot.',
        'Use UUIDs (`UUID=...`) rather than device names (`/dev/sda1`) in `/etc/fstab` because device letters can change when drives are unplugged or cloud volumes are reordered.',
      ],
      commonPitfalls: [
        'Unmounting a busy filesystem: attempting `umount /mnt/storage` will fail with "target is busy" if a shell or process has its working directory inside the mount. (Find blocking processes with `fuser -m /mnt/storage` or `lsof /mnt/storage`).',
        'Confusing `du` and `df`: `df` updates immediately when files are unlinked, but if a running process holds an open file descriptor to a deleted file, the space will NOT be freed until that process is terminated!',
      ],
      realWorldScenario: {
        title: 'Diagnosing Ghost Disk Consumption from Deleted Logs',
        situation:
          'A web server root partition shows 99% used on `df -h`, but `du -sh /*` accounts for only 20GB of files.',
        howLinuxHelps:
          'The engineer runs `lsof | grep deleted` and discovers a running Nginx process holding open file handles to deleted 30GB access logs. The engineer reloads Nginx (`systemctl reload nginx`), the kernel releases the blocks, and disk space instantly drops from 99% to 20%.',
      },
    },
    lab: {
      id: 'lab-16',
      title: 'Lab 16: Inspecting Storage & Directory Sizes',
      scenario:
        'A monitoring alert reports high disk usage. You need to inspect mounted filesystem capacity with `df -h`, check sizes of items in `/home/student` with `du -sh`, and view the system mount table in `/etc/fstab`.',
      objective:
        'Run `df -h` to inspect disk capacity, summarize directory usage with `du`, and view `/etc/fstab`.',
      tasks: [
        {
          id: 't1',
          instruction: 'Execute `df -h` to inspect total and available disk space across all mounted filesystems.',
          hint: 'Run: df -h',
          solutionCommand: 'df -h',
        },
        {
          id: 't2',
          instruction: 'Calculate the total size of files in the current directory using `du -sh .`.',
          hint: 'Run: du -sh .',
          solutionCommand: 'du -sh .',
        },
        {
          id: 't3',
          instruction: 'Inspect the system filesystem mount configuration file using `cat /etc/fstab`.',
          hint: 'Run: cat /etc/fstab',
          solutionCommand: 'cat /etc/fstab',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'User inspected disk space with df',
          checkType: 'command_executed_match',
          expectedValue: 'df',
          failureMessage: 'Run `df -h` to inspect disk space.',
        },
        {
          id: 'v2',
          description: 'User checked directory usage with du',
          checkType: 'command_executed_match',
          expectedValue: 'du',
          failureMessage: 'Run `du -sh .` to inspect directory usage.',
        },
      ],
    },
    quiz: [
      {
        id: 'q16-1',
        question: 'Why can a server return "No space left on device" even when `df -h` shows 40% free disk space?',
        options: [
          'The CPU is overheated.',
          'The filesystem has exhausted all available inodes (`df -i`) due to an excessive number of tiny files.',
          'The monitor is disconnected.',
          'The RAM is full of cache.',
        ],
        correctIndex: 1,
        explanation: 'Filesystems allocate a fixed number of inodes during creation. If all inodes are consumed, no new files can be created regardless of free byte space.',
      },
      {
        id: 'q16-2',
        question: 'What is the main difference between a hard link and a symbolic link?',
        options: [
          'Hard links are stored in RAM; symbolic links are on disk.',
          'A symbolic link points to a pathname (and breaks if the target moves), while a hard link points directly to the inode.',
          'Hard links only work for web files.',
          'Symbolic links require root privileges to create.',
        ],
        correctIndex: 1,
        explanation: 'A symbolic link stores the target path as its content, whereas a hard link is an alternate directory pointer directly to the file inode.',
      },
      {
        id: 'q16-3',
        question: 'Which command tests `/etc/fstab` for syntax errors and mounts all declared filesystems without rebooting?',
        options: ['mount -a', 'fstab --test', 'reboot -f', 'diskctl verify'],
        correctIndex: 0,
        explanation: '`mount -a` mounts all filesystems described in `/etc/fstab`, verifying syntax before a reboot.',
      },
    ],
    cheatSheet: [
      {
        name: 'df',
        syntax: 'df [OPTIONS] [FILE...]',
        description: 'Report filesystem disk space usage.',
        commonFlags: [
          { flag: '-h', description: 'Print sizes in human-readable powers of 1024 (e.g. 10G)' },
          { flag: '-i', description: 'List inode information instead of block usage' },
          { flag: '-T', description: 'Print filesystem type (ext4, xfs, etc.)' },
        ],
        realWorldExample: 'df -hT',
        category: 'system',
      },
      {
        name: 'du',
        syntax: 'du [OPTIONS] [FILE...]',
        description: 'Estimate file and directory space usage.',
        commonFlags: [
          { flag: '-s', description: 'Display only a total summary for each argument' },
          { flag: '-h', description: 'Print sizes in human-readable format' },
          { flag: '-d N', description: 'Max depth of directory traversal' },
        ],
        realWorldExample: 'du -sh /var/log/*',
        category: 'system',
      },
      {
        name: 'ln -s',
        syntax: 'ln -s TARGET LINK_NAME',
        description: 'Make symbolic links between files.',
        commonFlags: [
          { flag: '-s', description: 'Create symbolic link instead of hard link' },
        ],
        realWorldExample: 'ln -s /opt/node-v20/bin/node /usr/local/bin/node',
        category: 'file-ops',
      },
    ],
  },
  {
    id: 'mod-17',
    slug: 'systemd-service-orchestration-and-journalctl',
    levelId: 'level-4',
    moduleNumber: 17,
    title: 'Service Orchestration with systemd & journalctl',
    shortDescription:
      'Manage modern Linux services: systemctl (start, stop, restart, reload, status, enable, disable), writing custom .service unit files, and querying unified binary logs with journalctl.',
    durationMinutes: 45,
    coreCommands: ['systemctl', 'journalctl'],
    theory: {
      overview:
        '`systemd` is the default init system and service manager for all major Linux distributions (Ubuntu, Debian, RHEL, CentOS, Arch, SUSE). Operating as PID 1, it bootstraps the user space, handles parallel service activation, manages cgroups, restarts crashed daemons automatically, and captures all standard output/error streams into an indexed binary journal (`journald`).',
      keyConcepts: [
        {
          title: 'Managing Services with systemctl',
          content:
            '- `systemctl status nginx`: Check current state (active, dead, failed), uptime, PID, memory, and latest log snippets.\n- `systemctl start nginx`: Start the service immediately.\n- `systemctl stop nginx`: Terminate the service.\n- `systemctl restart nginx`: Stop then start the service (causes connection drops).\n- `systemctl reload nginx`: Gracefully re-read config without dropping active HTTP connections!\n- `systemctl enable nginx`: Create symlinks so the service starts automatically at system boot.\n- `systemctl disable nginx`: Prevent service from starting at system boot.',
        },
        {
          title: 'Anatomy of a Production Unit File (.service)',
          content:
            'Systemd service files are typically stored in `/etc/systemd/system/myapp.service`:\n\n```ini\n[Unit]\nDescription=Production Node.js API Service\nAfter=network.target postgresql.service\nRequires=postgresql.service\n\n[Service]\nType=simple\nUser=student\nWorkingDirectory=/home/student/projects\nExecStart=/usr/bin/python3 /home/student/projects/server.py\nRestart=always\nRestartSec=5s\nEnvironment=NODE_ENV=production PORT=8080\nLimitNOFILE=65535\n\n[Install]\nWantedBy=multi-user.target\n```\n\nWhenever you edit or create a service unit file, you MUST notify systemd by running:\n`systemctl daemon-reload`',
          diagramAscii: `     systemd (PID 1)
           |
     [ Supervisor ]  <- Automatically restarts crashed daemons!
           |
     [ journald ]    <- Captures stdout & stderr in real time
           |
     [ cgroups ]     <- Enforces CPU and Memory resource limits`,
        },
        {
          title: 'Querying Logs with journalctl',
          content:
            '- `journalctl -u nginx`: View all logs for a specific unit.\n- `journalctl -u nginx -f`: Follow logs in real time (like `tail -f`).\n- `journalctl -u nginx -n 50`: View last 50 log entries.\n- `journalctl -b`: View logs from the current boot only.\n- `journalctl -p err`: Filter logs by priority (emerg, alert, crit, err).\n- `journalctl --since "1 hour ago"`: Time-based filtering.',
        },
      ],
      productionBestPractices: [
        'Always configure `Restart=always` and `RestartSec=5s` in production unit files to ensure microservices self-heal from unhandled exceptions.',
        'Use `systemctl reload` instead of `restart` when updating web server configs (nginx, apache) to achieve zero-downtime reloads.',
        'Always run `systemctl daemon-reload` after editing `.service` files; otherwise, systemd continues running with stale cached definitions.',
      ],
      commonPitfalls: [
        'Putting relative paths in `ExecStart`: systemd requires absolute executable paths (e.g. `/usr/bin/python3`, NOT `python3`).',
        'Running daemons as `root`: always configure `User=nobody` or a dedicated unprivileged user in the `[Service]` section for security isolation.',
      ],
      realWorldScenario: {
        title: 'Zero-Downtime Web Server Configuration Reload',
        situation:
          'A new SSL TLS certificate is installed on a production Nginx proxy serving 10,000 active WebSocket connections. Dropping connections would disrupt active users.',
        howLinuxHelps:
          'The engineer tests the config syntax (`nginx -t`) and executes `systemctl reload nginx`. Systemd sends `SIGHUP` to the master process, which spawns new workers with the new certificate while allowing existing workers to drain connections cleanly without a single drop.',
      },
    },
    lab: {
      id: 'lab-17',
      title: 'Lab 17: Service Status & Log Inspection',
      scenario:
        'You need to verify that the Nginx web service is active, check its supervisor status with `systemctl`, and query recent service logs with `journalctl`.',
      objective:
        'Run `systemctl status nginx` to inspect service health, and query unit logs using `journalctl -u nginx`.',
      tasks: [
        {
          id: 't1',
          instruction: 'Check the status of the Nginx service using `systemctl status nginx`.',
          hint: 'Run: systemctl status nginx',
          solutionCommand: 'systemctl status nginx',
        },
        {
          id: 't2',
          instruction: 'Inspect system logs for the Nginx unit using `journalctl -u nginx`.',
          hint: 'Run: journalctl -u nginx',
          solutionCommand: 'journalctl -u nginx',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'User checked systemctl status',
          checkType: 'command_executed_match',
          expectedValue: 'systemctl',
          failureMessage: 'Run `systemctl status nginx` to check service health.',
        },
        {
          id: 'v2',
          description: 'User inspected logs with journalctl',
          checkType: 'command_executed_match',
          expectedValue: 'journalctl',
          failureMessage: 'Run `journalctl -u nginx` to inspect unit logs.',
        },
      ],
    },
    quiz: [
      {
        id: 'q17-1',
        question: 'What is the primary difference between `systemctl restart` and `systemctl reload`?',
        options: [
          'Restart reboots the operating system; reload clears the cache.',
          'Restart terminates and relaunches the service (causing connection downtime), while reload signals the service to re-read configs with zero downtime.',
          'Reload deletes log files.',
          'Restart only works for databases.',
        ],
        correctIndex: 1,
        explanation: '`reload` sends SIGHUP to apply configuration changes without killing active connections; `restart` terminates the process.',
      },
      {
        id: 'q17-2',
        question: 'What command must be executed after creating or updating a unit file in `/etc/systemd/system/`?',
        options: ['systemctl update', 'systemctl daemon-reload', 'systemctl reboot', 'service refresh'],
        correctIndex: 1,
        explanation: '`systemctl daemon-reload` reloads the systemd manager configuration and detects new or altered unit files.',
      },
      {
        id: 'q17-3',
        question: 'Which flag in `journalctl` follows incoming log entries in real time?',
        options: ['-f', '-live', '-tail', '-stream'],
        correctIndex: 0,
        explanation: '`-f` (follow) streams newly appended log records to your terminal.',
      },
    ],
    cheatSheet: [
      {
        name: 'systemctl',
        syntax: 'systemctl [COMMAND] [UNIT...]',
        description: 'Control the systemd system and service manager.',
        commonFlags: [
          { flag: 'status UNIT', description: 'Show runtime status information about units' },
          { flag: 'start UNIT', description: 'Start (activate) one or more units' },
          { flag: 'stop UNIT', description: 'Stop (deactivate) one or more units' },
          { flag: 'restart UNIT', description: 'Stop and then start one or more units' },
          { flag: 'reload UNIT', description: 'Reload one or more units configuration' },
          { flag: 'enable UNIT', description: 'Enable one or more unit files to start at boot' },
          { flag: 'daemon-reload', description: 'Reload systemd manager configuration' },
        ],
        realWorldExample: 'systemctl status nginx',
        category: 'system',
      },
      {
        name: 'journalctl',
        syntax: 'journalctl [OPTIONS]',
        description: 'Query the systemd journal.',
        commonFlags: [
          { flag: '-u UNIT', description: 'Show messages for the specified systemd unit' },
          { flag: '-f', description: 'Follow messages in real time' },
          { flag: '-n NUM', description: 'Number of journal entries to show' },
          { flag: '-b', description: 'Show messages from the current boot only' },
        ],
        realWorldExample: 'journalctl -u nginx -f -n 100',
        category: 'system',
      },
    ],
  },
  {
    id: 'mod-18',
    slug: 'linux-networking-and-socket-diagnostics',
    levelId: 'level-4',
    moduleNumber: 18,
    title: 'Linux Networking Essentials & Socket Diagnostics',
    shortDescription:
      'Diagnose network stacks: modern ip command (ip addr, ip route), ping, socket statistics with ss/netstat (ss -tulnp), curl HTTP debugging (curl -Iv), DNS lookup, and /etc/hosts.',
    durationMinutes: 40,
    coreCommands: ['ip', 'ping', 'ss', 'curl'],
    theory: {
      overview:
        'Linux powers modern network infrastructure, from software-defined networks (SDN) and Kubernetes ingress controllers to cloud routers and firewalls. Knowing how to query IP addresses, inspect routing tables, monitor listening TCP/UDP sockets, test connectivity with ping, and troubleshoot HTTP headers with curl is indispensable.',
      keyConcepts: [
        {
          title: 'The Modern ip Suite (Replacing net-tools)',
          content:
            'Legacy commands like `ifconfig` and `route` are deprecated. The modern `iproute2` package uses the `ip` command:\n- `ip addr` (or `ip a`): Display all network interfaces (e.g. `eth0`, `lo`), MAC addresses, and assigned IPv4/IPv6 addresses.\n- `ip route` (or `ip r`): View the IP routing table and default gateway.\n- `ip link set eth0 up/down`: Enable or disable a physical/virtual network interface.',
          diagramAscii: `  [ Application Layer ]      curl / nginx
           |
  [ Transport Layer ]        TCP Ports: 80, 443, 8080 (ss -tulnp)
           |
  [ Internet Layer ]         IP Addresses: 192.168.1.10 (ip addr)
           |
  [ Physical/Link Layer ]    eth0, MAC address (ip link)`,
        },
        {
          title: 'Socket Inspection with ss (Socket Statistics)',
          content:
            '`ss` replaces the legacy `netstat` utility for inspecting network sockets:\n`ss -tulnp`\n- `-t`: Show TCP sockets.\n- `-u`: Show UDP sockets.\n- `-l`: Show only LISTEN sockets (services waiting for connections).\n- `-n`: Show numeric IP addresses and port numbers (avoid slow DNS reverse lookups).\n- `-p`: Show the process name and PID owning each socket (requires sudo).',
        },
        {
          title: 'HTTP & Network Diagnostics with curl and ping',
          content:
            '- `ping -c 4 8.8.8.8`: Send 4 ICMP echo request packets to verify network connectivity and measure round-trip latency.\n- `curl -Iv http://localhost:8080`: Fetch HTTP response headers verbosely (`-I` for HEAD, `-v` for verbose SSL handshake and connection headers).\n- `curl -s http://api/endpoint | jq .`: Fetch JSON payloads silently.\n- Local name resolution: `/etc/hosts` (static IP mappings) and `/etc/resolv.conf` (DNS nameservers).',
        },
      ],
      productionBestPractices: [
        'Always pass `-n` to `ss` (`ss -tulnp`)! Without `-n`, `ss` attempts to resolve IP addresses to hostnames via reverse DNS, which can freeze the command if DNS is broken or slow.',
        'Use `curl -Iv` to diagnose SSL/TLS certificate expiry, cipher mismatches, and HTTP redirect chains directly from the server CLI.',
        'Remember that `ping` uses ICMP: if ping fails, the destination host might simply have an ICMP firewall rule blocking ping while HTTP traffic works fine!',
      ],
      commonPitfalls: [
        'Confusing `0.0.0.0` with `127.0.0.1`: Listening on `127.0.0.1` binds ONLY to the local loopback (external traffic cannot connect). Listening on `0.0.0.0` binds to all network interfaces.',
        'Binding to privileged ports (< 1024) as an unprivileged user: ports below 1024 (like port 80 or 443) require root privileges or specific Linux capabilities (`cap_net_bind_service`).',
      ],
      realWorldScenario: {
        title: 'Diagnosing "Connection Refused" on Production Port',
        situation:
          'Clients report "Connection Refused" when attempting to connect to a new API service deployed on port 8080.',
        howLinuxHelps:
          'The engineer logs in and runs `ss -tulnp | grep 8080`. The output reveals the service is listening on `127.0.0.1:8080` instead of `0.0.0.0:8080`. The engineer reconfigures the service bind address, restarts it, and external clients connect immediately.',
      },
    },
    lab: {
      id: 'lab-18',
      title: 'Lab 18: Network Interfaces & Socket Inspection',
      scenario:
        'You need to verify the server IP address configuration, test connectivity with ping, inspect active listening TCP ports, and query an HTTP endpoint with curl.',
      objective:
        'Run `ip addr` to inspect network interfaces, check open sockets with `ss -tulnp`, and debug an HTTP service with `curl -I`.',
      tasks: [
        {
          id: 't1',
          instruction: 'Display system network interfaces and IP addresses using `ip addr`.',
          hint: 'Run: ip addr',
          solutionCommand: 'ip addr',
        },
        {
          id: 't2',
          instruction: 'Inspect all listening TCP sockets and associated process IDs using `ss -tulnp`.',
          hint: 'Run: ss -tulnp',
          solutionCommand: 'ss -tulnp',
        },
        {
          id: 't3',
          instruction: 'Perform an HTTP HEAD request against `http://localhost:8080` using `curl -I http://localhost:8080`.',
          hint: 'Run: curl -I http://localhost:8080',
          solutionCommand: 'curl -I http://localhost:8080',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'User inspected IP addresses with ip addr',
          checkType: 'command_executed_match',
          expectedValue: 'ip',
          failureMessage: 'Run `ip addr` to inspect network interfaces.',
        },
        {
          id: 'v2',
          description: 'User checked sockets with ss',
          checkType: 'command_executed_match',
          expectedValue: 'ss',
          failureMessage: 'Run `ss -tulnp` to inspect listening sockets.',
        },
        {
          id: 'v3',
          description: 'User tested curl',
          checkType: 'command_executed_match',
          expectedValue: 'curl',
          failureMessage: 'Run `curl -I http://localhost:8080` to query the HTTP endpoint.',
        },
      ],
    },
    quiz: [
      {
        id: 'q18-1',
        question: 'What does the `-n` flag prevent `ss` or `netstat` from doing, ensuring fast execution?',
        options: [
          'It prevents slow reverse DNS hostname lookups by displaying raw numeric IP addresses and ports.',
          'It skips encrypted sockets.',
          'It limits output to 5 lines.',
          'It prevents root access.',
        ],
        correctIndex: 0,
        explanation: '`-n` keeps IP addresses and port numbers numeric, avoiding time-consuming DNS queries.',
      },
      {
        id: 'q18-2',
        question: 'If a service binds to `127.0.0.1:3000`, who can connect to it?',
        options: [
          'Anyone on the public internet.',
          'Only processes running locally on the same physical host.',
          'Only devices on the local Wi-Fi router.',
          'Nobody.',
        ],
        correctIndex: 1,
        explanation: '`127.0.0.1` is the loopback interface, accessible strictly from within the local machine.',
      },
      {
        id: 'q18-3',
        question: 'Which file stores static local hostname-to-IP mappings before external DNS is queried?',
        options: ['/etc/hosts', '/etc/resolv.conf', '/etc/network', '/var/dns/records'],
        correctIndex: 0,
        explanation: '`/etc/hosts` provides static hostname resolution mappings processed before or alongside DNS.',
      },
    ],
    cheatSheet: [
      {
        name: 'ip addr',
        syntax: 'ip [OPTIONS] addr [COMMAND]',
        description: 'Protocol address management for network devices.',
        commonFlags: [
          { flag: 'show', description: 'Display all interfaces and IP addresses' },
        ],
        realWorldExample: 'ip addr show eth0',
        category: 'networking',
      },
      {
        name: 'ss',
        syntax: 'ss [OPTIONS]',
        description: 'Utility to dump socket statistics.',
        commonFlags: [
          { flag: '-t', description: 'Display TCP sockets' },
          { flag: '-u', description: 'Display UDP sockets' },
          { flag: '-l', description: 'Display listening sockets' },
          { flag: '-n', description: 'Do not resolve service names / IPs' },
          { flag: '-p', description: 'Show process using socket' },
        ],
        realWorldExample: 'ss -tulnp',
        category: 'networking',
      },
      {
        name: 'curl',
        syntax: 'curl [OPTIONS] [URL...]',
        description: 'Transfer data from or to a server using supported protocols (HTTP, HTTPS, FTP).',
        commonFlags: [
          { flag: '-I', description: 'Fetch HTTP headers only (HEAD request)' },
          { flag: '-v', description: 'Make the operation more talkative (verbose)' },
          { flag: '-s', description: 'Silent mode (don\'t show progress meter or error messages)' },
        ],
        realWorldExample: 'curl -Iv https://example.com',
        category: 'networking',
      },
    ],
  },
  {
    id: 'mod-19',
    slug: 'remote-administration-ssh-and-keys',
    levelId: 'level-4',
    moduleNumber: 19,
    title: 'Remote Administration, SSH & Secure Key Exchange',
    shortDescription:
      'Master OpenSSH: cryptographic key generation (ssh-keygen -t ed25519), public key exchange (ssh-copy-id), ~/.ssh/config profiles, secure file transfer (scp, sftp), and SSH daemon hardening.',
    durationMinutes: 40,
    coreCommands: ['ssh', 'cat'],
    theory: {
      overview:
        'Secure Shell (SSH) is the standard cryptographic protocol for securely operating network services over an unsecured network. It provides encrypted terminal sessions, remote command execution, port forwarding, and secure file transfer. Managing public/private key pairs and configuring SSH clients and daemons is essential for DevOps and cloud operations.',
      keyConcepts: [
        {
          title: 'Asymmetric Cryptography: Public vs Private Key',
          content:
            '- Private Key (`id_ed25519`): Stored ONLY on your local workstation. Never shared, emailed, or committed to Git. Protected by mode `600`.\n- Public Key (`id_ed25519.pub`): Can be freely shared. Copied onto remote Linux servers and appended to `~/.ssh/authorized_keys`.\n\nWhen connecting, the remote server issues a cryptographic challenge. Your client signs the challenge using your private key. The server verifies the signature using your public key. If valid, you are authenticated without ever transmitting a password over the network!',
          diagramAscii: `  [ Local Workstation ]                      [ Remote Cloud Server ]
   Private Key: id_ed25519                     Public Key in:
   (Never leaves local machine!)               ~/.ssh/authorized_keys
            |                                           ^
            +------- Encrypted Challenge / Response ----+`,
        },
        {
          title: 'Generating Keys & Authorizing Access',
          content:
            '1. Generate modern Ed25519 key pair:\n   `ssh-keygen -t ed25519 -C "admin@company.com"`\n2. Copy public key to remote host:\n   `ssh-copy-id -i ~/.ssh/id_ed25519.pub student@192.168.1.10`\n3. Connect via SSH:\n   `ssh student@192.168.1.10`',
        },
        {
          title: 'Productivity Powerhouse: ~/.ssh/config',
          content:
            'Instead of memorizing long IP addresses and custom port flags, define host aliases in `~/.ssh/config`:\n\n```text\nHost prod-db\n    HostName 192.168.1.20\n    User deploy\n    Port 2222\n    IdentityFile ~/.ssh/prod_key\n```\nNow you can simply run `ssh prod-db`!',
        },
        {
          title: 'Hardening the SSH Daemon (/etc/ssh/sshd_config)',
          content:
            'In enterprise production environments, modify `/etc/ssh/sshd_config` to enforce strict security:\n- `PasswordAuthentication no`: Disables passwords completely, immune to brute force.\n- `PermitRootLogin prohibit-password` (or `no`): Prevents attackers from targeting `root` directly.\n- `PubkeyAuthentication yes`: Requires cryptographic keys.\n- `Port 22` (or custom port).',
        },
      ],
      productionBestPractices: [
        'Prefer modern `ed25519` keys over legacy `rsa` keys: Ed25519 keys are faster, shorter, and cryptographically superior.',
        'Never disable host key verification (`StrictHostKeyChecking=no`) on public production connections, as it leaves you vulnerable to Man-in-the-Middle (MitM) attacks.',
        'Always protect your private keys with a passphrase and use `ssh-agent` to cache unlocked keys in memory during work sessions.',
      ],
      commonPitfalls: [
        'Incorrect permissions on `.ssh` directory: SSH strictly enforces `chmod 700 ~/.ssh`, `chmod 600 ~/.ssh/authorized_keys`, and `chmod 600 ~/.ssh/id_ed25519`. If permissions are too open, SSH rejects logins silently!',
        'Locking yourself out: Never restart `sshd` after modifying `/etc/ssh/sshd_config` without testing your connection in a separate terminal window first!',
      ],
      realWorldScenario: {
        title: 'Hardening Cloud Instances Against Brute-Force Botnets',
        situation:
          'A public cloud VM receives 5,000 automated password guessing attempts per hour from botnets scanning port 22.',
        howLinuxHelps:
          'The engineer installs public keys for all team members, sets `PasswordAuthentication no` and `PermitRootLogin no` in `/etc/ssh/sshd_config`, and reloads sshd. Failed password attempts immediately drop to zero because password authentication is disabled at the socket layer.',
      },
    },
    lab: {
      id: 'lab-19',
      title: 'Lab 19: Inspecting SSH Configurations',
      scenario:
        'You need to verify the server OpenSSH configuration in `/etc/ssh/sshd_config` to ensure password authentication is disabled and root login is restricted.',
      objective:
        'Inspect `/etc/ssh/sshd_config` using `cat` and `grep` to verify SSH hardening parameters.',
      tasks: [
        {
          id: 't1',
          instruction: 'Search `/etc/ssh/sshd_config` for "PasswordAuthentication" using `grep "PasswordAuthentication" /etc/ssh/sshd_config`.',
          hint: 'Run: grep "PasswordAuthentication" /etc/ssh/sshd_config',
          solutionCommand: 'grep "PasswordAuthentication" /etc/ssh/sshd_config',
        },
        {
          id: 't2',
          instruction: 'Search `/etc/ssh/sshd_config` for "PermitRootLogin" to check root access policies.',
          hint: 'Run: grep "PermitRootLogin" /etc/ssh/sshd_config',
          solutionCommand: 'grep "PermitRootLogin" /etc/ssh/sshd_config',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'User inspected sshd_config with grep',
          checkType: 'command_executed_match',
          expectedValue: 'grep',
          failureMessage: 'Run `grep` to inspect `/etc/ssh/sshd_config`.',
        },
      ],
    },
    quiz: [
      {
        id: 'q19-1',
        question: 'Which key file must NEVER be copied or transmitted to remote servers?',
        options: ['The public key (id_ed25519.pub)', 'The private key (id_ed25519)', 'known_hosts', 'authorized_keys'],
        correctIndex: 1,
        explanation: 'The private key must remain exclusively on your local machine under strict mode 600 permissions.',
      },
      {
        id: 'q19-2',
        question: 'Where are approved public keys stored on a remote Linux server to allow SSH login?',
        options: ['/etc/shadow', '~/.ssh/authorized_keys', '/var/log/auth.log', '~/.bashrc'],
        correctIndex: 1,
        explanation: '`~/.ssh/authorized_keys` stores the public keys authorized to log in as that user.',
      },
      {
        id: 'q19-3',
        question: 'Which modern, secure key algorithm is recommended over RSA for new SSH key pairs?',
        options: ['DES', 'MD5', 'Ed25519', 'RC4'],
        correctIndex: 2,
        explanation: 'Ed25519 is an elliptic curve signature algorithm offering superior security and performance.',
      },
    ],
    cheatSheet: [
      {
        name: 'ssh-keygen',
        syntax: 'ssh-keygen -t TYPE -C "COMMENT"',
        description: 'Generate, manage and convert authentication keys for SSH.',
        commonFlags: [
          { flag: '-t ed25519', description: 'Specify type of cryptographic key to create' },
          { flag: '-C COMMENT', description: 'Provide a new comment (e.g. email or username)' },
        ],
        realWorldExample: 'ssh-keygen -t ed25519 -C "admin@company.com"',
        category: 'security',
      },
      {
        name: 'ssh-copy-id',
        syntax: 'ssh-copy-id [-i IDENTITY] USER@HOST',
        description: 'Use locally available keys to authorize logins on a remote machine.',
        commonFlags: [
          { flag: '-i KEY', description: 'Copy specific public key' },
        ],
        realWorldExample: 'ssh-copy-id -i ~/.ssh/id_ed25519.pub student@192.168.1.10',
        category: 'security',
      },
      {
        name: 'ssh',
        syntax: 'ssh [OPTIONS] [USER@]HOSTNAME [COMMAND]',
        description: 'OpenSSH remote login client.',
        commonFlags: [
          { flag: '-p PORT', description: 'Port to connect to on the remote host' },
          { flag: '-i KEY', description: 'Selects a file from which the identity (private key) is read' },
        ],
        realWorldExample: 'ssh -i ~/.ssh/id_ed25519 student@192.168.1.10',
        category: 'networking',
      },
    ],
  },
  {
    id: 'mod-20',
    slug: 'user-administration-groups-and-sudoers',
    levelId: 'level-4',
    moduleNumber: 20,
    title: 'User Administration, Groups & Sudo Privilege',
    shortDescription:
      'Manage multi-tenant users: useradd, usermod, passwd, /etc/passwd and /etc/shadow mechanics, group management, sudoers configuration, and safe editing with visudo.',
    durationMinutes: 35,
    coreCommands: ['whoami', 'id', 'groups'],
    theory: {
      overview:
        'Linux security is rooted in Discretionary Access Control (DAC) centered on Users (UIDs) and Groups (GIDs). System administrators must provision user accounts with appropriate privileges, assign secondary group memberships (like the `docker` or `sudo` group), and configure granular administrative rights via `/etc/sudoers` without ever sharing the root password.',
      keyConcepts: [
        {
          title: 'Account Architecture: /etc/passwd & /etc/shadow',
          content:
            '- `/etc/passwd`: Publicly readable directory of all accounts on the system:\n  `student:x:1000:1000:Linux Student,,,:/home/student:/bin/bash`\n  1. Username (`student`)\n  2. Password flag (`x` means password hash is stored in `/etc/shadow`!)\n  3. User ID (`1000`; 0 is reserved for root)\n  4. Primary Group ID (`1000`)\n  5. GECOS / Comments / Full Name\n  6. Home Directory (`/home/student`)\n  7. Login Shell (`/bin/bash`; `/usr/sbin/nologin` prevents interactive login for service accounts)\n\n- `/etc/shadow`: Readable ONLY by root (mode `640`). Contains salted cryptographically hashed passwords (SHA-512 / yescrypt), expiration dates, and password aging policies.',
        },
        {
          title: 'User & Group Provisioning Commands',
          content:
            '- `useradd -m -s /bin/bash deploy`: Create new user `deploy`, create their home directory (`-m`), and set shell to bash.\n- `passwd deploy`: Set or change password.\n- `usermod -aG sudo,docker deploy`: Append (`-a`) user to supplementary groups (`-G`) `sudo` and `docker`.\n- `userdel -r deploy`: Delete account and remove their home directory (`-r`).',
        },
        {
          title: 'Sudoers Architecture & visudo',
          content:
            '`sudo` (SuperUser DO) allows authorized users to execute individual commands with root privileges while logging actions to `/var/log/auth.log`.\n\nSudoers rules in `/etc/sudoers`:\n`student ALL=(ALL:ALL) ALL`\n`%sudo   ALL=(ALL:ALL) ALL` (any member of the `sudo` group has full sudo rights).\n\nCRITICAL RULE: NEVER edit `/etc/sudoers` with normal text editors like nano or vim! ALWAYS use `visudo`. `visudo` locks the file against concurrent edits and validates syntax before saving. A single typo in `/etc/sudoers` breaks sudo for every user on the entire machine!',
        },
      ],
      productionBestPractices: [
        'Always pass the `-a` (append) flag when adding groups with `usermod -aG`! If you omit `-a` (`usermod -G group user`), Linux removes the user from ALL other existing groups!',
        'Assign system daemon accounts a login shell of `/usr/sbin/nologin` or `/bin/false` so attackers cannot open interactive shell sessions even if the daemon account is compromised.',
        'Use granular sudo rules in `/etc/sudoers.d/` rather than granting unrestricted `ALL=(ALL) ALL` to developers.',
      ],
      commonPitfalls: [
        'Editing `/etc/sudoers` directly without `visudo`: a syntax error locks everyone out of root privileges.',
        'Sharing the root superuser password instead of configuring individual named accounts with `sudo`.',
      ],
      realWorldScenario: {
        title: 'Provisioning CI/CD Automated Deployment Bot',
        situation:
          'A continuous deployment agent needs automated permissions to reload the web server without requiring a human password prompt.',
        howLinuxHelps:
          'The administrator creates a dedicated file `/etc/sudoers.d/deploy-bot` using `visudo -f`: `deploy ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx`. The deploy bot can reload Nginx automatically, but cannot run any other privileged command.',
      },
    },
    lab: {
      id: 'lab-20',
      title: 'Lab 20: User & Sudoers Auditing',
      scenario:
        'You need to audit the user accounts on the system, verify group memberships for the current user, and inspect the `/etc/sudoers` configuration file.',
      objective:
        'Inspect user groups using `id` and `groups`, verify `/etc/passwd` accounts, and check sudoers rules.',
      tasks: [
        {
          id: 't1',
          instruction: 'Execute `id` to view your current user ID, primary group, and supplementary groups.',
          hint: 'Run: id',
          solutionCommand: 'id',
        },
        {
          id: 't2',
          instruction: 'View the groups you belong to using `groups`.',
          hint: 'Run: groups',
          solutionCommand: 'groups',
        },
        {
          id: 't3',
          instruction: 'Inspect the system sudo configuration file using `cat /etc/sudoers`.',
          hint: 'Run: cat /etc/sudoers',
          solutionCommand: 'cat /etc/sudoers',
        },
      ],
      verificationRules: [
        {
          id: 'v1',
          description: 'User executed id command',
          checkType: 'command_executed_match',
          expectedValue: 'id',
          failureMessage: 'Run `id` to inspect your user context.',
        },
        {
          id: 'v2',
          description: 'User executed groups command',
          checkType: 'command_executed_match',
          expectedValue: 'groups',
          failureMessage: 'Run `groups` to view group memberships.',
        },
      ],
    },
    quiz: [
      {
        id: 'q20-1',
        question: 'Why should `/etc/sudoers` always be edited using `visudo` instead of a plain text editor?',
        options: [
          'visudo encrypts the file with a password.',
          'visudo locks the file and validates syntax before saving, preventing accidental lockouts.',
          'visudo is the only tool that runs on Linux.',
          'Plain text editors delete files when opened.',
        ],
        correctIndex: 1,
        explanation: '`visudo` performs automated syntax checks before saving, preventing disastrous syntax errors from locking administrators out.',
      },
      {
        id: 'q20-2',
        question: 'What disaster happens if you run `usermod -G docker student` without the `-a` (append) flag?',
        options: [
          'Docker is uninstalled.',
          'The user `student` is removed from all other supplementary groups (including `sudo`!), losing administrative privileges.',
          'The user\'s password is changed.',
          'Nothing happens.',
        ],
        correctIndex: 1,
        explanation: 'Without `-a`, `-G` replaces all supplementary groups with only the ones listed in the command.',
      },
      {
        id: 'q20-3',
        question: 'What login shell should be assigned to daemon service accounts (like www-data or redis) to enhance security?',
        options: ['/bin/bash', '/bin/sh', '/usr/sbin/nologin', '/bin/zsh'],
        correctIndex: 2,
        explanation: '`/usr/sbin/nologin` (or `/bin/false`) prevents unauthorized interactive logins for non-human service accounts.',
      },
    ],
    cheatSheet: [
      {
        name: 'useradd',
        syntax: 'useradd [OPTIONS] USERNAME',
        description: 'Create a new user or update default new user information.',
        commonFlags: [
          { flag: '-m', description: 'Create the user\'s home directory' },
          { flag: '-s SHELL', description: 'Login shell of the new account' },
        ],
        realWorldExample: 'useradd -m -s /bin/bash deploy',
        category: 'security',
      },
      {
        name: 'usermod',
        syntax: 'usermod [OPTIONS] USERNAME',
        description: 'Modify a user account.',
        commonFlags: [
          { flag: '-aG GROUPS', description: 'Append the user to supplementary GROUPS (must use -a with -G!)' },
        ],
        realWorldExample: 'usermod -aG sudo,docker student',
        category: 'security',
      },
      {
        name: 'visudo',
        syntax: 'visudo [-f /path/to/file]',
        description: 'Safely edit the sudoers configuration file with automated syntax verification.',
        commonFlags: [],
        realWorldExample: 'sudo visudo',
        category: 'security',
      },
    ],
  },
];
