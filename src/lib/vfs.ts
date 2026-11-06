export interface VFSNode {
  name: string;
  type: 'file' | 'dir';
  content: string;
  mode: number; // e.g. 0o755, 0o644
  owner: string; // 'student' or 'root'
  group: string; // 'student' or 'root'
  mtime: number; // timestamp
  children?: Map<string, VFSNode>;
}

export interface SerializedNode {
  name: string;
  type: 'file' | 'dir';
  content: string;
  mode: number;
  owner: string;
  group: string;
  mtime: number;
  children?: Record<string, SerializedNode>;
}

const INITIAL_BOOT_TIME = 1730829600000; // Deterministic static timestamp for prerender

export class VirtualFileSystem {
  private root: VFSNode;
  private currentWorkingDir: string = '/home/student';

  constructor() {
    this.root = this.createDefaultRoot();
  }

  private createDefaultRoot(): VFSNode {
    const rootNode: VFSNode = {
      name: '/',
      type: 'dir',
      content: '',
      mode: 0o755,
      owner: 'root',
      group: 'root',
      mtime: INITIAL_BOOT_TIME - 86400000,
      children: new Map(),
    };

    // Helper to add dir
    const addDir = (pathStr: string, mode = 0o755, owner = 'root', group = 'root') => {
      const parts = pathStr.split('/').filter(Boolean);
      let curr = rootNode;
      for (const part of parts) {
        if (!curr.children) curr.children = new Map();
        if (!curr.children.has(part)) {
          curr.children.set(part, {
            name: part,
            type: 'dir',
            content: '',
            mode,
            owner,
            group,
            mtime: INITIAL_BOOT_TIME - 3600000,
            children: new Map(),
          });
        }
        curr = curr.children.get(part)!;
      }
      return curr;
    };

    // Helper to add file
    const addFile = (
      pathStr: string,
      content: string,
      mode = 0o644,
      owner = 'root',
      group = 'root'
    ) => {
      const parts = pathStr.split('/').filter(Boolean);
      const fileName = parts.pop()!;
      const dirPath = parts.join('/');
      const parent = addDir(dirPath, 0o755, owner, group);
      if (!parent.children) parent.children = new Map();
      parent.children.set(fileName, {
        name: fileName,
        type: 'file',
        content,
        mode,
        owner,
        group,
        mtime: INITIAL_BOOT_TIME - 1800000,
      });
    };

    // Standard Linux Filesystem Structure
    addDir('bin');
    addDir('sbin');
    addDir('usr/bin');
    addDir('usr/lib');
    addDir('var/log/nginx', 0o755, 'root', 'root');
    addDir('var/www/html', 0o755, 'www-data', 'www-data');
    addDir('etc/ssh');
    addDir('etc/cron.d');
    addDir('etc/systemd/system');
    addDir('tmp', 0o1777, 'root', 'root'); // Sticky bit!
    addDir('proc');
    addDir('dev');
    addDir('home/student', 0o750, 'student', 'student');
    addDir('home/student/projects', 0o755, 'student', 'student');
    addDir('home/student/downloads', 0o755, 'student', 'student');
    addDir('home/student/scripts', 0o755, 'student', 'student');
    addDir('root', 0o700, 'root', 'root');

    // /etc files
    addFile(
      'etc/os-release',
      `NAME="Ubuntu"
VERSION="24.04 LTS (Noble Numbat)"
ID=ubuntu
ID_LIKE=debian
PRETTY_NAME="Ubuntu 24.04 LTS"
VERSION_ID="24.04"
HOME_URL="https://www.ubuntu.com/"
SUPPORT_URL="https://help.ubuntu.com/"
BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"`
    );

    addFile(
      'etc/passwd',
      `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
systemd-resolve:x:101:103:systemd Resolver,,,:/run/systemd/resolve:/usr/sbin/nologin
syslog:x:104:110::/home/syslog:/usr/sbin/nologin
student:x:1000:1000:Linux Student,,,:/home/student:/bin/bash
deploy:x:1001:1001:Deploy Bot,,,:/home/deploy:/bin/bash`
    );

    addFile(
      'etc/group',
      `root:x:0:
daemon:x:1:
bin:x:2:
sys:x:3:
adm:x:4:syslog,student
sudo:x:27:student
www-data:x:33:
docker:x:999:student
student:x:1000:
deploy:x:1001:`
    );

    addFile(
      'etc/hosts',
      `127.0.0.1 localhost
127.0.1.1 linux-box.localdomain linux-box
192.168.1.10 web-production-01
192.168.1.20 db-production-primary
::1     ip6-localhost ip6-loopback`
    );

    addFile(
      'etc/resolv.conf',
      `nameserver 1.1.1.1
nameserver 8.8.8.8
search localdomain`
    );

    addFile(
      'etc/fstab',
      `# /etc/fstab: static file system information.
UUID=a1b2c3d4-e5f6-7890-abcd-ef0123456789 /               ext4    errors=remount-ro 0       1
UUID=b2c3d4e5-f6a7-8901-bcde-f0123456789a /boot           ext4    defaults        0       2
UUID=c3d4e5f6-a7b8-9012-cdef-0123456789ab none            swap    sw              0       0
/dev/sdb1                                 /mnt/storage    ext4    defaults,noatime 0       2`
    );

    addFile(
      'etc/sudoers',
      `# User privilege specification
root    ALL=(ALL:ALL) ALL
%admin ALL=(ALL) ALL
%sudo   ALL=(ALL:ALL) ALL
student ALL=(ALL:ALL) NOPASSWD:ALL`,
      0o440,
      'root',
      'root'
    );

    addFile(
      'etc/ssh/sshd_config',
      `Port 22
Protocol 2
PermitRootLogin prohibit-password
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
PasswordAuthentication no
ChallengeResponseAuthentication no
X11Forwarding no
PrintMotd no
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server`
    );

    // /proc virtual files
    addFile(
      'proc/cpuinfo',
      `processor	: 0
vendor_id	: GenuineIntel
cpu family	: 6
model name	: Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz
stepping	: 1
cpu MHz		: 2793.438
cache size	: 49152 KB
cpu cores	: 4`
    );

    addFile(
      'proc/meminfo',
      `MemTotal:       16384000 kB
MemFree:         8421000 kB
MemAvailable:   12104000 kB
Buffers:          342000 kB
Cached:          3841000 kB
SwapCached:            0 kB
Active:          4210000 kB
Inactive:        2800000 kB
SwapTotal:       2097152 kB
SwapFree:        2097152 kB`
    );

    addFile(
      'proc/uptime',
      `14238.45 56123.12`
    );

    addFile(
      'proc/loadavg',
      `0.14 0.22 0.18 1/320 28419`
    );

    addFile(
      'proc/version',
      `Linux version 6.8.0-40-generic (buildd@lcy02-amd64-001) (gcc-13) #40-Ubuntu SMP PREEMPT_DYNAMIC`
    );

    // /var/log sample files
    addFile(
      'var/log/syslog',
      `Nov 05 10:14:02 linux-box systemd[1]: Started Daily apt upgrade and clean activities.
Nov 05 10:15:10 linux-box sshd[2841]: Accepted publickey for student from 192.168.1.42 port 54320 ssh2: ED25519
Nov 05 10:15:10 linux-box systemd[1]: Started User Manager for UID 1000.
Nov 05 10:18:22 linux-box kernel: [  412.301901] [UFW BLOCK] IN=eth0 OUT= MAC=00:16:3e:2b:8f:1a SRC=185.220.101.5 DST=192.168.1.10 PROTO=TCP SPT=49120 DPT=23
Nov 05 10:20:00 linux-box CRON[3102]: (root) CMD (/usr/local/bin/backup-sync.sh > /dev/null 2>&1)
Nov 05 10:22:45 linux-box nginx[1822]: 2026/11/05 10:22:45 [notice] 1822#1822: signal process started`
    );

    addFile(
      'var/log/auth.log',
      `Nov 05 09:44:12 linux-box sshd[2101]: Failed password for invalid user admin from 203.0.113.195 port 42100 ssh2
Nov 05 09:44:15 linux-box sshd[2101]: Connection closed by authenticating user admin 203.0.113.195 [preauth]
Nov 05 09:50:00 linux-box sudo:  student : TTY=pts/0 ; PWD=/home/student ; USER=root ; COMMAND=/bin/systemctl restart nginx
Nov 05 10:15:10 linux-box sshd[2841]: Accepted publickey for student from 192.168.1.42 port 54320 ssh2`
    );

    addFile(
      'var/log/nginx/access.log',
      `192.168.1.42 - - [05/Nov/2026:10:15:12 +0000] "GET / HTTP/1.1" 200 612 "-" "Mozilla/5.0"
192.168.1.42 - - [05/Nov/2026:10:15:13 +0000] "GET /api/status HTTP/1.1" 200 42 "-" "curl/8.5.0"
198.51.100.2 - - [05/Nov/2026:10:16:40 +0000] "POST /api/login HTTP/1.1" 401 89 "-" "Mozilla/5.0"
198.51.100.2 - - [05/Nov/2026:10:16:45 +0000] "POST /api/login HTTP/1.1" 200 154 "-" "Mozilla/5.0"
203.0.113.55 - - [05/Nov/2026:10:22:01 +0000] "GET /admin/config.php HTTP/1.1" 404 162 "-" "curl/7.88.1"`
    );

    // /home/student files
    addFile(
      'home/student/.bashrc',
      `# ~/.bashrc: executed by bash(1) for non-login shells.
export HISTCONTROL=ignoreboth:erasedups
export HISTSIZE=10000
export HISTFILESIZE=20000
shopt -s histappend
shopt -s checkwinsize

# Aliases
alias ll='ls -alF --color=auto'
alias la='ls -A --color=auto'
alias l='ls -CF --color=auto'
alias grep='grep --color=auto'
alias df='df -h'
alias free='free -m'

export PATH="$HOME/.local/bin:$PATH"
export EDITOR=nano`,
      0o644,
      'student',
      'student'
    );

    addFile(
      'home/student/.profile',
      `# ~/.profile: executed by Bourne-compatible login shells.
if [ -n "$BASH_VERSION" ]; then
    if [ -f "$HOME/.bashrc" ]; then
        . "$HOME/.bashrc"
    fi
fi
PATH="$HOME/bin:$HOME/.local/bin:$PATH"`,
      0o644,
      'student',
      'student'
    );

    addFile(
      'home/student/.bash_history',
      `ls -la
pwd
cd projects
cat /etc/os-release
df -h
free -m
uname -a
top
uptime`,
      0o600,
      'student',
      'student'
    );

    addFile(
      'home/student/welcome.txt',
      `=============================================================
 Welcome to the Linux Engineering & DevOps Interactive Box! 
=============================================================
This virtual environment runs directly in your browser.
You have real-time filesystem persistence, standard utilities,
redirection, pipes, regex, system inspection, and hands-on labs!

Quick Tips:
  - Type 'help' to see supported commands.
  - Type 'ls -la' to see hidden dotfiles.
  - Type 'cat welcome.txt' to re-read this message.
  - Use Up/Down arrows for command history.
  - Use Tab for path and command auto-completion.
Enjoy your journey from absolute fundamentals to Linux Specialist!`,
      0o644,
      'student',
      'student'
    );

    addFile(
      'home/student/projects/server.py',
      `#!/usr/bin/env python3
import http.server
import socketserver

PORT = 8080
Handler = http.server.SimpleHTTPRequestHandler

print(f"Starting Linux Web Service on port {PORT}...")
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()`,
      0o755,
      'student',
      'student'
    );

    addFile(
      'home/student/projects/config.env',
      `PORT=8080
DATABASE_URL=postgres://dbuser:s3cr3t@192.168.1.20:5432/production_app
NODE_ENV=production
DEBUG=false
CACHE_TTL=3600`,
      0o600,
      'student',
      'student'
    );

    addFile(
      'home/student/scripts/healthcheck.sh',
      `#!/bin/bash
set -euo pipefail

echo "=== System Health Diagnostic ==="
echo "Hostname: $(hostname)"
echo "Kernel: $(uname -r)"
echo "Uptime: $(uptime)"
echo "Memory Available: $(free -h | grep Mem | awk '{print $7}')"
echo "Root Disk Free: $(df -h / | tail -n1 | awk '{print $4}')"
echo "=== All Checks Passed ==="`,
      0o755,
      'student',
      'student'
    );

    return rootNode;
  }

  public getCwd(): string {
    return this.currentWorkingDir;
  }

  public setCwd(dir: string): boolean {
    const resolved = this.resolvePath(dir);
    const node = this.getNode(resolved);
    if (node && node.type === 'dir') {
      this.currentWorkingDir = resolved;
      return true;
    }
    return false;
  }

  public resolvePath(targetPath: string, fromDir: string = this.currentWorkingDir): string {
    if (!targetPath) return fromDir;

    let path = targetPath.trim();
    if (path.startsWith('~')) {
      path = '/home/student' + path.slice(1);
    }

    if (!path.startsWith('/')) {
      path = fromDir === '/' ? `/${path}` : `${fromDir}/${path}`;
    }

    const segments = path.split('/').filter(Boolean);
    const resolvedSegments: string[] = [];

    for (const segment of segments) {
      if (segment === '.') {
        continue;
      } else if (segment === '..') {
        resolvedSegments.pop();
      } else {
        resolvedSegments.push(segment);
      }
    }

    return '/' + resolvedSegments.join('/');
  }

  public getNode(absolutePath: string): VFSNode | null {
    if (absolutePath === '/' || absolutePath === '') {
      return this.root;
    }

    const parts = absolutePath.split('/').filter(Boolean);
    let curr: VFSNode = this.root;

    for (const part of parts) {
      if (curr.type !== 'dir' || !curr.children) return null;
      const child = curr.children.get(part);
      if (!child) return null;
      curr = child;
    }

    return curr;
  }

  public getParentNode(absolutePath: string): { parent: VFSNode | null; baseName: string } {
    const parts = absolutePath.split('/').filter(Boolean);
    if (parts.length === 0) return { parent: null, baseName: '' };
    const baseName = parts.pop()!;
    const parentPath = '/' + parts.join('/');
    const parent = this.getNode(parentPath);
    return { parent, baseName };
  }

  public fileExists(targetPath: string): boolean {
    const abs = this.resolvePath(targetPath);
    const node = this.getNode(abs);
    return node !== null && node.type === 'file';
  }

  public dirExists(targetPath: string): boolean {
    const abs = this.resolvePath(targetPath);
    const node = this.getNode(abs);
    return node !== null && node.type === 'dir';
  }

  public exists(targetPath: string): boolean {
    const abs = this.resolvePath(targetPath);
    return this.getNode(abs) !== null;
  }

  public readFile(targetPath: string): string | null {
    const abs = this.resolvePath(targetPath);
    const node = this.getNode(abs);
    if (!node || node.type !== 'file') return null;
    return node.content;
  }

  public writeFile(
    targetPath: string,
    content: string,
    append: boolean = false,
    mode: number = 0o644,
    owner: string = 'student',
    group: string = 'student'
  ): { success: boolean; error?: string } {
    const abs = this.resolvePath(targetPath);
    const existing = this.getNode(abs);

    if (existing) {
      if (existing.type === 'dir') {
        return { success: false, error: `${targetPath}: Is a directory` };
      }
      existing.content = append ? existing.content + content : content;
      existing.mtime = Date.now();
      return { success: true };
    }

    const { parent, baseName } = this.getParentNode(abs);
    if (!parent || parent.type !== 'dir') {
      return { success: false, error: `${targetPath}: No such file or directory` };
    }

    if (!parent.children) parent.children = new Map();
    parent.children.set(baseName, {
      name: baseName,
      type: 'file',
      content,
      mode,
      owner,
      group,
      mtime: Date.now(),
    });

    return { success: true };
  }

  public mkdir(
    targetPath: string,
    recursive: boolean = false,
    mode: number = 0o755,
    owner: string = 'student',
    group: string = 'student'
  ): { success: boolean; error?: string } {
    const abs = this.resolvePath(targetPath);
    if (this.getNode(abs)) {
      return { success: false, error: `cannot create directory '${targetPath}': File exists` };
    }

    const parts = abs.split('/').filter(Boolean);
    if (parts.length === 0) return { success: true };

    if (!recursive) {
      const { parent, baseName } = this.getParentNode(abs);
      if (!parent || parent.type !== 'dir') {
        return {
          success: false,
          error: `cannot create directory '${targetPath}': No such file or directory`,
        };
      }
      if (!parent.children) parent.children = new Map();
      parent.children.set(baseName, {
        name: baseName,
        type: 'dir',
        content: '',
        mode,
        owner,
        group,
        mtime: Date.now(),
        children: new Map(),
      });
      return { success: true };
    }

    let curr = this.root;
    for (const part of parts) {
      if (!curr.children) curr.children = new Map();
      if (!curr.children.has(part)) {
        curr.children.set(part, {
          name: part,
          type: 'dir',
          content: '',
          mode,
          owner,
          group,
          mtime: Date.now(),
          children: new Map(),
        });
      }
      curr = curr.children.get(part)!;
    }
    return { success: true };
  }

  public remove(
    targetPath: string,
    recursive: boolean = false,
    force: boolean = false
  ): { success: boolean; error?: string } {
    const abs = this.resolvePath(targetPath);
    if (abs === '/') {
      return { success: false, error: 'rm: refusing to remove root directory (/)' };
    }

    const node = this.getNode(abs);
    if (!node) {
      if (force) return { success: true };
      return { success: false, error: `cannot remove '${targetPath}': No such file or directory` };
    }

    if (node.type === 'dir' && !recursive) {
      return { success: false, error: `cannot remove '${targetPath}': Is a directory` };
    }

    const { parent, baseName } = this.getParentNode(abs);
    if (parent && parent.children) {
      parent.children.delete(baseName);
      return { success: true };
    }

    return { success: false, error: `failed to remove '${targetPath}'` };
  }

  public copy(
    srcPath: string,
    destPath: string,
    recursive: boolean = false
  ): { success: boolean; error?: string } {
    const absSrc = this.resolvePath(srcPath);
    const srcNode = this.getNode(absSrc);
    if (!srcNode) {
      return { success: false, error: `cannot stat '${srcPath}': No such file or directory` };
    }

    if (srcNode.type === 'dir' && !recursive) {
      return { success: false, error: `-r not specified; omitting directory '${srcPath}'` };
    }

    let absDest = this.resolvePath(destPath);
    const destNode = this.getNode(absDest);

    // If destination is an existing directory, copy inside it
    if (destNode && destNode.type === 'dir') {
      absDest = `${absDest}/${srcNode.name}`.replace(/\/+/g, '/');
    }

    const cloneNode = (node: VFSNode): VFSNode => {
      const cloned: VFSNode = {
        name: node.name,
        type: node.type,
        content: node.content,
        mode: node.mode,
        owner: 'student',
        group: 'student',
        mtime: Date.now(),
      };
      if (node.children) {
        cloned.children = new Map();
        for (const [k, v] of node.children.entries()) {
          cloned.children.set(k, cloneNode(v));
        }
      }
      return cloned;
    };

    const { parent, baseName } = this.getParentNode(absDest);
    if (!parent || parent.type !== 'dir') {
      return { success: false, error: `cannot copy to '${destPath}': No such file or directory` };
    }

    const newNode = cloneNode(srcNode);
    newNode.name = baseName;
    if (!parent.children) parent.children = new Map();
    parent.children.set(baseName, newNode);

    return { success: true };
  }

  public move(srcPath: string, destPath: string): { success: boolean; error?: string } {
    const absSrc = this.resolvePath(srcPath);
    const srcNode = this.getNode(absSrc);
    if (!srcNode) {
      return { success: false, error: `cannot stat '${srcPath}': No such file or directory` };
    }

    let absDest = this.resolvePath(destPath);
    const destNode = this.getNode(absDest);
    if (destNode && destNode.type === 'dir') {
      absDest = `${absDest}/${srcNode.name}`.replace(/\/+/g, '/');
    }

    const { parent: srcParent, baseName: srcBase } = this.getParentNode(absSrc);
    const { parent: destParent, baseName: destBase } = this.getParentNode(absDest);

    if (!destParent || destParent.type !== 'dir') {
      return { success: false, error: `cannot move to '${destPath}': No such file or directory` };
    }

    srcNode.name = destBase;
    if (!destParent.children) destParent.children = new Map();
    destParent.children.set(destBase, srcNode);

    if (srcParent && srcParent.children) {
      srcParent.children.delete(srcBase);
    }

    return { success: true };
  }

  public chmod(targetPath: string, mode: number): { success: boolean; error?: string } {
    const abs = this.resolvePath(targetPath);
    const node = this.getNode(abs);
    if (!node) {
      return { success: false, error: `cannot access '${targetPath}': No such file or directory` };
    }
    node.mode = mode;
    return { success: true };
  }

  public chown(
    targetPath: string,
    owner: string,
    group?: string
  ): { success: boolean; error?: string } {
    const abs = this.resolvePath(targetPath);
    const node = this.getNode(abs);
    if (!node) {
      return { success: false, error: `cannot access '${targetPath}': No such file or directory` };
    }
    node.owner = owner;
    if (group) node.group = group;
    return { success: true };
  }

  public listDirectory(targetPath?: string): VFSNode[] | null {
    const abs = this.resolvePath(targetPath || this.currentWorkingDir);
    const node = this.getNode(abs);
    if (!node || node.type !== 'dir' || !node.children) return null;
    return Array.from(node.children.values()).sort((a, b) => {
      // Dirs first, then alphabetical
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  public getAllPaths(startPath: string = '/'): string[] {
    const result: string[] = [];
    const traverse = (node: VFSNode, currPath: string) => {
      result.push(currPath);
      if (node.type === 'dir' && node.children) {
        for (const [name, child] of node.children.entries()) {
          const childPath = currPath === '/' ? `/${name}` : `${currPath}/${name}`;
          traverse(child, childPath);
        }
      }
    };
    const startNode = this.getNode(this.resolvePath(startPath));
    if (startNode) {
      traverse(startNode, this.resolvePath(startPath));
    }
    return result;
  }

  public reset(): void {
    this.root = this.createDefaultRoot();
    this.currentWorkingDir = '/home/student';
  }

  // Format mode as ls -l string (e.g. -rwxr-xr-x)
  public static modeToString(mode: number, isDir: boolean): string {
    const typeChar = isDir ? 'd' : '-';
    const rwx = (m: number) => {
      return (
        (m & 4 ? 'r' : '-') +
        (m & 2 ? 'w' : '-') +
        (m & 1 ? 'x' : '-')
      );
    };
    const u = rwx((mode >> 6) & 7);
    const g = rwx((mode >> 3) & 7);
    const o = rwx(mode & 7);
    return `${typeChar}${u}${g}${o}`;
  }
}
