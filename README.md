# linux — LinuxMastery LMS

An interactive, comprehensive Linux operating system engineering LMS platform built with **Next.js**, **React**, and **Tailwind CSS**.

Featuring an in-browser virtual POSIX terminal sandbox, automated hands-on lab grading, real-time command execution, interactive quizzes, an extensive command lexicon, and verified certification.

---

## 🌟 Key Features

- **No Sign-Up or Backend Required**: 100% private and persistent in browser `localStorage`.
- **In-Browser Virtual POSIX Linux Terminal (`VFS`)**:
  - Full virtual Filesystem Hierarchy Standard (`/`, `/etc`, `/var/log`, `/proc`, `/home/student`, `/tmp`).
  - Command line history (`↑` / `↓`), `Tab` auto-completion, and ANSI styling.
  - Standard streams and pipelines: `cmd1 | cmd2`, `> file`, `>> file`, `2>&1`, and `/dev/null`.
  - Supports 60+ commands: `ls`, `cd`, `pwd`, `mkdir -p`, `rm -rf`, `cp -r`, `cat -n`, `head -n`, `tail -f`, `grep -i -v -E`, `awk`, `sed`, `cut`, `sort -nr`, `uniq -c`, `chmod`, `chown`, `df -h`, `du -sh`, `free -m`, `uptime`, `whoami`, `id`, `ps aux`, `top`, `kill`, `systemctl`, `journalctl`, `ip addr`, `ss -tulnp`, `curl -Iv`, `tar -czvf`, `gzip`, `export`, and more.
- **5 Progression Levels & 25 Structured Modules**:
  - **Level 1**: Absolute Beginner — Foundations & Core CLI (Modules 1–5)
  - **Level 2**: Intermediate — Streams, Permissions & Processes (Modules 6–10)
  - **Level 3**: Power User — Search, Regex & Text Processing (Modules 11–15)
  - **Level 4**: SysAdmin Specialist — Storage, Systemd & Networking (Modules 16–20)
  - **Level 5**: DevOps & SRE Pro — Automation, Hardening & War Rooms (Modules 21–25)
- **Hands-On Labs with Live Verification**:
  - Automated grading engine that validates your live virtual filesystem state upon completing challenges.
- **Interactive Quizzes**:
  - Conceptual and scenario-based questions with instant explanations.
- **Searchable Command Lexicon**:
  - Encyclopedia of Linux utilities with flags, syntax, and one-click "Run in Sandbox".
- **Certification Generator**:
  - Export and print your personalized **Linux Systems & SRE Specialist Certificate** as PDF upon completion.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested with Node 20 / 24)
- npm 10+

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/mahe-gi/linux.git
cd linux

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the course!

### Production Build

```bash
npm run build
npm start
```

---

## 📜 Curriculum Overview

| Level | Focus Area | Modules Included |
| :--- | :--- | :--- |
| **Level 1** | Absolute Beginner | Architecture, Shell Mechanics, FHS, CRUD File Ops, Paging & Inspecting |
| **Level 2** | Intermediate | I/O Streams & Redirection, Octal Permissions, Processes & Signals, Env & Dotfiles, Tar/Gzip |
| **Level 3** | Power User | Deep Find, Regex with Grep, Cut/Sort/Uniq, Stream Editing with Sed, Reporting with Awk |
| **Level 4** | SysAdmin Specialist | Disks/Mounts/Inodes, Systemd & Journalctl, Linux Networking & Sockets, SSH & Keys, Sudoers |
| **Level 5** | DevOps & SRE Pro | Defensive Bash Scripting, Cron & Timers, Load Average & OOM Triage, Firewalls, Outage War Rooms |

---

## 📄 License
MIT License. Inspired by the Unix educational materials from Imperial College London.
